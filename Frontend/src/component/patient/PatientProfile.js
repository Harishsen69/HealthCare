import React, { useState, useEffect, useCallback } from "react";
import API from "../../services/api";
import "./PatientProfile.css";

function PatientProfile({ user, setUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        address: "",
        state: "",
        dob: "",
        blood_group: "",
        gender: "",
        father_name: "",
        mother_name: "",
});

    const fetchLatestProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            
            const response = await API.get('patient-profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setFormData(prev => ({
                ...prev,
                phone: response.data.phone || "",
                address: response.data.address || "",
                state: response.data.state || "",
                dob: response.data.dob || "",
                blood_group: response.data.blood_group || "",
                gender: response.data.gender || "",
                father_name: response.data.father_name || "",
                mother_name: response.data.mother_name || "",
            }));
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    }, []);

    useEffect(() => {
        fetchLatestProfile();
    }, [fetchLatestProfile]);

    useEffect(() => {
        if (user) {
            const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
            setFormData(prev => ({
                ...prev,
                full_name: fullName,
                phone: user.phone || "",
                address: user.address || "",
                state: user.state || "",
                dob: user.dob || "",
                blood_group: user.blood_group || "",
                gender: user.gender || "",
                father_name: user.father_name || "",
                mother_name: user.mother_name || "",
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login again");
                return;
            }
            
            const payload = {
                full_name: formData.full_name,
                phone: formData.phone,
                address: formData.address,
                state: formData.state,
                dob: formData.dob,
                blood_group: formData.blood_group,
                gender: formData.gender,
                father_name: formData.father_name,
                mother_name: formData.mother_name,
            };
            
            console.log("Sending payload:", payload);
            
            const response = await API.put('profile/update/', payload, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                const updatedUser = { 
                    ...user, 
                    ...response.data.user,
                    name: formData.full_name,
                };
                setUser(updatedUser);
                localStorage.setItem("medicareUser", JSON.stringify(updatedUser));
                setIsEditing(false);
                alert("Profile updated successfully!");
                await fetchLatestProfile();
            }
        } catch (error) {
            console.error("Save error:", error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || "Failed to update profile";
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        const name = formData.full_name || user?.name || "";
        if (!name) return "U";
        return name.charAt(0).toUpperCase();
    };

    const calculateAge = () => {
        if (!formData.dob) return null;
        const birthDate = new Date(formData.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = calculateAge();
    const displayName = formData.full_name || user?.name || "Patient";

    return (
        <div className="patient-profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    <div className="avatar-initial">{getInitials()}</div>
                    <div>
                        <h2>{displayName}</h2>
                        <p className="profile-badge">Patient</p>
                    </div>
                </div>
                {!isEditing && (
                    <button className="edit-btn" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-content">
                <div className="info-section">
                    <div className="section-header">
                        <span>👤</span>
                        <h3>Personal Information</h3>
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Full Name</label>
                            {isEditing ? (
                                <input name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name" />
                            ) : (
                                <p>{displayName}</p>
                            )}
                        </div>
                        
                        <div className="info-item">
                            <label>Gender</label>
                            {isEditing ? (
                                <select name="gender" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            ) : (
                                <p>{formData.gender === "male" ? "Male" : formData.gender === "female" ? "Female" : formData.gender === "other" ? "Other" : "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="info-item">
                            <label>Father's Name</label>
                            {isEditing ? (
                                <input name="father_name" value={formData.father_name} onChange={handleChange} placeholder="Father's Name" />
                            ) : (
                                <p>{formData.father_name || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="info-item">
                            <label>Mother's Name</label>
                            {isEditing ? (
                                <input name="mother_name" value={formData.mother_name} onChange={handleChange} placeholder="Mother's Name" />
                            ) : (
                                <p>{formData.mother_name || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="info-item">
                            <label>Date of Birth</label>
                            {isEditing ? (
                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                            ) : (
                                <p>{formData.dob || "Not added"} {age && <span className="age-badge">({age} years)</span>}</p>
                            )}
                        </div>
                        
                        <div className="info-item">
                            <label>Blood Group</label>
                            {isEditing ? (
                                <select name="blood_group" value={formData.blood_group} onChange={handleChange}>
                                    <option value="">Select</option>
                                    <option value="A+">A+</option><option value="A-">A-</option>
                                    <option value="B+">B+</option><option value="B-">B-</option>
                                    <option value="O+">O+</option><option value="O-">O-</option>
                                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                </select>
                            ) : (
                                <p>{formData.blood_group || "Not added"}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="info-section">
                    <div className="section-header">
                        <span>📞</span>
                        <h3>Contact Information</h3>
                    </div>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Email Address</label>
                            <p>{user?.email || "Not added"}</p>
                        </div>
                        
                        <div className="info-item">
                            <label>Phone Number</label>
                            {isEditing ? (
                                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" maxLength="10" />
                            ) : (
                                <p>{formData.phone || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="info-item">
                            <label>Address</label>
                            {isEditing ? (
                                <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" rows="2" />
                            ) : (
                                <p>{formData.address || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="info-item">
                            <label>State</label>
                            {isEditing ? (
                                <input name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                            ) : (
                                <p>{formData.state || "Not added"}</p>
                            )}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="edit-actions">
                        <button className="save-btn" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientProfile;