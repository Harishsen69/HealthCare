import React, { useState, useEffect, useCallback } from "react";
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

    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('doctorDashboardTab');
        return savedTab || "overview";
    });

    const [loading, setLoading] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const [doctorPendingAppointments, setDoctorPendingAppointments] = useState([]);
    const [doctorConfirmedAppointments, setDoctorConfirmedAppointments] = useState([]);
    const [doctorCompletedAppointments, setDoctorCompletedAppointments] = useState([]);
    const [hasPendingAppointments, setHasPendingAppointments] = useState(false);
    const [doctorUniquePatients, setDoctorUniquePatients] = useState(0);

    const [todayAppointments, setTodayAppointments] = useState([]);
    const [upcomingDoctorAppointments, setUpcomingDoctorAppointments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);

    // 🔥 Search & Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);

    // 🔥 Force re-render state
    const [forceUpdate, setForceUpdate] = useState(0);

    const isMobile = window.innerWidth <= 768;

    // 🔥 Auto-sync user from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem("medicareUser");
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
                console.log("✅ DoctorDashboard initial sync:", userData.name);
            } catch (e) { }
        }

        const handleStorageChange = () => {
            const saved = localStorage.getItem("medicareUser");
            if (saved) {
                try {
                    const userData = JSON.parse(saved);
                    setUser(userData);
                    setForceUpdate(prev => prev + 1);
                    console.log("🔄 DoctorDashboard storage sync:", userData.name);
                } catch (e) { }
            }
        };

        const handleCustomEvent = () => {
            const saved = localStorage.getItem("medicareUser");
            if (saved) {
                try {
                    const userData = JSON.parse(saved);
                    setUser(userData);
                    setForceUpdate(prev => prev + 1);
                    console.log("🔄 DoctorDashboard custom event sync:", userData.name);
                } catch (e) { }
            }
        };

        // Polling for cross-device updates
        let lastCheckedUser = localStorage.getItem("medicareUser");
        const interval = setInterval(() => {
            const currentUser = localStorage.getItem("medicareUser");
            if (currentUser !== lastCheckedUser) {
                lastCheckedUser = currentUser;
                if (currentUser) {
                    try {
                        const userData = JSON.parse(currentUser);
                        setUser(userData);
                        setForceUpdate(prev => prev + 1);
                        console.log("🔄 DoctorDashboard polling sync:", userData.name);
                    } catch (e) { }
                }
            }
        }, 2000);

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('profileUpdated', handleCustomEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profileUpdated', handleCustomEvent);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const savedTab = localStorage.getItem('doctorDashboardTab');
        if (savedTab) {
            setActiveTab(savedTab);
        } else {
            setActiveTab('overview');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('doctorDashboardTab', activeTab);
    }, [activeTab]);

    const formatTimeTo12Hour = (time24) => {
        if (!time24) return '';
        let [hours, minutes] = time24.split(':');
        let period = hours >= 12 ? 'PM' : 'AM';
        let hour12 = hours % 12 || 12;
        let hour12Str = hour12.toString().padStart(2, '0');
        return `${hour12Str}:${minutes} ${period}`;
    };

    const getCurrentPageName = () => {
        const pageNames = {
            overview: "Dashboard",
            appointments: "Appointments",
            availability: "Availability",
            profile: "Profile & Location",
            notifications: "Notifications",
            reports: "Reports"
        };
        return pageNames[activeTab] || "Dashboard";
    };

    // 🔥 Filter appointments function
    const filterAppointments = (appointmentsList) => {
        let filtered = [...appointmentsList];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(apt =>
                apt.patient_name?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(apt => apt.status === statusFilter);
        }

        const today = new Date().toISOString().split('T')[0];

        if (dateFilter === "today") {
            filtered = filtered.filter(apt => apt.date === today);
        } else if (dateFilter === "upcoming") {
            filtered = filtered.filter(apt => apt.date > today);
        } else if (dateFilter === "past") {
            filtered = filtered.filter(apt => apt.date < today);
        } else if (dateFilter === "custom" && customDateRange.start && customDateRange.end) {
            filtered = filtered.filter(apt => apt.date >= customDateRange.start && apt.date <= customDateRange.end);
        }

        return filtered;
    };

    // 🔥 Reset all filters
    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setDateFilter("all");
        setCustomDateRange({ start: "", end: "" });
        setShowDateRangePicker(false);
    };

    // 🔥 Export to CSV
    const exportToCSV = () => {
        const allAppointments = [...doctorPendingAppointments, ...doctorConfirmedAppointments, ...doctorCompletedAppointments];
        const filteredAppointments = filterAppointments(allAppointments);

        if (filteredAppointments.length === 0) {
            alert("No appointments to export!");
            return;
        }

        const headers = ["S.No", "Patient Name", "Date", "Time", "Status"];
        const rows = filteredAppointments.map((apt, index) => [
            index + 1,
            apt.patient_name || "Patient",
            apt.date,
            formatTimeTo12Hour(apt.time),
            apt.status
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `doctor_appointments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('notifications/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data || [];
            setNotifications(data);
            setNotificationCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

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

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    useEffect(() => {
        fetchDoctorAppointments();
        fetchDoctorPendingCount();
        fetchNotifications();
    }, []);

    // 🔥 Render Filter Bar Component
    const renderFilterBar = () => (
        <div className="doctor-filter-bar">
            <div className="doctor-filter-row">
                <div className="doctor-search-input">
                    <input
                        type="text"
                        placeholder="🔍 Search by patient name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="doctor-filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">📊 All Status</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="confirmed">✅ Confirmed</option>
                    <option value="completed">✔️ Completed</option>
                    <option value="cancelled">❌ Cancelled</option>
                </select>

                <select
                    className="doctor-filter-select"
                    value={dateFilter}
                    onChange={(e) => {
                        setDateFilter(e.target.value);
                        if (e.target.value === "custom") {
                            setShowDateRangePicker(true);
                        } else {
                            setShowDateRangePicker(false);
                        }
                    }}
                >
                    <option value="all">📅 All Dates</option>
                    <option value="today">📍 Today</option>
                    <option value="upcoming">⏫ Upcoming</option>
                    <option value="past">⬇️ Past</option>
                    <option value="custom">📆 Custom Range</option>
                </select>
            </div>

            {showDateRangePicker && dateFilter === "custom" && (
                <div className="doctor-date-range">
                    <input
                        type="date"
                        placeholder="Start Date"
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                    <span>to</span>
                    <input
                        type="date"
                        placeholder="End Date"
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                </div>
            )}

            <div className="doctor-filter-actions">
                <button className="doctor-reset-btn" onClick={resetFilters}>
                    🔄 Reset
                </button>
                <button className="doctor-export-btn" onClick={exportToCSV}>
                    📥 Export
                </button>
            </div>
        </div>
    );

    if (loading) return (
        <div className="doctor-loading">
            <div className="doctor-loading-spinner"></div>
            <p>Loading your dashboard...</p>
        </div>
    );

    // Filtered appointments for overview
    const filteredPending = filterAppointments(doctorPendingAppointments);
    const filteredConfirmed = filterAppointments(doctorConfirmedAppointments);
    const filteredCompleted = filterAppointments(doctorCompletedAppointments);
    const allAppointments = [...doctorPendingAppointments, ...doctorConfirmedAppointments, ...doctorCompletedAppointments];
    const filteredAll = filterAppointments(allAppointments);

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
                        <h3>{filteredPending.length}</h3>
                        <p>Pending Requests</p>
                    </div>
                </div>
                <div className="doctor-stat-card">
                    <div className="doctor-stat-icon">✅</div>
                    <div className="doctor-stat-details">
                        <h3>{filteredCompleted.length}</h3>
                        <p>Completed</p>
                    </div>
                </div>
                <div className="doctor-stat-card">
                    <div className="doctor-stat-icon">📊</div>
                    <div className="doctor-stat-details">
                        <h3>{filteredAll.length}</h3>
                        <p>Total Appointments</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar in Overview */}
            {renderFilterBar()}

            {/* Today's Schedule */}
            <div className="doctor-today-schedule">
                <div className="doctor-section-header">
                    <h3>📅 Today's Schedule - {new Date().toISOString().split('T')[0]}</h3>
                </div>

                {todayAppointments.length === 0 ? (
                    <div className="doctor-empty-table">No appointments scheduled for today</div>
                ) : (
                    <div className="doctor-table-responsive">
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
                    </div>
                )}
            </div>

            {/* Upcoming Appointments */}
            {filteredAll.filter(apt => apt.date > new Date().toISOString().split('T')[0] && apt.status !== 'completed').length > 0 && (
                <div className="doctor-upcoming-appointments">
                    <div className="doctor-section-header">
                        <h3>📋 Upcoming Appointments</h3>
                    </div>
                    <div className="doctor-table-responsive">
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
                                {filteredAll.filter(apt => apt.date > new Date().toISOString().split('T')[0] && apt.status !== 'completed').slice(0, 5).map((apt, index) => (
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
                    </div>
                    {filteredAll.filter(apt => apt.date > new Date().toISOString().split('T')[0] && apt.status !== 'completed').length > 5 && (
                        <div className="doctor-view-all" onClick={() => setActiveTab("appointments")}>
                            View all upcoming appointments →
                        </div>
                    )}
                </div>
            )}

            {/* Completed Appointments */}
            {filteredCompleted.length > 0 && (
                <div className="doctor-completed-appointments">
                    <div className="doctor-section-header">
                        <h3>✅ Completed Appointments</h3>
                        <span className="doctor-completed-count">{filteredCompleted.length} Completed</span>
                    </div>
                    <div className="doctor-table-responsive">
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
                                {filteredCompleted.slice(0, 5).map((apt, index) => (
                                    <tr key={apt.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{apt.patient_name || "Patient"}</strong></td>
                                        <td>{apt.date}</td>
                                        <td>{formatTimeTo12Hour(apt.time)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredCompleted.length > 5 && (
                        <div className="doctor-view-all" onClick={() => setActiveTab("appointments")}>
                            View all {filteredCompleted.length} completed appointments →
                        </div>
                    )}
                </div>
            )}

            {/* 🔥 EXTRA SPACE AT BOTTOM */}
            <div style={{ height: '30px' }}></div>
        </div>
    );

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
                isMobile={isMobile}
                isMobileSidebarOpen={isMobileSidebarOpen}
                toggleMobileSidebar={toggleMobileSidebar}
            />

            <div className={`doctor-content-overlay ${isMobile && isMobileSidebarOpen ? 'blur-active' : ''}`}>
                <div className="doctor-main-content">
                    {isMobile && (
                        <div className="doctor-mobile-header">
                            <div className="doctor-mobile-page-title">
                                <h2>{getCurrentPageName()}</h2>
                            </div>
                        </div>
                    )}

                    {!isMobile && (
                        <div className="doctor-main-header">
                            <h1>Welcome back, <span>{user?.name?.split(" ")[0] || "Doctor"}</span>!</h1>
                            <p>Manage your appointments and availability.</p>
                        </div>
                    )}

                    {activeTab === "overview" && renderOverview()}
                    {activeTab === "appointments" && (
                        <>
                            {renderFilterBar()}
                            <DoctorAppointments
                                doctorPendingAppointments={filteredPending}
                                doctorConfirmedAppointments={filteredConfirmed}
                                doctorCompletedAppointments={filteredCompleted}
                                loadingDoctorApps={loading}
                                handleDoctorAppointmentAction={handleDoctorAppointmentAction}
                                formatTimeTo12Hour={formatTimeTo12Hour}
                            />
                        </>
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
        </div>
    );
}

export default DoctorDashboard;