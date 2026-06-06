import React, { useState, useEffect } from "react";
import "./Sidebar.css";

function Sidebar({ userRole, activeTab, setActiveTab, user, setPage, hasPendingAppointments, notificationCount, reportCount }) {
    const [isOpen, setIsOpen] = useState(false);
    
    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.style.overflow = 'hidden';
            // ✅ Hide mobile header when sidebar opens
            const mobileHeader = document.querySelector('.patient-mobile-header');
            if (mobileHeader) {
                mobileHeader.style.display = 'none';
            }
        } else {
            document.body.style.overflow = '';
            // ✅ Show mobile header when sidebar closes
            if (isMobile && !isOpen) {
                const mobileHeader = document.querySelector('.patient-mobile-header');
                if (mobileHeader) {
                    mobileHeader.style.display = 'flex';
                }
            }
        }
        return () => {
            document.body.style.overflow = '';
            // ✅ Ensure header is visible on cleanup
            const mobileHeader = document.querySelector('.patient-mobile-header');
            if (mobileHeader && isMobile) {
                mobileHeader.style.display = 'flex';
            }
        };
    }, [isOpen, isMobile]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    const adminMenu = [
        { id: "overview", icon: "📊", label: "Dashboard" },
        { id: "doctors", icon: "👨‍⚕️", label: "Doctors" },
        { id: "appointments", icon: "📅", label: "Appointments" },
        { id: "profile", icon: "👤", label: "Profile" }
    ];

    const doctorMenu = [
        { id: "overview", icon: "📊", label: "Dashboard" },
        { id: "appointments", icon: "📅", label: "Appointments", showBadge: hasPendingAppointments },
        { id: "availability", icon: "⏰", label: "Availability" },
        { id: "reports", icon: "📋", label: "Reports" },
        { id: "profile", icon: "👤", label: "Profile" },
        { id: "notifications", icon: "🔔", label: "Notifications" }
    ];

    const patientMenu = [
        { id: "overview", icon: "📊", label: "Dashboard" },
        { id: "appointments", icon: "📅", label: "My Appointments" },
        { id: "reports", icon: "📋", label: "My Reports", showBadge: reportCount > 0 },
        { id: "profile", icon: "👤", label: "Profile" },
        { id: "notifications", icon: "🔔", label: "Notifications", badge: notificationCount }
    ];

    let menuItems = [];
    if (userRole === "admin") menuItems = adminMenu;
    else if (userRole === "doctor") menuItems = doctorMenu;
    else menuItems = patientMenu;

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("medicareUser");
        localStorage.removeItem("user_type");
        localStorage.removeItem("user_role");
        localStorage.removeItem("currentPage");
        sessionStorage.clear();
        if (setPage) setPage("home");
        setTimeout(() => window.location.reload(), 50);
    };

    const handleHome = () => {
        setPage("home");
        closeSidebar();
    };

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        closeSidebar();
    };

    return (
        <>
            {/* Mobile Hamburger Menu Button - Right Side */}
            {isMobile && (
                <button className={`hamburger-menu ${isOpen ? "open" : ""}`} onClick={toggleSidebar}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            )}

            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar}></div>
            )}

            {/* Sidebar */}
            <div className={`sidebar-container ${isOpen ? "sidebar-open" : ""}`}>
                <div className="sidebar-logo">
                    <span className="sidebar-logo-icon">🏥</span>
                    <span className="sidebar-logo-text">MediCare</span>
                </div>
                
                <div className="sidebar-user-info">
                    <div className="sidebar-user-avatar">👤</div>
                    <h3 className="sidebar-user-name">{user?.name || "User"}</h3>
                    <p className="sidebar-user-role">
                        {userRole === "admin" ? "🛡️ Admin" : userRole === "doctor" ? "👨‍⚕️ Doctor" : "👤 Patient"}
                    </p>
                </div>
                
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-nav-item ${activeTab === item.id ? "sidebar-nav-item-active" : ""}`}
                            onClick={() => handleTabClick(item.id)}
                        >
                            <span className="sidebar-nav-icon">{item.icon}</span>
                            <span className="sidebar-nav-label">{item.label}</span>
                            {item.showBadge && <span className="new-badge">NEW</span>}
                            {item.badge > 0 && <span className="notification-badge">{item.badge}</span>}
                            {item.id === "notifications" && notificationCount > 0 && !item.badge && (
                                <span className="notification-badge">{notificationCount}</span>
                            )}
                        </button>
                    ))}
                </nav>
                
                <div className="sidebar-footer">
                    <button className="sidebar-home-btn" onClick={handleHome}>
                        <span className="sidebar-nav-icon">🏠</span>
                        <span className="sidebar-nav-label">Home</span>
                    </button>
                    <button className="sidebar-logout-btn" onClick={handleLogout}>
                        <span className="sidebar-nav-icon">↪️</span>
                        <span className="sidebar-nav-label">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default Sidebar;