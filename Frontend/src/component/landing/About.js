import React, { useEffect } from "react";
import "./About.css";

function About({ setPage }) {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.ab-fade-up').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const features = [
        { icon: "👨‍⚕️", title: "Expert Doctors", desc: "Board-certified specialists with years of experience" },
        { icon: "🏥", title: "Modern Facilities", desc: "State-of-the-art equipment and infrastructure" },
        { icon: "⏰", title: "24/7 Support", desc: "Round-the-clock medical assistance" },
        { icon: "💙", title: "Patient First", desc: "Personalized care for every patient" },
        { icon: "🚑", title: "Emergency Care", desc: "Immediate response in critical situations" },
        { icon: "🔬", title: "Advanced Tech", desc: "Latest medical technology for accurate diagnosis" }
    ];

    const values = [
        { num: "01", title: "Compassion", desc: "We treat every patient with empathy and respect" },
        { num: "02", title: "Excellence", desc: "We strive for the highest quality in everything we do" },
        { num: "03", title: "Integrity", desc: "We are honest, ethical, and transparent" },
        { num: "04", title: "Innovation", desc: "We embrace new technology and ideas" },
        { num: "05", title: "Teamwork", desc: "Collaborative approach for better outcomes" },
        { num: "06", title: "Accessibility", desc: "Healthcare for everyone, everywhere" }
    ];

    const testimonials = [
        { quote: "Excellent doctors and staff. My surgery was successful and recovery was smooth.", name: "Rajesh Kumar", rating: "⭐⭐⭐⭐⭐" },
        { quote: "Best hospital in town. Very clean, professional, and caring staff.", name: "Priya Sharma", rating: "⭐⭐⭐⭐⭐" },
        { quote: "Quick appointment and excellent treatment. The doctors explained everything clearly.", name: "Amit Patel", rating: "⭐⭐⭐⭐⭐" }
    ];

    return (
        <div className="ab-about-container">
            {/* Hero Section */}
            <section className="ab-hero-section">
                <div className="ab-hero-content">
                    <div className="ab-hero-text">
                        <span className="ab-hero-badge">✦ About MediCare</span>
                        <h1>Your Health, <span className="ab-gradient-text">Our Commitment</span></h1>
                        <p>With 15+ years of excellence in healthcare, we combine modern medical technology with compassionate care to serve you better.</p>
                        <div className="ab-hero-buttons">
                            <button className="ab-btn-primary" onClick={() => setPage("services")}>Our Services →</button>
                            <button className="ab-btn-secondary" onClick={() => setPage("contact")}>Contact Us</button>
                        </div>
                        <div className="ab-hero-stats">
                            <div><h3>150+</h3><p>Expert Doctors</p></div>
                            <div><h3>50k+</h3><p>Happy Patients</p></div>
                            <div><h3>24/7</h3><p>Support</p></div>
                        </div>
                    </div>
                    <div className="ab-hero-image">
                        <img src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&h=450&fit=crop" alt="Healthcare" />
                        <div className="ab-hero-badge-card">
                            <span>🏆</span>
                            <div><strong>15+ Years of Excellence</strong></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="ab-stats-section">
                <div className="ab-stats-grid">
                    <div><div className="ab-stat-num">500+</div><div className="ab-stat-label">Beds</div></div>
                    <div><div className="ab-stat-num">50+</div><div className="ab-stat-label">Specialities</div></div>
                    <div><div className="ab-stat-num">100+</div><div className="ab-stat-label">Ambulance</div></div>
                    <div><div className="ab-stat-num">98%</div><div className="ab-stat-label">Satisfaction</div></div>
                </div>
            </section>

            {/* Who We Are */}
            <section className="ab-who-section ab-fade-up">
                <div className="ab-container">
                    <div className="ab-who-grid">
                        <div className="ab-who-content">
                            <span className="ab-section-badge">Who We Are</span>
                            <h2>Leading Healthcare Provider</h2>
                            <p>MediCare is a premier healthcare institution dedicated to providing exceptional medical services with a patient-first approach.</p>
                            <p>With state-of-the-art facilities and a commitment to excellence, we have successfully treated thousands of patients across the country.</p>
                            <div className="ab-who-features">
                                <div className="ab-feature"><span>✓</span> NABH Accredited</div>
                                <div className="ab-feature"><span>✓</span> ISO Certified Labs</div>
                                <div className="ab-feature"><span>✓</span> Advanced ICUs</div>
                                <div className="ab-feature"><span>✓</span> Modern OTs</div>
                            </div>
                        </div>
                        <div className="ab-who-image">
                            <img src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=500&h=400&fit=crop" alt="Doctors" />
                            <div className="ab-who-badge">
                                <span>🏥</span>
                                <div><strong>Multi-Specialty</strong><p>Hospital</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="ab-mission-section ab-fade-up">
                <div className="ab-container">
                    <div className="ab-section-header">
                        <span className="ab-section-badge">Our Promise</span>
                        <h2>Mission & Vision</h2>
                        <p>Guiding our journey towards better healthcare</p>
                    </div>
                    <div className="ab-mission-grid">
                        <div className="ab-mission-card">
                            <div className="ab-mission-icon">🎯</div>
                            <h3>Our Mission</h3>
                            <p>To provide accessible, high-quality healthcare services with compassion, integrity, and advanced medical technology.</p>
                        </div>
                        <div className="ab-vision-card">
                            <div className="ab-vision-icon">👁️</div>
                            <h3>Our Vision</h3>
                            <p>To become India's most trusted healthcare network, recognized for excellence in patient care and medical innovation.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="ab-features-section ab-fade-up">
                <div className="ab-container">
                    <div className="ab-section-header">
                        <span className="ab-section-badge">Why Choose Us</span>
                        <h2>What Makes Us Different</h2>
                        <p>We are committed to providing the highest standard of medical care</p>
                    </div>
                    <div className="ab-features-grid">
                        {features.map((item, idx) => (
                            <div className="ab-feature-card" key={idx}>
                                <div className="ab-feature-icon">{item.icon}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="ab-values-section ab-fade-up">
                <div className="ab-container">
                    <div className="ab-section-header">
                        <span className="ab-section-badge">Core Values</span>
                        <h2>Guided by Excellence</h2>
                        <p>The principles that drive everything we do</p>
                    </div>
                    <div className="ab-values-grid">
                        {values.map((item, idx) => (
                            <div className="ab-value-card" key={idx}>
                                <div className="ab-value-num">{item.num}</div>
                                <h3>{item.title}</h3>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="ab-testimonials-section ab-fade-up">
                <div className="ab-container">
                    <div className="ab-section-header">
                        <span className="ab-section-badge">Testimonials</span>
                        <h2>What Our Patients Say</h2>
                        <p>Trusted by thousands of patients across India</p>
                    </div>
                    <div className="ab-testimonials-grid">
                        {testimonials.map((item, idx) => (
                            <div className="ab-testimonial-card" key={idx}>
                                <div className="ab-quote">"</div>
                                <p>{item.quote}</p>
                                <div className="ab-patient-info">
                                    <strong>{item.name}</strong>
                                    <span>{item.rating}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="ab-cta-section">
                <div className="ab-cta-content">
                    <h2>Ready to Start Your Health Journey?</h2>
                    <p>Join thousands of satisfied patients and experience quality healthcare today</p>
                    <button className="ab-cta-btn" onClick={() => setPage("services")}>Get Started →</button>
                </div>
            </section>

            {/* Footer */}
            <footer className="ab-footer">
                <div className="ab-footer-inner">
                    <div className="ab-footer-grid">
                        <div><div className="ab-footer-logo">🏥 MediCare</div><p>Quality healthcare since 2010</p><div className="ab-social-links">📘 📷 🐦 🔗</div></div>
                        <div><h4>Quick Links</h4><ul><li><button onClick={() => setPage("home")}>Home</button></li><li><button onClick={() => setPage("about")}>About</button></li><li><button onClick={() => setPage("services")}>Services</button></li><li><button onClick={() => setPage("contact")}>Contact</button></li></ul></div>
                        <div><h4>Services</h4><ul><li>Cardiology</li><li>Neurology</li><li>Pediatrics</li><li>Orthopedics</li></ul></div>
                        <div><h4>Contact</h4><ul><li>📍 Delhi, India</li><li>📞 +91 98765 43210</li><li>✉️ info@medicare.com</li></ul></div>
                    </div>
                    <div className="ab-footer-bottom"><p>&copy; 2025 MediCare. All rights reserved.</p></div>
                </div>
            </footer>
        </div>
    );
}

export default About;