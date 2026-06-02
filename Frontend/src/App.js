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
    // ✅ ALWAYS HOME PAGE BY DEFAULT
    const [page, setPage] = useState("home");
    const [userRole, setUserRole] = useState(() => {
        return localStorage.getItem('user_type') || null;
    });

    // Save page to localStorage
    useEffect(() => {
        localStorage.setItem('currentPage', page);
    }, [page]);

    // Check login status and redirect from login/register
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userType = localStorage.getItem('user_type');
        
        // ✅ Agar logged in hai aur login/register page pe hai to home pe bhejo
        if (token && userType) {
            if (page === 'login' || page === 'register') {
                setPage('home');
            }
        }
        setUserRole(userType);
    }, [page]);

    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_type');

    // ========== DASHBOARD RENDERING ==========
    // ✅ Patient Dashboard - Sirf tab dikhe jab page 'patient_dashboard' ho
    if (page === 'patient_dashboard') {
        if (token && role === 'patient') {
            return <PatientDashboard setPage={setPage} />;
        } else {
            // Agar token nahi hai ya role patient nahi hai to home pe bhejo
            setPage('home');
            return null;
        }
    }
    
    // ✅ Doctor Dashboard
    if (page === 'doctor_dashboard') {
        if (token && role === 'doctor') {
            return <DoctorDashboard setPage={setPage} />;
        } else {
            setPage('home');
            return null;
        }
    }
    
    // ✅ Admin Dashboard
    if (page === 'admin_dashboard') {
        if (token && role === 'admin') {
            return <AdminDashboard setPage={setPage} />;
        } else {
            setPage('home');
            return null;
        }
    }

    // ✅ INVALID DASHBOARD PAGE CHECK - Agar koi 'dashboard' page aaya to home bhejo
    if (page === 'dashboard') {
        setPage('home');
        return null;
    }

    // ========== LANDING PAGES RENDERING ==========
    const isDashboard = page === 'patient_dashboard' || page === 'doctor_dashboard' || page === 'admin_dashboard';
    const showHeader = !isDashboard && page !== "login" && page !== "register" && page !== "appointment";

    return (
        <div className="app">
            {showHeader && <Header setPage={setPage} currentPage={page} />}
            
            {page === "home" && <Home setPage={setPage} />}
            {page === "about" && <About setPage={setPage} />}
            {page === "services" && <Service setPage={setPage} />}
            {page === "contact" && <Contact setPage={setPage} />}
            {page === "login" && <Login setPage={setPage} />}
            {page === "register" && <Register setPage={setPage} />}
            {page === "appointment" && <Appointment setPage={setPage} />}
        </div>
    );
}

export default App;