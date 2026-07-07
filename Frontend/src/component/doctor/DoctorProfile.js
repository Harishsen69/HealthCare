import React, { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import "./DoctorProfile.css";

function DoctorProfile({ user, setUser }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [forceUpdate, setForceUpdate] = useState(0);

    // 🔥 DIRECT FROM localStorage
    const getLocalUser = () => {
        const saved = localStorage.getItem("medicareUser");
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const localUser = getLocalUser();

    const [fullName, setFullName] = useState(localUser?.name || user?.name || "");
    const [phone, setPhone] = useState(localUser?.phone || user?.phone || "");
    const [address, setAddress] = useState(localUser?.address || user?.address || "");
    const [dob, setDob] = useState(localUser?.dob || user?.dob || "");
    const [bloodGroup, setBloodGroup] = useState(localUser?.blood_group || user?.blood_group || "");

    // Profile Image
    const [profileImage, setProfileImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Crop States
    const [showCropModal, setShowCropModal] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);
    const [cropData, setCropData] = useState({ x: 0, y: 0, width: 200, height: 200 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const cropContainerRef = useRef(null);
    const imageRef = useRef(null);
    const touchIdRef = useRef(null);

    // Doctor Profile Fields
    const [specialization, setSpecialization] = useState("");
    const [experience, setExperience] = useState("");
    const [fee, setFee] = useState("");
    const [clinicName, setClinicName] = useState("");
    const [clinicAddress, setClinicAddress] = useState("");
    const [clinicCity, setClinicCity] = useState("");
    const [clinicState, setClinicState] = useState("");
    const [clinicPincode, setClinicPincode] = useState("");
    const [clinicTimings, setClinicTimings] = useState("");
    const [clinicLandmark, setClinicLandmark] = useState("");
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [isDoctor, setIsDoctor] = useState(true);

    // ========================================
    // 🔥 API SE FORCE FETCH - Cross-device sync
    // ========================================
    const fetchFromAPI = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            console.log("🔄 Fetching latest profile from API...");

            const doctorsRes = await API.get('doctors/');
            const doctors = doctorsRes.data || [];
            const currentDoctor = doctors.find(d => d.email === user?.email);

            const profileRes = await API.get('patient-profile/', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const saved = localStorage.getItem("medicareUser");
            let localData = null;
            if (saved) {
                try {
                    localData = JSON.parse(saved);
                } catch (e) { }
            }

            const latestName = currentDoctor?.name || localData?.name || user?.name || "";
            const latestPhone = profileRes.data?.phone || localData?.phone || user?.phone || "";
            const latestAddress = profileRes.data?.address || localData?.address || user?.address || "";
            const latestDob = profileRes.data?.dob || localData?.dob || user?.dob || "";
            const latestBloodGroup = profileRes.data?.blood_group || localData?.blood_group || user?.blood_group || "";

            setFullName(latestName);
            setPhone(latestPhone);
            setAddress(latestAddress);
            setDob(latestDob);
            setBloodGroup(latestBloodGroup);

            const updatedUser = {
                ...localData,
                ...user,
                name: latestName,
                phone: latestPhone,
                address: latestAddress,
                dob: latestDob,
                blood_group: latestBloodGroup,
            };
            localStorage.setItem("medicareUser", JSON.stringify(updatedUser));

            if (setUser) {
                setUser(updatedUser);
            }

            if (currentDoctor) {
                setDoctorProfile(currentDoctor);
                setSpecialization(currentDoctor.specialization || "");
                setExperience(currentDoctor.experience || "");
                setFee(currentDoctor.fee || "");
                setClinicName(currentDoctor.clinic_name || "");
                setClinicAddress(currentDoctor.address || "");
                setClinicCity(currentDoctor.city || "");
                setClinicState(currentDoctor.state || "");
                setClinicPincode(currentDoctor.pincode || "");
                setClinicTimings(currentDoctor.clinic_timings || "");
                setClinicLandmark(currentDoctor.landmark || "");
                setIsDoctor(true);

                // 🔥🔥🔥 FIX: Image URL
                if (currentDoctor.image) {
                    let imageUrl = currentDoctor.image;
                    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
                        imageUrl = `http://127.0.0.1:8000${imageUrl}`;
                    }
                    console.log("🖼️ Setting image URL:", imageUrl);
                    setProfileImage(imageUrl);
                    setImagePreview(imageUrl);
                } else {
                    setProfileImage(null);
                }
            }

            setForceUpdate(prev => prev + 1);

        } catch (error) {
            console.error("Error fetching from API:", error);
        }
    };

    // ========================================
    // 🔥 HOOKS
    // ========================================

    useEffect(() => {
        fetchFromAPI();
    }, []);

    useEffect(() => {
        const handleStorage = (e) => {
            if (e.key === 'medicareUser') {
                console.log("🔄 Storage event, fetching from API...");
                fetchFromAPI();
            }
        };

        const handleCustom = () => {
            console.log("🔄 Custom event, fetching from API...");
            fetchFromAPI();
        };

        let lastCheckedName = fullName;
        const interval = setInterval(() => {
            const saved = localStorage.getItem("medicareUser");
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.name !== lastCheckedName) {
                        console.log("🔄 Polling detected change, fetching from API...");
                        fetchFromAPI();
                        lastCheckedName = data.name;
                    }
                } catch (e) { }
            }
        }, 2000);

        window.addEventListener('storage', handleStorage);
        window.addEventListener('profileUpdated', handleCustom);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('profileUpdated', handleCustom);
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (user?.name) {
            setFullName(user.name);
        }
    }, [user]);

    // ========================================
    // IMAGE HANDLING
    // ========================================
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result);
                setCropData({ x: 50, y: 50, width: 200, height: 200 });
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        const rect = cropContainerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const target = e.target;
        if (target.classList.contains('doctor-crop-drag-handle') || target.closest('.doctor-crop-drag-handle')) {
            setIsResizing(true);
            return;
        }

        setIsDragging(true);
        setDragStart({
            x: e.clientX - rect.left - cropData.x,
            y: e.clientY - rect.top - cropData.y
        });
    };

    const handleMouseMove = (e) => {
        e.preventDefault();
        const rect = cropContainerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const containerWidth = rect.width;
        const containerHeight = rect.height;

        if (isDragging) {
            let newX = e.clientX - rect.left - dragStart.x;
            let newY = e.clientY - rect.top - dragStart.y;
            newX = Math.max(0, Math.min(newX, containerWidth - cropData.width));
            newY = Math.max(0, Math.min(newY, containerHeight - cropData.height));
            setCropData(prev => ({ ...prev, x: newX, y: newY }));
        }

        if (isResizing) {
            let newWidth = e.clientX - rect.left - cropData.x;
            let newHeight = e.clientY - rect.top - cropData.y;
            const size = Math.min(newWidth, newHeight);
            const maxW = containerWidth - cropData.x;
            const maxH = containerHeight - cropData.y;
            newWidth = Math.max(50, Math.min(size, maxW));
            newHeight = Math.max(50, Math.min(size, maxH));
            setCropData(prev => ({ ...prev, width: newWidth, height: newHeight }));
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    const handleTouchStart = (e) => {
        const touch = e.touches[0];
        if (!touch) return;

        const rect = cropContainerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const target = e.target;
        if (target.classList.contains('doctor-crop-drag-handle') || target.closest('.doctor-crop-drag-handle')) {
            setIsResizing(true);
            touchIdRef.current = touch.identifier;
            return;
        }

        setIsDragging(true);
        touchIdRef.current = touch.identifier;
        setDragStart({
            x: touch.clientX - rect.left - cropData.x,
            y: touch.clientY - rect.top - cropData.y
        });
    };

    const handleTouchMove = (e) => {
        e.preventDefault();

        let touch = null;
        for (let t of e.touches) {
            if (t.identifier === touchIdRef.current || touchIdRef.current === null) {
                touch = t;
                break;
            }
        }

        if (!touch) {
            touch = e.touches[0];
        }

        const rect = cropContainerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const containerWidth = rect.width;
        const containerHeight = rect.height;

        if (isDragging) {
            let newX = touch.clientX - rect.left - dragStart.x;
            let newY = touch.clientY - rect.top - dragStart.y;
            newX = Math.max(0, Math.min(newX, containerWidth - cropData.width));
            newY = Math.max(0, Math.min(newY, containerHeight - cropData.height));
            setCropData(prev => ({ ...prev, x: newX, y: newY }));
        }

        if (isResizing) {
            let newWidth = touch.clientX - rect.left - cropData.x;
            let newHeight = touch.clientY - rect.top - cropData.y;
            const size = Math.min(newWidth, newHeight);
            const maxW = containerWidth - cropData.x;
            const maxH = containerHeight - cropData.y;
            newWidth = Math.max(50, Math.min(size, maxW));
            newHeight = Math.max(50, Math.min(size, maxH));
            setCropData(prev => ({ ...prev, width: newWidth, height: newHeight }));
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setIsResizing(false);
        touchIdRef.current = null;
    };

    // 🔥 FINAL FIXED - High quality crop with proper scaling
    const handleCropConfirm = () => {
        if (!imageToCrop || !cropContainerRef.current) return;

        const image = imageRef.current;
        if (!image) return;

        const imageRect = image.getBoundingClientRect();

        const scaleX = image.naturalWidth / imageRect.width;
        const scaleY = image.naturalHeight / imageRect.height;

        const cropX = cropData.x * scaleX;
        const cropY = cropData.y * scaleY;
        const cropWidth = cropData.width * scaleX;
        const cropHeight = cropData.height * scaleY;

        // Square crop size
        const cropSize = Math.min(cropWidth, cropHeight);

        // High quality canvas
        const canvas = document.createElement('canvas');
        canvas.width = cropSize;
        canvas.height = cropSize;

        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropSize,
            cropSize,
            0,
            0,
            cropSize,
            cropSize
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) return;

                const file = new File(
                    [blob],
                    "profile.jpg",
                    { type: "image/jpeg" }
                );

                const previewUrl = URL.createObjectURL(blob);

                setImageFile(file);
                setImagePreview(previewUrl);
                setProfileImage(previewUrl);

                setShowCropModal(false);
                setImageToCrop(null);
            },
            "image/jpeg",
            1
        );
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        setImageToCrop(null);
        setCropData({ x: 0, y: 0, width: 200, height: 200 });
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setProfileImage(null);
        document.getElementById('profileImageInput').value = '';
    };

    // ========================================
    // SAVE PROFILE
    // ========================================
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

            await API.put('profile/update/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (doctorProfile) {
                const formData = new FormData();
                formData.append('name', fullName);
                formData.append('phone', phone);
                formData.append('specialization', specialization);
                formData.append('experience', experience);
                formData.append('fee', fee);
                formData.append('clinic_name', clinicName);
                formData.append('address', clinicAddress);
                formData.append('city', clinicCity);
                formData.append('state', clinicState);
                formData.append('pincode', clinicPincode);
                formData.append('clinic_timings', clinicTimings);
                formData.append('landmark', clinicLandmark);

                if (imageFile) {
                    formData.append('image', imageFile);
                }

                await API.patch(`doctors/${doctorProfile.id}/update/`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            const updatedUser = {
                ...user,
                name: fullName,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                address: address,
                dob: dob,
                blood_group: bloodGroup,
                image: imagePreview || profileImage,
            };

            localStorage.setItem("medicareUser", JSON.stringify(updatedUser));

            if (setUser) {
                setUser(updatedUser);
            }

            setFullName(fullName);

            setIsEditing(false);
            alert("Profile updated successfully!");

            await fetchFromAPI();

            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('profileUpdated'));

            console.log("✅ Profile saved:", fullName);

        } catch (error) {
            console.error("Save error:", error);
            alert(error.response?.data?.error || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        const name = fullName || user?.name || "Doctor";
        if (!name || name === "Doctor") return "D";
        return name.charAt(0).toUpperCase();
    };

    const displayName = fullName || user?.name || "Doctor";

    return (
        <div className="doctor-profile-container">
            {/* CROP MODAL */}
            {showCropModal && imageToCrop && (
                <div className="doctor-crop-modal-overlay" onClick={handleCropCancel}>
                    <div className="doctor-crop-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="doctor-crop-modal-header">
                            <h3>✂️ Crop Image</h3>
                            <button className="doctor-crop-close" onClick={handleCropCancel}>✕</button>
                        </div>
                        <div className="doctor-crop-modal-body">
                            <div
                                className="doctor-crop-container"
                                ref={cropContainerRef}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <img
                                    ref={imageRef}
                                    src={imageToCrop}
                                    alt="Crop"
                                    className="doctor-crop-image"
                                    draggable="false"
                                />
                                <div
                                    className="doctor-crop-box"
                                    style={{
                                        left: cropData.x,
                                        top: cropData.y,
                                        width: cropData.width,
                                        height: cropData.height
                                    }}
                                    onMouseDown={handleMouseDown}
                                    onTouchStart={handleTouchStart}
                                >
                                    <div className="doctor-crop-box-border"></div>
                                    <div className="doctor-crop-grid">
                                        <span></span><span></span><span></span>
                                        <span></span><span></span><span></span>
                                        <span></span><span></span><span></span>
                                    </div>
                                    <div
                                        className="doctor-crop-drag-handle"
                                        onMouseDown={(e) => { e.stopPropagation(); setIsResizing(true); }}
                                        onTouchStart={(e) => { e.stopPropagation(); setIsResizing(true); }}
                                    ></div>
                                </div>
                            </div>
                            <div className="doctor-crop-controls">
                                <div className="doctor-crop-tip">
                                    <span>🖱️</span>
                                    <p>Drag box to move • Drag corner to resize</p>
                                </div>
                                <div className="doctor-crop-buttons">
                                    <button className="doctor-crop-cancel" onClick={handleCropCancel}>Cancel</button>
                                    <button className="doctor-crop-confirm" onClick={handleCropConfirm}>✅ Apply Crop</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="doctor-profile-header">
                <div className="doctor-profile-avatar">
                    <div className="doctor-profile-avatar-wrapper">
                        {imagePreview ? (
                            <img
                                src={imagePreview}
                                alt="Profile"
                                className="doctor-profile-avatar-img"
                                onError={(e) => {
                                    console.log("Image load error, using placeholder");
                                    e.target.style.display = 'none';
                                }}
                            />
                        ) : (
                            <div className="doctor-profile-avatar-initial">{getInitials()}</div>
                        )}
                        {isEditing && (
                            <div className="doctor-profile-avatar-upload">
                                <label className="doctor-profile-upload-label" title="Upload Image">
                                    📷
                                    <input
                                        type="file"
                                        id="profileImageInput"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                {imagePreview && (
                                    <button className="doctor-profile-remove-img" onClick={removeImage} title="Remove Image">✕</button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="doctor-profile-info">
                        <h2>Dr. {displayName}</h2>
                        <span className="doctor-profile-badge">👨‍⚕️ Medical Professional</span>
                    </div>
                </div>
                {!isEditing && (
                    <button className="doctor-profile-edit-btn" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile
                    </button>
                )}
            </div>

            <div className="doctor-profile-content">
                {/* Personal Information */}
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

                {/* Doctor Professional Information */}
                <div className="doctor-profile-section">
                    <div className="doctor-profile-section-title">
                        <span>🩺</span>
                        <h3>Professional Information</h3>
                    </div>
                    <div className="doctor-profile-grid">
                        <div className="doctor-profile-info-card full-width">
                            <label>Specialization</label>
                            {isEditing ? (
                                <input
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    placeholder="e.g., Cardiologist"
                                />
                            ) : (
                                <p>{specialization || "Not added"}</p>
                            )}
                        </div>

                        <div className="doctor-profile-info-card">
                            <label>Experience (Years)</label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    placeholder="e.g., 10+ years"
                                />
                            ) : (
                                <p>{experience || "Not added"}</p>
                            )}
                        </div>

                        <div className="doctor-profile-info-card">
                            <label>Consultation Fee (₹)</label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                    placeholder="Fee"
                                />
                            ) : (
                                <p>₹{fee || "Not added"}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Clinic/Hospital Information */}
                <div className="doctor-profile-section">
                    <div className="doctor-profile-section-title">
                        <span>🏥</span>
                        <h3>Clinic / Hospital Information</h3>
                    </div>
                    <div className="doctor-profile-grid">
                        <div className="doctor-profile-info-card full-width">
                            <label>Clinic/Hospital Name</label>
                            {isEditing ? (
                                <input
                                    value={clinicName}
                                    onChange={(e) => setClinicName(e.target.value)}
                                    placeholder="Clinic or Hospital Name"
                                />
                            ) : (
                                <p>{clinicName || "Not added"}</p>
                            )}
                        </div>

                        <div className="doctor-profile-info-card full-width">
                            <label>Clinic Address</label>
                            {isEditing ? (
                                <textarea
                                    value={clinicAddress}
                                    onChange={(e) => setClinicAddress(e.target.value)}
                                    placeholder="Clinic Address"
                                    rows="2"
                                />
                            ) : (
                                <p>{clinicAddress || "Not added"}</p>
                            )}
                        </div>

                        <div className="doctor-profile-info-card">
                            <label>City</label>
                            {isEditing ? (
                                <input
                                    value={clinicCity}
                                    onChange={(e) => setClinicCity(e.target.value)}
                                    placeholder="City"
                                />
                            ) : (
                                <p>{clinicCity || "Not added"}</p>
                            )}
                        </div>

                        <div className="doctor-profile-info-card">
                            <label>State</label>
                            {isEditing ? (
                                <input
                                    value={clinicState}
                                    onChange={(e) => setClinicState(e.target.value)}
                                    placeholder="State"
                                />
                            ) : (
                                <p>{clinicState || "Not added"}</p>
                            )}
                        </div>

                        <div className="doctor-profile-info-card">
                            <label>Pincode</label>
                            {isEditing ? (
                                <input
                                    value={clinicPincode}
                                    onChange={(e) => setClinicPincode(e.target.value)}
                                    placeholder="Pincode"
                                    maxLength="6"
                                />
                            ) : (
                                <p>{clinicPincode || "Not added"}</p>
                            )}
                        </div>

                        <div className="doctor-profile-info-card">
                            <label>Landmark</label>
                            {isEditing ? (
                                <input
                                    value={clinicLandmark}
                                    onChange={(e) => setClinicLandmark(e.target.value)}
                                    placeholder="Nearby Landmark"
                                />
                            ) : (
                                <p>{clinicLandmark || "Not added"}</p>
                            )}
                        </div>

                        <div className="doctor-profile-info-card full-width">
                            <label>Clinic Timings</label>
                            {isEditing ? (
                                <input
                                    value={clinicTimings}
                                    onChange={(e) => setClinicTimings(e.target.value)}
                                    placeholder="e.g., Mon-Sat 9:00 AM - 6:00 PM"
                                />
                            ) : (
                                <p>{clinicTimings || "Not added"}</p>
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