import React, { useState, useEffect } from "react";
import "./Login.css";
import API from "../../services/api";

function Login({ setPage }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");

    // OTP Password Reset States
    const [resetStep, setResetStep] = useState("email");
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpSuccess, setOtpSuccess] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resetError, setResetError] = useState("");
    const [resetSuccess, setResetSuccess] = useState("");
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

    // Auto-hide toast after 3 seconds
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

    // ========== HANDLE LOGIN SUBMIT ==========
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError("Please fill in all fields");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const response = await API.post('login/', {
                username: username,
                password: password,
                user_type: "auto"
            });

            if (response.status === 200) {
                localStorage.setItem('access_token', response.data.access);
                localStorage.setItem('refresh_token', response.data.refresh);
                localStorage.setItem('user_role', response.data.user.user_type);
                localStorage.setItem('user_type', response.data.user.user_type);

                const userData = {
                    id: response.data.user.id,
                    name: response.data.user.first_name && response.data.user.last_name
                        ? `${response.data.user.first_name} ${response.data.user.last_name}`
                        : response.data.user.username || response.data.user.email,
                    first_name: response.data.user.first_name || "",
                    last_name: response.data.user.last_name || "",
                    email: response.data.user.email,
                    user_type: response.data.user.user_type,
                    phone: response.data.user.phone || "",
                    address: response.data.user.address || ""
                };

                localStorage.setItem("medicareUser", JSON.stringify(userData));
                setPage("home");
                showToast(`Welcome ${response.data.user.user_type}!`, "success");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    // ========== SEND OTP FOR PASSWORD RESET ==========
    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!forgotEmail) {
            setError("Please enter your email");
            return;
        }

        setOtpError("");
        setOtpSuccess("");
        setOtpLoading(true);

        try {
            const response = await API.post('send-reset-otp/', {
                email: forgotEmail
            });

            if (response.status === 200) {
                showToast("✓ OTP sent successfully to your email!", "success");
                setResetStep("otp");
                setResendTimer(60);
            }
        } catch (err) {
            setOtpError(err.response?.data?.error || "Failed to send OTP");
            showToast(err.response?.data?.error || "Failed to send OTP", "error");
        } finally {
            setOtpLoading(false);
        }
    };

    // ========== VERIFY OTP ==========
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setOtpError("Please enter 6-digit OTP");
            return;
        }

        setOtpError("");
        setOtpLoading(true);

        try {
            const response = await API.post('verify-reset-otp/', {
                email: forgotEmail,
                otp: otp
            });

            if (response.status === 200) {
                showToast("✓ OTP verified! Set your new password.", "success");
                setResetStep("reset");
            }
        } catch (err) {
            setOtpError(err.response?.data?.error || "Invalid OTP");
            showToast(err.response?.data?.error || "Invalid OTP", "error");
        } finally {
            setOtpLoading(false);
        }
    };

    // ========== RESET PASSWORD ==========
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            setResetError("Please fill all fields");
            return;
        }

        if (newPassword.length < 6) {
            setResetError("Password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            setResetError("Passwords do not match");
            return;
        }

        setResetError("");
        setLoading(true);

        try {
            const response = await API.post('reset-password/', {
                email: forgotEmail,
                new_password: newPassword
            });

            if (response.status === 200) {
                showToast("✓ Password reset successfully! Please login.", "success");
                setTimeout(() => {
                    setShowForgotPassword(false);
                    setResetStep("email");
                    setForgotEmail("");
                    setOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                }, 2000);
            }
        } catch (err) {
            setResetError(err.response?.data?.error || "Failed to reset password");
            showToast(err.response?.data?.error || "Failed to reset password", "error");
        } finally {
            setLoading(false);
        }
    };

    // ========== RESEND OTP ==========
    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setOtpLoading(true);
        try {
            const response = await API.post('send-reset-otp/', {
                email: forgotEmail
            });
            if (response.status === 200) {
                showToast("✓ OTP resent successfully!", "success");
                setResendTimer(60);
            }
        } catch (err) {
            setOtpError(err.response?.data?.error || "Failed to resend OTP");
            showToast(err.response?.data?.error || "Failed to resend OTP", "error");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleRegister = () => setPage("register");
    const handleBackToHome = () => setPage("home");
    const handleBackToLogin = () => {
        setShowForgotPassword(false);
        setResetStep("email");
        setForgotEmail("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setOtpError("");
        setResetError("");
        setToastMessage("");
    };

    // Render OTP Step
    const renderOTPStep = () => (
        <form onSubmit={handleVerifyOTP}>
            <div className="auth-input-group">
                <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength="6"
                    className="auth-input"
                />
            </div>

            <button type="submit" className="auth-btn-primary" disabled={otpLoading}>
                {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className="auth-otp-actions">
                <button
                    type="button"
                    className={`auth-link-btn ${resendTimer > 0 ? "disabled" : ""}`}
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0}
                >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
                <button type="button" className="auth-link-btn" onClick={() => setResetStep("email")}>
                    Change Email
                </button>
            </div>
        </form>
    );

    // Render Reset Password Step
    const renderResetStep = () => (
        <form onSubmit={handleResetPassword}>
            <div className="auth-input-group">
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="auth-input"
                />
            </div>
            <div className="auth-input-group">
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="auth-input"
                />
            </div>

            {resetError && <div className="auth-error-msg">{resetError}</div>}

            <button type="submit" className="auth-btn-primary" disabled={loading}>
                {loading ? "Resetting..." : "Reset Password"}
            </button>
        </form>
    );

    return (
        <div className="auth-page">
            {/* Toast Notification */}
            {toastMessage && (
                <div className={`auth-toast ${toastType}`}>
                    <span>{toastType === "success" ? "✓" : "⚠️"}</span>
                    {toastMessage}
                </div>
            )}

            <div className="auth-container">
                <div className="auth-card">
                    {!showForgotPassword ? (
                        // Login Form
                        <>
                            <div className="auth-brand">
                                <h1 className="auth-brand-title">Login Your Account</h1>
                                <p className="auth-brand-subtitle">Your Health, Our Priority</p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="auth-input-group">
                                    <input
                                        type="text"
                                        placeholder="Email or Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="auth-input"
                                    />
                                </div>

                                <div className="auth-input-group">
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="auth-input"
                                    />
                                </div>

                                {error && <div className="auth-error-msg">{error}</div>}

                                <div className="auth-options">
                                    <label className="auth-checkbox">
                                        <input type="checkbox" />
                                        <span>Remember me</span>
                                    </label>
                                    <button type="button" className="auth-link-btn" onClick={() => setShowForgotPassword(true)}>
                                        Forgot Password?
                                    </button>
                                </div>

                                <button type="submit" className="auth-btn-primary" disabled={loading}>
                                    {loading ? "Logging in..." : "Sign In"}
                                </button>
                            </form>

                            <div className="auth-footer-links">
                                <button className="auth-footer-btn" onClick={handleBackToHome}>
                                    ← Back to Home
                                </button>
                                <div className="auth-register-link">
                                    Don't have an account? <span onClick={handleRegister}>Register Now</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Forgot Password Flow
                        <>
                            <div className="auth-brand auth-brand-small">
                                <div className="auth-brand-icon">🔐</div>
                                <h2 className="auth-brand-subtitle">Reset Password</h2>
                            </div>

                            {resetStep === "email" && (
                                <form onSubmit={handleSendOTP}>
                                    <div className="auth-input-group">
                                        <input
                                            type="email"
                                            placeholder="Enter your email address"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            required
                                            className="auth-input"
                                        />
                                    </div>
                                    <button type="submit" className="auth-btn-primary" disabled={otpLoading}>
                                        {otpLoading ? "Sending..." : "Send OTP"}
                                    </button>
                                </form>
                            )}

                            {resetStep === "otp" && renderOTPStep()}
                            {resetStep === "reset" && renderResetStep()}

                            <div className="auth-footer-buttons">
                                <button className="auth-secondary-btn" onClick={handleBackToLogin}>
                                    ← Back to Login
                                </button>
                                <button className="auth-secondary-btn" onClick={handleBackToHome}>
                                    ← Back to Home
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Login;