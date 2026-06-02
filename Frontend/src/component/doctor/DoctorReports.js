import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./DoctorReports.css";

function DoctorReports() {
    const [activeSubTab, setActiveSubTab] = useState("add");
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [allReports, setAllReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    
    // Report Form State
    const [formData, setFormData] = useState({
        appointment: "",
        report_type: "prescription",
        status: "final",
        diagnosis: "",
        symptoms: "",
        medicines: [],
        tests_recommended: "",
        doctor_notes: "",
        follow_up_required: false,
        follow_up_date: ""
    });
    
    const [currentMedicine, setCurrentMedicine] = useState({
        name: "",
        dosage: "",
        duration: "",
        timing: ""
    });

    // ========== FETCH PENDING APPOINTMENTS ==========
    const fetchPendingAppointments = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('reports/pending/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPendingAppointments(response.data);
        } catch (error) {
            console.error("Error fetching pending appointments:", error);
        }
    };

    // ========== FETCH ALL REPORTS ==========
    const fetchAllReports = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('reports/doctor/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllReports(response.data);
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    };

    // ========== ADD MEDICINE ==========
    const addMedicine = () => {
        if (currentMedicine.name && currentMedicine.dosage) {
            setFormData({
                ...formData,
                medicines: [...formData.medicines, { ...currentMedicine }]
            });
            setCurrentMedicine({ name: "", dosage: "", duration: "", timing: "" });
        } else {
            alert("Please enter at least medicine name and dosage");
        }
    };

    // ========== REMOVE MEDICINE ==========
    const removeMedicine = (index) => {
        const newMedicines = [...formData.medicines];
        newMedicines.splice(index, 1);
        setFormData({ ...formData, medicines: newMedicines });
    };

    // ========== HANDLE FORM CHANGE ==========
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    // ========== CREATE REPORT ==========
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.appointment) {
            alert("Please select an appointment");
            return;
        }
        
        if (!formData.diagnosis) {
            alert("Please enter diagnosis");
            return;
        }
        
        setLoading(true);
        
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.post('reports/create/', {
                ...formData,
                medicines: JSON.stringify(formData.medicines)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.status === 201) {
                alert("Report created successfully!");
                resetForm();
                fetchAllReports();
                fetchPendingAppointments();
                setActiveSubTab("list");
            }
        } catch (error) {
            console.error("Error creating report:", error);
            alert(error.response?.data?.error || "Failed to create report");
        } finally {
            setLoading(false);
        }
    };

    // ========== RESET FORM ==========
    const resetForm = () => {
        setFormData({
            appointment: "",
            report_type: "prescription",
            status: "final",
            diagnosis: "",
            symptoms: "",
            medicines: [],
            tests_recommended: "",
            doctor_notes: "",
            follow_up_required: false,
            follow_up_date: ""
        });
        setEditingReport(null);
    };

    // ========== EDIT REPORT ==========
    const handleEdit = async (report) => {
        setEditingReport(report);
        
        // Parse medicines
        let medicines = [];
        try {
            medicines = JSON.parse(report.medicines);
        } catch {
            medicines = [];
        }
        
        // ✅ Set form data with appointment ID
        setFormData({
            appointment: report.appointment?.id || "",  // ✅ Auto-fill appointment
            report_type: report.report_type || "prescription",
            status: report.status || "final",
            diagnosis: report.diagnosis || "",
            symptoms: report.symptoms || "",
            medicines: medicines,
            tests_recommended: report.tests_recommended || "",
            doctor_notes: report.doctor_notes || "",
            follow_up_required: report.follow_up_required || false,
            follow_up_date: report.follow_up_date || ""
        });
        
        setActiveSubTab("add");
    };

    // ========== UPDATE REPORT ==========
    const handleUpdate = async (e) => {
        e.preventDefault();
        
        if (!formData.diagnosis) {
            alert("Please enter diagnosis");
            return;
        }
        
        setLoading(true);
        
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.put(`reports/${editingReport.id}/update/`, {
                ...formData,
                medicines: JSON.stringify(formData.medicines)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.status === 200) {
                alert("Report updated successfully!");
                resetForm();
                fetchAllReports();
                setActiveSubTab("list");
            }
        } catch (error) {
            console.error("Error updating report:", error);
            alert(error.response?.data?.error || "Failed to update report");
        } finally {
            setLoading(false);
        }
    };

    // ========== DELETE REPORT ==========
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this report?")) return;
        
        try {
            const token = localStorage.getItem('access_token');
            await API.delete(`reports/${id}/delete/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Report deleted successfully!");
            fetchAllReports();
        } catch (error) {
            console.error("Error deleting report:", error);
            alert("Failed to delete report");
        }
    };

    // ========== DOWNLOAD PDF ==========
    const handleDownload = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get(`reports/${id}/download/`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `medical_report_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            alert("Report downloaded successfully!");
        } catch (error) {
            console.error("Error downloading report:", error);
            alert("Failed to download report");
        }
    };

    // ========== FORMAT DATE ==========
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // ========== GET APPOINTMENT DISPLAY TEXT ==========
    const getAppointmentDisplayText = (appointmentId) => {
        const apt = pendingAppointments.find(a => a.id === appointmentId);
        if (apt) {
            return `${apt.patient_name} - ${apt.date} at ${apt.time}`;
        }
        // Also check in allReports for edit mode
        const report = allReports.find(r => r.appointment?.id === appointmentId);
        if (report && report.appointment) {
            return `${report.appointment.patient_name || report.patient_name} - ${report.appointment.date} at ${report.appointment.time}`;
        }
        return "";
    };

    useEffect(() => {
        fetchPendingAppointments();
        fetchAllReports();
    }, []);

    // ========== RENDER ADD REPORT FORM (2 Columns Layout) ==========
    const renderAddReportForm = () => (
        <div className="dr-report-form-container">
            <div className="dr-form-header">
                <h3>{editingReport ? "✏️ Edit Report" : "📝 Create New Report"}</h3>
                {editingReport && (
                    <button className="dr-cancel-edit" onClick={resetForm}>Cancel Edit</button>
                )}
            </div>
            
            <form onSubmit={editingReport ? handleUpdate : handleSubmit}>
                {/* Appointment Selection - Row 1 */}
                <div className="dr-form-row">
                    <div className="dr-form-group">
                        <label>Select Appointment *</label>
                        {editingReport ? (
                            // In edit mode, show disabled input with value
                            <input 
                                type="text" 
                                value={getAppointmentDisplayText(formData.appointment)}
                                disabled
                                className="dr-disabled-input"
                            />
                        ) : (
                            <select 
                                name="appointment" 
                                value={formData.appointment} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">-- Select Appointment --</option>
                                {pendingAppointments.map(apt => (
                                    <option key={apt.id} value={apt.id}>
                                        {apt.patient_name} - {apt.date} at {apt.time}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
                
                {/* Report Type & Status - Row 2 */}
                <div className="dr-form-row">
                    <div className="dr-form-group">
                        <label>Report Type</label>
                        <select name="report_type" value={formData.report_type} onChange={handleChange}>
                            <option value="prescription">💊 Prescription</option>
                            <option value="discharge">📋 Discharge Summary</option>
                            <option value="lab_report">🔬 Lab Report</option>
                            <option value="other">📄 Other</option>
                        </select>
                    </div>
                    <div className="dr-form-group">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="draft">📝 Draft</option>
                            <option value="final">✅ Final</option>
                            <option value="archived">📦 Archived</option>
                        </select>
                    </div>
                </div>
                
                {/* Diagnosis - Full Width */}
                <div className="dr-form-group">
                    <label>Diagnosis *</label>
                    <textarea 
                        name="diagnosis" 
                        rows="3" 
                        placeholder="Enter diagnosis..." 
                        value={formData.diagnosis} 
                        onChange={handleChange} 
                        required
                    ></textarea>
                </div>
                
                {/* Symptoms - Full Width */}
                <div className="dr-form-group">
                    <label>Symptoms</label>
                    <textarea 
                        name="symptoms" 
                        rows="2" 
                        placeholder="Enter symptoms (separated by commas)..." 
                        value={formData.symptoms} 
                        onChange={handleChange}
                    ></textarea>
                </div>
                
                {/* Medicines Section */}
                <div className="dr-medicines-section">
                    <label>Prescribed Medicines</label>
                    
                    {/* Add Medicine Row - 4 columns */}
                    <div className="dr-medicine-input-group">
                        <input 
                            type="text" 
                            placeholder="Medicine Name *" 
                            value={currentMedicine.name} 
                            onChange={(e) => setCurrentMedicine({...currentMedicine, name: e.target.value})}
                        />
                        <input 
                            type="text" 
                            placeholder="Dosage *" 
                            value={currentMedicine.dosage} 
                            onChange={(e) => setCurrentMedicine({...currentMedicine, dosage: e.target.value})}
                        />
                        <input 
                            type="text" 
                            placeholder="Duration" 
                            value={currentMedicine.duration} 
                            onChange={(e) => setCurrentMedicine({...currentMedicine, duration: e.target.value})}
                        />
                        <select 
                            value={currentMedicine.timing} 
                            onChange={(e) => setCurrentMedicine({...currentMedicine, timing: e.target.value})}
                        >
                            <option value="">Timing</option>
                            <option value="Before Meal">🍽️ Before Meal</option>
                            <option value="After Meal">🍽️ After Meal</option>
                            <option value="Morning">🌅 Morning</option>
                            <option value="Evening">🌙 Evening</option>
                            <option value="Night">🌃 Night</option>
                            <option value="Every 6 Hours">⏰ Every 6 Hours</option>
                            <option value="Every 8 Hours">⏰ Every 8 Hours</option>
                            <option value="Every 12 Hours">⏰ Every 12 Hours</option>
                        </select>
                        <button type="button" onClick={addMedicine} className="dr-add-medicine-btn">+ Add</button>
                    </div>
                    
                    {/* Medicines List Table */}
                    {formData.medicines.length > 0 && (
                        <div className="dr-medicines-table-container">
                            <table className="dr-medicines-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Medicine Name</th>
                                        <th>Dosage</th>
                                        <th>Duration</th>
                                        <th>Timing</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.medicines.map((med, idx) => (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td><strong>{med.name}</strong></td>
                                            <td>{med.dosage}</td>
                                            <td>{med.duration || '-'}</td>
                                            <td>{med.timing || '-'}</td>
                                            <td>
                                                <button 
                                                    type="button" 
                                                    className="dr-remove-medicine-btn"
                                                    onClick={() => removeMedicine(idx)}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                {/* Tests Recommended & Follow-up - Row 3 */}
                <div className="dr-form-row">
                    <div className="dr-form-group">
                        <label>Tests Recommended</label>
                        <textarea 
                            name="tests_recommended" 
                            rows="2" 
                            placeholder="Enter recommended tests..." 
                            value={formData.tests_recommended} 
                            onChange={handleChange}
                        ></textarea>
                    </div>
                    <div className="dr-form-group">
                        <label className="dr-checkbox-label">
                            <input 
                                type="checkbox" 
                                name="follow_up_required" 
                                checked={formData.follow_up_required} 
                                onChange={handleChange}
                            />
                            <span>📅 Follow-up Required</span>
                        </label>
                        {formData.follow_up_required && (
                            <input 
                                type="date" 
                                name="follow_up_date" 
                                value={formData.follow_up_date} 
                                onChange={handleChange}
                                style={{ marginTop: "0.5rem" }}
                            />
                        )}
                    </div>
                </div>
                
                {/* Doctor's Notes - Full Width */}
                <div className="dr-form-group">
                    <label>Doctor's Notes</label>
                    <textarea 
                        name="doctor_notes" 
                        rows="2" 
                        placeholder="Additional notes..." 
                        value={formData.doctor_notes} 
                        onChange={handleChange}
                    ></textarea>
                </div>
                
                <div className="dr-form-actions">
                    <button type="submit" disabled={loading}>
                        {loading ? "Processing..." : (editingReport ? "Update Report" : "Create Report")}
                    </button>
                </div>
            </form>
        </div>
    );

    // ========== RENDER REPORTS LIST ==========
    const renderReportsList = () => (
        <div className="dr-reports-list">
            <div className="dr-list-header">
                <h3>📋 All Reports</h3>
                <span className="dr-report-count">{allReports.length} Reports</span>
            </div>
            
            {loading ? (
                <div className="dr-loading">Loading...</div>
            ) : allReports.length === 0 ? (
                <div className="dr-empty">
                    <span>📭</span>
                    <p>No reports found</p>
                </div>
            ) : (
                <div className="dr-table-container">
                    <table className="dr-reports-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Report ID</th>
                                <th>Patient Name</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allReports.map((report, index) => (
                                <tr key={report.id}>
                                    <td>{index + 1}</td>
                                    <td><span className="dr-report-id">{report.report_number}</span></td>
                                    <td><strong>{report.patient_name || report.patient?.username}</strong></td>
                                    <td>{formatDate(report.created_at)}</td>
                                    <td>{report.report_type}</td>
                                    <td>
                                        <span className={`dr-status-badge ${report.is_final ? 'final' : 'draft'}`}>
                                            {report.is_final ? 'Final' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="dr-actions">
                                        <button className="dr-btn-edit" onClick={() => handleEdit(report)} title="Edit">✏️</button>
                                        <button className="dr-btn-download" onClick={() => handleDownload(report.id)} title="Download PDF">📥</button>
                                        <button className="dr-btn-delete" onClick={() => handleDelete(report.id)} title="Delete">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="doctor-reports-container">
            <div className="dr-tabs">
                <button 
                    className={activeSubTab === "add" ? "active" : ""} 
                    onClick={() => {
                        setActiveSubTab("add");
                        resetForm();
                    }}
                >
                    📝 Add Report
                </button>
                <button 
                    className={activeSubTab === "list" ? "active" : ""} 
                    onClick={() => setActiveSubTab("list")}
                >
                    📋 All Reports
                </button>
            </div>
            
            {activeSubTab === "add" && renderAddReportForm()}
            {activeSubTab === "list" && renderReportsList()}
        </div>
    );
}

export default DoctorReports;