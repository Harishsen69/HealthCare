import React, { useState, useEffect } from "react";
import "./Header.css";

function Header({ setPage, currentPage }) {
    const isLoggedIn = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_type');
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("medicareUser");
        localStorage.removeItem("user_type");
        localStorage.removeItem("user_role");
        localStorage.removeItem("currentPage");
        localStorage.removeItem("viewedReports");
        sessionStorage.clear();
        setPage("home");
        setTimeout(() => window.location.reload(), 50);
    };

    const handleDashboardClick = () => {
        if (userRole === 'admin') {
            setPage("admin_dashboard");
        } else if (userRole === 'doctor') {
            setPage("doctor_dashboard");
        } else if (userRole === 'patient') {
            setPage("patient_dashboard");
        } else {
            setPage("login");
        }
    };

    const handleNavigation = (pageName) => {
        setPage(pageName);
    };

    const getActiveClass = (pageName) => {
        return currentPage === pageName ? "hc-nav-active" : "";
    };

    return (
        <header className={`hc-wrapper ${scrolled ? "hc-scrolled" : ""}`}>
            <div className="hc-container">
                <div className="hc-logo" onClick={() => handleNavigation("home")}>
                    <span className="hc-logo-icon">🏥</span>
                    <span className="hc-logo-text">MediCare</span>
                </div>
                
                <nav className="hc-nav">
                    <ul className="hc-nav-list">
                        <li className={`hc-nav-item ${getActiveClass("home")}`} onClick={() => handleNavigation("home")}>Home</li>
                        <li className={`hc-nav-item ${getActiveClass("about")}`} onClick={() => handleNavigation("about")}>About</li>
                        <li className={`hc-nav-item ${getActiveClass("services")}`} onClick={() => handleNavigation("services")}>Services</li>
                        <li className={`hc-nav-item ${getActiveClass("contact")}`} onClick={() => handleNavigation("contact")}>Contact</li>
                    </ul>
                </nav>
                
                <div className="hc-buttons">
                    {isLoggedIn ? (
                        <>
                            <button className="hc-btn-dashboard" onClick={handleDashboardClick}>Dashboard</button>
                            <button className="hc-btn-logout" onClick={handleLogout}>Logout</button>
                        </>
                    ) : (
                        <>
                            <button className="hc-btn-login" onClick={() => handleNavigation("login")}>Login</button>
                            <button className="hc-btn-register" onClick={() => handleNavigation("register")}>Register</button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;