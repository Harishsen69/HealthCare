import React, { useState, useEffect, useCallback } from "react";
import "./Home.css";
import API from "../../services/api";

function Home({ setPage }) {
    const [showAppointment, setShowAppointment] = useState(false);
    const [formData, setFormData] = useState({ doctorId: "", date: "", time: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [visibleDoctors, setVisibleDoctors] = useState(6);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
    const [scrollPosition, setScrollPosition] = useState(0);

    const [showSpecialtyModal, setShowSpecialtyModal] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [specialtyDoctors, setSpecialtyDoctors] = useState([]);

    const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '', email: '', password: '', phone: '',
        specialization: '', experience: '', fee: '', image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [addDoctorLoading, setAddDoctorLoading] = useState(false);

    const userRole = localStorage.getItem('user_type');
    const token = localStorage.getItem('access_token');

    const timeOptions = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
        "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
    ];

    const specialties = [
        { 
            icon: "❤️", 
            name: "Cardiology", 
            desc: "Heart Specialists",
            fullDesc: "Cardiology is the branch of medicine that deals with disorders of the heart and blood vessels.",
            symptoms: "Chest pain, Shortness of breath, Palpitations, Dizziness, Swelling in legs"
        },
        { 
            icon: "🧠", 
            name: "Neurology", 
            desc: "Brain & Nerves",
            fullDesc: "Neurology is the branch of medicine dealing with disorders of the nervous system.",
            symptoms: "Headaches, Numbness, Memory problems, Seizures, Difficulty speaking"
        },
        { 
            icon: "👶", 
            name: "Pediatrics", 
            desc: "Child Care",
            fullDesc: "Pediatrics is the branch of medicine that involves the medical care of infants, children, and adolescents.",
            symptoms: "Fever, Growth concerns, Developmental delays, Behavioral issues"
        },
        { 
            icon: "🦴", 
            name: "Orthopedics", 
            desc: "Bone & Joints",
            fullDesc: "Orthopedics is the branch of surgery concerned with conditions involving the musculoskeletal system.",
            symptoms: "Joint pain, Fractures, Back pain, Sports injuries, Arthritis"
        },
        { 
            icon: "🩺", 
            name: "Dermatology", 
            desc: "Skin Care",
            fullDesc: "Dermatology is the branch of medicine dealing with the skin, nails, hair and their diseases.",
            symptoms: "Rashes, Itching, Skin discoloration, Moles, Hair loss, Acne"
        },
        { 
            icon: "🧘", 
            name: "Psychiatry", 
            desc: "Mental Health",
            fullDesc: "Psychiatry is the medical specialty devoted to the diagnosis, prevention, and treatment of mental disorders.",
            symptoms: "Anxiety, Depression, Mood swings, Sleep problems, Stress"
        }
    ];

    const getInitialCount = () => {
        return window.innerWidth <= 900 ? 4 : 6;
    };

    const getLoadMoreIncrement = () => {
        return window.innerWidth <= 900 ? 4 : 3;
    };

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 900;
            setIsMobile(mobile);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadMoreDoctors = () => {
        const increment = getLoadMoreIncrement();
        const newCount = visibleDoctors + increment;
        setVisibleDoctors(Math.min(newCount, doctors.length));
    };

    const viewAllDoctors = () => {
        setVisibleDoctors(doctors.length);
    };

    const showLessDoctors = () => {
        const initialCount = getInitialCount();
        setVisibleDoctors(initialCount);
    };

    // 🔥 FIX: Modal body control with exact scroll position - NO BLINK
    useEffect(() => {
        if (showAppointment || showDoctorModal || showSpecialtyModal) {
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
            
            // 🔥 FIX: Exact position restore - NO SCROLL DOWN
            if (scrollPosition > 0) {
                // Use requestAnimationFrame for smooth restore
                requestAnimationFrame(() => {
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: 'instant'
                    });
                    // Don't reset scrollPosition immediately, keep it
                });
            }
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.top = '';
        };
    }, [showAppointment, showDoctorModal, showSpecialtyModal]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                if (showAppointment) closeAppointmentModal();
                if (showDoctorModal) closeDoctorModal();
                if (showSpecialtyModal) closeSpecialtyModal();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [showAppointment, showDoctorModal, showSpecialtyModal]);

    const fetchUserProfile = useCallback(async () => {
        if (!token) return;
        try {
            const response = await API.get('patient-profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const savedUser = JSON.parse(localStorage.getItem('medicareUser') || '{}');
            setUserProfile({
                name: savedUser.name || "",
                email: savedUser.email || "",
                phone: response.data.phone || savedUser.phone || "",
                role: userRole
            });
        } catch (error) {
            const savedUser = JSON.parse(localStorage.getItem('medicareUser') || '{}');
            setUserProfile({
                name: savedUser.name || "",
                email: savedUser.email || "",
                phone: savedUser.phone || "",
                role: userRole
            });
        }
    }, [token, userRole]);

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        return imagePath;
    };

    const fetchDoctors = useCallback(async () => {
        try {
            setLoading(true);
            const response = await API.get('doctors/');
            const doctorsData = response.data || [];
            const doctorsWithImages = doctorsData.map((doc, index) => ({
                ...doc,
                image: doc.image || `https://randomuser.me/api/portraits/${index % 2 === 0 ? 'men' : 'women'}/${(index % 50) + 1}.jpg`
            }));
            setDoctors(doctorsWithImages);
            const initialCount = window.innerWidth <= 900 ? 4 : 6;
            setVisibleDoctors(initialCount);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const getDoctorsBySpecialty = (specialtyName) => {
        return doctors.filter(doc => 
            doc.specialization?.toLowerCase().includes(specialtyName.toLowerCase())
        );
    };

    const handleSpecialtyClick = (specialty) => {
        const specialtyDoctorsList = getDoctorsBySpecialty(specialty.name);
        setSelectedSpecialty(specialty);
        setSpecialtyDoctors(specialtyDoctorsList);
        setShowSpecialtyModal(true);
    };

    const closeSpecialtyModal = () => {
        setShowSpecialtyModal(false);
        setSelectedSpecialty(null);
        setSpecialtyDoctors([]);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewDoctor(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddDoctorChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone' && !/^\d{0,10}$/.test(value)) return;
        setNewDoctor(prev => ({ ...prev, [name]: value }));
    };

    const handleAddDoctorSubmit = async (e) => {
        e.preventDefault();
        setAddDoctorLoading(true);
        const formDataToSend = new FormData();
        formDataToSend.append('name', newDoctor.name);
        formDataToSend.append('email', newDoctor.email);
        formDataToSend.append('password', newDoctor.password);
        formDataToSend.append('phone', newDoctor.phone || '');
        formDataToSend.append('specialization', newDoctor.specialization);
        formDataToSend.append('experience', newDoctor.experience || '0');
        formDataToSend.append('fee', newDoctor.fee);
        if (newDoctor.image) {
            formDataToSend.append('image', newDoctor.image);
        }
        try {
            const response = await API.post('admin/add-doctor/', formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.status === 201) {
                alert('Doctor added successfully!');
                setShowAddDoctorForm(false);
                setNewDoctor({ name: '', email: '', password: '', phone: '', specialization: '', experience: '', fee: '', image: null });
                setImagePreview(null);
                fetchDoctors();
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add doctor');
        } finally {
            setAddDoctorLoading(false);
        }
    };

    const closeAppointmentModal = () => {
        setShowAppointment(false);
        setFormData({ doctorId: "", date: "", time: "" });
    };

    const closeDoctorModal = () => {
        setShowDoctorModal(false);
        setSelectedDoctor(null);
    };

    const handleBookAppointmentClick = () => {
        if (!token) {
            if (window.confirm("Please login to book an appointment.")) {
                setPage("login");
            }
            return;
        }
        if (userRole === 'doctor' || userRole === 'admin') {
            alert("Only patients can book appointments.");
            return;
        }
        fetchUserProfile();
        setShowAppointment(true);
    };

    const convertTo24Hour = (time12) => {
        if (!time12) return "";
        const [time, period] = time12.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    };

    const handleSubmitAppointment = async (e) => {
        e.preventDefault();
        if (!token) {
            alert("Please login to book an appointment");
            setPage("login");
            return;
        }
        if (userRole === 'doctor' || userRole === 'admin') {
            alert("Only patients can book appointments.");
            return;
        }
        if (!formData.doctorId || !formData.date || !formData.time) {
            alert("Please fill all fields");
            return;
        }
        setIsSubmitting(true);
        try {
            const time24 = convertTo24Hour(formData.time);
            await API.post('appointments/create/', {
                doctor: parseInt(formData.doctorId),
                patient_name: userProfile?.name || "",
                patient_email: userProfile?.email || "",
                patient_phone: userProfile?.phone || "",
                date: formData.date,
                time: time24
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSubmitSuccess(true);
            setFormData({ doctorId: "", date: "", time: "" });
            setTimeout(() => setSubmitSuccess(false), 3000);
            setShowAppointment(false);
            alert("Appointment booked successfully!");
        } catch (error) {
            alert(error.response?.data?.error || "Failed to book appointment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDoctorClick = (doctor) => {
        setSelectedDoctor(doctor);
        setShowDoctorModal(true);
    };

    const quickBook = (doctorId) => {
        if (!token) {
            if (window.confirm("Please login to book an appointment.")) {
                setPage("login");
            }
            return;
        }
        if (userRole === 'doctor' || userRole === 'admin') {
            alert("Only patients can book appointments.");
            return;
        }
        fetchUserProfile();
        setFormData(prev => ({ ...prev, doctorId: doctorId.toString() }));
        setShowAppointment(true);
        setShowDoctorModal(false);
        setShowSpecialtyModal(false);
    };

    const stopPropagation = (e) => e.stopPropagation();

    useEffect(() => {
        fetchDoctors();
        fetchUserProfile();
    }, [fetchDoctors, fetchUserProfile]);

    const displayedDoctors = doctors.slice(0, visibleDoctors);
    const initialCount = isMobile ? 4 : 6;
    const showMoreButton = visibleDoctors < doctors.length;
    const showLessButton = visibleDoctors > initialCount;

    if (loading) {
        return (
            <div className="hm-home-container">
                <div className="hm-loading-screen">
                    <div className="hm-loading-spinner"></div>
                    <p>Loading doctors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="hm-home-container">
            {submitSuccess && <div className="hm-toast">✓ Appointment Booked Successfully!</div>}

            {/* Hero Section */}
            <section className="hm-hero-section">
                <div className="hm-hero-content">
                    <div className="hm-hero-text">
                        <span className="hm-hero-badge">✨ Trusted Healthcare Partner</span>
                        <h1>Your Health, <span className="hm-gradient-text">Our Priority</span></h1>
                        <p>Experience world-class medical care with our team of expert doctors.</p>
                        <div className="hm-hero-buttons">
                            <button className="hm-btn-primary" onClick={handleBookAppointmentClick}>Book Appointment</button>
                            <button className="hm-btn-secondary" onClick={() => document.getElementById('hm-doctors-section').scrollIntoView({ behavior: 'smooth' })}>Find Doctors</button>
                        </div>
                        <div className="hm-hero-stats">
                            <div><h3>{doctors.length}+</h3><p>Expert Doctors</p></div>
                            <div><h3>50k+</h3><p>Happy Patients</p></div>
                            <div><h3>24/7</h3><p>Support</p></div>
                        </div>
                    </div>
                    <div className="hm-hero-image">
                        <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=450&fit=crop" alt="Doctor" />
                        <div className="hm-hero-badge-card">
                            <span>🏆</span>
                            <div><strong>15+ Years of Excellence</strong></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Admin Add Doctor Section */}
            {userRole === 'admin' && (
                <section className="hm-admin-section">
                    <div className="hm-container">
                        <div className="hm-section-header">
                            <span className="hm-section-badge">Admin Panel</span>
                            <h2>Manage Doctors</h2>
                            <p>Add new doctors to the platform</p>
                        </div>
                        <button className="hm-admin-add-btn" onClick={() => setShowAddDoctorForm(!showAddDoctorForm)}>
                            {showAddDoctorForm ? 'Cancel' : '+ Add New Doctor'}
                        </button>
                        {showAddDoctorForm && (
                            <div className="hm-admin-form-container">
                                <form onSubmit={handleAddDoctorSubmit}>
                                    <div className="hm-form-row">
                                        <input type="text" name="name" placeholder="Full Name" value={newDoctor.name} onChange={handleAddDoctorChange} required />
                                        <input type="email" name="email" placeholder="Email" value={newDoctor.email} onChange={handleAddDoctorChange} required autoComplete="off" />
                                    </div>
                                    <div className="hm-form-row">
                                        <input type="password" name="password" placeholder="Password" value={newDoctor.password} onChange={handleAddDoctorChange} required />
                                        <input type="text" name="phone" placeholder="Phone" value={newDoctor.phone} onChange={handleAddDoctorChange} maxLength="10" />
                                    </div>
                                    <div className="hm-form-row">
                                        <input type="text" name="specialization" placeholder="Specialization" value={newDoctor.specialization} onChange={handleAddDoctorChange} required />
                                        <input type="text" name="experience" placeholder="Experience (years)" value={newDoctor.experience} onChange={handleAddDoctorChange} />
                                    </div>
                                    <div className="hm-form-row">
                                        <input type="number" name="fee" placeholder="Consultation Fee (₹)" value={newDoctor.fee} onChange={handleAddDoctorChange} required />
                                    </div>
                                    <div className="hm-form-row hm-image-upload-row">
                                        <div className="hm-image-upload-container">
                                            <label className="hm-image-upload-label">
                                                <span>📷</span> Upload Doctor Image
                                                <input type="file" name="image" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                                            </label>
                                            {imagePreview && (
                                                <div className="hm-image-preview">
                                                    <img src={imagePreview} alt="Preview" />
                                                    <button type="button" onClick={() => { setImagePreview(null); setNewDoctor(prev => ({ ...prev, image: null })); }}>✕</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button type="submit" disabled={addDoctorLoading} className="hm-submit-btn">
                                        {addDoctorLoading ? "Adding..." : "Add Doctor"}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Specialties Section - Clickable */}
            <section className="hm-specialties-section">
                <div className="hm-container">
                    <div className="hm-section-header">
                        <span className="hm-section-badge">Specialties</span>
                        <h2>Browse by Medical Specialty</h2>
                        <p>Click on any specialty to see specialist doctors</p>
                    </div>
                    <div className="hm-specialties-grid">
                        {specialties.map((item, idx) => (
                            <div className="hm-spec-card" key={idx} onClick={() => handleSpecialtyClick(item)}>
                                <div className="hm-spec-icon">{item.icon}</div>
                                <h3>{item.name}</h3>
                                <p>{item.desc}</p>
                                <span className="hm-spec-doctor-count">
                                    {getDoctorsBySpecialty(item.name).length} Doctors
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctors Section */}
            <section id="hm-doctors-section" className="hm-doctors-section">
                <div className="hm-container">
                    <div className="hm-section-header">
                        <span className="hm-section-badge">Meet Our Experts</span>
                        <h2>Top Rated Doctors</h2>
                        <p>Tap on any doctor to see complete details</p>
                    </div>
                    {doctors.length === 0 ? (
                        <div className="hm-no-doctors">
                            <div className="hm-no-doctors-icon">👨‍⚕️</div>
                            <h3>No Doctors Found</h3>
                            <p>{userRole === 'admin' ? 'Click "Add New Doctor" above to add doctors.' : 'Please check back later for doctor listings.'}</p>
                        </div>
                    ) : (
                        <>
                            <div className="hm-doctors-grid">
                                {displayedDoctors.map((doctor) => (
                                    <div className="hm-doctor-card" key={doctor.id} onClick={() => handleDoctorClick(doctor)}>
                                        <div className="hm-doctor-img">
                                            <img
                                                src={doctor.image}
                                                alt={doctor.name}
                                                onError={(e) => {
                                                    console.log("Image Error:", doctor.image);
                                                    e.target.src = "https://randomuser.me/api/portraits/men/1.jpg";
                                                }}
                                            />
                                            <div className="hm-doctor-overlay"><span>View Profile</span></div>
                                        </div>
                                        <h3>Dr. {doctor.name}</h3>
                                        <p className="hm-doctor-spec">{doctor.specialization}</p>
                                        <button className="hm-doctor-book" onClick={(e) => { e.stopPropagation(); quickBook(doctor.id); }}>Book Appointment →</button>
                                    </div>
                                ))}
                            </div>

                            {doctors.length > initialCount && (
                                <div className="hm-load-more-container">
                                    {showMoreButton && (
                                        <button className="hm-load-more-btn" onClick={loadMoreDoctors}>
                                            Show More {isMobile ? "(+4)" : "(+3)"}
                                        </button>
                                    )}
                                    {showMoreButton && visibleDoctors < doctors.length && (
                                        <button className="hm-view-all-btn" onClick={viewAllDoctors}>
                                            View All ({doctors.length})
                                        </button>
                                    )}
                                    {showLessButton && (
                                        <button className="hm-show-less-btn" onClick={showLessDoctors}>
                                            Show Less ↑
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="hm-cta-section">
                <div className="hm-cta-content">
                    <h2>Ready to Start Your Health Journey?</h2>
                    <p>Join thousands of satisfied patients</p>
                    <button className="hm-cta-btn" onClick={handleBookAppointmentClick}>Get Started →</button>
                </div>
            </section>

            {/* Footer */}
            <footer className="hm-footer">
                <div className="hm-footer-inner">
                    <div className="hm-footer-grid">
                        <div><div className="hm-footer-logo">🏥 MediCare</div><p>Quality healthcare since 2010</p><div className="hm-social-links">📘  🐦 🔗</div></div>
                        <div><h4>Quick Links</h4><ul><li><button onClick={() => setPage("home")}>Home</button></li><li><button onClick={() => setPage("about")}>About</button></li><li><button onClick={() => setPage("services")}>Services</button></li><li><button onClick={() => setPage("contact")}>Contact</button></li></ul></div>
                        <div><h4>Services</h4><ul><li>Cardiology</li><li>Neurology</li><li>Pediatrics</li><li>Orthopedics</li></ul></div>
                        <div><h4>Contact</h4><ul><li>📍 Delhi, India</li><li>📞 +91 98765 43210</li><li>✉️ info@medicare.com</li></ul></div>
                    </div>
                    <div className="hm-footer-bottom"><p>&copy; 2025 MediCare. All rights reserved.</p></div>
                </div>
            </footer>

            {/* Appointment Modal */}
            {showAppointment && userRole === 'patient' && (
                <div className="hm-modal-overlay" onClick={closeAppointmentModal}>
                    <div className="hm-modal-content" onClick={stopPropagation}>
                        <button className="hm-modal-close" onClick={closeAppointmentModal}>×</button>
                        <h2>📅 Book Appointment</h2>
                        {userProfile && (
                            <div className="hm-user-summary">
                                <p>👤 {userProfile.name}</p>
                                <p>📧 {userProfile.email}</p>
                                <p>📞 {userProfile.phone || "No phone added"}</p>
                            </div>
                        )}
                        <form onSubmit={handleSubmitAppointment}>
                            <select name="doctorId" value={formData.doctorId} onChange={handleChange} required>
                                <option value="">Select Doctor</option>
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.id}>Dr. {doc.name} - {doc.specialization} (₹{doc.fee})</option>
                                ))}
                            </select>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
                            <select name="time" value={formData.time} onChange={handleChange} required>
                                <option value="">Select Time</option>
                                {timeOptions.map((slot, idx) => <option key={idx} value={slot}>{slot}</option>)}
                            </select>
                            <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Booking..." : "Confirm Appointment"}</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Doctor Modal - Full Detail */}
            {showDoctorModal && selectedDoctor && (
                <div className="hm-modal-overlay" onClick={closeDoctorModal}>
                    <div className="hm-doctor-modal" onClick={stopPropagation}>
                        <button className="hm-modal-close-icon" onClick={closeDoctorModal}>✕</button>
                        <div className="hm-doc-header">
                            <div className="hm-doc-avatar">
                                <img
                                    src={getImageUrl(selectedDoctor?.image)}
                                    alt={selectedDoctor?.name}
                                    onError={(e) => {
                                        e.target.src = "https://randomuser.me/api/portraits/men/1.jpg";
                                    }}
                                />
                                <div className="hm-available-tag">Available Today</div>
                            </div>
                            <div className="hm-doc-info">
                                <h2>Dr. {selectedDoctor.name}</h2>
                                <p className="hm-doc-specialty">{selectedDoctor.specialization}</p>
                                <div className="hm-doc-rating">
                                    <span>★★★★★</span>
                                    <span>{selectedDoctor.rating || 4.5}</span>
                                    <span>({selectedDoctor.patients || 5000}+ reviews)</span>
                                </div>
                            </div>
                        </div>
                        <div className="hm-doc-scroll-area">
                            <div className="hm-doc-details">
                                <div className="hm-doc-detail-item">
                                    <span>🎓</span>
                                    <div>
                                        <label>Experience</label>
                                        <p>{selectedDoctor.experience || "15+ years"}</p>
                                    </div>
                                </div>
                                <div className="hm-doc-detail-item">
                                    <span>📍</span>
                                    <div>
                                        <label>Location</label>
                                        <p>{selectedDoctor.location || "Delhi, India"}</p>
                                    </div>
                                </div>
                                <div className="hm-doc-detail-item">
                                    <span>💰</span>
                                    <div>
                                        <label>Fee</label>
                                        <p>₹{selectedDoctor.fee}</p>
                                    </div>
                                </div>
                                <div className="hm-doc-detail-item">
                                    <span>👥</span>
                                    <div>
                                        <label>Patients</label>
                                        <p>{selectedDoctor.patients || 5000}+</p>
                                    </div>
                                </div>
                            </div>
                            <div className="hm-about-doc">
                                <h3>📖 About Doctor</h3>
                                <p>{selectedDoctor.about || `Dr. ${selectedDoctor.name} is an expert ${selectedDoctor.specialization} with over ${selectedDoctor.experience || 15} years of experience.`}</p>
                            </div>
                            <div className="hm-services-tags">
                                <span>🏥 Specialist</span>
                                <span>🚑 Emergency</span>
                                <span>💻 Online Consultation</span>
                                <span>🔄 Free Follow-up</span>
                            </div>
                        </div>
                        <div className="hm-doc-footer">
                            <button className="hm-book-now" onClick={() => quickBook(selectedDoctor.id)}>📅 Book Appointment Now</button>
                            <button className="hm-video-consult">🎥 Video Consultation</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Specialty Modal */}
            {showSpecialtyModal && selectedSpecialty && (
                <div className="hm-modal-overlay" onClick={closeSpecialtyModal}>
                    <div className="hm-specialty-modal" onClick={stopPropagation}>
                        <button className="hm-modal-close-icon" onClick={closeSpecialtyModal}>✕</button>
                        
                        <div className="hm-specialty-header">
                            <div className="hm-specialty-icon">{selectedSpecialty.icon}</div>
                            <div>
                                <h2>{selectedSpecialty.name}</h2>
                                <p>{selectedSpecialty.desc}</p>
                            </div>
                        </div>

                        <div className="hm-specialty-scroll-area">
                            <div className="hm-specialty-description">
                                <h3>📖 About {selectedSpecialty.name}</h3>
                                <p>{selectedSpecialty.fullDesc}</p>
                            </div>

                            <div className="hm-specialty-symptoms">
                                <h3>🩺 Common Symptoms</h3>
                                <div className="hm-symptoms-tags">
                                    {selectedSpecialty.symptoms.split(',').map((symptom, idx) => (
                                        <span key={idx} className="hm-symptom-tag">{symptom.trim()}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="hm-specialty-doctors">
                                <h3>👨‍⚕️ Specialist Doctors ({specialtyDoctors.length})</h3>
                                {specialtyDoctors.length === 0 ? (
                                    <p className="hm-no-specialist-doctors">No {selectedSpecialty.name} specialists available currently.</p>
                                ) : (
                                    <div className="hm-specialty-doctors-list">
                                        {specialtyDoctors.map(doc => (
                                            <div key={doc.id} className="hm-specialty-doctor-item" onClick={() => { closeSpecialtyModal(); handleDoctorClick(doc); }}>
                                                <div className="hm-specialty-doc-avatar">
                                                    <img
                                                        src={doc.image || "https://randomuser.me/api/portraits/men/1.jpg"}
                                                        alt={doc.name}
                                                        onError={(e) => { e.target.src = "https://randomuser.me/api/portraits/men/1.jpg"; }}
                                                    />
                                                </div>
                                                <div className="hm-specialty-doc-info">
                                                    <h4>Dr. {doc.name}</h4>
                                                    <p>{doc.specialization}</p>
                                                    <span className="hm-specialty-doc-fee">₹{doc.fee}</span>
                                                </div>
                                                <button className="hm-specialty-book-btn" onClick={(e) => { e.stopPropagation(); quickBook(doc.id); }}>
                                                    Book
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;