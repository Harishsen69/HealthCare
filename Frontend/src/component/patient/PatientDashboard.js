import React, { useState, useEffect, useCallback } from "react";
import API from "../../services/api";
import Sidebar from "../common/Sidebar";
import PatientAppointments from "./PatientAppointments";
import PatientProfile from "./PatientProfile";
import PatientNotifications from "./PatientNotifications";
import PatientReports from "./PatientReports";
import "./PatientDashboard.css";

function PatientDashboard({ setPage }) {
    // ========== STATE VARIABLES ==========
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("medicareUser");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    // Get activeTab from localStorage on refresh
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('patientDashboardTab');
        return savedTab || "overview";
    });
    
    const [loading, setLoading] = useState(true);
    const [showAllUpcoming, setShowAllUpcoming] = useState(false);
    const [showAllCompleted, setShowAllCompleted] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    
    // Patient data states
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [reportCount, setReportCount] = useState(0);
    const [hasNewReports, setHasNewReports] = useState(false);
    
    // Booking form states
    const [showBookingForm, setShowBookingForm] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [appointmentDate, setAppointmentDate] = useState("");
    const [appointmentTime, setAppointmentTime] = useState("");
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [bookedSlots, setBookedSlots] = useState([]);
    const [checkingSlots, setCheckingSlots] = useState(false);
    const [doctorAvailable, setDoctorAvailable] = useState(true);

    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    // Save activeTab to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('patientDashboardTab', activeTab);
    }, [activeTab]);

    // ========== HELPER FUNCTIONS ==========
    const formatTimeTo12Hour = (time24) => {
        if (!time24) return '';
        let [hours, minutes] = time24.split(':');
        let period = hours >= 12 ? 'PM' : 'AM';
        let hour12 = hours % 12 || 12;
        let hour12Str = hour12.toString().padStart(2, '0');
        return `${hour12Str}:${minutes} ${period}`;
    };

    const getAvailableTimeSlots = () => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const minAdvanceMinutes = 60;
        
        const allSlots = [
            { value: "09:00", label: "09:00 AM" }, { value: "10:00", label: "10:00 AM" },
            { value: "11:00", label: "11:00 AM" }, { value: "12:00", label: "12:00 PM" },
            { value: "13:00", label: "01:00 PM" }, { value: "14:00", label: "02:00 PM" },
            { value: "15:00", label: "03:00 PM" }, { value: "16:00", label: "04:00 PM" },
            { value: "17:00", label: "05:00 PM" }, { value: "18:00", label: "06:00 PM" },
            { value: "19:00", label: "07:00 PM" }, { value: "20:00", label: "08:00 PM" }
        ];
        
        if (appointmentDate === today) {
            return allSlots.filter(slot => {
                const [hours, minutes] = slot.value.split(':');
                const slotTotalMinutes = parseInt(hours) * 60 + parseInt(minutes);
                return slotTotalMinutes >= currentTotalMinutes + minAdvanceMinutes;
            });
        }
        return allSlots;
    };

    const getCurrentPageName = () => {
        const pageNames = {
            overview: "Dashboard",
            appointments: "My Appointments",
            reports: "My Reports",
            profile: "Profile",
            notifications: "Notifications"
        };
        return pageNames[activeTab] || "Dashboard";
    };

    // ========== FETCH FUNCTIONS ==========
    const fetchDoctors = useCallback(async () => {
        try {
            const response = await API.get('doctors/');
            setDoctors(response.data);
            return true;
        } catch (error) {
            console.error("Error fetching doctors:", error);
            return false;
        }
    }, []);

    const fetchAppointments = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('appointments/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
            return true;
        } catch (error) {
            console.error("Error fetching appointments:", error);
            return false;
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('notifications/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data || [];
            setNotifications(data);
            const unreadCount = data.filter(n => !n.is_read).length;
            setNotificationCount(unreadCount);
            return true;
        } catch (error) {
            console.error("Error fetching notifications:", error);
            return false;
        }
    }, []);

    const fetchReportCount = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return false;
            const response = await API.get('reports/unviewed-count/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const unviewedCount = response.data.unviewed_count;
            setReportCount(unviewedCount);
            setHasNewReports(unviewedCount > 0);
            return true;
        } catch (error) {
            console.error("Error fetching report count:", error);
            setReportCount(0);
            setHasNewReports(false);
            return false;
        }
    }, []);

    const fetchBookedSlots = useCallback(async (doctorId, date) => {
        if (!doctorId || !date) return;
        setCheckingSlots(true);
        try {
            const response = await API.get(`booked-slots/?doctor_id=${doctorId}&date=${date}`);
            setBookedSlots(response.data.booked_slots || []);
            setDoctorAvailable(response.data.is_available !== false);
            if (response.data.is_available === false) {
                setAppointmentTime("");
            }
        } catch (error) {
            console.error("Error fetching booked slots:", error);
            setBookedSlots([]);
            setDoctorAvailable(true);
        } finally {
            setCheckingSlots(false);
        }
    }, []);

    // ========== BOOK APPOINTMENT ==========
    const handleBookAppointment = useCallback(async (e) => {
        e.preventDefault();
        if (!selectedDoctor || !appointmentDate || !appointmentTime) {
            setBookingError("Please fill all fields");
            return;
        }
        setBookingError("");
        setBookingLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.post('appointments/create/', {
                doctor: selectedDoctor,
                date: appointmentDate,
                time: appointmentTime,
                patient_name: user?.name,
                patient_email: user?.email,
                patient_phone: user?.phone || ""
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 201) {
                alert("Appointment booked successfully!");
                setShowBookingForm(false);
                setSelectedDoctor("");
                setAppointmentDate("");
                setAppointmentTime("");
                setBookedSlots([]);
                setDoctorAvailable(true);
                setBookingError("");
                await fetchAppointments();
            }
        } catch (error) {
            console.error("Booking error:", error);
            const errorMsg = error.response?.data?.error || "Failed to book appointment";
            setBookingError(errorMsg);
            alert(errorMsg);
        } finally {
            setBookingLoading(false);
        }
    }, [selectedDoctor, appointmentDate, appointmentTime, user, fetchAppointments]);

    // ========== CANCEL APPOINTMENT ==========
    const handleCancelAppointment = useCallback(async (appointmentId) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.delete(`appointments/cancel/${appointmentId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 200) {
                alert("Appointment cancelled!");
                await fetchAppointments();
                if (selectedDoctor && appointmentDate) {
                    fetchBookedSlots(selectedDoctor, appointmentDate);
                }
            }
        } catch (error) {
            console.error("Cancel error:", error);
            alert("Failed to cancel appointment");
        }
    }, [selectedDoctor, appointmentDate, fetchAppointments, fetchBookedSlots]);

    const handleNotificationCountChange = useCallback((newCount) => {
        setNotificationCount(newCount);
    }, []);

    const handleReportViewed = useCallback((unreadCount) => {
        setReportCount(unreadCount);
        setHasNewReports(unreadCount > 0);
    }, []);

    // ========== LOAD ALL DATA ==========
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchDoctors(),
                    fetchAppointments(),
                    fetchNotifications(),
                    fetchReportCount()
                ]);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [fetchDoctors, fetchAppointments, fetchNotifications, fetchReportCount]);

    // ========== WATCH FOR BOOKING DATE/DOCTOR CHANGES ==========
    useEffect(() => {
        if (selectedDoctor && appointmentDate) {
            fetchBookedSlots(selectedDoctor, appointmentDate);
        } else {
            setBookedSlots([]);
            setDoctorAvailable(true);
        }
    }, [selectedDoctor, appointmentDate, fetchBookedSlots]);

    // ========== SHOW LOADING SCREEN ==========
    if (loading) {
        return (
            <div className="patient-loading">
                <div className="patient-loading-spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    // ========== FILTER APPOINTMENTS ==========
    const today = new Date().toISOString().split('T')[0];
    const upcomingAppointments = appointments.filter(a => a.status !== 'completed' && a.status !== 'cancelled');
    const pastAppointments = appointments.filter(a => a.status === 'completed');
    const todayAppointments = upcomingAppointments.filter(apt => apt.date === today);
    const futureAppointments = upcomingAppointments.filter(apt => apt.date > today);
    const totalDoctors = doctors.length;
    const completedCount = pastAppointments.length;
    const upcomingCount = upcomingAppointments.length;
    const availableTimeSlots = getAvailableTimeSlots();

    const visibleFutureAppointments = showAllUpcoming ? futureAppointments : futureAppointments.slice(0, 5);
    const visiblePastAppointments = showAllCompleted ? pastAppointments : pastAppointments.slice(0, 5);
    const hasMoreFuture = futureAppointments.length > 5;
    const hasMorePast = pastAppointments.length > 5;

    const toggleShowAllUpcoming = () => setShowAllUpcoming(!showAllUpcoming);
    const toggleShowAllCompleted = () => setShowAllCompleted(!showAllCompleted);
    const toggleMobileSidebar = () => setIsMobileSidebarOpen(!isMobileSidebarOpen);

    // ========== RENDER OVERVIEW ==========
    const renderOverview = () => (
        <div className="patient-dashboard-container">
            {/* Stats Cards */}
            <div className="patient-stats-cards">
                <div className="patient-stat-card">
                    <div className="patient-stat-icon">📅</div>
                    <div className="patient-stat-details">
                        <h3>{upcomingCount}</h3>
                        <p>Upcoming Appointments</p>
                    </div>
                </div>
                <div className="patient-stat-card">
                    <div className="patient-stat-icon">✅</div>
                    <div className="patient-stat-details">
                        <h3>{completedCount}</h3>
                        <p>Completed Visits</p>
                    </div>
                </div>
                <div className="patient-stat-card">
                    <div className="patient-stat-icon">👨‍⚕️</div>
                    <div className="patient-stat-details">
                        <h3>{totalDoctors}</h3>
                        <p>Doctors Available</p>
                    </div>
                </div>
                <div className="patient-stat-card">
                    <div className="patient-stat-icon">📄</div>
                    <div className="patient-stat-details">
                        <h3>{reportCount}</h3>
                        <p>New Reports</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
<div className="patient-quick-actions">
    <h3>Quick Actions</h3>
    <div className="patient-action-grid">
        <button className="patient-action-card" onClick={() => setShowBookingForm(!showBookingForm)}>
            <span>📅</span>
            <p>Book New Appointment</p>
        </button>
        <button className="patient-action-card" onClick={() => setActiveTab("appointments")}>
            <span>📋</span>
            <p>View My Appointments</p>
        </button>
        <button className="patient-action-card" onClick={() => setActiveTab("profile")}>
            <span>👤</span>
            <p>Update Profile</p>
        </button>
    </div>
</div>

{/* Booking Form */}
{showBookingForm && (
    <div className="patient-booking-form-wrapper">
        <div className="patient-booking-form">
            <div className="patient-booking-header">
                <h3>📅 Book New Appointment</h3>
                <button className="patient-close-booking" onClick={() => setShowBookingForm(false)}>✕</button>
            </div>
            {bookingError && <div className="patient-booking-error">⚠️ {bookingError}</div>}
            <form onSubmit={handleBookAppointment}>
                {/* NEW: 3-column row for Doctor, Date, and Time */}
                <div className="patient-form-row">
                    <div className="patient-form-group">
                        <select 
                            value={selectedDoctor} 
                            onChange={(e) => { setSelectedDoctor(e.target.value); setAppointmentTime(""); setBookedSlots([]); setDoctorAvailable(true); setBookingError(""); }} 
                            required
                        >
                            <option value="">Select Doctor</option>
                            {doctors.map(doc => (<option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>))}
                        </select>
                    </div>
                    
                    <div className="patient-form-group">
                        <input 
                            type="date" 
                            value={appointmentDate} 
                            onChange={(e) => { setAppointmentDate(e.target.value); setAppointmentTime(""); setBookedSlots([]); setDoctorAvailable(true); setBookingError(""); }} 
                            required 
                            min={today}
                        />
                    </div>
                    
                    <div className="patient-form-group">
                        <select 
                            value={appointmentTime} 
                            onChange={(e) => setAppointmentTime(e.target.value)} 
                            required 
                            disabled={doctorAvailable === false}
                        >
                            <option value="">Select Time</option>
                            {availableTimeSlots.map(slot => (
                                <option key={slot.value} value={slot.value} disabled={bookedSlots.includes(slot.value) || doctorAvailable === false}>
                                    {slot.label}{bookedSlots.includes(slot.value) && ' 🔴 Booked'}{doctorAvailable === false && ' ⛔ Unavailable'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Availability Messages */}
                {checkingSlots && <div className="patient-slot-loading">⏳ Checking availability...</div>}
                {!checkingSlots && appointmentDate && selectedDoctor && doctorAvailable === false && (
                    <div className="patient-unavailable-msg">❌ Doctor is not available on {appointmentDate}</div>
                )}
                {!checkingSlots && appointmentDate && selectedDoctor && doctorAvailable === true && bookedSlots.length === 0 && (
                    <div className="patient-available-msg">✅ Doctor is available on this date</div>
                )}
                {!checkingSlots && appointmentDate && selectedDoctor && doctorAvailable === true && bookedSlots.length > 0 && (
                    <div className="patient-available-msg">✅ Doctor is available - {availableTimeSlots.filter(slot => !bookedSlots.includes(slot.value)).length} slots open</div>
                )}

                {/* Buttons Row */}
                <div className="patient-booking-actions">
                    <button type="submit" disabled={bookingLoading || doctorAvailable === false}>
                        {bookingLoading ? "Booking..." : "Confirm Booking"}
                    </button>
                    <button type="button" onClick={() => { 
                        setShowBookingForm(false); 
                        setSelectedDoctor(""); 
                        setAppointmentDate(""); 
                        setAppointmentTime(""); 
                        setBookedSlots([]); 
                        setDoctorAvailable(true); 
                        setBookingError(""); 
                    }}>
                        Cancel
                    </button>
                </div>
            </form>
            <div className="patient-time-info">⏰ Available: 9:00 AM - 8:00 PM (Lunch Break: 1:00 PM - 2:00 PM)</div>
        </div>
    </div>
)}

            {/* Today's Schedule */}
            <div className="patient-today-schedule">
                <div className="patient-section-header">
                    <h3>📅 Today's Schedule - {today}</h3>
                </div>
                {todayAppointments.length === 0 ? (
                    <div className="patient-empty-table">No appointments scheduled for today</div>
                ) : (
                    <div className="patient-table-responsive">
                        <table className="patient-availability-table">
                            <thead><tr><th>S.No.</th><th>Doctor</th><th>Time</th><th>Status</th></tr></thead>
                            <tbody>
                                {todayAppointments.map((apt, index) => (
                                    <tr key={apt.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{apt.doctor_name}</strong></td>
                                        <td>{formatTimeTo12Hour(apt.time)}</td>
                                        <td><span className={`patient-status-badge ${apt.status}`}>{apt.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Upcoming Appointments */}
            {futureAppointments.length > 0 && (
                <div className="patient-upcoming-appointments">
                    <div className="patient-section-header">
                        <h3>📋 Upcoming Appointments</h3>
                        <span className="patient-total-count">{futureAppointments.length} Total</span>
                    </div>
                    <div className="patient-table-responsive">
                        <table className="patient-availability-table">
                            <thead><tr><th>S.No.</th><th>Doctor</th><th>Specialization</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
                            <tbody>
                                {visibleFutureAppointments.map((apt, index) => (
                                    <tr key={apt.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{apt.doctor_name}</strong></td>
                                        <td>{apt.doctor_specialty}</td>
                                        <td>{apt.date}</td>
                                        <td>{formatTimeTo12Hour(apt.time)}</td>
                                        <td><span className={`patient-status-badge ${apt.status}`}>{apt.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {hasMoreFuture && (
                        <div className="patient-view-all" onClick={toggleShowAllUpcoming}>
                            {showAllUpcoming ? "Show Less ↑" : `View All (${futureAppointments.length}) →`}
                        </div>
                    )}
                </div>
            )}

            {/* Recent Completed Visits */}
            {pastAppointments.length > 0 && (
                <div className="patient-completed-visits">
                    <div className="patient-section-header">
                        <h3>✅ Recent Completed Visits</h3>
                        <span className="patient-total-count">{pastAppointments.length} Total</span>
                    </div>
                    <div className="patient-table-responsive">
                        <table className="patient-availability-table">
                            <thead><tr><th>S.No.</th><th>Doctor</th><th>Date</th><th>Time</th></tr></thead>
                            <tbody>
                                {visiblePastAppointments.map((apt, index) => (
                                    <tr key={apt.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{apt.doctor_name}</strong></td>
                                        <td>{apt.date}</td>
                                        <td>{formatTimeTo12Hour(apt.time)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {hasMorePast && (
                        <div className="patient-view-all" onClick={toggleShowAllCompleted}>
                            {showAllCompleted ? "Show Less ↑" : `View All (${pastAppointments.length}) →`}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // ========== MAIN RENDER ==========
    return (
        <div className="patient-dashboard-layout">
            <Sidebar 
                userRole="patient"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                setPage={setPage}
                notificationCount={notificationCount}
                reportCount={hasNewReports ? reportCount : 0}
                isMobile={isMobile}
                isMobileSidebarOpen={isMobileSidebarOpen}
                toggleMobileSidebar={toggleMobileSidebar}
            />
            
            {/* ✅ Blur overlay wrapper - THIS IS IMPORTANT */}
            <div className={`patient-content-overlay ${isMobile && isMobileSidebarOpen ? 'blur-active' : ''}`}>
                <div className="patient-main-content">
                    {/* Mobile Header - Only Page Name */}
                    {isMobile && (
                        <div className="patient-mobile-header">
                            <div className="patient-mobile-page-title">
                                <h2>{getCurrentPageName()}</h2>
                            </div>
                        </div>
                    )}
                    
                    {/* Desktop Header */}
                    {!isMobile && (
                        <div className="patient-main-header">
                            <h1>Welcome back, <span>{user?.name?.split(" ")[0] || "Patient"}</span>!</h1>
                            <p>Book and manage your appointments.</p>
                        </div>
                    )}
                    
                    {activeTab === "overview" && renderOverview()}
                    {activeTab === "appointments" && (
                        <PatientAppointments 
                            upcomingAppointments={upcomingAppointments} 
                            pastAppointments={pastAppointments} 
                            handleCancelAppointment={handleCancelAppointment} 
                            formatTimeTo12Hour={formatTimeTo12Hour} 
                        />
                    )}
                    {activeTab === "profile" && <PatientProfile user={user} setUser={setUser} />}
                    {activeTab === "notifications" && (
                        <PatientNotifications 
                            notifications={notifications} 
                            fetchNotifications={fetchNotifications}
                            onNotificationCountChange={handleNotificationCountChange}
                        />
                    )}
                    {activeTab === "reports" && <PatientReports onReportViewed={handleReportViewed} />}
                </div>
            </div>
        </div>
    );
}

export default PatientDashboard;