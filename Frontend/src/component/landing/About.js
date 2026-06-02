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

        document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero-section">
                <div className="about-hero-container">
                    <div className="about-hero-left">
                        <div className="hero-badge">
                            <span className="badge-icon">✦</span>
                            About MediCare
                        </div>
                        <h1>
                            Your Health, <br />
                            <span className="text-primary">Our Commitment</span>
                        </h1>
                        <p>
                            With 15+ years of excellence in healthcare, we combine modern medical technology 
                            with compassionate care to serve you better. Your well-being is our top priority.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-primary" onClick={() => setPage("services")}>
                                Our Services →
                            </button>
                            <button className="btn-outline" onClick={() => setPage("contact")}>
                                Contact Us
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <h3>150+</h3>
                                <p>Expert Doctors</p>
                            </div>
                            <div className="stat">
                                <h3>50k+</h3>
                                <p>Happy Patients</p>
                            </div>
                            <div className="stat">
                                <h3>24/7</h3>
                                <p>Support Available</p>
                            </div>
                        </div>
                    </div>
                    <div className="about-hero-right">
                        <div className="hero-image-wrapper">
                            <img 
                                src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=500&h=450&fit=crop" 
                                alt="Healthcare" 
                                loading="lazy"
                            />
                            <div className="floating-card">
                                <span>🏆</span>
                                <div>
                                    <strong>15+ Years</strong>
                                    <p>of Excellence</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Beds Available</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">50+</div>
                            <div className="stat-label">Specialities</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">100+</div>
                            <div className="stat-label">Ambulance Fleet</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">98%</div>
                            <div className="stat-label">Patient Satisfaction</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who We Are Section */}
            <section className="who-we-are fade-up">
                <div className="container">
                    <div className="who-grid">
                        <div className="who-content">
                            <span className="section-badge">Who We Are</span>
                            <h2>Leading Healthcare Provider in India</h2>
                            <p>MediCare is a premier healthcare institution dedicated to providing exceptional medical services with a patient-first approach. Our team of experienced doctors and medical professionals work tirelessly to ensure the best possible outcomes for every patient.</p>
                            <p>With state-of-the-art facilities and a commitment to excellence, we have successfully treated thousands of patients across the country. Our multi-specialty hospital offers comprehensive care under one roof.</p>
                            <div className="who-features">
                                <div className="who-feature">
                                    <span>✓</span>
                                    <span>NABH Accredited Hospital</span>
                                </div>
                                <div className="who-feature">
                                    <span>✓</span>
                                    <span>ISO Certified Labs</span>
                                </div>
                                <div className="who-feature">
                                    <span>✓</span>
                                    <span>Advanced ICUs</span>
                                </div>
                                <div className="who-feature">
                                    <span>✓</span>
                                    <span>Modern Operation Theatres</span>
                                </div>
                            </div>
                        </div>
                        <div className="who-image">
                            <img 
                                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&h=400&fit=crop" 
                                alt="Hospital" 
                                loading="lazy"
                            />
                            <div className="experience-badge">
                                <span>🏥</span>
                                <div>
                                    <strong>Multi-Specialty</strong>
                                    <p>Hospital</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="mission-section fade-up">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Our Promise</span>
                        <h2>Mission & Vision</h2>
                        <p>Guiding our journey towards better healthcare</p>
                    </div>
                    <div className="mission-grid">
                        <div className="mission-card">
                            <div className="mission-icon">🎯</div>
                            <h3>Our Mission</h3>
                            <p>To provide accessible, high-quality healthcare services with compassion, integrity, and advanced medical technology for every patient who walks through our doors. We strive to make a positive difference in the lives of our patients and their families.</p>
                        </div>
                        <div className="vision-card">
                            <div className="vision-icon">👁️</div>
                            <h3>Our Vision</h3>
                            <p>To become India's most trusted healthcare network, recognized for excellence in patient care, medical innovation, and community wellness. We envision a healthier India through quality healthcare for all.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="features-section fade-up">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Why Choose Us</span>
                        <h2>What Makes Us Different</h2>
                        <p>We are committed to providing the highest standard of medical care</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">👨‍⚕️</div>
                            <h3>Expert Doctors</h3>
                            <p>Board-certified specialists with years of experience</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🏥</div>
                            <h3>Modern Facilities</h3>
                            <p>State-of-the-art equipment and infrastructure</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">⏰</div>
                            <h3>24/7 Support</h3>
                            <p>Round-the-clock medical assistance</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💙</div>
                            <h3>Patient First</h3>
                            <p>Personalized care for every patient</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🚑</div>
                            <h3>Emergency Care</h3>
                            <p>Immediate response in critical situations</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔬</div>
                            <h3>Advanced Tech</h3>
                            <p>Latest medical technology for accurate diagnosis</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="values-section fade-up">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Core Values</span>
                        <h2>Guided by Excellence</h2>
                        <p>The principles that drive everything we do</p>
                    </div>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-number">01</div>
                            <h3>Compassion</h3>
                            <p>We treat every patient with empathy and respect</p>
                        </div>
                        <div className="value-card">
                            <div className="value-number">02</div>
                            <h3>Excellence</h3>
                            <p>We strive for the highest quality in everything we do</p>
                        </div>
                        <div className="value-card">
                            <div className="value-number">03</div>
                            <h3>Integrity</h3>
                            <p>We are honest, ethical, and transparent</p>
                        </div>
                        <div className="value-card">
                            <div className="value-number">04</div>
                            <h3>Innovation</h3>
                            <p>We embrace new technology and ideas</p>
                        </div>
                        <div className="value-card">
                            <div className="value-number">05</div>
                            <h3>Teamwork</h3>
                            <p>Collaborative approach for better outcomes</p>
                        </div>
                        <div className="value-card">
                            <div className="value-number">06</div>
                            <h3>Accessibility</h3>
                            <p>Healthcare for everyone, everywhere</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section fade-up">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Testimonials</span>
                        <h2>What Our Patients Say</h2>
                        <p>Trusted by thousands of patients across India</p>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="quote">"</div>
                            <p>Excellent doctors and staff. My surgery was successful and recovery was smooth. Highly recommended!</p>
                            <div className="patient-info">
                                <strong>Rajesh Kumar</strong>
                                <span>⭐⭐⭐⭐⭐</span>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="quote">"</div>
                            <p>Best hospital in town. Very clean, professional, and caring staff. Thank you MediCare!</p>
                            <div className="patient-info">
                                <strong>Priya Sharma</strong>
                                <span>⭐⭐⭐⭐⭐</span>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="quote">"</div>
                            <p>Quick appointment and excellent treatment. The doctors explained everything clearly.</p>
                            <div className="patient-info">
                                <strong>Amit Patel</strong>
                                <span>⭐⭐⭐⭐⭐</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section fade-up">
                <div className="cta-container">
                    <h2>Ready to Start Your Health Journey?</h2>
                    <p>Join thousands of satisfied patients and experience quality healthcare today</p>
                    <button className="cta-button" onClick={() => setPage("services")}>
                        Get Started Now →
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
                                <li>📍 Delhi, India</li>
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

export default About;