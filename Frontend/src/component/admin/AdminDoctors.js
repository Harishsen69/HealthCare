import React, { useState } from "react";
import API from "../../services/api";
import "./AdminDoctors.css";

function AdminDoctors({ doctors, setDoctors }) {
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        experience: '',
        fee: ''
    });

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

    // ========== ADD NEW DOCTOR ==========
    const handleAddDoctor = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.post('admin/add-doctor/', newDoctor, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.status === 201) {
                alert('Doctor added successfully!');
                setShowAddForm(false);
                setNewDoctor({
                    name: '', email: '', password: '', phone: '',
                    specialization: '', experience: '', fee: ''
                });
                
                // Refresh doctors list
                const doctorsRes = await API.get('admin/doctors/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDoctors(doctorsRes.data);
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
                            <input type="text" name="name" placeholder="Full Name" value={newDoctor.name} onChange={handleChange} required />
                            <input type="email" name="email" placeholder="Email" value={newDoctor.email} onChange={handleChange} required />
                        </div>
                        <div className="admin-form-row">
                            <input type="password" name="password" placeholder="Password" value={newDoctor.password} onChange={handleChange} required />
                            <input type="text" name="phone" placeholder="Phone (max 10 digits)" value={newDoctor.phone} onChange={handleChange} />
                        </div>
                        <div className="admin-form-row">
                            <input type="text" name="specialization" placeholder="Specialization" value={newDoctor.specialization} onChange={handleChange} />
                            <input type="text" name="experience" placeholder="Experience" value={newDoctor.experience} onChange={handleChange} />
                        </div>
                        <div className="admin-form-row">
                            <input type="number" name="fee" placeholder="Consultation Fee" value={newDoctor.fee} onChange={handleChange} />
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
                            <th>Name</th>
                            <th>Specialization</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Fee</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doctors.map((doc, index) => (
                            <tr key={doc.id}>
                                <td>{index + 1}</td>
                                <td>{doc.name}</td>
                                <td>{doc.specialization}</td>
                                <td>{doc.email}</td>
                                <td>{doc.phone || "N/A"}</td>
                                <td>₹{doc.fee}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminDoctors;