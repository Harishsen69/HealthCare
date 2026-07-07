import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./AdminProfile.css";

function AdminProfile({ user, setUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [fullName, setFullName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const [state, setState] = useState(user?.state || "");
    const [dob, setDob] = useState(user?.dob || "");
    const [bloodGroup, setBloodGroup] = useState(user?.blood_group || "");

    // 🔥 Force update function - localStorage se direct read
    const syncFromLocalStorage = () => {
        const savedUser = localStorage.getItem("medicareUser");
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setFullName(userData.name || "");
                setPhone(userData.phone || "");
                setAddress(userData.address || "");
                setState(userData.state || "");
                setDob(userData.dob || "");
                setBloodGroup(userData.blood_group || "");
                
                // 🔥 Update parent user state bhi karo
                if (setUser) {
                    setUser(userData);
                }
                
                console.log("✅ Profile synced from localStorage:", userData.name);
            } catch (e) {
                console.error("Error syncing profile:", e);
            }
        }
    };

    // 🔥 Initial load + storage event listener
    useEffect(() => {
        // Initial sync
        syncFromLocalStorage();
        
        // 🔥 Listen for storage events (other tabs)
        const handleStorageChange = (e) => {
            if (e.key === 'medicareUser') {
                console.log("🔄 Storage event detected, syncing profile...");
                syncFromLocalStorage();
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        // 🔥 Custom event for same-tab updates
        const handleCustomEvent = () => {
            console.log("🔄 Custom event detected, syncing profile...");
            syncFromLocalStorage();
        };
        
        window.addEventListener('profileUpdated', handleCustomEvent);
        
        // 🔥 Polling for cross-device updates (every 3 seconds)
        let lastCheckedName = fullName;
        const interval = setInterval(() => {
            const savedUser = localStorage.getItem("medicareUser");
            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser);
                    if (userData.name !== lastCheckedName) {
                        console.log("🔄 Polling detected name change:", userData.name);
                        syncFromLocalStorage();
                        lastCheckedName = userData.name;
                    }
                } catch (e) {}
            }
        }, 3000);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('profileUpdated', handleCustomEvent);
            clearInterval(interval);
        };
    }, []);

    // 🔥 Update when user prop changes
    useEffect(() => {
        if (user) {
            setFullName(user.name || "");
            setPhone(user.phone || "");
            setAddress(user.address || "");
            setState(user.state || "");
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
            
            await API.put('profile/update/', {
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                address: address,
                state: state,
                dob: dob,
                blood_group: bloodGroup,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const updatedUser = {
                ...user,
                name: fullName,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                address: address,
                state: state,
                dob: dob,
                blood_group: bloodGroup,
            };
            
            setUser(updatedUser);
            localStorage.setItem("medicareUser", JSON.stringify(updatedUser));
            
            // 🔥 Force update - multiple ways
            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('profileUpdated'));
            
            // 🔥 Force re-render for same tab
            syncFromLocalStorage();
            
            setIsEditing(false);
            alert("Profile updated successfully!");
            console.log("✅ Profile saved and synced:", fullName);
            
        } catch (error) {
            console.error("Save error:", error);
            alert(error.response?.data?.error || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        const name = fullName || user?.name || "Admin";
        if (!name || name === "Admin") return "A";
        return name.charAt(0).toUpperCase();
    };

    const displayName = fullName || user?.name || "Admin";

    return (
        <div className="admin-profile-container">
            <div className="admin-profile-header">
                <div className="admin-profile-avatar">
                    <div className="admin-profile-avatar-initial">{getInitials()}</div>
                    <div className="admin-profile-info">
                        <h2>{displayName}</h2>
                        <span className="admin-profile-badge">🛡️ Administrator</span>
                    </div>
                </div>
                {!isEditing && (
                    <button className="admin-profile-edit-btn" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            <div className="admin-profile-content">
                <div className="admin-profile-section">
                    <div className="admin-profile-section-title">
                        <span>👤</span>
                        <h3>Personal Information</h3>
                    </div>
                    <div className="admin-profile-grid">
                        <div className="admin-profile-info-card full-width">
                            <label>Full Name</label>
                            {isEditing ? (
                                <input 
                                    value={fullName} 
                                    onChange={(e) => setFullName(e.target.value)} 
                                    placeholder="Enter your full name"
                                />
                            ) : (
                                <p>{displayName}</p>
                            )}
                        </div>
                        
                        <div className="admin-profile-info-card">
                            <label>Email Address</label>
                            <p>{user?.email || "Not added"}</p>
                        </div>
                        
                        <div className="admin-profile-info-card">
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
                        
                        <div className="admin-profile-info-card">
                            <label>State</label>
                            {isEditing ? (
                                <input 
                                    value={state} 
                                    onChange={(e) => setState(e.target.value)} 
                                    placeholder="State"
                                />
                            ) : (
                                <p>{state || "Not added"}</p>
                            )}
                        </div>
                        
                        <div className="admin-profile-info-card">
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
                        
                        <div className="admin-profile-info-card">
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
                        
                        <div className="admin-profile-info-card full-width">
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
                    <div className="admin-profile-actions">
                        <button className="admin-profile-save-btn" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                        <button className="admin-profile-cancel-btn" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminProfile;