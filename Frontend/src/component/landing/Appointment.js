import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import "./Appointment.css";
import API from "../../services/api";

function Appointment({ setPage }) {
    const [formData, setFormData] = useState({
        doctorId: "",
        date: "",
        time: "",
        patient_name: "",
        patient_email: "",
        patient_phone: ""
    });
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [error, setError] = useState("");
    const [bookedSlots, setBookedSlots] = useState([]);
    const [checkingSlots, setCheckingSlots] = useState(false);
    const [doctorAvailable, setDoctorAvailable] = useState(true);

    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('user_type');
    const savedUser = useMemo(() => 
        JSON.parse(localStorage.getItem('medicareUser') || '{}'), 
    []);

    const timeOptions = useMemo(() => [
        "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
        "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
        "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
    ], []);

    // Fetch doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            if (!token) {
                setError("⚠️ Please login to book an appointment");
                setLoading(false);
                return;
            }
            
            if (userRole !== 'patient') {
                setError("⚠️ Only patients can book appointments. Please login as patient.");
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                const response = await API.get('doctors/');
                setDoctors(response.data);
                setError("");
            } catch (error) {
                console.error("Error fetching doctors:", error);
                setError("Failed to load doctors. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        
        fetchDoctors();
    }, [token, userRole]);

    // Auto-fill user data
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            patient_name: savedUser.name || "",
            patient_email: savedUser.email || "",
            patient_phone: savedUser.phone || ""
        }));
    }, [savedUser]);

    // Booked slots fetch
    const fetchBookedSlots = useCallback(async (doctorId, date) => {
        if (!doctorId || !date) return;
        if (!token) return;

        setCheckingSlots(true);
        try {
            const response = await API.get(`booked-slots/?doctor_id=${doctorId}&date=${date}`);
            setBookedSlots(response.data.booked_slots || []);
            setDoctorAvailable(response.data.is_available !== false);
            if (response.data.is_available === false) {
                setFormData(prev => ({ ...prev, time: "" }));
            }
        } catch (error) {
            console.error("Error:", error);
            setBookedSlots([]);
            setDoctorAvailable(true);
        } finally {
            setCheckingSlots(false);
        }
    }, [token]);

    useEffect(() => {
        if (formData.doctorId && formData.date && token) {
            fetchBookedSlots(formData.doctorId, formData.date);
        } else {
            setBookedSlots([]);
            setDoctorAvailable(true);
        }
    }, [formData.doctorId, formData.date, fetchBookedSlots, token]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError("");
    }, []);

    const convertTo24Hour = useCallback((time12) => {
        if (!time12) return "";
        const [time, period] = time12.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }, []);

    const getAvailableTimeSlots = useCallback(() => {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const minAdvanceMinutes = 60;

        let slots = [...timeOptions];

        if (formData.date === today) {
            slots = slots.filter(slot => {
                const [hours, minutes] = slot.split(':');
                let slotHour = parseInt(hours);
                const period = slot.includes('PM') ? 'PM' : 'AM';
                
                if (period === 'PM' && slotHour !== 12) slotHour += 12;
                if (period === 'AM' && slotHour === 12) slotHour = 0;
                
                const slotTotalMinutes = slotHour * 60 + parseInt(minutes);
                return slotTotalMinutes >= currentTotalMinutes + minAdvanceMinutes;
            });
        }
        return slots;
    }, [formData.date, timeOptions]);

    const availableTimeSlots = useMemo(() => 
        getAvailableTimeSlots(), 
    [getAvailableTimeSlots]);

    // ✅ UPDATED: handleSubmit with auto scroll to top
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!token) {
            setError("⚠️ Please login to book an appointment");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => setPage("login"), 1500);
            return;
        }

        if (userRole !== 'patient') {
            setError("⚠️ Only patients can book appointments");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (!formData.doctorId || !formData.date || !formData.time) {
            setError("Please fill all fields");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setError("");
        setIsSubmitting(true);

        try {
            const time24 = convertTo24Hour(formData.time);

            await API.post('appointments/create/', {
                doctor: parseInt(formData.doctorId),
                patient_name: formData.patient_name,
                patient_email: formData.patient_email,
                patient_phone: formData.patient_phone,
                date: formData.date,
                time: time24
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSubmitSuccess(true);
            
            // ✅ AUTO SCROLL TO TOP - so user can see the success toast
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            setFormData(prev => ({
                ...prev,
                doctorId: "",
                date: "",
                time: ""
            }));
            
            setTimeout(() => setSubmitSuccess(false), 3000);
            setTimeout(() => setPage("home"), 2000);
        } catch (error) {
            console.error("Booking error:", error);
            setError(error.response?.data?.error || "Failed to book appointment");
            // ✅ AUTO SCROLL TO TOP on error as well
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    }, [token, userRole, formData, convertTo24Hour, setPage]);

    if (loading) {
        return (
            <div className="ap-container">
                <div className="ap-loading-screen">
                    <div className="ap-loading-spinner"></div>
                    <p>Loading doctors...</p>
                </div>
            </div>
        );
    }

    if (!token || userRole !== 'patient') {
        return (
            <div className="ap-container">
                <div className="ap-form-card ap-full-width" style={{ textAlign: 'center', padding: '60px 40px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
                    <h2 style={{ color: '#1e3a5f', marginBottom: '16px' }}>Login Required</h2>
                    <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '16px' }}>
                        {!token ? "Please login to book an appointment" : "Only patients can book appointments"}
                    </p>
                    <div className="ap-form-actions" style={{ justifyContent: 'center', maxWidth: '300px', margin: '0 auto' }}>
                        <button className="ap-submit-btn" onClick={() => setPage("login")} style={{ width: '100%' }}>
                            Go to Login
                        </button>
                    </div>
                    <div className="ap-footer-nav" style={{ marginTop: '40px', borderTop: 'none' }}>
                        <button className="ap-back-footer" onClick={() => setPage("services")}>
                            ← Back to Services
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="ap-container">
            {/* Success Toast - Fixed at top */}
            {submitSuccess && (
                <div className="ap-success-msg">
                    ✓ Appointment booked successfully! Redirecting...
                </div>
            )}
            
            {/* Error Toast - Fixed at top */}
            {error && !submitSuccess && (
                <div className="ap-error-msg">
                    ⚠️ {error}
                </div>
            )}

            <div className="ap-header">
                <h1>📅 Book an Appointment</h1>
                <p>Fill in the details below to schedule your consultation</p>
            </div>

            <div className="ap-main">
                <div className="ap-form-card ap-full-width">
                    <form onSubmit={handleSubmit}>
                        {/* User Info Section */}
                        <div className="ap-section">
                            <div className="ap-section-title">
                                <span>👤</span>
                                <h3>Your Information</h3>
                            </div>
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="patient_name"
                                        value={formData.patient_name}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                <div className="ap-form-group">
                                    <label>Email Address *</label>
                                    <input
                                        type="email"
                                        name="patient_email"
                                        value={formData.patient_email}
                                        onChange={handleChange}
                                        placeholder="your@email.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        name="patient_phone"
                                        value={formData.patient_phone}
                                        onChange={handleChange}
                                        placeholder="10-digit mobile number"
                                        maxLength="10"
                                    />
                                    <small className="ap-field-hint">Optional but recommended for SMS reminders</small>
                                </div>
                            </div>
                        </div>

                        {/* Appointment Details Section */}
                        <div className="ap-section">
                            <div className="ap-section-title">
                                <span>📋</span>
                                <h3>Appointment Details</h3>
                            </div>
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label>Select Doctor *</label>
                                    <select name="doctorId" value={formData.doctorId} onChange={handleChange} required>
                                        <option value="">Choose a doctor</option>
                                        {doctors.map(doc => (
                                            <option key={doc.id} value={doc.id}>
                                                Dr. {doc.name} - {doc.specialization} (₹{doc.fee})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="ap-form-group">
                                    <label>Appointment Date *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="ap-form-row">
                                <div className="ap-form-group">
                                    <label>Select Time *</label>
                                    <select 
                                        name="time" 
                                        value={formData.time} 
                                        onChange={handleChange} 
                                        required 
                                        disabled={doctorAvailable === false}
                                    >
                                        <option value="">Choose time slot</option>
                                        {availableTimeSlots.map((slot, idx) => (
                                            <option key={idx} value={slot} disabled={bookedSlots.includes(slot)}>
                                                {slot} {bookedSlots.includes(slot) && "🔴 Booked"}
                                            </option>
                                        ))}
                                    </select>
                                    {checkingSlots && <div className="ap-slot-loading">⏳ Checking availability...</div>}
                                    {!checkingSlots && formData.date && formData.doctorId && doctorAvailable === false && (
                                        <div className="ap-unavailable-msg">❌ Doctor is not available on this date</div>
                                    )}
                                    {!checkingSlots && formData.date && formData.doctorId && doctorAvailable && availableTimeSlots.filter(slot => !bookedSlots.includes(slot)).length === 0 && (
                                        <div className="ap-unavailable-msg">
                                            ❌ No slots available on this date. Please select another date.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="ap-time-info">
                            <span>⏰</span>
                            <p>Available: 9:00 AM - 8:00 PM (Lunch Break: 1:00 PM - 2:00 PM)</p>
                        </div>

                        <div className="ap-form-actions">
                            <button type="button" className="ap-cancel-btn" onClick={() => setPage("services")}>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="ap-submit-btn" 
                                disabled={isSubmitting || doctorAvailable === false || (availableTimeSlots.filter(slot => !bookedSlots.includes(slot)).length === 0 && formData.doctorId && formData.date)}
                            >
                                {isSubmitting ? "Booking..." : "Confirm Appointment"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="ap-footer-nav">
                <button className="ap-back-footer" onClick={() => setPage("services")}>
                    ← Back to Services
                </button>
            </div>
        </div>
    );
}

export default memo(Appointment);