import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./DoctorProfile.css";

function DoctorProfile({ user, setUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [fullName, setFullName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const [dob, setDob] = useState(user?.dob || "");
    const [bloodGroup, setBloodGroup] = useState(user?.blood_group || "");

    const fetchLatestProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('patient-profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setPhone(response.data.phone || "");
            setAddress(response.data.address || "");
            setDob(response.data.dob || "");
            setBloodGroup(response.data.blood_group || "");
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    useEffect(() => {
        fetchLatestProfile();
    }, []);

    useEffect(() => {
        if (user) {
            setFullName(user.name || "");
            setPhone(user.phone || "");
            setAddress(user.address || "");
            setDob(user.dob || "");
            setBloodGroup(user.blood_group || "");
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(' ') || "";
            
            const payload = {
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                address: address,
                dob: dob,
                blood_group: bloodGroup,
            };
            
            const response = await API.put('profile/update/', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                const updatedUser = {
                    ...user,
                    name: fullName,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    address: address,
                    dob: dob,
                    blood_group: bloodGroup,
                };
                
                setUser(updatedUser);
                localStorage.setItem("medicareUser", JSON.stringify(updatedUser));
                setIsEditing(false);
                alert("Profile updated successfully!");
                fetchLatestProfile();
            }
        } catch (error) {
            console.error("Save error:", error);
            alert(error.response?.data?.error || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        const name = user?.name || fullName || "Doctor";
        if (!name || name === "Doctor") return "D";
        return name.charAt(0).toUpperCase();
    };

    const displayName = fullName || user?.name || "Doctor";

    return (
        <div className="doctor-profile-container">
            <div className="doctor-profile-header">
                <div className="doctor-profile-avatar">
                    <div className="doctor-profile-avatar-initial">{getInitials()}</div>
                    <div className="doctor-profile-info">
                        <h2>Dr. {displayName}</h2>
                        <span className="doctor-profile-badge">Medical Professional</span>
                    </div>
                </div>
                {!isEditing && (
                    <button className="doctor-profile-edit-btn" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            <div className="doctor-profile-content">
                <div className="doctor-profile-section">
                    <div className="doctor-profile-section-title">
                        <span>👤</span>
                        <h3>Personal Information</h3>
                    </div>
                    <div className="doctor-profile-grid">
                        <div className="doctor-profile-info-card full-width">
                            <label>Full Name</label>
                            {isEditing ? (
                                <input 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)} 
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <p>Dr. {displayName}</p>
                            )}
                        </div>
                        
                        <div className="doctor-profile-info-card">
                            <label>Email Address</label>
                            <p>{user?.email || "Not added"}</p>
                        </div>
                        
                        <div className="doctor-profile-info-card">
                            <label>Phone Number</label>
                            {isEditing ? (
                                <input 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    placeholder="Phone Number" 
                                    maxLength="10"
                                />
                            ) : (
                                <p>{phone || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="doctor-profile-info-card">
                            <label>Date of Birth</label>
                            {isEditing ? (
                                <input 
                                    type="date" 
                                    value={dob} 
                                    onChange={(e) => setDob(e.target.value)} 
                                />
                            ) : (
                                <p>{dob || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="doctor-profile-info-card">
                            <label>Blood Group</label>
                            {isEditing ? (
                                <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="A+">A+</option><option value="A-">A-</option>
                                    <option value="B+">B+</option><option value="B-">B-</option>
                                    <option value="O+">O+</option><option value="O-">O-</option>
                                    <option value="AB+">AB+</option><option value="AB-">AB-</option>
                                </select>
                            ) : (
                                <p>{bloodGroup || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="doctor-profile-info-card full-width">
                            <label>Address</label>
                            {isEditing ? (
                                <textarea 
                                    value={address} 
                                    onChange={(e) => setAddress(e.target.value)} 
                                    placeholder="Full Address" 
                                    rows="2"
                                />
                            ) : (
                                <p>{address || "Not added"}</p>
                            )}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="doctor-profile-actions">
                        <button className="doctor-profile-save-btn" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button className="doctor-profile-cancel-btn" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DoctorProfile;