import React, { useState } from "react";
import Pagination from "../common/Pagination";
import "./DoctorAppointments.css";

function DoctorAppointments({ 
    doctorPendingAppointments, 
    doctorConfirmedAppointments, 
    doctorCompletedAppointments, 
    loadingDoctorApps, 
    handleDoctorAppointmentAction, 
    formatTimeTo12Hour 
}) {
    
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Pagination states for Pending Appointments
    const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
    const [pendingItemsPerPage, setPendingItemsPerPage] = useState(5);
    
    // Pagination states for Confirmed Appointments
    const [confirmedCurrentPage, setConfirmedCurrentPage] = useState(1);
    const [confirmedItemsPerPage, setConfirmedItemsPerPage] = useState(5);
    
    // Pagination states for Completed Appointments
    const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
    const [completedItemsPerPage, setCompletedItemsPerPage] = useState(5);

    // ========== HELPER: CHECK IF DATE IS FUTURE ==========
    const isFutureDate = (dateStr) => {
        const today = new Date().toISOString().split('T')[0];
        return dateStr > today;
    };

    // Calculate pagination for Pending
    const pendingTotalItems = doctorPendingAppointments.length;
    const pendingTotalPages = Math.ceil(pendingTotalItems / pendingItemsPerPage);
    const pendingStartIndex = (pendingCurrentPage - 1) * pendingItemsPerPage;
    const pendingEndIndex = pendingStartIndex + pendingItemsPerPage;
    const currentPending = doctorPendingAppointments.slice(pendingStartIndex, pendingEndIndex);
    
    // Calculate pagination for Confirmed
    const confirmedTotalItems = doctorConfirmedAppointments.length;
    const confirmedTotalPages = Math.ceil(confirmedTotalItems / confirmedItemsPerPage);
    const confirmedStartIndex = (confirmedCurrentPage - 1) * confirmedItemsPerPage;
    const confirmedEndIndex = confirmedStartIndex + confirmedItemsPerPage;
    const currentConfirmed = doctorConfirmedAppointments.slice(confirmedStartIndex, confirmedEndIndex);
    
    // Calculate pagination for Completed
    const completedTotalItems = doctorCompletedAppointments.length;
    const completedTotalPages = Math.ceil(completedTotalItems / completedItemsPerPage);
    const completedStartIndex = (completedCurrentPage - 1) * completedItemsPerPage;
    const completedEndIndex = completedStartIndex + completedItemsPerPage;
    const currentCompleted = doctorCompletedAppointments.slice(completedStartIndex, completedEndIndex);

    // Handle page changes
    const handlePendingPageChange = (page) => {
        setPendingCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleConfirmedPageChange = (page) => {
        setConfirmedCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handleCompletedPageChange = (page) => {
        setCompletedCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    const handlePendingItemsPerPageChange = (newItemsPerPage) => {
        setPendingItemsPerPage(newItemsPerPage);
        setPendingCurrentPage(1);
    };
    
    const handleConfirmedItemsPerPageChange = (newItemsPerPage) => {
        setConfirmedItemsPerPage(newItemsPerPage);
        setConfirmedCurrentPage(1);
    };
    
    const handleCompletedItemsPerPageChange = (newItemsPerPage) => {
        setCompletedItemsPerPage(newItemsPerPage);
        setCompletedCurrentPage(1);
    };

    // ========== OPEN MODAL WITH APPOINTMENT DETAILS ==========
    const openViewModal = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
    };

    // ========== CLOSE MODAL ==========
    const closeModal = () => {
        setShowModal(false);
        setSelectedAppointment(null);
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    };

    // ========== APPOINTMENT DETAILS MODAL COMPONENT ==========
    const AppointmentDetailsModal = () => {
        if (!selectedAppointment) return null;

        return (
            <div className="doc-appointment-modal-overlay" onClick={closeModal}>
                <div className="doc-appointment-modal-container" onClick={(e) => e.stopPropagation()}>
                    <div className="doc-appointment-modal-header">
                        <div className="doc-appointment-modal-title">
                            <div className="doc-appointment-modal-icon">📋</div>
                            <div>
                                <h2>Appointment Details</h2>
                                <p>Complete consultation information</p>
                            </div>
                        </div>
                        <button className="doc-appointment-modal-close" onClick={closeModal}>✕</button>
                    </div>

                    <div className="doc-appointment-modal-body">
                        {/* Status Banner */}
                        <div className="doc-appointment-status-banner completed">
                            <span>✅</span>
                            <div>
                                <strong>Appointment Completed</strong>
                                <p>This appointment has been successfully completed</p>
                            </div>
                        </div>

                        {/* Patient Information Card */}
                        <div className="doc-appointment-info-card">
                            <div className="doc-appointment-card-header">
                                <span>👤</span>
                                <h3>Patient Information</h3>
                            </div>
                            <div className="doc-appointment-info-grid">
                                <div className="doc-appointment-info-item">
                                    <label>Full Name</label>
                                    <p><strong>{selectedAppointment.patient_name || "Patient"}</strong></p>
                                </div>
                                <div className="doc-appointment-info-item">
                                    <label>Phone Number</label>
                                    <p>{selectedAppointment.patient_phone || "N/A"}</p>
                                </div>
                                <div className="doc-appointment-info-item">
                                    <label>Email</label>
                                    <p>{selectedAppointment.patient_email || "N/A"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Appointment Details Card */}
                        <div className="doc-appointment-info-card">
                            <div className="doc-appointment-card-header">
                                <span>📅</span>
                                <h3>Appointment Details</h3>
                            </div>
                            <div className="doc-appointment-info-grid">
                                <div className="doc-appointment-info-item">
                                    <label>Appointment Date</label>
                                    <p><strong>{selectedAppointment.date}</strong></p>
                                </div>
                                <div className="doc-appointment-info-item">
                                    <label>Appointment Time</label>
                                    <p><strong>{formatTimeTo12Hour(selectedAppointment.time)}</strong></p>
                                </div>
                                <div className="doc-appointment-info-item">
                                    <label>Status</label>
                                    <span className={`doc-appointment-status-badge ${selectedAppointment.status}`}>
                                        {selectedAppointment.status === 'completed' ? '✅ Completed' : selectedAppointment.status}
                                    </span>
                                </div>
                                <div className="doc-appointment-info-item">
                                    <label>Appointment ID</label>
                                    <p>#{selectedAppointment.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Card */}
                        <div className="doc-appointment-info-card">
                            <div className="doc-appointment-card-header">
                                <span>📝</span>
                                <h3>Additional Information</h3>
                            </div>
                            <div className="doc-appointment-additional-info">
                                <div className="doc-appointment-info-item full-width">
                                    <label>Doctor Notes</label>
                                    <p className="doc-appointment-notes">
                                        {selectedAppointment.doctor_notes || "No additional notes available for this appointment."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Completion Badge */}
                        <div className="doc-appointment-completion-badge">
                            <span>🏆</span>
                            <div>
                                <strong>Treatment Completed Successfully</strong>
                                <p>This appointment has been marked as completed by the doctor</p>
                            </div>
                        </div>
                    </div>

                    <div className="doc-appointment-modal-footer">
                        <button className="doc-appointment-close-btn" onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="doctor-appointments-container">
                {/* PENDING REQUESTS SECTION */}
                <div className="doctor-appointments-section">
                    <div className="doctor-appointments-header">
                        <div className="doctor-appointments-title">
                            <span className="doctor-appointments-icon">📌</span>
                            <h3>Pending Requests</h3>
                        </div>
                        <span className="doctor-appointments-count pending-badge">{pendingTotalItems} Pending</span>
                    </div>

                    {loadingDoctorApps ? (
                        <div className="doctor-loading-text">Loading...</div>
                    ) : pendingTotalItems === 0 ? (
                        <div className="doctor-empty-table">No pending requests</div>
                    ) : (
                        <>
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
                                        {currentPending.map((apt, index) => (
                                            <tr key={apt.id}>
                                                <td>{pendingStartIndex + index + 1}</td>
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
                            <Pagination
                                currentPage={pendingCurrentPage}
                                totalPages={pendingTotalPages}
                                onPageChange={handlePendingPageChange}
                                itemsPerPage={pendingItemsPerPage}
                                onItemsPerPageChange={handlePendingItemsPerPageChange}
                                totalItems={pendingTotalItems}
                                startIndex={pendingStartIndex}
                                endIndex={pendingEndIndex}
                            />
                        </>
                    )}
                </div>

                {/* CONFIRMED APPOINTMENTS SECTION */}
                {confirmedTotalItems > 0 && (
                    <div className="doctor-appointments-section">
                        <div className="doctor-appointments-header">
                            <div className="doctor-appointments-title">
                                <span className="doctor-appointments-icon">✅</span>
                                <h3>Confirmed Appointments</h3>
                            </div>
                            <span className="doctor-appointments-count confirmed-badge">{confirmedTotalItems} Confirmed</span>
                        </div>

                        <>
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
                                        {currentConfirmed.map((apt, index) => {
                                            const isFuture = isFutureDate(apt.date);
                                            return (
                                                <tr key={apt.id}>
                                                    <td>{confirmedStartIndex + index + 1}</td>
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
                            <Pagination
                                currentPage={confirmedCurrentPage}
                                totalPages={confirmedTotalPages}
                                onPageChange={handleConfirmedPageChange}
                                itemsPerPage={confirmedItemsPerPage}
                                onItemsPerPageChange={handleConfirmedItemsPerPageChange}
                                totalItems={confirmedTotalItems}
                                startIndex={confirmedStartIndex}
                                endIndex={confirmedEndIndex}
                            />
                        </>
                    </div>
                )}

                {/* COMPLETED APPOINTMENTS SECTION - WITH VIEW BUTTON */}
                {completedTotalItems > 0 && (
                    <div className="doctor-appointments-section">
                        <div className="doctor-appointments-header">
                            <div className="doctor-appointments-title">
                                <span className="doctor-appointments-icon">🎉</span>
                                <h3>Completed Appointments</h3>
                            </div>
                            <span className="doctor-appointments-count completed-badge">{completedTotalItems} Completed</span>
                        </div>

                        <>
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
                                        {currentCompleted.map((apt, index) => (
                                            <tr key={apt.id}>
                                                <td>{completedStartIndex + index + 1}</td>
                                                <td><strong>{apt.patient_name || "Patient"}</strong></td>
                                                <td>{apt.patient_phone || "N/A"}</td>
                                                <td>{apt.date}</td>
                                                <td>{formatTimeTo12Hour(apt.time)}</td>
                                                <td><span className={`doctor-status-badge ${apt.status}`}>{apt.status}</span></td>
                                                <td className="doctor-action-cell">
                                                    <button 
                                                        className="view-details-btn" 
                                                        onClick={() => openViewModal(apt)}
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination
                                currentPage={completedCurrentPage}
                                totalPages={completedTotalPages}
                                onPageChange={handleCompletedPageChange}
                                itemsPerPage={completedItemsPerPage}
                                onItemsPerPageChange={handleCompletedItemsPerPageChange}
                                totalItems={completedTotalItems}
                                startIndex={completedStartIndex}
                                endIndex={completedEndIndex}
                            />
                        </>
                    </div>
                )}
            </div>

            {/* Appointment Details Modal */}
            {showModal && <AppointmentDetailsModal />}
        </>
    );
}

export default DoctorAppointments;