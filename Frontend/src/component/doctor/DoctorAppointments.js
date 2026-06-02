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
            <h2 className="doctor-page-title">📋 Appointments</h2>

            {/* PENDING REQUESTS TABLE */}
            <div className="doctor-appointments-table-wrapper">
                <div className="doctor-table-header">
                    <span className="doctor-table-icon">📌</span>
                    <h3>Pending Requests</h3>
                    <span className="doctor-pending-count">{doctorPendingAppointments.length} Pending</span>
                </div>

                {loadingDoctorApps ? (
                    <div className="doctor-loading-text">Loading...</div>
                ) : doctorPendingAppointments.length === 0 ? (
                    <div className="doctor-empty-table">No pending appointments</div>
                ) : (
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
                )}
            </div>

            {/* CONFIRMED APPOINTMENTS TABLE */}
            {doctorConfirmedAppointments.length > 0 && (
                <div className="doctor-appointments-table-wrapper">
                    <div className="doctor-table-header">
                        <span className="doctor-table-icon">✅</span>
                        <h3>Confirmed Appointments</h3>
                        <span className="doctor-confirmed-count">{doctorConfirmedAppointments.length} Confirmed</span>
                    </div>

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
                                                style={isFuture ? { opacity: 0.5, cursor: "not-allowed" } : {}}
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
            )}

            {/* COMPLETED APPOINTMENTS TABLE */}
            {doctorCompletedAppointments.length > 0 && (
                <div className="doctor-appointments-table-wrapper">
                    <div className="doctor-table-header">
                        <span className="doctor-table-icon">🎉</span>
                        <h3>Completed Appointments</h3>
                        <span className="doctor-completed-count">{doctorCompletedAppointments.length} Completed</span>
                    </div>

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
                                                `Time: ${apt.time}\n` +
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
            )}
        </div>
    );
}

export default DoctorAppointments;