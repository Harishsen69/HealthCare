import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./DoctorNotifications.css";

function DoctorNotifications({ notifications, fetchNotifications, setActiveTab }) {
    const [localNotifications, setLocalNotifications] = useState(notifications);

    useEffect(() => {
        setLocalNotifications(notifications);
    }, [notifications]);

    // ========== MARK NOTIFICATION READ AND REMOVE ==========
    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            await API.post(`notifications/read/${id}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLocalNotifications(prev => prev.filter(n => n.id !== id));
            if (fetchNotifications) fetchNotifications();
        } catch (err) {
            console.log("Error marking notification as read:", err);
        }
    };

    // ========== HANDLE VIEW - Go to Appointments Tab ==========
    const handleView = async (notification) => {
        // Switch to appointments tab
        if (setActiveTab) {
            setActiveTab("appointments");
        }
        // Mark as read and remove from list
        await markAsRead(notification.id);
    };

    return (
        <div className="doctor-notifications-container">
            <div className="doctor-notif-header">
                <h3>🔔 Notifications</h3>
                <span className="doctor-unread-count">
                    {localNotifications.filter(n => !n.is_read).length} Unread
                </span>
            </div>

            {localNotifications.length === 0 ? (
                <div className="doctor-empty-notif">
                    <span>📭</span>
                    <p>No notifications</p>
                </div>
            ) : (
                <div className="doctor-notif-list">
                    <table className="doctor-notif-table">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Message</th>
                                <th>Date & Time</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {localNotifications.map(notif => (
                                <tr key={notif.id} className={!notif.is_read ? 'doctor-unread-row' : ''}>
                                    <td className="doctor-notif-type-cell">
                                        <div className="doctor-notif-type-icon">
                                            {notif.title.includes('Completed') ? '🎉'
                                                : notif.title.includes('Confirmed') ? '✅'
                                                : notif.title.includes('Cancelled') ? '❌'
                                                : notif.title.includes('Request') ? '📅'
                                                : '🔔'}
                                        </div>
                                        <div className="doctor-notif-type-text">
                                            {notif.title.includes('Completed') ? 'Completed'
                                                : notif.title.includes('Confirmed') ? 'Confirmed'
                                                : notif.title.includes('Cancelled') ? 'Cancelled'
                                                : notif.title.includes('Request') ? 'New Request'
                                                : 'Update'}
                                        </div>
                                    </td>
                                    <td className="doctor-notif-msg-cell">
                                        <strong>{notif.title}</strong>
                                        <p>{notif.message}</p>
                                    </td>
                                    <td className="doctor-notif-date-cell">
                                        {new Date(notif.created_at).toLocaleString()}
                                    </td>
                                    <td className="doctor-notif-action-cell">
                                        <button 
                                            className="doctor-view-notif-btn"
                                            onClick={() => handleView(notif)}
                                        >
                                            👁️ View
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

export default DoctorNotifications;