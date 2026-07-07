import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { 
  FaHome, 
  FaSignOutAlt, 
  FaTachometerAlt, 
  FaUserMd, 
  FaCalendarAlt, 
  FaUser, 
  FaClock, 
  FaFileAlt, 
  FaBell,
  FaClipboardList,
  FaStethoscope,
  FaChartLine,
  FaHospitalAlt,
  FaMapMarkerAlt
} from "react-icons/fa";

function Sidebar({ userRole, activeTab, setActiveTab, user, setPage, hasPendingAppointments, notificationCount, reportCount }) {
    const [isOpen, setIsOpen] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(false);
    const [displayName, setDisplayName] = useState("User");
    
    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    // 🔥 UPDATED: Better scroll prevention when sidebar is open
    useEffect(() => {
        if (isMobile && isOpen) {
            document.body.classList.add('sidebar-open-mobile');
            const mobileHeader = document.querySelector('.patient-mobile-header');
            if (mobileHeader) {
                mobileHeader.style.display = 'none';
            }
        } else {
            document.body.classList.remove('sidebar-open-mobile');
            if (isMobile && !isOpen) {
                const mobileHeader = document.querySelector('.patient-mobile-header');
                if (mobileHeader) {
                    mobileHeader.style.display = 'flex';
                }
            }
        }
        
        return () => {
            document.body.classList.remove('sidebar-open-mobile');
            const mobileHeader = document.querySelector('.patient-mobile-header');
            if (mobileHeader && isMobile) {
                mobileHeader.style.display = 'flex';
            }
        };
    }, [isOpen, isMobile]);

    // 🔥 Listen for storage changes to update user name
    useEffect(() => {
        updateDisplayName();

        const handleStorageChange = (e) => {
            if (e.key === 'medicareUser' || e.key === 'user_type' || e.key === 'user_role') {
                console.log("🔄 Sidebar: Storage event detected");
                updateDisplayName();
                setForceUpdate(prev => !prev);
            }
        };
        
        const handleCustomEvent = () => {
            console.log("🔄 Sidebar: Custom event detected");
            updateDisplayName();
            setForceUpdate(prev => !prev);
        };
        
        let lastCheckedName = displayName;
        const interval = setInterval(() => {
            const savedUser = localStorage.getItem("medicareUser");
            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    const currentName = getUserDisplayNameFromData(userData);
                    if (currentName !== lastCheckedName) {
                        console.log("🔄 Sidebar: Polling detected name change:", currentName);
                        updateDisplayName();
                        setForceUpdate(prev => !prev);
                        lastCheckedName = currentName;
                    }
                } catch (e) {}
            }
        }, 1000);
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('profileUpdated', handleCustomEvent);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profileUpdated', handleCustomEvent);
            clearInterval(interval);
        };
    }, []);

    // 🔥 Update display name from localStorage
    const updateDisplayName = () => {
        const savedUser = localStorage.getItem("medicareUser");
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                const name = getUserDisplayNameFromData(userData);
                setDisplayName(name);
                console.log("✅ Sidebar: Display name updated to:", name);
                return;
            } catch (e) {}
        }
        
        if (user?.name) {
            setDisplayName(user.name);
        } else if (user?.first_name && user?.last_name) {
            setDisplayName(`${user.first_name} ${user.last_name}`);
        } else if (user?.username) {
            setDisplayName(user.username);
        } else {
            setDisplayName("User");
        }
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const closeSidebar = () => {
        setIsOpen(false);
    };

    // 🔥 Navigation with sidebar close
    const handleNavigation = (tabId) => {
        setActiveTab(tabId);
        if (isMobile) {
            closeSidebar();
        }
    };

    // ========================================
    // 🔥 ADMIN MENU - Complete Control
    // ========================================
    const adminMenu = [
        { id: "overview", icon: <FaTachometerAlt />, label: "Dashboard" },
        { id: "doctors", icon: <FaUserMd />, label: "Manage Doctors" },
        { id: "appointments", icon: <FaCalendarAlt />, label: "All Appointments" },
        { id: "profile", icon: <FaUser />, label: "Profile" }
    ];

    // ========================================
    // 🔥 DOCTOR MENU - Doctor Features
    // ========================================
    const doctorMenu = [
        { id: "overview", icon: <FaChartLine />, label: "Dashboard" },
        { id: "appointments", icon: <FaCalendarAlt />, label: "My Appointments", showBadge: hasPendingAppointments },
        { id: "availability", icon: <FaClock />, label: "Availability" },
        { id: "reports", icon: <FaClipboardList />, label: "Reports" },
        { id: "profile", icon: <FaUser />, label: "Profile & Location" },
        { id: "notifications", icon: <FaBell />, label: "Notifications" }
    ];

    // ========================================
    // 🔥 PATIENT MENU - Patient Features
    // ========================================
    const patientMenu = [
        { id: "overview", icon: <FaTachometerAlt />, label: "Dashboard" },
        { id: "appointments", icon: <FaCalendarAlt />, label: "My Appointments" },
        { id: "reports", icon: <FaFileAlt />, label: "My Reports", showBadge: reportCount > 0 },
        { id: "profile", icon: <FaUser />, label: "Profile" },
        { id: "notifications", icon: <FaBell />, label: "Notifications", badge: notificationCount }
    ];

    // ========================================
    // 🔥 MENU SELECTION BASED ON ROLE
    // ========================================
    let menuItems = [];
    if (userRole === "admin") menuItems = adminMenu;
    else if (userRole === "doctor") menuItems = doctorMenu;
    else menuItems = patientMenu;

    // ========================================
    // 🔥 LOGOUT FUNCTION - UPDATED
    // ========================================
    const handleLogout = () => {
        // ✅ Remove all dashboard tabs
        localStorage.removeItem('patientDashboardTab');
        localStorage.removeItem('doctorDashboardTab');
        localStorage.removeItem('adminDashboardTab');
        localStorage.removeItem('currentPage');
        
        // Remove other items
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("medicareUser");
        localStorage.removeItem("user_type");
        localStorage.removeItem("user_role");
        sessionStorage.clear();
        
        if (setPage) setPage("home");
        setTimeout(() => window.location.reload(), 50);
    };

    const handleHome = () => {
        setPage("home");
        closeSidebar();
    };

    // ========================================
    // 🔥 GET USER ROLE LABEL
    // ========================================
    const getRoleLabel = () => {
        if (userRole === "admin") return "🛡️ Admin";
        if (userRole === "doctor") return "👨‍⚕️ Doctor";
        return "👤 Patient";
    };

    // ========================================
    // 🔥 GET USER DISPLAY NAME FROM DATA
    // ========================================
    const getUserDisplayNameFromData = (userData) => {
        if (userData.name) return userData.name;
        if (userData.first_name && userData.last_name) return `${userData.first_name} ${userData.last_name}`;
        if (userData.username) return userData.username;
        return "User";
    };

    return (
        <>
            {/* Mobile Hamburger Menu Button - Right Side */}
            {isMobile && (
                <button 
                    className={`hamburger-menu ${isOpen ? "open" : ""}`} 
                    onClick={toggleSidebar}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            )}

            {/* Mobile Overlay - Blocks clicks on main content */}
            {isMobile && isOpen && (
                <div 
                    className="sidebar-overlay show" 
                    onClick={closeSidebar}
                    aria-label="Close menu"
                ></div>
            )}

            {/* Sidebar */}
            <div className={`sidebar-container ${isOpen ? "sidebar-open" : ""}`}>
                <div className="sidebar-logo">
                    <span className="sidebar-logo-icon">🏥</span>
                    <span className="sidebar-logo-text">MediCare</span>
                </div>
                
                <div className="sidebar-user-info">
                    <div className="sidebar-user-avatar">👤</div>
                    <h3 className="sidebar-user-name">{displayName}</h3>
                    <p className="sidebar-user-role">{getRoleLabel()}</p>
                </div>
                
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`sidebar-nav-item ${activeTab === item.id ? "sidebar-nav-item-active" : ""}`}
                            onClick={() => handleNavigation(item.id)}
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
                        <span className="sidebar-nav-icon"><FaHome /></span>
                        <span className="sidebar-nav-label">Home</span>
                    </button>
                    <button className="sidebar-logout-btn" onClick={handleLogout}>
                        <span className="sidebar-nav-icon"><FaSignOutAlt /></span>
                        <span className="sidebar-nav-label">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}

export default Sidebar;