import React, { useState, useEffect } from "react";
import "./App.css";

// Landing Pages
import Header from "./component/landing/Header";
import Home from "./component/landing/Home";
import About from "./component/landing/About";
import Service from "./component/landing/Service";
import Contact from "./component/landing/Contact";
import Login from "./component/auth/Login";
import Register from "./component/auth/Register";
import Appointment from "./component/landing/Appointment";

// Dashboards
import PatientDashboard from "./component/patient/PatientDashboard";
import DoctorDashboard from "./component/doctor/DoctorDashboard";
import AdminDashboard from "./component/admin/AdminDashboard";

function App() {
    // ✅ Get current page from URL hash ONLY (no localStorage on app start)
    const getCurrentPageFromUrl = () => {
        const hash = window.location.hash.slice(1);
        const validPages = ['home', 'about', 'services', 'contact', 'appointment', 'login', 'register', 'patient_dashboard', 'doctor_dashboard', 'admin_dashboard'];
        
        // If hash exists and is valid, use it
        if (hash && validPages.includes(hash)) {
            return hash;
        }
        
        // ✅ Default to home on app start/restart (no localStorage check)
        return 'home';
    };

    const [page, setPage] = useState(getCurrentPageFromUrl());
    const [userRole, setUserRole] = useState(() => {
        return localStorage.getItem('user_type') || null;
    });

    // ✅ Update URL and localStorage when page changes
    const handleSetPage = (newPage) => {
        setPage(newPage);
        window.location.hash = newPage;
        localStorage.setItem('currentPage', newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ✅ Listen for browser back/forward buttons and refresh
    useEffect(() => {
        const handleHashChange = () => {
            const newPage = getCurrentPageFromUrl();
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };

        window.addEventListener('hashchange', handleHashChange);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Save page to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('currentPage', page);
    }, [page]);

    // Check login status and redirect from login/register
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userType = localStorage.getItem('user_type');
        
        if (token && userType) {
            if (page === 'login' || page === 'register') {
                handleSetPage('home');
            }
        }
        setUserRole(userType);
    }, [page]);

    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_type');

    // ========== DASHBOARD RENDERING ==========
    if (page === 'patient_dashboard') {
        if (token && role === 'patient') {
            return <PatientDashboard setPage={handleSetPage} />;
        } else {
            handleSetPage('home');
            return null;
        }
    }
    
    if (page === 'doctor_dashboard') {
        if (token && role === 'doctor') {
            return <DoctorDashboard setPage={handleSetPage} />;
        } else {
            handleSetPage('home');
            return null;
        }
    }
    
    if (page === 'admin_dashboard') {
        if (token && role === 'admin') {
            return <AdminDashboard setPage={handleSetPage} />;
        } else {
            handleSetPage('home');
            return null;
        }
    }

    if (page === 'dashboard') {
        handleSetPage('home');
        return null;
    }

    // ========== LANDING PAGES RENDERING ==========
    const isDashboard = page === 'patient_dashboard' || page === 'doctor_dashboard' || page === 'admin_dashboard';
    const showHeader = !isDashboard && page !== "login" && page !== "register" && page !== "appointment";

    return (
        <div className="app">
            {showHeader && <Header setPage={handleSetPage} currentPage={page} />}
            
            {page === "home" && <Home setPage={handleSetPage} />}
            {page === "about" && <About setPage={handleSetPage} />}
            {page === "services" && <Service setPage={handleSetPage} />}
            {page === "contact" && <Contact setPage={handleSetPage} />}
            {page === "login" && <Login setPage={handleSetPage} />}
            {page === "register" && <Register setPage={handleSetPage} />}
            {page === "appointment" && <Appointment setPage={handleSetPage} />}
        </div>
    );
}

export default App;