import React from "react";
import "./PatientAppointments.css";

function PatientAppointments({ upcomingAppointments, pastAppointments, handleCancelAppointment, formatTimeTo12Hour }) {
    return (
        <div className="patient-appointments-container">
            {/* Upcoming Appointments */}
            <div className="patient-appointments-section">
                <div className="patient-appointments-header">
                    <h3>📋 Upcoming Appointments</h3>
                    <span className="patient-appointments-count">{upcomingAppointments.length} Total</span>
                </div>
                
                {upcomingAppointments.length === 0 ? (
                    <div className="patient-appointments-empty">No upcoming appointments</div>
                ) : (
                    <div className="patient-appointments-table-wrapper">
                        <table className="patient-appointments-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Doctor</th>
                                    <th>Specialization</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingAppointments.map((apt, index) => (
                                    <tr key={apt.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{apt.doctor_name}</strong></td>
                                        <td>{apt.doctor_specialty}</td>
                                        <td>{apt.date}</td>
                                        <td>{formatTimeTo12Hour(apt.time)}</td>
                                        <td><span className={`patient-appointment-status ${apt.status}`}>{apt.status}</span></td>
                                        <td>
                                            {apt.status === 'pending' && (
                                                <button 
                                                    className="patient-cancel-appointment-btn"
                                                    onClick={() => handleCancelAppointment(apt.id)}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Past Appointments */}
            <div className="patient-appointments-section">
                <div className="patient-appointments-header">
                    <h3>✅ Past Appointments</h3>
                    <span className="patient-appointments-count">{pastAppointments.length} Total</span>
                </div>
                
                {pastAppointments.length === 0 ? (
                    <div className="patient-appointments-empty">No past appointments</div>
                ) : (
                    <div className="patient-appointments-table-wrapper">
                        <table className="patient-appointments-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Doctor</th>
                                    <th>Specialization</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pastAppointments.map((apt, index) => (
                                    <tr key={apt.id}>
                                        <td>{index + 1}</td>
                                        <td><strong>{apt.doctor_name}</strong></td>
                                        <td>{apt.doctor_specialty}</td>
                                        <td>{apt.date}</td>
                                        <td>{formatTimeTo12Hour(apt.time)}</td>
                                        <td><span className={`patient-appointment-status ${apt.status}`}>{apt.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientAppointments;