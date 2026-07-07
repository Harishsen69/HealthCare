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

// Chatbot Component
import Chatbot from "./component/Chatbot/Chatbot";

function App() {
    const getCurrentPageFromUrl = () => {
        const hash = window.location.hash.slice(1);
        const validPages = ['home', 'about', 'services', 'contact', 'appointment', 'login', 'register', 'patient_dashboard', 'doctor_dashboard', 'admin_dashboard'];
        if (hash && validPages.includes(hash)) {
            return hash;
        }
        return 'home';
    };

    const [page, setPage] = useState(getCurrentPageFromUrl());
    const [userRole, setUserRole] = useState(() => {
        return localStorage.getItem('user_type') || null;
    });

    // 🔥 Force re-render state
    const [forceUpdate, setForceUpdate] = useState(0);

    // 🔥 Get user from localStorage with force update
    const getUserFromLocalStorage = () => {
        const savedUser = localStorage.getItem("medicareUser");
        if (savedUser) {
            try {
                return JSON.parse(savedUser);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    // 🔥 Listen for storage changes (cross-tab/device)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'medicareUser' || e.key === 'user_type' || e.key === 'user_role') {
                console.log("🔄 App: Storage event detected");
                setForceUpdate(prev => prev + 1);
                const userType = localStorage.getItem('user_type');
                if (userType) {
                    setUserRole(userType);
                }
            }
        };
        
        const handleCustomEvent = () => {
            console.log("🔄 App: Custom event detected");
            setForceUpdate(prev => prev + 1);
            const userType = localStorage.getItem('user_type');
            if (userType) {
                setUserRole(userType);
            }
        };
        
        let lastCheckedUser = localStorage.getItem('medicareUser');
        const interval = setInterval(() => {
            const currentUser = localStorage.getItem('medicareUser');
            if (currentUser !== lastCheckedUser) {
                lastCheckedUser = currentUser;
                setForceUpdate(prev => prev + 1);
                const userType = localStorage.getItem('user_type');
                if (userType) {
                    setUserRole(userType);
                }
                console.log("🔄 App: Polling detected change");
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

    useEffect(() => {
        const dashboardPages = ['patient_dashboard', 'doctor_dashboard', 'admin_dashboard'];
        const landingPages = ['home', 'about', 'services', 'contact', 'appointment', 'login', 'register'];
        
        document.body.classList.remove('landing-page', 'dashboard-page');
        
        if (dashboardPages.includes(page)) {
            document.body.classList.add('dashboard-page');
        } else if (landingPages.includes(page)) {
            document.body.classList.add('landing-page');
        }
        
        return () => {
            document.body.classList.remove('landing-page', 'dashboard-page');
        };
    }, [page]);

    const handleSetPage = (newPage) => {
        setPage(newPage);
        window.location.hash = newPage;
        localStorage.setItem('currentPage', newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    useEffect(() => {
        localStorage.setItem('currentPage', page);
    }, [page]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userType = localStorage.getItem('user_type');
        
        if (token && userType) {
            if (page === 'login' || page === 'register') {
                // ✅ Login/Register se home par redirect
                window.location.hash = 'home';
                setPage('home');
            }
        }
        setUserRole(userType);
    }, [page]);

    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_type');

    // 🔥 Get user data fresh
    const currentUser = getUserFromLocalStorage();

    // ========================================
    // ROLE-BASED DASHBOARD RENDERING
    // ========================================
    
    if (page === 'patient_dashboard') {
        if (token && role === 'patient') {
            return (
                <>
                    <PatientDashboard setPage={handleSetPage} key={forceUpdate} />
                    <Chatbot />
                </>
            );
        } else {
            handleSetPage('home');
            return null;
        }
    }
    
    if (page === 'doctor_dashboard') {
        if (token && role === 'doctor') {
            return (
                <>
                    <DoctorDashboard setPage={handleSetPage} key={forceUpdate} />
                    <Chatbot />
                </>
            );
        } else {
            handleSetPage('home');
            return null;
        }
    }
    
    if (page === 'admin_dashboard') {
        if (token && role === 'admin') {
            return (
                <>
                    <AdminDashboard setPage={handleSetPage} key={forceUpdate} />
                    <Chatbot />
                </>
            );
        } else {
            handleSetPage('home');
            return null;
        }
    }

    if (page === 'dashboard') {
        handleSetPage('home');
        return null;
    }

    const isDashboard = page === 'patient_dashboard' || page === 'doctor_dashboard' || page === 'admin_dashboard';
    const showHeader = !isDashboard && page !== "login" && page !== "register" && page !== "appointment";
    const showChatbot = page !== 'login' && page !== 'register';

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
            
            {showChatbot && <Chatbot />}
        </div>
    );
}

export default App;