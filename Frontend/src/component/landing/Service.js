import React, { useEffect } from "react";
import "./Service.css";

function Service({ setPage }) {
    // Scroll animations - same as Home
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.sc-fade-up').forEach(el => observer.observe(el));
        
        return () => observer.disconnect();
    }, []);

    const services = [
        { icon: "❤️", name: "Cardiology", desc: "Expert heart care with advanced diagnostic and treatment options for all cardiac conditions." },
        { icon: "🧠", name: "Neurology", desc: "Specialized care for brain, spine, and nervous system disorders with advanced treatments." },
        { icon: "👶", name: "Pediatrics", desc: "Comprehensive child healthcare from newborns to adolescents in a friendly environment." },
        { icon: "🦴", name: "Orthopedics", desc: "Expert care for bones, joints, and muscles with modern surgical techniques." },
        { icon: "👁️", name: "Ophthalmology", desc: "Complete eye care services including cataract surgery and laser treatments." },
        { icon: "🦷", name: "Dentistry", desc: "Comprehensive dental care including root canals, crowns, and cosmetic dentistry." },
        { icon: "🤰", name: "Gynecology", desc: "Complete women's health services from adolescence to menopause." },
        { icon: "🩺", name: "Dermatology", desc: "Expert skin, hair, and nail care with advanced cosmetic treatments." },
        { icon: "🚑", name: "Emergency Care", desc: "24/7 emergency services with rapid response and critical care." }
    ];

    const whyUs = [
        { icon: "👨‍⚕️", title: "Expert Doctors", desc: "Highly qualified specialists with years of experience" },
        { icon: "🏥", title: "Modern Facilities", desc: "State-of-the-art equipment and infrastructure" },
        { icon: "💙", title: "Patient First", desc: "Personalized care for every patient" },
        { icon: "⭐", title: "98% Satisfaction", desc: "Thousands of happy patients" }
    ];

    const testimonials = [
        { quote: "Excellent doctors and staff. My surgery was successful and recovery was smooth.", name: "Rajesh Kumar", rating: "⭐⭐⭐⭐⭐" },
        { quote: "Best hospital in town. Very clean, professional, and caring staff. Thank you MediCare!", name: "Priya Sharma", rating: "⭐⭐⭐⭐⭐" },
        { quote: "Quick appointment and excellent treatment. The doctors explained everything clearly.", name: "Amit Patel", rating: "⭐⭐⭐⭐⭐" }
    ];

    return (
        <div className="sc-service-container">
            {/* Hero Section */}
            <section className="sc-hero-section">
                <div className="sc-hero-content">
                    <div className="sc-hero-text">
                        <span className="sc-hero-badge">⚕️ Our Services</span>
                        <h1>Comprehensive <span className="sc-gradient-text">Healthcare Services</span></h1>
                        <p>We offer a wide range of medical services to meet all your healthcare needs. From preventive care to complex surgeries, our expert team is here for you.</p>
                        <div className="sc-hero-buttons">
                            <button className="sc-btn-primary" onClick={() => setPage("appointment")}>Book Appointment →</button>
                            <button className="sc-btn-secondary" onClick={() => setPage("contact")}>Contact Us</button>
                        </div>
                        <div className="sc-hero-stats">
                            <div><h3>50+</h3><p>Specialities</p></div>
                            <div><h3>150+</h3><p>Expert Doctors</p></div>
                            <div><h3>24/7</h3><p>Emergency Care</p></div>
                        </div>
                    </div>
                    <div className="sc-hero-image">
                        <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&h=450&fit=crop" alt="Medical Services" />
                        <div className="sc-hero-badge-card">
                            <span>🏥</span>
                            <div><strong>24/7 Available</strong></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid Section */}
            <section className="sc-services-section sc-fade-up">
                <div className="sc-container">
                    <div className="sc-section-header">
                        <span className="sc-section-badge">What We Offer</span>
                        <h2>Complete Medical Care</h2>
                        <p>Advanced technology meets compassionate care</p>
                    </div>
                    <div className="sc-services-grid">
                        {services.map((service, idx) => (
                            <div className="sc-service-card" key={idx}>
                                <div className="sc-service-icon">{service.icon}</div>
                                <h3>{service.name}</h3>
                                <p>{service.desc}</p>
                                <button className="sc-service-btn" onClick={() => setPage("appointment")}>Book Consultation →</button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="sc-why-section sc-fade-up">
                <div className="sc-container">
                    <div className="sc-section-header">
                        <span className="sc-section-badge">Why Choose Us</span>
                        <h2>Why Patients Trust MediCare</h2>
                        <p>We are committed to providing the highest standard of medical care</p>
                    </div>
                    <div className="sc-why-grid">
                        {whyUs.map((item, idx) => (
                            <div className="sc-why-card" key={idx}>
                                <div className="sc-why-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="sc-testimonials-section sc-fade-up">
                <div className="sc-container">
                    <div className="sc-section-header">
                        <span className="sc-section-badge">Testimonials</span>
                        <h2>What Our Patients Say</h2>
                        <p>Real stories from real patients</p>
                    </div>
                    <div className="sc-testimonials-grid">
                        {testimonials.map((item, idx) => (
                            <div className="sc-testimonial-card" key={idx}>
                                <div className="sc-quote">"</div>
                                <p>{item.quote}</p>
                                <div className="sc-patient-info">
                                    <strong>{item.name}</strong>
                                    <span>{item.rating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section - Same as Home */}
            <section className="sc-cta-section">
                <div className="sc-cta-content">
                    <h2>Ready to Get Started?</h2>
                    <p>Book an appointment with our expert doctors today</p>
                    <button className="sc-cta-btn" onClick={() => setPage("appointment")}>Book Appointment Now →</button>
                </div>
            </section>

            {/* Footer - Exactly like Home */}
            <footer className="sc-footer">
                <div className="sc-footer-inner">
                    <div className="sc-footer-grid">
                        <div>
                            <div className="sc-footer-logo">🏥 MediCare</div>
                            <p>Quality healthcare since 2010</p>
                            <div className="sc-social-links">📘 📷 🐦 🔗</div>
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
                    <div className="sc-footer-bottom">
                        <p>&copy; 2025 MediCare. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Service;