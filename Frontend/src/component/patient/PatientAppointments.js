import React, { useState } from "react";
import Pagination from "../common/Pagination";
import "./PatientAppointments.css";

function PatientAppointments({ upcomingAppointments, pastAppointments, handleCancelAppointment, formatTimeTo12Hour }) {
    // Pagination states for Upcoming Appointments
    const [upcomingCurrentPage, setUpcomingCurrentPage] = useState(1);
    const [upcomingItemsPerPage, setUpcomingItemsPerPage] = useState(5);
    
    // Pagination states for Past Appointments
    const [pastCurrentPage, setPastCurrentPage] = useState(1);
    const [pastItemsPerPage, setPastItemsPerPage] = useState(5);
    
    // Calculate pagination for Upcoming
    const upcomingTotalItems = upcomingAppointments.length;
    const upcomingTotalPages = Math.ceil(upcomingTotalItems / upcomingItemsPerPage);
    const upcomingStartIndex = (upcomingCurrentPage - 1) * upcomingItemsPerPage;
    const upcomingEndIndex = upcomingStartIndex + upcomingItemsPerPage;
    const currentUpcoming = upcomingAppointments.slice(upcomingStartIndex, upcomingEndIndex);
    
    // Calculate pagination for Past
    const pastTotalItems = pastAppointments.length;
    const pastTotalPages = Math.ceil(pastTotalItems / pastItemsPerPage);
    const pastStartIndex = (pastCurrentPage - 1) * pastItemsPerPage;
    const pastEndIndex = pastStartIndex + pastItemsPerPage;
    const currentPast = pastAppointments.slice(pastStartIndex, pastEndIndex);
    
    // Handle page changes
    const handleUpcomingPageChange = (page) => {
        setUpcomingCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handlePastPageChange = (page) => {
        setPastCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleUpcomingItemsPerPageChange = (newItemsPerPage) => {
        setUpcomingItemsPerPage(newItemsPerPage);
        setUpcomingCurrentPage(1);
    };
    
    const handlePastItemsPerPageChange = (newItemsPerPage) => {
        setPastItemsPerPage(newItemsPerPage);
        setPastCurrentPage(1);
    };

    return (
        <div className="patient-appointments-container">
            {/* Upcoming Appointments */}
            <div className="patient-appointments-section">
                <div className="patient-appointments-header">
                    <h3>📋 Upcoming Appointments</h3>
                    <span className="patient-appointments-count">{upcomingTotalItems} Total</span>
                </div>
                
                {upcomingTotalItems === 0 ? (
                    <div className="patient-appointments-empty">No upcoming appointments</div>
                ) : (
                    <>
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
                                    {currentUpcoming.map((apt, index) => (
                                        <tr key={apt.id}>
                                            <td>{upcomingStartIndex + index + 1}</td>
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
                        
                        {/* Pagination for Upcoming */}
                        <Pagination
                            currentPage={upcomingCurrentPage}
                            totalPages={upcomingTotalPages}
                            onPageChange={handleUpcomingPageChange}
                            itemsPerPage={upcomingItemsPerPage}
                            onItemsPerPageChange={handleUpcomingItemsPerPageChange}
                            totalItems={upcomingTotalItems}
                            startIndex={upcomingStartIndex}
                            endIndex={upcomingEndIndex}
                        />
                    </>
                )}
            </div>

            {/* Past Appointments */}
            <div className="patient-appointments-section">
                <div className="patient-appointments-header">
                    <h3>✅ Past Appointments</h3>
                    <span className="patient-appointments-count">{pastTotalItems} Total</span>
                </div>
                
                {pastTotalItems === 0 ? (
                    <div className="patient-appointments-empty">No past appointments</div>
                ) : (
                    <>
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
                                    {currentPast.map((apt, index) => (
                                        <tr key={apt.id}>
                                            <td>{pastStartIndex + index + 1}</td>
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
                        
                        {/* Pagination for Past */}
                        <Pagination
                            currentPage={pastCurrentPage}
                            totalPages={pastTotalPages}
                            onPageChange={handlePastPageChange}
                            itemsPerPage={pastItemsPerPage}
                            onItemsPerPageChange={handlePastItemsPerPageChange}
                            totalItems={pastTotalItems}
                            startIndex={pastStartIndex}
                            endIndex={pastEndIndex}
                        />
                    </>
                )}
            </div>
        </div>
    );
}

export default PatientAppointments;