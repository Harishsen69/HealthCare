import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./DoctorProfile.css";

function DoctorProfile({ user, setUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    
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
            
            if (response.data.avatar) {
                setAvatarPreview(response.data.avatar);
            }
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

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
            setAvatarFile(file);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!window.confirm("Are you sure you want to delete your profile picture?")) return;
        
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.delete('delete-avatar/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.status === 200) {
                setAvatarPreview(null);
                const updatedUser = { ...user, avatar: null };
                setUser(updatedUser);
                localStorage.setItem("medicareUser", JSON.stringify(updatedUser));
                alert("Profile picture deleted successfully!");
            }
        } catch (error) {
            console.error("Delete avatar error:", error);
            alert("Failed to delete profile picture");
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            
            const nameParts = fullName.trim().split(' ');
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(' ') || "";
            
            const formDataToSend = new FormData();
            formDataToSend.append('first_name', firstName);
            formDataToSend.append('last_name', lastName);
            formDataToSend.append('phone', phone);
            formDataToSend.append('address', address);
            formDataToSend.append('dob', dob);
            formDataToSend.append('blood_group', bloodGroup);
            
            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile);
            }
            
            const response = await API.put('profile/update/', formDataToSend, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
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
                    avatar: response.data.user?.avatar || user?.avatar,
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

    return (
        <div className="profile-doctor-container">
            <div className="profile-doctor-header">
                <div className="profile-doctor-avatar">
                    <div className="profile-doctor-avatar-initial">{getInitials()}</div>
                    <div className="profile-doctor-info">
                        <h2>Dr. {user?.name || fullName || "Doctor"}</h2>
                        <span className="profile-doctor-badge">Medical Professional</span>
                    </div>
                </div>
                {!isEditing && (
                    <button className="profile-doctor-edit-btn" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-doctor-content">
                <div className="profile-doctor-section">
                    <div className="profile-doctor-section-title">
                        <span>👤</span>
                        <h3>Personal Information</h3>
                    </div>
                    <div className="profile-doctor-grid">
                        <div className="profile-doctor-info-card full-width">
                            <label>Full Name</label>
                            {isEditing ? (
                                <input 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)} 
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <p>Dr. {user?.name || fullName || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="profile-doctor-info-card">
                            <label>Email Address</label>
                            <p>{user?.email || "Not added"}</p>
                        </div>
                        
                        <div className="profile-doctor-info-card">
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
                        
                        <div className="profile-doctor-info-card">
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
                        
                        <div className="profile-doctor-info-card">
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
                        
                        <div className="profile-doctor-info-card full-width">
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
                    <div className="profile-doctor-actions">
                        <button className="profile-doctor-save-btn" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button className="profile-doctor-cancel-btn" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DoctorProfile;