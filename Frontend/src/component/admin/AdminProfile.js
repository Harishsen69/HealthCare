import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./AdminProfile.css";

function AdminProfile({ user, setUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    
    const [formData, setFormData] = useState({
        full_name: user?.name || "",
        phone: user?.phone || "",
        address: user?.address || "",
        dob: user?.dob || "",
        blood_group: user?.blood_group || "",
    });

    // Fetch latest profile from backend
    const fetchLatestProfile = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('patient-profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setFormData(prev => ({
                ...prev,
                phone: response.data.phone || "",
                address: response.data.address || "",
                dob: response.data.dob || "",
                blood_group: response.data.blood_group || "",
            }));
            
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
            setFormData(prev => ({
                ...prev,
                full_name: user.name || "",
                phone: user.phone || "",
                address: user.address || "",
                dob: user.dob || "",
                blood_group: user.blood_group || "",
            }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

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
            
            // Split full name into first and last name
            const nameParts = formData.full_name.trim().split(' ');
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(' ') || "";
            
            const payload = {
                first_name: firstName,
                last_name: lastName,
                phone: formData.phone,
                address: formData.address,
                dob: formData.dob,
                blood_group: formData.blood_group,
            };
            
            const response = await API.put('profile/update/', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200) {
                // ✅ Update user object
                const updatedUser = {
                    ...user,
                    name: formData.full_name,
                    first_name: firstName,
                    last_name: lastName,
                    phone: formData.phone,
                    address: formData.address,
                    dob: formData.dob,
                    blood_group: formData.blood_group,
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
        const name = user?.name || formData.full_name || "Admin";
        if (!name || name === "Admin") return "A";
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="profile-admin-container">
            <div className="profile-admin-header">
                <div className="profile-admin-avatar">
                    <div className="profile-admin-avatar-initial">{getInitials()}</div>
                    <div className="profile-admin-info">
                        <h2>{user?.name || formData.full_name || "Admin"}</h2>
                        <span className="profile-admin-badge">Administrator</span>
                    </div>
                </div>
                {!isEditing && (
                    <button className="profile-admin-edit-btn" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-admin-content">
                <div className="profile-admin-section">
                    <div className="profile-admin-section-title">
                        <span>👤</span>
                        <h3>Personal Information</h3>
                    </div>
                    <div className="profile-admin-grid">
                        <div className="profile-admin-info-card">
                            <label>Full Name</label>
                            {isEditing ? (
                                <input 
                                    name="full_name" 
                                    value={formData.full_name} 
                                    onChange={handleChange} 
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <p>{user?.name || formData.full_name || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="profile-admin-info-card">
                            <label>Email Address</label>
                            <p>{user?.email || "Not added"}</p>
                        </div>
                        
                        <div className="profile-admin-info-card">
                            <label>Phone Number</label>
                            {isEditing ? (
                                <input 
                                    name="phone" 
                                    value={formData.phone} 
                                    onChange={handleChange} 
                                    placeholder="Phone Number" 
                                    maxLength="10"
                                />
                            ) : (
                                <p>{formData.phone || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="profile-admin-info-card">
                            <label>Date of Birth</label>
                            {isEditing ? (
                                <input 
                                    type="date" 
                                    name="dob" 
                                    value={formData.dob} 
                                    onChange={handleChange} 
                                />
                            ) : (
                                <p>{formData.dob || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="profile-admin-info-card">
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
                        
                        <div className="profile-admin-info-card full-width">
                            <label>Address</label>
                            {isEditing ? (
                                <textarea 
                                    name="address" 
                                    value={formData.address} 
                                    onChange={handleChange} 
                                    placeholder="Full Address" 
                                    rows="2"
                                />
                            ) : (
                                <p>{formData.address || "Not added"}</p>
                            )}
                        </div>
                    </div>
                </div>

                {isEditing && (
                    <div className="profile-admin-actions">
                        <button className="profile-admin-save-btn" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button className="profile-admin-cancel-btn" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminProfile;