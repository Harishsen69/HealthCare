import React from "react";
import "./PatientAppointments.css";

function PatientAppointments({ upcomingAppointments, pastAppointments, handleCancelAppointment, formatTimeTo12Hour }) {
    return (
        <div className="patient-appointments-container">
            <h2 className="patient-page-title">📋 My Appointments</h2>

            {/* Upcoming Appointments Table */}
            <div className="patient-appointments-table-wrapper">
                <div className="patient-table-header">
                    <span className="patient-table-icon">📅</span>
                    <h3>Upcoming Appointments</h3>
                    <span className="patient-upcoming-count">{upcomingAppointments.length} Upcoming</span>
                </div>

                {upcomingAppointments.length === 0 ? (
                    <div className="patient-empty-table">No upcoming appointments</div>
                ) : (
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
                                    <td><span className={`patient-status-badge ${apt.status}`}>{apt.status}</span></td>
                                    <td>
                                        <button 
                                            className="patient-cancel-btn" 
                                            onClick={() => handleCancelAppointment(apt.id)}
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

            {/* Past Appointments Table */}
            <div className="patient-appointments-table-wrapper">
                <div className="patient-table-header">
                    <span className="patient-table-icon">✅</span>
                    <h3>Past Appointments</h3>
                    <span className="patient-completed-count">{pastAppointments.length} Completed</span>
                </div>

                {pastAppointments.length === 0 ? (
                    <div className="patient-empty-table">No past appointments</div>
                ) : (
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
                                    <td><span className={`patient-status-badge ${apt.status}`}>{apt.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default PatientAppointments;