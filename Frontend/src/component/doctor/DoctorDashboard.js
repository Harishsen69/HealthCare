import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Sidebar from "../common/Sidebar";
import DoctorAppointments from "./DoctorAppointments";
import DoctorAvailability from "./DoctorAvailability";
import DoctorProfile from "./DoctorProfile";
import DoctorNotifications from "./DoctorNotifications";
import DoctorReports from "./DoctorReports";
import "./DoctorDashboard.css";

function DoctorDashboard({ setPage }) {
    // ========== STATE VARIABLES ==========
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("medicareUser");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    
    // Doctor appointments states
    const [doctorPendingAppointments, setDoctorPendingAppointments] = useState([]);
    const [doctorConfirmedAppointments, setDoctorConfirmedAppointments] = useState([]);
    const [doctorCompletedAppointments, setDoctorCompletedAppointments] = useState([]);
    const [hasPendingAppointments, setHasPendingAppointments] = useState(false);
    const [doctorUniquePatients, setDoctorUniquePatients] = useState(0);
    
    // Dashboard states
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [upcomingDoctorAppointments, setUpcomingDoctorAppointments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);

    // ========== HELPER: FORMAT TIME TO 12-HOUR ==========
    const formatTimeTo12Hour = (time24) => {
        if (!time24) return '';
        let [hours, minutes] = time24.split(':');
        let period = hours >= 12 ? 'PM' : 'AM';
        let hour12 = hours % 12 || 12;
        let hour12Str = hour12.toString().padStart(2, '0');
        return `${hour12Str}:${minutes} ${period}`;
    };

    // ========== FETCH NOTIFICATIONS ==========
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('notifications/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data || [];
            setNotifications(data);
            setNotificationCount(data.filter(n => !n.is_read).length);
            console.log("Notifications fetched:", data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    // ========== FETCH DOCTOR APPOINTMENTS ==========
    const fetchDoctorAppointments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('doctor-all-appointments/', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                const pending = response.data.pending || [];
                const confirmed = response.data.confirmed || [];
                const completed = response.data.completed || [];

                setDoctorPendingAppointments(pending);
                setDoctorConfirmedAppointments(confirmed);
                setDoctorCompletedAppointments(completed);
                setHasPendingAppointments(pending.length > 0);
                setDoctorUniquePatients(response.data.unique_patients || 0);

                const today = new Date().toISOString().split('T')[0];
                const allApps = [...pending, ...confirmed, ...completed];
                
                setTodayAppointments(allApps.filter(apt => apt.date === today));
                setUpcomingDoctorAppointments(
                    allApps.filter(apt => apt.date > today && apt.status !== 'completed')
                );
            }
        } catch (error) {
            console.error("Error fetching doctor appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    // ========== FETCH PENDING COUNT ==========
    const fetchDoctorPendingCount = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('doctor-pending-count/', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                setHasPendingAppointments(response.data.has_pending);
            }
        } catch (error) {
            console.error("Error fetching pending count:", error);
        }
    };

    // ========== DOCTOR APPOINTMENT ACTION ==========
    const handleDoctorAppointmentAction = async (appointmentId, action) => {
        try {
            const token = localStorage.getItem('access_token');
            let newStatus = '';

            if (action === 'confirm') newStatus = 'confirmed';
            else if (action === 'complete') newStatus = 'completed';
            else if (action === 'cancel') newStatus = 'cancelled';

            const response = await API.put(`update-appointment/${appointmentId}/`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                await fetchDoctorAppointments();
                await fetchDoctorPendingCount();
                await fetchNotifications();
            }
        } catch (error) {
            console.error("Action error:", error);
            alert(error.response?.data?.error || "Failed to perform action");
        }
    };

    // ========== UPDATED LOGOUT HANDLER ==========
    const handleLogout = () => {
        // Clear all localStorage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("medicareUser");
        localStorage.removeItem("user_type");
        localStorage.removeItem("user_role");
        localStorage.removeItem("currentPage");
        localStorage.removeItem("viewedReports");
        
        // Clear session storage
        sessionStorage.clear();
        
        // Home page pe bhejo
        setPage("home");
        
        // Force page reload
        setTimeout(() => {
            window.location.reload();
        }, 50);
    };

    // ========== LOAD DATA ON MOUNT ==========
    useEffect(() => {
        fetchDoctorAppointments();
        fetchDoctorPendingCount();
        fetchNotifications();
    }, []);

    if (loading) return <div className="doctor-loading">Loading...</div>;

    // ========== RENDER OVERVIEW DASHBOARD ==========
    const renderOverview = () => (
        <div className="doctor-dashboard-container">
            {/* Stats Cards */}
            <div className="doctor-stats-cards">
                <div className="doctor-stat-card">
                    <div className="doctor-stat-icon">👥</div>
                    <div className="doctor-stat-details">
                        <h3>{doctorUniquePatients}</h3>
                        <p>Total Patients</p>
                    </div>
                </div>
                <div className="doctor-stat-card">
                    <div className="doctor-stat-icon">📅</div>
                    <div className="doctor-stat-details">
                        <h3>{doctorPendingAppointments.length}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>
                <div className="doctor-stat-card">
                    <div className="doctor-stat-icon">✅</div>
                    <div className="doctor-stat-details">
                        <h3>{doctorCompletedAppointments.length}</h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div className="doctor-stat-card">
                    <div className="doctor-stat-icon">📊</div>
                    <div className="doctor-stat-details">
                        <h3>{doctorPendingAppointments.length + doctorConfirmedAppointments.length + doctorCompletedAppointments.length}</h3>
                        <p>Total Appointments</p>
                    </div>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="doctor-today-schedule">
                <div className="doctor-section-header">
                    <h3>📅 Today's Schedule - {new Date().toISOString().split('T')[0]}</h3>
                </div>
                
                {todayAppointments.length === 0 ? (
                    <div className="doctor-empty-table">No appointments scheduled for today</div>
                ) : (
                    <table className="doctor-availability-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Patient Name</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todayAppointments.map((apt, index) => (
                                <tr key={apt.id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{apt.patient_name || "Patient"}</strong></td>
                                    <td>{formatTimeTo12Hour(apt.time)}</td>
                                    <td><span className={`doctor-status-badge ${apt.status}`}>{apt.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Upcoming Appointments */}
            {upcomingDoctorAppointments.length > 0 && (
                <div className="doctor-upcoming-appointments">
                    <div className="doctor-section-header">
                        <h3>📋 Upcoming Appointments</h3>
                    </div>
                    <table className="doctor-availability-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Patient Name</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {upcomingDoctorAppointments.slice(0, 5).map((apt, index) => (
                                <tr key={apt.id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{apt.patient_name || "Patient"}</strong></td>
                                    <td>{apt.date}</td>
                                    <td>{formatTimeTo12Hour(apt.time)}</td>
                                    <td><span className={`doctor-status-badge ${apt.status}`}>{apt.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {upcomingDoctorAppointments.length > 5 && (
                        <div className="doctor-view-all" onClick={() => setActiveTab("appointments")}>
                            View all upcoming appointments →
                        </div>
                    )}
                </div>
            )}

            {/* Completed Appointments */}
            {doctorCompletedAppointments.length > 0 && (
                <div className="doctor-completed-appointments">
                    <div className="doctor-section-header">
                        <h3>✅ Completed Appointments</h3>
                        <span className="doctor-completed-count">{doctorCompletedAppointments.length} Completed</span>
                    </div>
                    <table className="doctor-availability-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Patient Name</th>
                                <th>Date</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctorCompletedAppointments.slice(0, 5).map((apt, index) => (
                                <tr key={apt.id}>
                                    <td>{index + 1}</td>
                                    <td><strong>{apt.patient_name || "Patient"}</strong></td>
                                    <td>{apt.date}</td>
                                    <td>{formatTimeTo12Hour(apt.time)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {doctorCompletedAppointments.length > 5 && (
                        <div className="doctor-view-all" onClick={() => setActiveTab("appointments")}>
                            View all {doctorCompletedAppointments.length} completed appointments →
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // ========== MAIN RENDER ==========
    return (
        <div className="doctor-dashboard-layout">
            <Sidebar 
                userRole="doctor"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                setPage={setPage}
                hasPendingAppointments={hasPendingAppointments}
                notificationCount={notificationCount}
            />
            
            <div className="doctor-main-content">
                <div className="doctor-main-header">
                    <h1>Welcome back, <span>{user?.name?.split(" ")[0] || "Doctor"}</span>!</h1>
                    <p>Manage your appointments and availability.</p>
                </div>
                
                {activeTab === "overview" && renderOverview()}
                {activeTab === "appointments" && (
                    <DoctorAppointments 
                        doctorPendingAppointments={doctorPendingAppointments}
                        doctorConfirmedAppointments={doctorConfirmedAppointments}
                        doctorCompletedAppointments={doctorCompletedAppointments}
                        loadingDoctorApps={loading}
                        handleDoctorAppointmentAction={handleDoctorAppointmentAction}
                        formatTimeTo12Hour={formatTimeTo12Hour}
                    />
                )}
                {activeTab === "availability" && <DoctorAvailability />}
                {activeTab === "profile" && <DoctorProfile user={user} setUser={setUser} />}
                {activeTab === "notifications" && (
                    <DoctorNotifications 
                        notifications={notifications}
                        fetchNotifications={fetchNotifications}
                        setActiveTab={setActiveTab}
                    />
                )}
                {activeTab === "reports" && <DoctorReports />}
            </div>
        </div>
    );
}

export default DoctorDashboard;