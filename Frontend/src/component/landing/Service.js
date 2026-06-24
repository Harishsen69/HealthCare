import React, { useState, useEffect } from "react";
import "./Service.css";

function Service({ setPage }) {
    const [visibleServices, setVisibleServices] = useState(6);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [scrollPosition, setScrollPosition] = useState(0);

    // 🔥 Modal States
    const [selectedService, setSelectedService] = useState(null);
    const [showServiceModal, setShowServiceModal] = useState(false);

    // Check screen size for mobile/laptop
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 900;
            setIsMobile(mobile);
            // Reset visible count on resize
            if (mobile && visibleServices > 4) {
                setVisibleServices(4);
            } else if (!mobile && visibleServices < 6) {
                setVisibleServices(6);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [visibleServices]);

    // Scroll animations
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

    // Modal body control with exact scroll position - NO BLINK
    useEffect(() => {
        if (showServiceModal) {
            const scrollY = window.scrollY;
            setScrollPosition(scrollY);
            
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
            document.body.style.height = '100%';
            document.body.style.top = `-${scrollY}px`;
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
            
            if (scrollPosition > 0) {
                setTimeout(() => {
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: 'auto'
                    });
                    setScrollPosition(0);
                }, 10);
            }
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
        };
    }, [showServiceModal]);

    // ESC key handler
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && showServiceModal) {
                closeServiceModal();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showServiceModal]);

    // 🔥 Services with Full Details
    const services = [
        { 
            icon: "❤️", 
            name: "Cardiology", 
            desc: "Expert heart care with advanced diagnostic and treatment options for all cardiac conditions.",
            fullDesc: "Our Cardiology department offers comprehensive heart care services including diagnostic testing, interventional procedures, and cardiac rehabilitation. We specialize in treating coronary artery disease, heart failure, arrhythmias, and valvular heart disease using state-of-the-art technology.",
            treatments: ["ECG & Stress Testing", "Echocardiography", "Angiography & Angioplasty", "Pacemaker Implantation", "Cardiac Rehabilitation"]
        },
        { 
            icon: "🧠", 
            name: "Neurology", 
            desc: "Specialized care for brain, spine, and nervous system disorders with advanced treatments.",
            fullDesc: "Our Neurology department provides expert diagnosis and treatment for disorders of the nervous system. We offer comprehensive care for stroke, epilepsy, Parkinson's disease, multiple sclerosis, and other neurological conditions using advanced imaging and therapeutic techniques.",
            treatments: ["Brain & Spine MRI", "EEG & EMG Studies", "Stroke Management", "Epilepsy Treatment", "Movement Disorder Care"]
        },
        { 
            icon: "👶", 
            name: "Pediatrics", 
            desc: "Comprehensive child healthcare from newborns to adolescents in a friendly environment.",
            fullDesc: "Our Pediatrics department offers complete healthcare for children from birth to adolescence. We provide routine check-ups, vaccinations, growth monitoring, and treatment of childhood illnesses in a child-friendly environment with specialized pediatricians.",
            treatments: ["Well-baby Check-ups", "Vaccinations", "Growth Monitoring", "Childhood Illness Treatment", "Adolescent Health Care"]
        },
        { 
            icon: "🦴", 
            name: "Orthopedics", 
            desc: "Expert care for bones, joints, and muscles with modern surgical techniques.",
            fullDesc: "Our Orthopedics department specializes in diagnosing and treating musculoskeletal conditions. We provide comprehensive care for fractures, joint disorders, sports injuries, and perform advanced orthopedic surgeries including joint replacement and arthroscopy.",
            treatments: ["Fracture Treatment", "Joint Replacement", "Arthroscopy", "Spine Surgery", "Sports Injury Management"]
        },
        { 
            icon: "👁️", 
            name: "Ophthalmology", 
            desc: "Complete eye care services including cataract surgery and laser treatments.",
            fullDesc: "Our Ophthalmology department provides comprehensive eye care services for all age groups. We offer advanced diagnostic testing, medical treatments, and surgical procedures including cataract surgery, LASIK, and treatment for glaucoma, diabetic retinopathy, and other eye conditions.",
            treatments: ["Cataract Surgery", "LASIK & Vision Correction", "Glaucoma Treatment", "Diabetic Retinopathy Care", "Pediatric Eye Care"]
        },
        { 
            icon: "🦷", 
            name: "Dentistry", 
            desc: "Comprehensive dental care including root canals, crowns, and cosmetic dentistry.",
            fullDesc: "Our Dentistry department offers complete oral healthcare services. We provide preventive care, restorative treatments, and cosmetic procedures using modern dental technology. Our experienced dentists ensure comfortable and effective treatment for all dental conditions.",
            treatments: ["Root Canal Treatment", "Dental Crowns & Bridges", "Cosmetic Dentistry", "Teeth Whitening", "Orthodontics"]
        },
        { 
            icon: "🤰", 
            name: "Gynecology", 
            desc: "Complete women's health services from adolescence to menopause.",
            fullDesc: "Our Gynecology department provides comprehensive healthcare for women at all stages of life. We offer routine check-ups, pregnancy care, fertility treatments, and management of various gynecological conditions with compassionate and expert care.",
            treatments: ["Prenatal & Postnatal Care", "Infertility Treatment", "Menstrual Disorder Management", "Menopause Care", "Gynecological Surgeries"]
        },
        { 
            icon: "🩺", 
            name: "Dermatology", 
            desc: "Expert skin, hair, and nail care with advanced cosmetic treatments.",
            fullDesc: "Our Dermatology department offers comprehensive care for skin, hair, and nail conditions. We provide medical treatments for acne, eczema, psoriasis, and skin infections, as well as advanced cosmetic procedures like laser treatments, chemical peels, and scar reduction.",
            treatments: ["Acne & Eczema Treatment", "Psoriasis Management", "Laser Skin Treatments", "Chemical Peels", "Scar & Pigmentation Treatment"]
        },
        { 
            icon: "🚑", 
            name: "Emergency Care", 
            desc: "24/7 emergency services with rapid response and critical care.",
            fullDesc: "Our Emergency Care department is available 24/7 with a dedicated team of emergency physicians and support staff. We provide immediate medical care for critical conditions, traumatic injuries, and medical emergencies with advanced life support systems.",
            treatments: ["Trauma Care", "Stroke & Heart Attack Care", "Respiratory Emergencies", "Critical Care Unit", "24/7 Ambulance Services"]
        }
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

    // 🔥 Service Click Handler
    const handleServiceClick = (service) => {
        setSelectedService(service);
        setShowServiceModal(true);
    };

    // 🔥 Close Service Modal
    const closeServiceModal = () => {
        setShowServiceModal(false);
        setSelectedService(null);
    };

    // 🔥 Stop Propagation
    const stopPropagation = (e) => e.stopPropagation();

    // Get initial count based on screen size
    const getInitialCount = () => {
        return window.innerWidth <= 900 ? 4 : 6;
    };

    // Get load more increment based on screen size
    const getLoadMoreIncrement = () => {
        return window.innerWidth <= 900 ? 4 : 3;
    };

    const loadMoreServices = () => {
        const increment = getLoadMoreIncrement();
        setVisibleServices(prev => prev + increment);
    };

    const viewAllServices = () => {
        setVisibleServices(services.length);
    };

    const showLessServices = () => {
        const initialCount = getInitialCount();
        setVisibleServices(initialCount);
    };

    const displayedServices = services.slice(0, visibleServices);
    const initialCount = isMobile ? 4 : 6;
    const isShowingAll = visibleServices === services.length;
    const showLoadMore = !isShowingAll && visibleServices < services.length;
    const showViewAll = !isShowingAll && services.length > visibleServices;

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
                            <button className="sc-btn-primary" onClick={() => setPage("appointment")}>Book Appointment</button>
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

            {/* Services Grid Section - Clickable Cards */}
            <section className="sc-services-section sc-fade-up">
                <div className="sc-container">
                    <div className="sc-section-header">
                        <span className="sc-section-badge">What We Offer</span>
                        <h2>Complete Medical Care</h2>
                        <p>Tap on any service to learn more</p>
                    </div>
                    <div className="sc-services-grid">
                        {displayedServices.map((service, idx) => (
                            <div className="sc-service-card clickable" key={idx} onClick={() => handleServiceClick(service)}>
                                <div className="sc-service-icon">{service.icon}</div>
                                <h3>{service.name}</h3>
                                <p>{service.desc}</p>
                                <span className="sc-click-hint">Tap to learn more →</span>
                            </div>
                        ))}
                    </div>

                    {/* 🔥 LOAD MORE / VIEW ALL / SHOW LESS BUTTONS */}
                    {services.length > initialCount && (
                        <div className="sc-load-more-container">
                            {showLoadMore && (
                                <button className="sc-load-more-btn" onClick={loadMoreServices}>
                                    Load More {isMobile ? "(+4)" : "(+3)"}
                                </button>
                            )}
                            {showViewAll && !showLoadMore && (
                                <button className="sc-view-all-btn" onClick={viewAllServices}>
                                    View All Services ({services.length})
                                </button>
                            )}
                            {isShowingAll && services.length > initialCount && (
                                <button className="sc-show-less-btn" onClick={showLessServices}>
                                    Show Less ↑
                                </button>
                            )}
                        </div>
                    )}
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

            {/* CTA Section */}
            <section className="sc-cta-section">
                <div className="sc-cta-content">
                    <h2>Ready to Get Started?</h2>
                    <p>Book an appointment with our expert doctors today</p>
                    <button className="sc-cta-btn" onClick={() => setPage("appointment")}>Book Appointment Now →</button>
                </div>
            </section>

            {/* ========== SERVICE MODAL ========== */}
            {showServiceModal && selectedService && (
                <div className="sc-modal-overlay" onClick={closeServiceModal}>
                    <div className="sc-modal-content" onClick={stopPropagation}>
                        <button className="sc-modal-close" onClick={closeServiceModal}>✕</button>
                        
                        <div className="sc-modal-header">
                            <span className="sc-modal-icon">{selectedService.icon}</span>
                            <h2>{selectedService.name}</h2>
                        </div>

                        <div className="sc-modal-body">
                            <p className="sc-modal-desc">{selectedService.fullDesc}</p>
                            
                            <div className="sc-modal-treatments">
                                <h4>🩺 Key Treatments</h4>
                                <ul>
                                    {selectedService.treatments.map((treatment, idx) => (
                                        <li key={idx}>{treatment}</li>
                                    ))}
                                </ul>
                            </div>
                            
                            <button className="sc-modal-action-btn" onClick={() => { closeServiceModal(); setPage("appointment"); }}>
                                Book Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="sc-footer">
                <div className="sc-footer-inner">
                    <div className="sc-footer-grid">
                        <div><div className="sc-footer-logo">🏥 MediCare</div><p>Quality healthcare since 2010</p><div className="sc-social-links">📘 📷 🐦 🔗</div></div>
                        <div><h4>Quick Links</h4><ul><li><button onClick={() => setPage("home")}>Home</button></li><li><button onClick={() => setPage("about")}>About</button></li><li><button onClick={() => setPage("services")}>Services</button></li><li><button onClick={() => setPage("contact")}>Contact</button></li></ul></div>
                        <div><h4>Services</h4><ul><li>Cardiology</li><li>Neurology</li><li>Pediatrics</li><li>Orthopedics</li></ul></div>
                        <div><h4>Contact</h4><ul><li>📍 Delhi, India</li><li>📞 +91 98765 43210</li><li>✉️ info@medicare.com</li></ul></div>
                    </div>
                    <div className="sc-footer-bottom"><p>&copy; 2025 MediCare. All rights reserved.</p></div>
                </div>
            </footer>
        </div>
    );
}

export default Service;