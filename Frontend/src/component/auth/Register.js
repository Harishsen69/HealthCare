import React, { useState, useEffect } from "react";
import "./Register.css";
import API from "../../services/api";

function Register({ setPage }) {
    // Step 1: Registration Form
    const [step, setStep] = useState("form");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        agreeTerms: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    
    // Step 2: OTP Verification
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpSuccess, setOtpSuccess] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("");

    // Timer for resend OTP
    useEffect(() => {
        let timer;
        if (resendTimer > 0) {
            timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendTimer]);

    // Auto-hide toast
    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage("");
                setToastType("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const showToast = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
        if (errors[name]) {
            setErrors({ ...errors, [name]: "" });
        }
    };

    // Only numbers for OTP
    const handleOtpChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setOtp(value);
        }
    };

    // Validate registration form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required";
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required";
        }
        
        if (!formData.phone) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phone)) {
            newErrors.phone = "Please enter a valid 10-digit mobile number";
        }
        
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Please enter a valid email";
        }
        
        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }
        
        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }
        
        if (!formData.agreeTerms) {
            newErrors.agreeTerms = "You must agree to the terms and conditions";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Send OTP after form validation
    const handleSubmitForm = async (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            setLoading(true);
            
            try {
                const checkResponse = await API.post('check-email/', {
                    email: formData.email
                });
                
                if (checkResponse.data.exists) {
                    setErrors({ email: "This email is already registered. Please login instead." });
                    setLoading(false);
                    return;
                }
                
                const response = await API.post('send-otp/', {
                    email: formData.email,
                    user_type: 'patient'
                });
                
                if (response.status === 200) {
                    setRegisteredEmail(formData.email);
                    setStep("otp");
                    setResendTimer(60);
                    showToast(`✓ OTP sent successfully to ${formData.email}`, "success");
                }
            } catch (err) {
                setErrors({ email: err.response?.data?.error || "Failed to send OTP" });
                showToast(err.response?.data?.error || "Failed to send OTP", "error");
            } finally {
                setLoading(false);
            }
        }
    };

    // Verify OTP and then create account
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        if (!otp || otp.length !== 6) {
            setOtpError("Please enter 6-digit OTP");
            return;
        }
        
        setOtpError("");
        setOtpLoading(true);
        
        try {
            const response = await API.post('verify-otp/', {
                email: registeredEmail,
                otp: otp,
                user_type: 'patient'
            });
            
            if (response.status === 200) {
                const baseUsername = `${formData.firstName}${formData.lastName}`.toLowerCase().replace(/\s/g, '');
                const username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
                
                const registerResponse = await API.post('register/', {
                    username: username,
                    email: registeredEmail,
                    password: formData.password,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    phone: formData.phone,
                    address: formData.address
                });
                
                localStorage.setItem('access_token', registerResponse.data.access);
                localStorage.setItem('refresh_token', registerResponse.data.refresh);
                localStorage.setItem('user_type', 'patient');
                localStorage.setItem('user_role', 'patient');
                
                const userData = {
                    id: registerResponse.data.user.id,
                    name: `${formData.firstName} ${formData.lastName}`,
                    username: username,
                    email: registeredEmail,
                    phone: formData.phone,
                    address: formData.address,
                    user_type: 'patient',
                };
                
                localStorage.setItem("medicareUser", JSON.stringify(userData));
                
                showToast("✓ Registration successful! Welcome to MediCare.", "success");
                setTimeout(() => setPage("home"), 1500);
            }
        } catch (err) {
            setOtpError(err.response?.data?.error || "Invalid OTP. Please try again.");
            showToast(err.response?.data?.error || "Invalid OTP", "error");
        } finally {
            setOtpLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        
        setOtpLoading(true);
        try {
            const response = await API.post('send-otp/', {
                email: registeredEmail,
                user_type: 'patient'
            });
            
            if (response.status === 200) {
                setResendTimer(60);
                showToast(`✓ OTP resent successfully to ${registeredEmail}`, "success");
            }
        } catch (err) {
            setOtpError("Failed to resend OTP");
            showToast("Failed to resend OTP", "error");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleChangeEmail = () => {
        setStep("form");
        setOtp("");
        setOtpError("");
        setOtpSuccess("");
        setRegisteredEmail("");
    };

    const handleBackToHome = () => {
        setPage("home");
    };

    // Step 1: Registration Form
    if (step === "form") {
        return (
            <div className="register-page">
                {/* Toast Notification */}
                {toastMessage && (
                    <div className={`auth-toast ${toastType}`}>
                        <span>{toastType === "success" ? "✓" : "⚠️"}</span>
                        {toastMessage}
                    </div>
                )}
                
                <div className="register-container-simple">
                    <div className="register-form">
                        <div className="register-header">
                            <h1>Create Account</h1>
                        </div>

                        <form onSubmit={handleSubmitForm}>
                            <div className="form-row">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="firstName"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                    {errors.firstName && <span className="error">{errors.firstName}</span>}
                                </div>

                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="lastName"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                    {errors.lastName && <span className="error">{errors.lastName}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        maxLength="10"
                                    />
                                    {errors.phone && <span className="error">{errors.phone}</span>}
                                </div>

                                <div className="input-group">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    {errors.email && <span className="error">{errors.email}</span>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-group">
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    {errors.password && <span className="error">{errors.password}</span>}
                                </div>

                                <div className="input-group">
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                                </div>
                            </div>

                            <div className="form-row-full">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Full Address"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                    {errors.address && <span className="error">{errors.address}</span>}
                                </div>
                            </div>

                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="agreeTerms"
                                        checked={formData.agreeTerms}
                                        onChange={handleChange}
                                    />
                                    <span>I agree to the <a>Terms & Conditions</a> and <a>Privacy Policy</a></span>
                                </label>
                                {errors.agreeTerms && <span className="error">{errors.agreeTerms}</span>}
                            </div>

                            <button type="submit" className="btn-register" disabled={loading}>
                                {loading ? "Sending OTP..." : "Create Account"}
                            </button>
                        </form>

                        <div className="back-home-container">
                            <button className="btn-back-home" onClick={handleBackToHome}>
                                ← Back to Home
                            </button>
                        </div>
                        <div className="login-link">
                            Already have an account? <span onClick={() => setPage("login")}>Login here</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: OTP Verification
    return (
        <div className="register-page">
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`auth-toast ${toastType}`}>
                    <span>{toastType === "success" ? "✓" : "⚠️"}</span>
                    {toastMessage}
                </div>
            )}
            
            <div className="register-container-simple">
                <div className="register-form">
                    <div className="register-header">
                        <div className="brand-icon">🔐</div>
                        <h1>Verify OTP</h1>
                    </div>

                    {otpError && (
                        <div className="error-message">
                            <span>⚠️</span> {otpError}
                        </div>
                    )}

                    {otpSuccess && (
                        <div className="success-message">
                            <span>✓</span> {otpSuccess}
                        </div>
                    )}

                    <form onSubmit={handleVerifyOTP}>
                        <div className="input-group">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={handleOtpChange}
                                maxLength="6"
                                required
                            />
                        </div>

                        <button type="submit" className="btn-verify" disabled={otpLoading}>
                            {otpLoading ? "Verifying..." : "Verify & Create Account"}
                        </button>

                        <div className="otp-actions">
                            <button
                                type="button"
                                className={`btn-resend ${resendTimer > 0 ? "disabled" : ""}`}
                                onClick={handleResendOTP}
                                disabled={resendTimer > 0}
                            >
                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                            </button>
                            <button
                                type="button"
                                className="btn-change-email"
                                onClick={handleChangeEmail}
                            >
                                Change Email
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;