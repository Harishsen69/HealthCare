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
    const [showAllDoctors, setShowAllDoctors] = useState(false);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    
    const [showAddDoctorForm, setShowAddDoctorForm] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '', email: '', password: '', phone: '',
        specialization: '', experience: '', fee: ''
    });
    const [addDoctorLoading, setAddDoctorLoading] = useState(false);

    const userRole = localStorage.getItem('user_type');
    const token = localStorage.getItem('access_token');
    
    const timeOptions = [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
        "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
    ];

    const specialties = [
        { icon: "❤️", name: "Cardiology", desc: "Heart Specialists" },
        { icon: "🧠", name: "Neurology", desc: "Brain & Nerves" },
        { icon: "👶", name: "Pediatrics", desc: "Child Care" },
        { icon: "🦴", name: "Orthopedics", desc: "Bone & Joints" },
        { icon: "🩺", name: "Dermatology", desc: "Skin Care" },
        { icon: "🧘", name: "Psychiatry", desc: "Mental Health" }
    ];

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

    const fetchDoctors = useCallback(async () => {
        try {
            setLoading(true);
            const response = await API.get('doctors/');
            setDoctors(response.data || []);
        } catch (error) {
            console.error("Error fetching doctors:", error);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleAddDoctorChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone' && !/^\d{0,10}$/.test(value)) return;
        setNewDoctor(prev => ({ ...prev, [name]: value }));
    };

    const handleAddDoctorSubmit = async (e) => {
        e.preventDefault();
        setAddDoctorLoading(true);
        try {
            const response = await API.post('admin/add-doctor/', newDoctor, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.status === 201) {
                alert('Doctor added successfully!');
                setShowAddDoctorForm(false);
                setNewDoctor({ name: '', email: '', password: '', phone: '', specialization: '', experience: '', fee: '' });
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
        document.body.style.overflow = '';
    };

    const closeDoctorModal = () => {
        setShowDoctorModal(false);
        setSelectedDoctor(null);
        document.body.style.overflow = '';
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
        document.body.style.overflow = 'hidden';
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
            document.body.style.overflow = '';
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
        document.body.style.overflow = 'hidden';
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
    };

    const stopPropagation = (e) => e.stopPropagation();

    useEffect(() => {
        fetchDoctors();
        fetchUserProfile();
    }, [fetchDoctors, fetchUserProfile]);

    const displayedDoctors = showAllDoctors ? doctors : doctors.slice(0, 6);

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
                        <p>Experience world-class medical care with our team of expert doctors. Book appointments online and get treated from the comfort of your home.</p>
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
                            <div>
                                <strong>15+ Years of Excellence</strong>
                            </div>
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
                                        <input type="text" name="experience" placeholder="Experience" value={newDoctor.experience} onChange={handleAddDoctorChange} />
                                    </div>
                                    <div className="hm-form-row">
                                        <input type="number" name="fee" placeholder="Consultation Fee" value={newDoctor.fee} onChange={handleAddDoctorChange} required />
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

            {/* Specialties Section */}
            <section className="hm-specialties-section">
                <div className="hm-container">
                    <div className="hm-section-header">
                        <span className="hm-section-badge">Specialties</span>
                        <h2>Browse by Medical Specialty</h2>
                        <p>Find the right specialist for your health needs</p>
                    </div>
                    <div className="hm-specialties-grid">
                        {specialties.map((item, idx) => (
                            <div className="hm-spec-card" key={idx}>
                                <div className="hm-spec-icon">{item.icon}</div>
                                <h3>{item.name}</h3>
                                <p>{item.desc}</p>
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
                        <p>Click on any doctor to see complete details</p>
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
                                            <img src={doctor.image || "https://randomuser.me/api/portraits/men/32.jpg"} alt={doctor.name} />
                                            <div className="hm-doctor-overlay"><span>View Profile</span></div>
                                        </div>
                                        <h3>Dr. {doctor.name}</h3>
                                        <p className="hm-doctor-spec">{doctor.specialization}</p>
                                        <div className="hm-doctor-info">
                                            <span>⭐ {doctor.rating || 4.5}</span>
                                            <span>📅 {doctor.experience || "5+ years"}</span>
                                        </div>
                                        <div className="hm-doctor-location">📍 {doctor.location || "Delhi, India"}</div>
                                        <div className="hm-doctor-fee">₹{doctor.fee}</div>
                                        <button className="hm-doctor-book" onClick={(e) => { e.stopPropagation(); quickBook(doctor.id); }}>Book Appointment →</button>
                                    </div>
                                ))}
                            </div>
                            {doctors.length > 6 && (
                                <div className="hm-view-all">
                                    <button className="hm-view-all-btn" onClick={() => setShowAllDoctors(!showAllDoctors)}>
                                        {showAllDoctors ? "Show Less ↑" : `View All Doctors (${doctors.length}) →`}
                                    </button>
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
                    <p>Join thousands of satisfied patients and experience quality healthcare today</p>
                    <button className="hm-cta-btn" onClick={handleBookAppointmentClick}>Get Started →</button>
                </div>
            </section>

            {/* Footer */}
            <footer className="hm-footer">
                <div className="hm-footer-inner">
                    <div className="hm-footer-grid">
                        <div><div className="hm-footer-logo">🏥 MediCare</div><p>Quality healthcare since 2010</p><div className="hm-social-links">📘 📷 🐦 🔗</div></div>
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

            {/* Doctor Modal */}
            {showDoctorModal && selectedDoctor && (
                <div className="hm-modal-overlay" onClick={closeDoctorModal}>
                    <div className="hm-doctor-modal" onClick={stopPropagation}>
                        <button className="hm-modal-close-icon" onClick={closeDoctorModal}>✕</button>
                        <div className="hm-doc-header">
                            <div className="hm-doc-avatar">
                                <img src={selectedDoctor.image || "https://randomuser.me/api/portraits/men/32.jpg"} alt={selectedDoctor.name} />
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
                        <div className="hm-doc-body">
                            <div className="hm-doc-details">
                                <div><span>🎓</span><div><label>Experience</label><p>{selectedDoctor.experience || "10+ years"}</p></div></div>
                                <div><span>📍</span><div><label>Location</label><p>{selectedDoctor.location || "Delhi, India"}</p></div></div>
                                <div><span>💰</span><div><label>Fee</label><p>₹{selectedDoctor.fee}</p></div></div>
                                <div><span>👥</span><div><label>Patients</label><p>{selectedDoctor.patients || 5000}+</p></div></div>
                            </div>
                            <div className="hm-about-doc">
                                <h3>📖 About Doctor</h3>
                                <p>{selectedDoctor.about || `Dr. ${selectedDoctor.name} is an expert ${selectedDoctor.specialization} with over ${selectedDoctor.experience || 10} years of experience.`}</p>
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
        </div>
    );
}

export default Home;