import React, { useState } from "react";
import API from "../../services/api";
import Pagination from "../common/Pagination";
import "./AdminDoctors.css";

function AdminDoctors({ doctors, setDoctors, onDeleteDoctor, onUpdateDoctor }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    
    // 🔥 Edit Modal States
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [editImageFile, setEditImageFile] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [newDoctor, setNewDoctor] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        experience: '',
        fee: '',
        clinic_name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        clinic_timings: '',
        landmark: ''
    });

    // 🔥 Edit Doctor State
    const [editDoctor, setEditDoctor] = useState({
        name: '',
        phone: '',
        specialization: '',
        experience: '',
        fee: '',
        clinic_name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        clinic_timings: '',
        landmark: ''
    });

    const token = localStorage.getItem('access_token');

    // Calculate pagination
    const totalItems = doctors.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentDoctors = doctors.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle items per page change
    const handleItemsPerPageChange = (newItemsPerPage) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    // ========== HANDLE FORM INPUT CHANGE ==========
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            if (/^\d{0,10}$/.test(value)) {
                setNewDoctor({ ...newDoctor, [name]: value });
            }
        } else {
            setNewDoctor({ ...newDoctor, [name]: value });
        }
    };

    // ========== HANDLE EDIT INPUT CHANGE ==========
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            if (/^\d{0,10}$/.test(value)) {
                setEditDoctor({ ...editDoctor, [name]: value });
            }
        } else {
            setEditDoctor({ ...editDoctor, [name]: value });
        }
    };

    // ========== HANDLE IMAGE CHANGE ==========
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // ========== HANDLE EDIT IMAGE CHANGE ==========
    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // ========== REMOVE IMAGE ==========
    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
        document.getElementById('doctorImageInput').value = '';
    };

    // ========== REMOVE EDIT IMAGE ==========
    const removeEditImage = () => {
        setEditImagePreview(null);
        setEditImageFile(null);
        document.getElementById('editDoctorImageInput').value = '';
    };

    // ========== OPEN EDIT MODAL ==========
    const openEditModal = (doctor) => {
        setSelectedDoctor(doctor);
        setEditDoctor({
            name: doctor.name || '',
            phone: doctor.phone || '',
            specialization: doctor.specialization || '',
            experience: doctor.experience || '',
            fee: doctor.fee || '',
            clinic_name: doctor.clinic_name || '',
            address: doctor.address || '',
            city: doctor.city || '',
            state: doctor.state || '',
            pincode: doctor.pincode || '',
            clinic_timings: doctor.clinic_timings || '',
            landmark: doctor.landmark || ''
        });
        setEditImagePreview(doctor.image ? `http://127.0.0.1:8000${doctor.image}` : null);
        setEditImageFile(null);
        setShowEditModal(true);
    };

    // ========== CLOSE EDIT MODAL ==========
    const closeEditModal = () => {
        setShowEditModal(false);
        setSelectedDoctor(null);
        setEditImagePreview(null);
        setEditImageFile(null);
    };

    // ========== HANDLE EDIT DOCTOR SUBMIT ==========
    const handleEditDoctor = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('name', editDoctor.name);
            formData.append('phone', editDoctor.phone || '');
            formData.append('specialization', editDoctor.specialization || '');
            formData.append('experience', editDoctor.experience || '0');
            formData.append('fee', editDoctor.fee || 0);
            formData.append('clinic_name', editDoctor.clinic_name || '');
            formData.append('address', editDoctor.address || '');
            formData.append('city', editDoctor.city || '');
            formData.append('state', editDoctor.state || '');
            formData.append('pincode', editDoctor.pincode || '');
            formData.append('clinic_timings', editDoctor.clinic_timings || '');
            formData.append('landmark', editDoctor.landmark || '');
            
            if (editImageFile) {
                formData.append('image', editImageFile);
            }
            
            const response = await API.patch(`doctors/${selectedDoctor.id}/update/`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.status === 200) {
                alert('Doctor updated successfully!');
                closeEditModal();
                
                // Refresh doctors list
                const doctorsRes = await API.get('admin/doctors/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDoctors(doctorsRes.data);
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to update doctor');
        } finally {
            setEditLoading(false);
        }
    };

    // ========== HANDLE DELETE DOCTOR ==========
    const handleDelete = (doctorId) => {
        if (window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
            onDeleteDoctor(doctorId);
        }
    };

    // ========== ADD NEW DOCTOR ==========
    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const token = localStorage.getItem('access_token');
            
            const formData = new FormData();
            formData.append('name', newDoctor.name);
            formData.append('email', newDoctor.email);
            formData.append('password', newDoctor.password);
            formData.append('phone', newDoctor.phone || '');
            formData.append('specialization', newDoctor.specialization || '');
            formData.append('experience', newDoctor.experience || '0');
            formData.append('fee', newDoctor.fee || 0);
            formData.append('clinic_name', newDoctor.clinic_name || '');
            formData.append('address', newDoctor.address || '');
            formData.append('city', newDoctor.city || '');
            formData.append('state', newDoctor.state || '');
            formData.append('pincode', newDoctor.pincode || '');
            formData.append('clinic_timings', newDoctor.clinic_timings || '');
            formData.append('landmark', newDoctor.landmark || '');
            
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            const response = await API.post('admin/add-doctor/', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (response.status === 201) {
                alert('Doctor added successfully!');
                setShowAddForm(false);
                setNewDoctor({
                    name: '', email: '', password: '', phone: '',
                    specialization: '', experience: '', fee: '',
                    clinic_name: '', address: '', city: '', state: '',
                    pincode: '', clinic_timings: '', landmark: ''
                });
                setImagePreview(null);
                setImageFile(null);
                
                const doctorsRes = await API.get('admin/doctors/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDoctors(doctorsRes.data);
                setCurrentPage(1);
            }
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to add doctor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-doctors-container">
            <div className="admin-doctors-header">
                <h2>👨‍⚕️ Doctors List</h2>
                <button className="admin-add-doctor-btn" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : '+ Add Doctor'}
                </button>
            </div>

            {/* Add Doctor Form */}
            {showAddForm && (
                <div className="admin-add-doctor-form">
                    <h3>Add New Doctor</h3>
                    <form onSubmit={handleAddDoctor}>
                        <div className="admin-form-row">
                            <input type="text" name="name" placeholder="Full Name *" value={newDoctor.name} onChange={handleChange} required />
                            <input type="email" name="email" placeholder="Email *" value={newDoctor.email} onChange={handleChange} required />
                        </div>
                        
                        <div className="admin-form-row">
                            <input type="password" name="password" placeholder="Password *" value={newDoctor.password} onChange={handleChange} required />
                            <input type="text" name="phone" placeholder="Phone (max 10 digits)" value={newDoctor.phone} onChange={handleChange} maxLength="10" />
                        </div>
                        
                        <div className="admin-form-row">
                            <input type="text" name="specialization" placeholder="Specialization *" value={newDoctor.specialization} onChange={handleChange} required />
                            <input type="text" name="experience" placeholder="Experience (years)" value={newDoctor.experience} onChange={handleChange} />
                        </div>
                        
                        <div className="admin-form-row">
                            <input type="number" name="fee" placeholder="Consultation Fee *" value={newDoctor.fee} onChange={handleChange} required />
                        </div>
                        
                        <div className="admin-form-row">
                            <input type="text" name="clinic_name" placeholder="Clinic/Hospital Name" value={newDoctor.clinic_name} onChange={handleChange} />
                        </div>
                        
                        <div className="admin-form-row">
                            <input type="text" name="address" placeholder="Address" value={newDoctor.address} onChange={handleChange} />
                            <input type="text" name="landmark" placeholder="Landmark (optional)" value={newDoctor.landmark} onChange={handleChange} />
                        </div>
                        
                        <div className="admin-form-row">
                            <input type="text" name="city" placeholder="City" value={newDoctor.city} onChange={handleChange} />
                            <input type="text" name="state" placeholder="State" value={newDoctor.state} onChange={handleChange} />
                            <input type="text" name="pincode" placeholder="Pincode" value={newDoctor.pincode} onChange={handleChange} />
                        </div>
                        
                        <div className="admin-form-row">
                            <input type="text" name="clinic_timings" placeholder="Clinic Timings (e.g., Mon-Sat 9AM-6PM)" value={newDoctor.clinic_timings} onChange={handleChange} />
                        </div>
                        
                        <div className="admin-form-row admin-image-row">
                            <div className="admin-image-upload-container">
                                <label className="admin-image-upload-label">
                                    <span>📷</span> Upload Doctor Image
                                    <input 
                                        type="file" 
                                        id="doctorImageInput"
                                        name="image" 
                                        accept="image/*" 
                                        onChange={handleImageChange} 
                                        style={{ display: 'none' }} 
                                    />
                                </label>
                                {imagePreview && (
                                    <div className="admin-image-preview">
                                        <img src={imagePreview} alt="Preview" />
                                        <button type="button" className="admin-image-remove" onClick={removeImage}>✕</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <button type="submit" disabled={loading} className="admin-submit-btn">
                            {loading ? "Adding..." : "Add Doctor"}
                        </button>
                    </form>
                </div>
            )}

            {/* Doctors Table with Horizontal Scroll */}
            <div className="admin-table-responsive">
                <table className="admin-doctors-table">
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Specialization</th>
                            <th>Clinic/Hospital</th>
                            <th>Address</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Fee</th>
                            <th>Actions</th> {/* ✅ NEW COLUMN */}
                        </tr>
                    </thead>
                    <tbody>
                        {currentDoctors.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="admin-empty-table">No doctors found</td>
                            </tr>
                        ) : (
                            currentDoctors.map((doc, index) => (
                                <tr key={doc.id}>
                                    <td>{startIndex + index + 1}</td>
                                    <td>
                                        {doc.image ? (
                                            <img src={doc.image} alt={doc.name} className="admin-doctor-thumb" />
                                        ) : (
                                            <span className="admin-no-image">N/A</span>
                                        )}
                                    </td>
                                    <td>{doc.name}</td>
                                    <td>{doc.specialization}</td>
                                    <td>{doc.clinic_name || "N/A"}</td>
                                    <td>
                                        {doc.address || doc.city || doc.state ? 
                                            `${doc.address || ''}${doc.city ? ', ' + doc.city : ''}${doc.state ? ', ' + doc.state : ''}` 
                                            : "N/A"}
                                    </td>
                                    <td>{doc.email}</td>
                                    <td>{doc.phone || "N/A"}</td>
                                    <td>₹{doc.fee}</td>
                                    <td>
                                        <button 
                                            className="admin-edit-btn"
                                            onClick={() => openEditModal(doc)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className="admin-delete-btn"
                                            onClick={() => handleDelete(doc.id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Component */}
            {totalItems > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    totalItems={totalItems}
                    startIndex={startIndex}
                    endIndex={endIndex}
                />
            )}

            {/* ========== EDIT MODAL ========== */}
            {showEditModal && selectedDoctor && (
                <div className="admin-modal-overlay" onClick={closeEditModal}>
                    <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h2>✏️ Edit Doctor</h2>
                            <button className="admin-modal-close" onClick={closeEditModal}>✕</button>
                        </div>
                        <form onSubmit={handleEditDoctor}>
                            <div className="admin-form-grid">
                                <div className="admin-form-group">
                                    <label>Full Name</label>
                                    <input type="text" name="name" value={editDoctor.name} onChange={handleEditChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Phone</label>
                                    <input type="text" name="phone" value={editDoctor.phone} onChange={handleEditChange} maxLength="10" />
                                </div>
                                <div className="admin-form-group">
                                    <label>Specialization</label>
                                    <input type="text" name="specialization" value={editDoctor.specialization} onChange={handleEditChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Experience (years)</label>
                                    <input type="text" name="experience" value={editDoctor.experience} onChange={handleEditChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Consultation Fee (₹)</label>
                                    <input type="number" name="fee" value={editDoctor.fee} onChange={handleEditChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Profile Image</label>
                                    <input type="file" id="editDoctorImageInput" accept="image/*" onChange={handleEditImageChange} />
                                    {editImagePreview && (
                                        <div className="admin-image-preview">
                                            <img src={editImagePreview} alt="Preview" />
                                            <button type="button" className="admin-image-remove" onClick={removeEditImage}>✕</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h4>📍 Clinic/Hospital Details</h4>
                            <div className="admin-form-grid">
                                <div className="admin-form-group">
                                    <label>Clinic/Hospital Name</label>
                                    <input type="text" name="clinic_name" value={editDoctor.clinic_name} onChange={handleEditChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Address</label>
                                    <input type="text" name="address" value={editDoctor.address} onChange={handleEditChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label>City</label>
                                    <input type="text" name="city" value={editDoctor.city} onChange={handleEditChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label>State</label>
                                    <input type="text" name="state" value={editDoctor.state} onChange={handleEditChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Pincode</label>
                                    <input type="text" name="pincode" value={editDoctor.pincode} onChange={handleEditChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Clinic Timings</label>
                                    <input type="text" name="clinic_timings" value={editDoctor.clinic_timings} onChange={handleEditChange} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Landmark</label>
                                    <input type="text" name="landmark" value={editDoctor.landmark} onChange={handleEditChange} />
                                </div>
                            </div>

                            <button type="submit" className="admin-submit-btn" disabled={editLoading}>
                                {editLoading ? "Updating..." : "Update Doctor"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDoctors;