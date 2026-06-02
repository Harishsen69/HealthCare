import React from "react";
import "./AdminAppointments.css";

function AdminAppointments({ appointments, formatTimeTo12Hour }) {
    return (
        <div className="admin-appointments-container">
            <div className="admin-appointments-header">
                <h2>📅 All Appointments</h2>
            </div>

            <table className="admin-appointments-table">
                <thead>
                    <tr>
                        <th>S.No.</th>
                        <th>Patient Name</th>
                        <th>Doctor Name</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="admin-empty-table">No appointments found</td>
                        </tr>
                    ) : (
                        appointments.map((apt, index) => (
                            <tr key={apt.id}>
                                <td>{index + 1}</td>
                                <td>{apt.patient_name || apt.user?.username || "N/A"}</td>
                                <td>{apt.doctor_name}</td>
                                <td>{apt.date}</td>
                                <td>{formatTimeTo12Hour(apt.time)}</td>
                                <td><span className={`admin-status-badge ${apt.status}`}>{apt.status}</span></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default AdminAppointments;