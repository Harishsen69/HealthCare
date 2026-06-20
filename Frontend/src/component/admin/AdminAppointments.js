import React, { useState } from "react";
import Pagination from "../common/Pagination";
import "./AdminAppointments.css";

function AdminAppointments({ appointments, formatTimeTo12Hour }) {
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Calculate pagination
    const totalItems = appointments.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAppointments = appointments.slice(startIndex, endIndex);
    
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

    return (
        <div className="admin-appointments-container">
            <div className="admin-appointments-header">
                <h2>📅 All Appointments</h2>
            </div>

            <div className="admin-appointments-table-wrapper">
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
                        {currentAppointments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="admin-empty-table">No appointments found</td>
                            </tr>
                        ) : (
                            currentAppointments.map((apt, index) => (
                                <tr key={apt.id}>
                                    <td>{startIndex + index + 1}</td>
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
        </div>
    );
}

export default AdminAppointments;