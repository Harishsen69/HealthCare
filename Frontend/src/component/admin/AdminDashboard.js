import React, { useState, useEffect } from "react";
import API from "../../services/api";
import Sidebar from "../common/Sidebar";
import AdminDoctors from "./AdminDoctors";
import AdminAppointments from "./AdminAppointments";
import AdminProfile from "./AdminProfile";
import "./AdminDashboard.css";

function AdminDashboard({ setPage }) {
    // ========== STATE VARIABLES ==========
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("medicareUser");
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    // Get activeTab from localStorage on refresh
    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('adminDashboardTab');
        return savedTab || "overview";
    });
    
    const [loading, setLoading] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    
    // Dashboard data states
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);

    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    // Save activeTab to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('adminDashboardTab', activeTab);
    }, [activeTab]);

    // ========== FORMAT TIME TO 12-HOUR ==========
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
            doctors: "Doctors",
            appointments: "Appointments",
            profile: "Profile"
        };
        return pageNames[activeTab] || "Dashboard";
    };

    // ========== FETCH DASHBOARD DATA ==========
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = { Authorization: `Bearer ${token}` };
            
            // Fetch doctors list
            const doctorsRes = await API.get('admin/doctors/', { headers });
            setDoctors(doctorsRes.data);
            
            // Fetch all users (patients)
            const usersRes = await API.get('admin/users/', { headers });
            setPatients(usersRes.data.filter(u => !u.is_superuser));
            
            // Fetch all appointments
            const appointmentsRes = await API.get('admin/appointments/', { headers });
            setAppointments(appointmentsRes.data);
            
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    // ========== TOGGLE MOBILE SIDEBAR ==========
    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    // ========== LOAD DATA ON MOUNT ==========
    useEffect(() => {
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p>Loading your dashboard...</p>
        </div>
    );

    // ========== RENDER OVERVIEW DASHBOARD ==========
    const renderOverview = () => (
        <div className="admin-dashboard-container">
            {/* Stats Cards */}
            <div className="admin-stats-cards">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">👨‍⚕️</div>
                    <div className="admin-stat-details">
                        <h3>{doctors.length}</h3>
                        <p>Total Doctors</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">👤</div>
                    <div className="admin-stat-details">
                        <h3>{patients.length}</h3>
                        <p>Total Patients</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">📅</div>
                    <div className="admin-stat-details">
                        <h3>{appointments.length}</h3>
                        <p>Total Appointments</p>
                    </div>
                </div>
            </div>

            {/* Recent Appointments Table */}
            <div className="admin-recent-section">
                <div className="admin-section-header">
                    <h3>📋 Recent Appointments</h3>
                </div>
                <div className="admin-table-responsive">
                    <table className="admin-data-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.slice(0, 10).map((apt, index) => (
                                <tr key={apt.id}>
                                    <td>{index + 1}</td>
                                    <td>{apt.patient_name || apt.user?.username || "N/A"}</td>
                                    <td>{apt.doctor_name}</td>
                                    <td>{apt.date}</td>
                                    <td>{formatTimeTo12Hour(apt.time)}</td>
                                    <td><span className={`admin-status-badge ${apt.status}`}>{apt.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {appointments.length > 10 && (
                    <div className="admin-view-all" onClick={() => setActiveTab("appointments")}>
                        View all appointments →
                    </div>
                )}
            </div>
        </div>
    );

    // ========== MAIN RENDER ==========
    return (
        <div className="admin-dashboard-layout">
            <Sidebar 
                userRole="admin"
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                user={user}
                setPage={setPage}
                isMobile={isMobile}
                isMobileSidebarOpen={isMobileSidebarOpen}
                toggleMobileSidebar={toggleMobileSidebar}
            />
            
            {/* ✅ Blur overlay wrapper - SAME AS PATIENT */}
            <div className={`admin-content-overlay ${isMobile && isMobileSidebarOpen ? 'blur-active' : ''}`}>
                <div className="admin-main-content">
                    {/* Mobile Header - Only Page Name */}
                    {isMobile && (
                        <div className="admin-mobile-header">
                            <div className="admin-mobile-page-title">
                                <h2>{getCurrentPageName()}</h2>
                            </div>
                        </div>
                    )}
                    
                    {/* Desktop Header */}
                    {!isMobile && (
                        <div className="admin-main-header">
                            <h1>Welcome back, <span>{user?.name?.split(" ")[0] || "Admin"}</span>!</h1>
                            <p>Manage doctors, patients and appointments.</p>
                        </div>
                    )}
                    
                    {activeTab === "overview" && renderOverview()}
                    {activeTab === "doctors" && <AdminDoctors doctors={doctors} setDoctors={setDoctors} />}
                    {activeTab === "appointments" && <AdminAppointments appointments={appointments} formatTimeTo12Hour={formatTimeTo12Hour} />}
                    {activeTab === "profile" && <AdminProfile user={user} setUser={setUser} />}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;