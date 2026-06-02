import React, { useState } from "react";
import "./Contact.css";

function Contact({ setPage }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            setError("Please fill all required fields");
            return;
        }
        
        setIsSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            setTimeout(() => setSubmitSuccess(false), 3000);
        }, 1500);
    };

    const handleNavigation = (page) => {
        setPage(page);
    };

    return (
        <div className="contact-page">
            {/* Hero Section */}
            <section className="contact-hero-section">
                <div className="contact-hero-container">
                    <div className="contact-hero-content">
                        <div className="hero-badge">
                            <span className="badge-icon">📞</span>
                            Get in Touch
                        </div>
                        <h1>
                            We'd Love to <br />
                            <span className="text-primary">Hear From You</span>
                        </h1>
                        <p>
                            Have questions about our services? Want to book an appointment?
                            Our team is here to help you 24/7. Reach out to us anytime.
                        </p>
                        <div className="hero-stats">
                            <div className="stat">
                                <h3>24/7</h3>
                                <p>Support Available</p>
                            </div>
                            <div className="stat">
                                <h3>30min</h3>
                                <p>Response Time</p>
                            </div>
                            <div className="stat">
                                <h3>100%</h3>
                                <p>Satisfaction</p>
                            </div>
                        </div>
                    </div>
                    <div className="contact-hero-image">
                        <div className="hero-image-wrapper">
                            <img 
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=450&fit=crop" 
                                alt="Customer Support" 
                                loading="lazy"
                            />
                            <div className="floating-card">
                                <span>💬</span>
                                <div>
                                    <strong>24/7 Support</strong>
                                    <p>Always here for you</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Main Section */}
            <section className="contact-main-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Contact Us</span>
                        <h2>Get In Touch With Us</h2>
                        <p>We're here to answer your questions and provide the best healthcare support</p>
                    </div>

                    <div className="contact-grid">
                        {/* Left Side - Contact Info Cards */}
                        <div className="contact-info-side">
                            <div className="info-card">
                                <div className="info-icon">📍</div>
                                <h3>Visit Us</h3>
                                <p>123 Healthcare Avenue,</p>
                                <p>Urla, Chhattisgarh - 493221</p>
                                <p>India</p>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">📞</div>
                                <h3>Call Us</h3>
                                <p>+91 98765 43210</p>
                                <p>+91 98765 43211 (Emergency)</p>
                                <p>24/7 Helpline Available</p>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">✉️</div>
                                <h3>Email Us</h3>
                                <p>info@medicare.com</p>
                                <p>support@medicare.com</p>
                                <p>careers@medicare.com</p>
                            </div>

                            <div className="info-card">
                                <div className="info-icon">🕐</div>
                                <h3>Working Hours</h3>
                                <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
                                <p>Saturday: 9:00 AM - 5:00 PM</p>
                                <p>Sunday: Emergency Only</p>
                            </div>
                        </div>

                        {/* Right Side - Contact Form */}
                        <div className="contact-form-side">
                            <div className="form-card">
                                <h3>Send Us a Message</h3>
                                <p>We'll get back to you within 24 hours</p>

                                {submitSuccess && (
                                    <div className="success-message">
                                        ✓ Message sent successfully! We'll contact you soon.
                                    </div>
                                )}

                                {error && (
                                    <div className="error-message">
                                        ⚠️ {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                name="name"
                                                placeholder="Your Name *"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="Your Email *"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <input
                                                type="tel"
                                                name="phone"
                                                placeholder="Phone Number"
                                                value={formData.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                name="subject"
                                                placeholder="Subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <textarea
                                            name="message"
                                            placeholder="Your Message *"
                                            rows="5"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                        ></textarea>
                                    </div>

                                    <button type="submit" className="submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? "Sending..." : "Send Message →"}
                                    </button>
                                </form>

                                <div className="form-footer">
                                    <p>📱 Or reach us on WhatsApp: +91 98765 43210</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="map-section">
                        <div className="map-card">
                            <h3>📍 Find Us Here</h3>
                            <div className="map-container">
                                <iframe
                                    src="https://maps.google.com/maps?q=urla+chhattisgarh&t=&z=13&ie=UTF8&iwloc=&output=embed"
                                    title="Location Map"
                                    allowFullScreen=""
                                    loading="lazy"
                                ></iframe>
                            </div>
                            <div className="map-directions">
                                <a href="https://maps.google.com/?q=urla+chhattisgarh" target="_blank" rel="noopener noreferrer">
                                    Get Directions →
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="faq-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">FAQ</span>
                        <h2>Frequently Asked Questions</h2>
                        <p>Find quick answers to common questions</p>
                    </div>
                    <div className="faq-grid">
                        <div className="faq-card">
                            <h4>📅 How do I book an appointment?</h4>
                            <p>You can book an appointment online through our website or call our helpline number.</p>
                        </div>
                        <div className="faq-card">
                            <h4>💰 What are the consultation fees?</h4>
                            <p>Consultation fees vary by doctor and specialty. Starting from ₹500 for general physicians.</p>
                        </div>
                        <div className="faq-card">
                            <h4>🏥 Do you accept insurance?</h4>
                            <p>Yes, we accept all major health insurance plans. Contact us for more details.</p>
                        </div>
                        <div className="faq-card">
                            <h4>🚑 Is emergency service available 24/7?</h4>
                            <p>Yes, we have 24/7 emergency services with dedicated ambulance support.</p>
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
                                <li><button onClick={() => handleNavigation("home")}>Home</button></li>
                                <li><button onClick={() => handleNavigation("about")}>About Us</button></li>
                                <li><button onClick={() => handleNavigation("services")}>Services</button></li>
                                <li><button onClick={() => handleNavigation("contact")}>Contact</button></li>
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

export default Contact;