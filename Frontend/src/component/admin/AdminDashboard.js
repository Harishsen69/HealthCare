import React, { useState, useEffect, useCallback } from "react";
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

    const [activeTab, setActiveTab] = useState(() => {
        const savedTab = localStorage.getItem('adminDashboardTab');
        return savedTab || "overview";
    });

    const [loading, setLoading] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [pendingAppointments, setPendingAppointments] = useState([]);

    // 🔥 Appointments Search & Filter States
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [doctorFilter, setDoctorFilter] = useState("all");
    const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const [uniqueDoctors, setUniqueDoctors] = useState([]);

    // 🔥 Doctors Search & Filter States
    const [doctorSearchTerm, setDoctorSearchTerm] = useState("");
    const [specializationFilter, setSpecializationFilter] = useState("all");
    const [doctorStatusFilter, setDoctorStatusFilter] = useState("all");
    const [specializations, setSpecializations] = useState([]);

    const isMobile = window.innerWidth <= 768;

    // 🔥 Auto-sync user from localStorage
    useEffect(() => {
        const savedUser = localStorage.getItem("medicareUser");
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
            } catch (e) { }
        }

        const handleStorageChange = () => {
            const saved = localStorage.getItem("medicareUser");
            if (saved) {
                try {
                    const userData = JSON.parse(saved);
                    setUser(userData);
                } catch (e) { }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        const savedTab = localStorage.getItem('adminDashboardTab');
        if (savedTab) {
            setActiveTab(savedTab);
        } else {
            setActiveTab('overview');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('adminDashboardTab', activeTab);
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
            doctors: "Manage Doctors",
            appointments: "All Appointments",
            profile: "Profile"
        };
        return pageNames[activeTab] || "Dashboard";
    };

    // 🔥 Filter appointments function
    const filterAppointments = useCallback((appointmentsList) => {
        if (!appointmentsList || !Array.isArray(appointmentsList)) {
            return [];
        }

        let filtered = [...appointmentsList];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(apt =>
                apt.patient_name?.toLowerCase().includes(term) ||
                apt.doctor_name?.toLowerCase().includes(term)
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(apt => apt.status === statusFilter);
        }

        if (doctorFilter !== "all") {
            filtered = filtered.filter(apt => apt.doctor_name === doctorFilter);
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
    }, [searchTerm, statusFilter, doctorFilter, dateFilter, customDateRange]);

    // 🔥 Filter doctors function
    const filterDoctors = useCallback((doctorsList) => {
        if (!doctorsList || !Array.isArray(doctorsList)) {
            return [];
        }

        let filtered = [...doctorsList];

        if (doctorSearchTerm.trim()) {
            const term = doctorSearchTerm.toLowerCase();
            filtered = filtered.filter(doc =>
                doc.name?.toLowerCase().includes(term) ||
                doc.specialization?.toLowerCase().includes(term) ||
                doc.email?.toLowerCase().includes(term) ||
                doc.clinic_name?.toLowerCase().includes(term) ||
                doc.address?.toLowerCase().includes(term)
            );
        }

        if (specializationFilter !== "all") {
            filtered = filtered.filter(doc => doc.specialization === specializationFilter);
        }

        if (doctorStatusFilter !== "all") {
            const isActive = doctorStatusFilter === "active";
            filtered = filtered.filter(doc => doc.is_active === isActive);
        }

        return filtered;
    }, [doctorSearchTerm, specializationFilter, doctorStatusFilter]);

    // 🔥 Reset appointments filters
    const resetAppointmentsFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setDateFilter("all");
        setDoctorFilter("all");
        setCustomDateRange({ start: "", end: "" });
        setShowDateRangePicker(false);
    };

    // 🔥 Reset doctors filters
    const resetDoctorsFilters = () => {
        setDoctorSearchTerm("");
        setSpecializationFilter("all");
        setDoctorStatusFilter("all");
    };

    // 🔥 Export Appointments to CSV
    const exportAppointmentsToCSV = () => {
        const filteredAppointments = filterAppointments(appointments);

        if (!filteredAppointments || filteredAppointments.length === 0) {
            alert("No appointments to export!");
            return;
        }

        const headers = ["S.No", "Patient Name", "Doctor Name", "Clinic/Hospital", "Date", "Time", "Status"];
        const rows = filteredAppointments.map((apt, index) => [
            index + 1,
            apt.patient_name || "N/A",
            apt.doctor_name,
            apt.doctor_clinic || apt.doctor_address || "N/A",
            apt.date,
            formatTimeTo12Hour(apt.time),
            apt.status
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `admin_appointments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // 🔥 Export Doctors to CSV
    const exportDoctorsToCSV = () => {
        const filteredDoctors = filterDoctors(doctors);

        if (!filteredDoctors || filteredDoctors.length === 0) {
            alert("No doctors to export!");
            return;
        }

        const headers = ["S.No", "Doctor Name", "Specialization", "Email", "Phone", "Fee", "Experience", "Clinic/Hospital", "Address", "Status"];
        const rows = filteredDoctors.map((doc, index) => [
            index + 1,
            doc.name,
            doc.specialization,
            doc.email,
            doc.phone || "N/A",
            doc.fee || "N/A",
            doc.experience || "N/A",
            doc.clinic_name || "N/A",
            doc.address || "N/A",
            doc.is_active ? "Active" : "Inactive"
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `doctors_list_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const headers = { Authorization: `Bearer ${token}` };

            const doctorsRes = await API.get('admin/doctors/', { headers });
            setDoctors(doctorsRes.data || []);

            const uniqueSpecs = [...new Set((doctorsRes.data || []).map(doc => doc.specialization).filter(Boolean))];
            setSpecializations(uniqueSpecs);

            const usersRes = await API.get('admin/users/', { headers });
            setPatients(usersRes.data || []);

            const appointmentsRes = await API.get('admin/appointments/', { headers });
            const allAppointments = appointmentsRes.data || [];
            setAppointments(allAppointments);

            const uniqueDoctorNames = [...new Set(allAppointments.map(apt => apt.doctor_name).filter(Boolean))];
            setUniqueDoctors(uniqueDoctorNames);

            const today = new Date().toISOString().split('T')[0];
            setTodayAppointments(allAppointments.filter(apt => apt.date === today));
            setPendingAppointments(allAppointments.filter(apt => apt.status === 'pending'));

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setDoctors([]);
            setPatients([]);
            setAppointments([]);
            setTodayAppointments([]);
            setPendingAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // 🔥 DELETE DOCTOR FUNCTION
    // ========================================
    const handleDeleteDoctor = async (doctorId) => {
        if (!window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');
            await API.delete(`admin/doctors/${doctorId}/delete/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Doctor deleted successfully!");
            fetchDashboardData();
        } catch (error) {
            console.error("Error deleting doctor:", error);
            alert(error.response?.data?.error || "Failed to delete doctor");
        }
    };

    // ========================================
    // 🔥 UPDATE DOCTOR FUNCTION
    // ========================================
    const handleUpdateDoctor = async (doctorId, updatedData) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.patch(`doctors/${doctorId}/update/`, updatedData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                alert("Doctor updated successfully!");
                fetchDashboardData();
                return true;
            }
        } catch (error) {
            console.error("Error updating doctor:", error);
            alert(error.response?.data?.error || "Failed to update doctor");
            return false;
        }
    };

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    // 🔥 Render Appointments Filter Bar
    const renderAppointmentsFilterBar = () => (
        <div className="admin-filter-bar">
            <div className="admin-filter-row">
                <div className="admin-search-input">
                    <input
                        type="text"
                        placeholder="🔍 Search by patient or doctor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="admin-filter-select"
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
                    className="admin-filter-select"
                    value={doctorFilter}
                    onChange={(e) => setDoctorFilter(e.target.value)}
                >
                    <option value="all">👨‍⚕️ All Doctors</option>
                    {uniqueDoctors.map((doc, idx) => (
                        <option key={idx} value={doc}>{doc}</option>
                    ))}
                </select>

                <select
                    className="admin-filter-select"
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
                <div className="admin-date-range">
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

            <div className="admin-filter-actions">
                <button className="admin-reset-btn" onClick={resetAppointmentsFilters}>
                    🔄 Reset
                </button>
                <button className="admin-export-btn" onClick={exportAppointmentsToCSV}>
                    📥 Export
                </button>
            </div>
        </div>
    );

    // 🔥 Render Doctors Filter Bar
    const renderDoctorsFilterBar = () => (
        <div className="admin-doctors-filter-bar">
            <div className="admin-filter-row">
                <div className="admin-search-input">
                    <input
                        type="text"
                        placeholder="🔍 Search by name, specialization, clinic or location..."
                        value={doctorSearchTerm}
                        onChange={(e) => setDoctorSearchTerm(e.target.value)}
                    />
                </div>

                <select
                    className="admin-filter-select"
                    value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                >
                    <option value="all">📚 All Specializations</option>
                    {specializations.map((spec, idx) => (
                        <option key={idx} value={spec}>{spec}</option>
                    ))}
                </select>

                <select
                    className="admin-filter-select"
                    value={doctorStatusFilter}
                    onChange={(e) => setDoctorStatusFilter(e.target.value)}
                >
                    <option value="all">📊 All Status</option>
                    <option value="active">✅ Active</option>
                    <option value="inactive">❌ Inactive</option>
                </select>
            </div>

            <div className="admin-filter-actions">
                <button className="admin-reset-btn" onClick={resetDoctorsFilters}>
                    🔄 Reset
                </button>
                <button className="admin-export-btn" onClick={exportDoctorsToCSV}>
                    📥 Export Doctors
                </button>
            </div>
        </div>
    );

    if (loading) return (
        <div className="admin-loading">
            <div className="admin-loading-spinner"></div>
            <p>Loading your dashboard...</p>
        </div>
    );

    const filteredAppointmentsForOverview = filterAppointments(appointments) || [];
    const filteredAppointmentsForTable = (filterAppointments(appointments) || []).slice(0, 10);
    const filteredDoctors = filterDoctors(doctors) || [];

    const renderOverview = () => (
        <div className="admin-dashboard-container">
            {/* Stats Cards - 4 Cards */}
            <div className="admin-stats-cards">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">👨‍⚕️</div>
                    <div className="admin-stat-details">
                        <h3>{doctors?.length || 0}</h3>
                        <p>Total Doctors</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">👤</div>
                    <div className="admin-stat-details">
                        <h3>{patients?.length || 0}</h3>
                        <p>Total Patients</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">📅</div>
                    <div className="admin-stat-details">
                        <h3>{appointments?.length || 0}</h3>
                        <p>Total Appointments</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">📍</div>
                    <div className="admin-stat-details">
                        <h3>{todayAppointments?.length || 0}</h3>
                        <p>Today's Appointments</p>
                    </div>
                </div>
            </div>

            {/* Appointments Filter Bar in Overview */}
            {renderAppointmentsFilterBar()}

            {/* Recent Appointments Table */}
            <div className="admin-recent-section">
                <div className="admin-section-header">
                    <h3>📋 Recent Appointments</h3>
                    <span className="admin-total-count">{filteredAppointmentsForOverview?.length || 0} Total</span>
                </div>
                <div className="admin-table-responsive">
                    <table className="admin-data-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Clinic/Hospital</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!filteredAppointmentsForTable || filteredAppointmentsForTable.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="admin-empty-table">
                                        No appointments found matching your filters
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointmentsForTable.map((apt, index) => (
                                    <tr key={apt.id}>
                                        <td>{index + 1}</td>
                                        <td>{apt.patient_name || apt.user?.username || "N/A"}</td>
                                        <td>{apt.doctor_name}</td>
                                        <td>{apt.doctor_clinic || apt.doctor_address || "N/A"}</td>
                                        <td>{apt.date}</td>
                                        <td>{formatTimeTo12Hour(apt.time)}</td>
                                        <td><span className={`admin-status-badge ${apt.status}`}>{apt.status}</span></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {(filteredAppointmentsForOverview?.length || 0) > 10 && (
                    <div className="admin-view-all" onClick={() => setActiveTab("appointments")}>
                        View all {filteredAppointmentsForOverview?.length || 0} appointments →
                    </div>
                )}
            </div>

            {/* 🔥 EXTRA SPACE AT BOTTOM */}
            <div style={{ height: '30px' }}></div>
        </div>
    );

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

            <div className={`admin-content-overlay ${isMobile && isMobileSidebarOpen ? 'blur-active' : ''}`}>
                <div className="admin-main-content">
                    {isMobile && (
                        <div className="admin-mobile-header">
                            <div className="admin-mobile-page-title">
                                <h2>{getCurrentPageName()}</h2>
                            </div>
                        </div>
                    )}

                    {!isMobile && (
                        <div className="admin-main-header">
                            <h1>Welcome back, <span>{user?.name?.split(" ")[0] || "Admin"}</span>!</h1>
                            <p>Manage doctors, patients and appointments.</p>
                        </div>
                    )}

                    {activeTab === "overview" && renderOverview()}

                    {/* 🔥 Doctors Tab - WITH filter bar */}
                    {activeTab === "doctors" && (
                        <>
                            {renderDoctorsFilterBar()}
                            <AdminDoctors
                                doctors={filteredDoctors}
                                setDoctors={setDoctors}
                                onDeleteDoctor={handleDeleteDoctor}
                                onUpdateDoctor={handleUpdateDoctor}
                            />
                        </>
                    )}

                    {/* 🔥 Appointments Tab - WITH filter bar */}
                    {activeTab === "appointments" && (
                        <>
                            {renderAppointmentsFilterBar()}
                            <AdminAppointments
                                appointments={filterAppointments(appointments)}
                                formatTimeTo12Hour={formatTimeTo12Hour}
                            />
                        </>
                    )}

                    {activeTab === "profile" && <AdminProfile user={user} setUser={setUser} />}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;