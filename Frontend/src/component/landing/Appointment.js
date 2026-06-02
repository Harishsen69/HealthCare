import React, { useState, useEffect } from "react";
import "./Appointment.css";
import API from "../../services/api";

function Appointment({ setPage }) {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        doctor: ""
    });
    const [doctors, setDoctors] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ✅ FORM CLEAR ON PAGE REFRESH
    useEffect(() => {
        setFormData({
            fullName: "",
            email: "",
            phone: "",
            date: "",
            time: "",
            doctor: ""
        });
    }, []);

    // ✅ FETCH DOCTORS
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await API.get('doctors/');
                setDoctors(response.data);
            } catch (error) {
                console.error("Error fetching doctors:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    // ✅ GET AVAILABLE TIME SLOTS
    const getAvailableTimeSlots = () => {
        const allSlots = [
            "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
            "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
        ];
        return allSlots;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to book an appointment");
                setPage("login");
                return;
            }
            
            const selectedDoctor = doctors.find(d => d.name === formData.doctor);
            
            if (!selectedDoctor) {
                setError("Please select a valid doctor");
                setIsSubmitting(false);
                return;
            }
            
            await API.post('appointments/create/', {
                doctor: selectedDoctor.id,
                patient_name: formData.fullName,
                patient_email: formData.email,
                patient_phone: formData.phone,
                date: formData.date,
                time: formData.time.split(' ')[0] // Convert "09:00 AM" to "09:00"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setSubmitSuccess(true);
            setFormData({
                fullName: "",
                email: "",
                phone: "",
                date: "",
                time: "",
                doctor: ""
            });
            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (error) {
            console.error("Error booking appointment:", error);
            setError(error.response?.data?.error || "Failed to book appointment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const availableTimeSlots = getAvailableTimeSlots();

    if (loading) {
        return <div className="appointment-loading">Loading...</div>;
    }

    return (
        <div className="appointment-page">
            {/* Hero Section */}
            <section className="appointment-hero-section">
                <div className="appointment-hero-container">
                    <div className="appointment-hero-content">
                        <div className="hero-badge">
                            <span className="badge-icon">📅</span>
                            Book Appointment
                        </div>
                        <h1>Schedule Your <br /><span className="text-primary">Medical Visit</span></h1>
                        <p>Fill out the form below to book an appointment with our expert doctors. We'll confirm your appointment within 24 hours.</p>
                    </div>
                    <div className="appointment-hero-image">
                        <div className="hero-image-wrapper">
                            <img 
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=450&fit=crop" 
                                alt="Book Appointment" 
                                loading="lazy"
                            />
                            <div className="floating-card">
                                <span>🏥</span>
                                <div>
                                    <strong>Easy Booking</strong>
                                    <p>Quick & Secure</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Section */}
            <section className="booking-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Book Your Slot</span>
                        <h2>Fill Your Details</h2>
                        <p>We'll get back to you with confirmation</p>
                    </div>

                    {submitSuccess && (
                        <div className="success-message">
                            ✓ Appointment booked successfully! We'll contact you soon.
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="booking-form-container">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input 
                                        type="text" 
                                        name="fullName" 
                                        placeholder="Enter your full name" 
                                        value={formData.fullName} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address *</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        placeholder="your@email.com" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        placeholder="10-digit mobile number" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        required 
                                        maxLength="10"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Select Doctor *</label>
                                    <select name="doctor" value={formData.doctor} onChange={handleChange} required>
                                        <option value="">Select Doctor</option>
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.name}>
                                                {doc.name} - {doc.specialization} (₹{doc.fee})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Preferred Date *</label>
                                    <input 
                                        type="date" 
                                        name="date" 
                                        value={formData.date} 
                                        onChange={handleChange} 
                                        required 
                                        min={new Date().toISOString().split('T')[0]} 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Preferred Time *</label>
                                    <select name="time" value={formData.time} onChange={handleChange} required>
                                        <option value="">Select Time</option>
                                        {availableTimeSlots.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                {isSubmitting ? "Booking..." : "Confirm Appointment →"}
                            </button>
                        </form>

                        <div className="booking-info">
                            <div className="info-card">
                                <span>📞</span>
                                <div>
                                    <h4>Need Help?</h4>
                                    <p>Call us at +91 98765 43210</p>
                                </div>
                            </div>
                            <div className="info-card">
                                <span>⚕️</span>
                                <div>
                                    <h4>Free Cancellation</h4>
                                    <p>Cancel up to 2 hours before appointment</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2>Need Immediate Medical Assistance?</h2>
                    <p>Call our 24/7 emergency helpline for instant support</p>
                    <button className="cta-button" onClick={() => window.location.href = "tel:+919876543210"}>
                        📞 Call Emergency: +91 98765 43210
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-container">
                    <div className="footer-grid">
                        <div className="footer-about">
                            <div className="footer-logo">
                                <span className="logo-icon">🏥</span>
                                <span>MediCare</span>
                            </div>
                            <p>Providing quality healthcare services since 2010. We are committed to your health and well-being.</p>
                            <div className="social-links">
                                <a href="#" aria-label="Facebook">📘</a>
                                <a href="#" aria-label="Twitter">🐦</a>
                                <a href="#" aria-label="Instagram">📷</a>
                                <a href="#" aria-label="LinkedIn">🔗</a>
                            </div>
                        </div>
                        <div className="footer-links">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><button onClick={() => setPage("home")}>Home</button></li>
                                <li><button onClick={() => setPage("about")}>About Us</button></li>
                                <li><button onClick={() => setPage("services")}>Services</button></li>
                                <li><button onClick={() => setPage("contact")}>Contact</button></li>
                            </ul>
                        </div>
                        <div className="footer-services">
                            <h4>Our Services</h4>
                            <ul>
                                <li>Cardiology</li>
                                <li>Neurology</li>
                                <li>Pediatrics</li>
                                <li>Orthopedics</li>
                                <li>Emergency Care</li>
                            </ul>
                        </div>
                        <div className="footer-contact">
                            <h4>Contact Info</h4>
                            <ul>
                                <li>📍 Urla, Chhattisgarh</li>
                                <li>📞 +91 98765 43210</li>
                                <li>✉️ info@medicare.com</li>
                                <li>🕐 Mon-Sat: 9:00 AM - 8:00 PM</li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 MediCare. All rights reserved. | Designed with ❤️ for better healthcare</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Appointment;