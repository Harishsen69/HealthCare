import React, { useEffect } from "react";
import "./Service.css";

function Service({ setPage }) {
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

    const handleNavigation = (page) => {
        setPage(page);
    };

    return (
        <div className="service-page">
            {/* Hero Section */}
            <section className="service-hero-section">
                <div className="service-hero-container">
                    <div className="service-hero-content">
                        <div className="hero-badge">
                            <span className="badge-icon">⚕️</span>
                            Our Services
                        </div>
                        <h1>
                            Comprehensive <br />
                            <span className="text-primary">Healthcare Services</span>
                        </h1>
                        <p>
                            We offer a wide range of medical services to meet all your healthcare needs.
                            From preventive care to complex surgeries, our expert team is here for you.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-primary" onClick={() => handleNavigation("appointment")}>
                                Book Appointment →
                            </button>
                            <button className="btn-outline" onClick={() => handleNavigation("contact")}>
                                Contact Us
                            </button>
                        </div>
                        <div className="hero-stats">
                            <div className="stat">
                                <h3>50+</h3>
                                <p>Specialities</p>
                            </div>
                            <div className="stat">
                                <h3>150+</h3>
                                <p>Expert Doctors</p>
                            </div>
                            <div className="stat">
                                <h3>24/7</h3>
                                <p>Emergency Care</p>
                            </div>
                        </div>
                    </div>
                    <div className="service-hero-image">
                        <div className="hero-image-wrapper">
                            <img 
                                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=450&fit=crop" 
                                alt="Medical Services" 
                                loading="lazy"
                            />
                            <div className="floating-card">
                                <span>🏥</span>
                                <div>
                                    <strong>24/7 Available</strong>
                                    <p>Emergency Services</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid Section */}
            <section className="services-grid-section fade-up">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">What We Offer</span>
                        <h2>Complete Medical Care</h2>
                        <p>Advanced technology meets compassionate care</p>
                    </div>
                    <div className="services-grid">
                        <div className="service-card">
                            <div className="service-icon">❤️</div>
                            <h3>Cardiology</h3>
                            <p>Expert heart care with advanced diagnostic and treatment options for all cardiac conditions.</p>
                            <div className="service-features">
                                <span>✓ ECG</span>
                                <span>✓ Angiography</span>
                                <span>✓ Bypass Surgery</span>
                            </div>
                            <button className="service-btn" onClick={() => handleNavigation("appointment")}>Book Consultation →</button>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">🧠</div>
                            <h3>Neurology</h3>
                            <p>Specialized care for brain, spine, and nervous system disorders with advanced treatments.</p>
                            <div className="service-features">
                                <span>✓ MRI/CT Scan</span>
                                <span>✓ Stroke Care</span>
                                <span>✓ Neuro Surgery</span>
                            </div>
                            <button className="service-btn" onClick={() => handleNavigation("appointment")}>Book Consultation →</button>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">👶</div>
                            <h3>Pediatrics</h3>
                            <p>Comprehensive child healthcare from newborns to adolescents in a friendly environment.</p>
                            <div className="service-features">
                                <span>✓ Vaccination</span>
                                <span>✓ Growth Monitoring</span>
                                <span>✓ Child Psychology</span>
                            </div>
                            <button className="service-btn" onClick={() => handleNavigation("appointment")}>Book Consultation →</button>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">🦴</div>
                            <h3>Orthopedics</h3>
                            <p>Expert care for bones, joints, and muscles with modern surgical techniques.</p>
                            <div className="service-features">
                                <span>✓ Joint Replacement</span>
                                <span>✓ Sports Medicine</span>
                                <span>✓ Physiotherapy</span>
                            </div>
                            <button className="service-btn" onClick={() => handleNavigation("appointment")}>Book Consultation →</button>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">👁️</div>
                            <h3>Ophthalmology</h3>
                            <p>Complete eye care services including cataract surgery and laser treatments.</p>
                            <div className="service-features">
                                <span>✓ Cataract Surgery</span>
                                <span>✓ LASIK</span>
                                <span>✓ Glaucoma Care</span>
                            </div>
                            <button className="service-btn" onClick={() => handleNavigation("appointment")}>Book Consultation →</button>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">🦷</div>
                            <h3>Dentistry</h3>
                            <p>Comprehensive dental care including root canals, crowns, and cosmetic dentistry.</p>
                            <div className="service-features">
                                <span>✓ Root Canal</span>
                                <span>✓ Teeth Whitening</span>
                                <span>✓ Braces</span>
                            </div>
                            <button className="service-btn" onClick={() => handleNavigation("appointment")}>Book Consultation →</button>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">🤰</div>
                            <h3>Gynecology</h3>
                            <p>Complete women's health services from adolescence to menopause.</p>
                            <div className="service-features">
                                <span>✓ Pregnancy Care</span>
                                <span>✓ Fertility Treatment</span>
                                <span>✓ Cancer Screening</span>
                            </div>
                            <button className="service-btn" onClick={() => handleNavigation("appointment")}>Book Consultation →</button>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">🩺</div>
                            <h3>Dermatology</h3>
                            <p>Expert skin, hair, and nail care with advanced cosmetic treatments.</p>
                            <div className="service-features">
                                <span>✓ Skin Care</span>
                                <span>✓ Laser Treatment</span>
                                <span>✓ Hair Transplant</span>
                            </div>
                            <button className="service-btn" onClick={() => handleNavigation("appointment")}>Book Consultation →</button>
                        </div>

                        <div className="service-card">
                            <div className="service-icon">🚑</div>
                            <h3>Emergency Care</h3>
                            <p>24/7 emergency services with rapid response and critical care.</p>
                            <div className="service-features">
                                <span>✓ 24/7 Available</span>
                                <span>✓ Ambulance Service</span>
                                <span>✓ Trauma Care</span>
                            </div>
                            <button className="service-btn" onClick={() => handleNavigation("appointment")}>Book Consultation →</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Specialized Departments */}
            <section className="departments-section fade-up">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Specialized Departments</span>
                        <h2>Centers of Excellence</h2>
                        <p>Advanced care from specialized medical teams</p>
                    </div>
                    <div className="departments-grid">
                        <div className="dept-card">
                            <div className="dept-icon">🏥</div>
                            <h3>Cancer Center</h3>
                            <p>Comprehensive oncology care with modern radiation and chemotherapy.</p>
                        </div>
                        <div className="dept-card">
                            <div className="dept-icon">❤️</div>
                            <h3>Heart Institute</h3>
                            <p>Advanced cardiac care with state-of-the-art cath lab and surgery.</p>
                        </div>
                        <div className="dept-card">
                            <div className="dept-icon">🧠</div>
                            <h3>Neuroscience Center</h3>
                            <p>Specialized care for brain, spine, and nervous system disorders.</p>
                        </div>
                        <div className="dept-card">
                            <div className="dept-icon">🦴</div>
                            <h3>Orthopedic Center</h3>
                            <p>Complete bone and joint care with robotic surgery options.</p>
                        </div>
                        <div className="dept-card">
                            <div className="dept-icon">👶</div>
                            <h3>Women & Child Care</h3>
                            <p>Comprehensive care for mothers and children under one roof.</p>
                        </div>
                        <div className="dept-card">
                            <div className="dept-icon">🔬</div>
                            <h3>Diagnostic Center</h3>
                            <p>Advanced diagnostic services including MRI, CT, and lab tests.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="why-choose-section fade-up">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Why Choose Us</span>
                        <h2>Why Patients Trust MediCare</h2>
                        <p>We are committed to providing the highest standard of medical care</p>
                    </div>
                    <div className="why-grid">
                        <div className="why-card">
                            <div className="why-icon">👨‍⚕️</div>
                            <h3>Expert Doctors</h3>
                            <p>Highly qualified specialists with years of experience</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">🏥</div>
                            <h3>Modern Facilities</h3>
                            <p>State-of-the-art equipment and infrastructure</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">💙</div>
                            <h3>Patient First</h3>
                            <p>Personalized care for every patient</p>
                        </div>
                        <div className="why-card">
                            <div className="why-icon">⭐</div>
                            <h3>98% Satisfaction</h3>
                            <p>Thousands of happy patients</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section fade-up">
                <div className="container">
                    <div className="section-header">
                        <span className="section-badge">Testimonials</span>
                        <h2>What Our Patients Say</h2>
                        <p>Real stories from real patients</p>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="quote">"</div>
                            <p>Excellent doctors and staff. My surgery was successful and recovery was smooth.</p>
                            <div className="patient-info">
                                <strong>Rajesh Kumar</strong>
                                <span>⭐⭐⭐⭐⭐</span>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="quote">"</div>
                            <p>Best hospital in town. Very clean, professional, and caring staff.</p>
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
                    <h2>Ready to Get Started?</h2>
                    <p>Book an appointment with our expert doctors today</p>
                    <button className="cta-button" onClick={() => handleNavigation("appointment")}>
                        Book Appointment Now →
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

export default Service;