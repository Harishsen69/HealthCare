import React from "react";
import "./DoctorAppointments.css";

function DoctorAppointments({ 
    doctorPendingAppointments, 
    doctorConfirmedAppointments, 
    doctorCompletedAppointments, 
    loadingDoctorApps, 
    handleDoctorAppointmentAction, 
    formatTimeTo12Hour 
}) {
    
    // ========== HELPER: CHECK IF DATE IS FUTURE ==========
    const isFutureDate = (dateStr) => {
        const today = new Date().toISOString().split('T')[0];
        return dateStr > today;
    };

    return (
        <div className="doctor-appointments-container">
            
            

            {/* PENDING REQUESTS SECTION */}
            <div className="doctor-appointments-section">
                <div className="doctor-appointments-header">
                    <div className="doctor-appointments-title">
                        <span className="doctor-appointments-icon">📌</span>
                        <h3>Pending Requests</h3>
                    </div>
                    <span className="doctor-appointments-count pending-badge">{doctorPendingAppointments.length} Pending</span>
                </div>

                {loadingDoctorApps ? (
                    <div className="doctor-loading-text">Loading...</div>
                ) : doctorPendingAppointments.length === 0 ? (
                    <div className="doctor-empty-table">No pending requests</div>
                ) : (
                    <div className="doctor-appointments-table-wrapper">
                        <table className="doctor-appointments-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Patient Name</th>
                                    <th>Phone</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctorPendingAppointments.map((apt, index) => (
                                    <tr key={apt.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{apt.patient_name || "Patient"}</strong></td>
                                        <td>{apt.patient_phone || "N/A"}</td>
                                        <td>{apt.date}</td>
                                        <td>{formatTimeTo12Hour(apt.time)}</td>
                                        <td><span className={`doctor-status-badge ${apt.status}`}>{apt.status}</span></td>
                                        <td className="doctor-action-cell">
                                            <button 
                                                className="doc-confirm" 
                                                onClick={() => handleDoctorAppointmentAction(apt.id, 'confirm')}
                                            >
                                                Confirm
                                            </button>
                                            <button 
                                                className="doc-cancel" 
                                                onClick={() => handleDoctorAppointmentAction(apt.id, 'cancel')}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CONFIRMED APPOINTMENTS SECTION */}
            {doctorConfirmedAppointments.length > 0 && (
                <div className="doctor-appointments-section">
                    <div className="doctor-appointments-header">
                        <div className="doctor-appointments-title">
                            <span className="doctor-appointments-icon">✅</span>
                            <h3>Confirmed Appointments</h3>
                        </div>
                        <span className="doctor-appointments-count confirmed-badge">{doctorConfirmedAppointments.length} Confirmed</span>
                    </div>

                    <div className="doctor-appointments-table-wrapper">
                        <table className="doctor-appointments-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Patient Name</th>
                                    <th>Phone</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctorConfirmedAppointments.map((apt, index) => {
                                    const isFuture = isFutureDate(apt.date);
                                    return (
                                        <tr key={apt.id}>
                                            <td>{index + 1}</td>
                                            <td><strong>{apt.patient_name || "Patient"}</strong></td>
                                            <td>{apt.patient_phone || "N/A"}</td>
                                            <td>{apt.date}</td>
                                            <td>{formatTimeTo12Hour(apt.time)}</td>
                                            <td><span className={`doctor-status-badge ${apt.status}`}>{apt.status}</span></td>
                                            <td className="doctor-action-cell">
                                                <button 
                                                    className="doc-complete" 
                                                    onClick={() => handleDoctorAppointmentAction(apt.id, 'complete')}
                                                    disabled={isFuture}
                                                    title={isFuture ? "Cannot complete future appointments" : "Complete appointment"}
                                                >
                                                    Complete
                                                </button>
                                                <button 
                                                    className="doc-cancel" 
                                                    onClick={() => handleDoctorAppointmentAction(apt.id, 'cancel')}
                                                >
                                                    Cancel
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* COMPLETED APPOINTMENTS SECTION - WITH VIEW BUTTON */}
            {doctorCompletedAppointments.length > 0 && (
                <div className="doctor-appointments-section">
                    <div className="doctor-appointments-header">
                        <div className="doctor-appointments-title">
                            <span className="doctor-appointments-icon">🎉</span>
                            <h3>Completed Appointments</h3>
                        </div>
                        <span className="doctor-appointments-count completed-badge">{doctorCompletedAppointments.length} Completed</span>
                    </div>

                    <div className="doctor-appointments-table-wrapper">
                        <table className="doctor-appointments-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Patient Name</th>
                                    <th>Phone</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {doctorCompletedAppointments.map((apt, index) => (
                                    <tr key={apt.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{apt.patient_name || "Patient"}</strong></td>
                                        <td>{apt.patient_phone || "N/A"}</td>
                                        <td>{apt.date}</td>
                                        <td>{formatTimeTo12Hour(apt.time)}</td>
                                        <td><span className={`doctor-status-badge ${apt.status}`}>{apt.status}</span></td>
                                        <td className="doctor-action-cell">
                                            <button 
                                                className="view-details-btn" 
                                                onClick={() => alert(
                                                    `Patient: ${apt.patient_name}\n` +
                                                    `Phone: ${apt.patient_phone}\n` +
                                                    `Date: ${apt.date}\n` +
                                                    `Time: ${formatTimeTo12Hour(apt.time)}\n` +
                                                    `Status: ${apt.status}`
                                                )}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DoctorAppointments;