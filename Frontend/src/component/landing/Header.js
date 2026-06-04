import React, { useState, useEffect } from "react";
import "./Header.css";

function Header({ setPage, currentPage }) {
    const isLoggedIn = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_type');
    const [scrolled, setScrolled] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 900);
        };
        
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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
                {/* Desktop Layout - All in one row */}
                {!isMobile && (
                    <div className="hc-desktop-layout">
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
                                <button className="hc-btn-dashboard" onClick={handleDashboardClick}>Dashboard</button>
                            ) : (
                                <>
                                    <button className="hc-btn-login" onClick={() => handleNavigation("login")}>Login</button>
                                    <button className="hc-btn-register" onClick={() => handleNavigation("register")}>Register</button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Mobile Layout - Structure 1 */}
                {isMobile && (
                    <>
                        {/* Row 1: Logo + Button */}
                        <div className="hc-mobile-row1">
                            <div className="hc-logo" onClick={() => handleNavigation("home")}>
                                <span className="hc-logo-icon">🏥</span>
                                <span className="hc-logo-text">MediCare</span>
                            </div>
                            
                            <div className="hc-mobile-buttons">
                                {isLoggedIn ? (
                                    <button className="hc-btn-dashboard" onClick={handleDashboardClick}>Dashboard</button>
                                ) : (
                                    <>
                                        <button className="hc-btn-login" onClick={() => handleNavigation("login")}>Login</button>
                                        <button className="hc-btn-register" onClick={() => handleNavigation("register")}>Register</button>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        {/* Row 2: Navigation Center */}
                        <div className="hc-mobile-row2">
                            <nav className="hc-nav">
                                <ul className="hc-nav-list">
                                    <li className={`hc-nav-item ${getActiveClass("home")}`} onClick={() => handleNavigation("home")}>Home</li>
                                    <li className={`hc-nav-item ${getActiveClass("about")}`} onClick={() => handleNavigation("about")}>About</li>
                                    <li className={`hc-nav-item ${getActiveClass("services")}`} onClick={() => handleNavigation("services")}>Services</li>
                                    <li className={`hc-nav-item ${getActiveClass("contact")}`} onClick={() => handleNavigation("contact")}>Contact</li>
                                </ul>
                            </nav>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}

export default Header;