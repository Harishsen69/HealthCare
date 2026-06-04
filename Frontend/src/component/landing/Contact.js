import React, { useState, useEffect } from "react";
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

    // Scroll animations - same as Home
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.ct-fade-up').forEach(el => observer.observe(el));
        
        return () => observer.disconnect();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            setError("Please fill all required fields");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        setIsSubmitting(true);
        
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setSubmitSuccess(false), 3000);
        }, 1500);
    };

    const contactCards = [
        { icon: "📍", title: "Visit Us", details: ["123 Healthcare Avenue,", "Urla, Chhattisgarh - 493221"] },
        { icon: "📞", title: "Call Us", details: ["+91 98765 43210", "+91 98765 43211 (Emergency)"] },
        { icon: "✉️", title: "Email Us", details: ["info@medicare.com", "support@medicare.com"] },
        { icon: "🕐", title: "Working Hours", details: ["Mon - Fri: 9AM - 8PM", "Sat: 9AM - 5PM"] }
    ];

    const faqs = [
        { q: "How do I book an appointment?", a: "You can book an appointment online through our website or call our helpline number." },
        { q: "What are the consultation fees?", a: "Consultation fees vary by doctor and specialty. Starting from ₹500 for general physicians." },
        { q: "Do you accept insurance?", a: "Yes, we accept all major health insurance plans. Contact us for more details." },
        { q: "Is emergency service available 24/7?", a: "Yes, we have 24/7 emergency services with dedicated ambulance support." }
    ];

    return (
        <div className="ct-contact-container">
            {/* Hero Section */}
            <section className="ct-hero-section">
                <div className="ct-hero-content">
                    <div className="ct-hero-text">
                        <span className="ct-hero-badge">📞 Get in Touch</span>
                        <h1>We'd Love to <span className="ct-gradient-text">Hear From You</span></h1>
                        <p>Have questions about our services? Want to book an appointment? Our team is here to help you 24/7.</p>
                        <div className="ct-hero-stats">
                            <div><h3>24/7</h3><p>Support</p></div>
                            <div><h3>30min</h3><p>Response</p></div>
                            <div><h3>100%</h3><p>Satisfaction</p></div>
                        </div>
                    </div>
                    <div className="ct-hero-image">
                        <img src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=500&h=450&fit=crop" alt="Healthcare" />
                        <div className="ct-hero-badge-card">
                            <span>💬</span>
                            <div><strong>24/7 Support</strong></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="ct-contact-section ct-fade-up">
                <div className="ct-container">
                    <div className="ct-section-header">
                        <span className="ct-section-badge">Contact Us</span>
                        <h2>Get In Touch With Us</h2>
                        <p>We're here to answer your questions and provide the best support</p>
                    </div>

                    <div className="ct-contact-grid">
                        <div className="ct-contact-info">
                            {contactCards.map((card, idx) => (
                                <div className="ct-info-card" key={idx}>
                                    <div className="ct-info-icon">{card.icon}</div>
                                    <h3>{card.title}</h3>
                                    {card.details.map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Contact Form */}
                        <div className="ct-contact-form">
                            <div className="ct-form-card">
                                <h3>Send Us a Message</h3>
                                <p>We'll get back to you within 24 hours</p>

                                {submitSuccess && (
                                    <div className="ct-success-msg">✓ Message sent successfully! We'll contact you soon.</div>
                                )}
                                {error && <div className="ct-error-msg">⚠️ {error}</div>}

                                <form onSubmit={handleSubmit}>
                                    <div className="ct-form-row">
                                        <div className="ct-form-group">
                                            <input type="text" name="name" placeholder="Your Name *" value={formData.name} onChange={handleChange} required />
                                        </div>
                                        <div className="ct-form-group">
                                            <input type="email" name="email" placeholder="Your Email *" value={formData.email} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="ct-form-row">
                                        <div className="ct-form-group">
                                            <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
                                        </div>
                                        <div className="ct-form-group">
                                            <input type="text" name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <div className="ct-form-group">
                                        <textarea name="message" placeholder="Your Message *" rows="5" value={formData.message} onChange={handleChange} required></textarea>
                                    </div>
                                    <button type="submit" className="ct-submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? "Sending..." : "Send Message →"}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="ct-map-section">
                        <div className="ct-map-card">
                            <h3>📍 Find Us Here</h3>
                            <div className="ct-map-container">
                                <iframe
                                    src="https://maps.google.com/maps?q=urla+chhattisgarh&t=&z=13&ie=UTF8&iwloc=&output=embed"
                                    title="Location Map"
                                    allowFullScreen=""
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="ct-faq-section ct-fade-up">
                <div className="ct-container">
                    <div className="ct-section-header">
                        <span className="ct-section-badge">FAQ</span>
                        <h2>Frequently Asked Questions</h2>
                        <p>Find quick answers to common questions</p>
                    </div>
                    <div className="ct-faq-grid">
                        {faqs.map((faq, idx) => (
                            <div className="ct-faq-card" key={idx}>
                                <h4>📅 {faq.q}</h4>
                                <p>{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Same as Home */}
            <section className="ct-cta-section">
                <div className="ct-cta-content">
                    <h2>Need Immediate Medical Assistance?</h2>
                    <p>Call our 24/7 emergency helpline for instant support</p>
                    <button className="ct-cta-btn" onClick={() => window.location.href = "tel:+919876543210"}>
                        📞 Call Emergency: +91 98765 43210
                    </button>
                </div>
            </section>

            {/* Footer - Exactly like Home */}
            <footer className="ct-footer">
                <div className="ct-footer-inner">
                    <div className="ct-footer-grid">
                        <div>
                            <div className="ct-footer-logo">🏥 MediCare</div>
                            <p>Quality healthcare since 2010</p>
                            <div className="ct-social-links">📘 📷 🐦 🔗</div>
                        </div>
                        <div>
                            <h4>Quick Links</h4>
                            <ul>
                                <li><button onClick={() => setPage("home")}>Home</button></li>
                                <li><button onClick={() => setPage("about")}>About</button></li>
                                <li><button onClick={() => setPage("services")}>Services</button></li>
                                <li><button onClick={() => setPage("contact")}>Contact</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4>Services</h4>
                            <ul>
                                <li>Cardiology</li>
                                <li>Neurology</li>
                                <li>Pediatrics</li>
                                <li>Orthopedics</li>
                            </ul>
                        </div>
                        <div>
                            <h4>Contact</h4>
                            <ul>
                                <li>📍 Delhi, India</li>
                                <li>📞 +91 98765 43210</li>
                                <li>✉️ info@medicare.com</li>
                            </ul>
                        </div>
                    </div>
                    <div className="ct-footer-bottom">
                        <p>&copy; 2025 MediCare. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Contact;