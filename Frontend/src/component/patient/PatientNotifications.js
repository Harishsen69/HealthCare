import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../../services/api";
import "./PatientNotifications.css";

function PatientNotifications({ notifications: initialNotifications, fetchNotifications, onNotificationCountChange }) {
    const [localNotifications, setLocalNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const isMounted = useRef(true);
    const hasInitialized = useRef(false);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('notifications/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (isMounted.current) {
                const data = response.data || [];
                setLocalNotifications(data);
                const unreadCount = data.filter(n => !n.is_read).length;
                if (onNotificationCountChange) {
                    onNotificationCountChange(unreadCount);
                }
            }
        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [onNotificationCountChange]);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            await API.post(`notifications/read/${id}/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setLocalNotifications(prev => {
                const updated = prev.filter(n => n.id !== id);
                const unreadCount = updated.filter(n => !n.is_read).length;
                if (onNotificationCountChange) {
                    onNotificationCountChange(unreadCount);
                }
                return updated;
            });
            
            if (fetchNotifications) fetchNotifications();
            
        } catch (err) {
            console.log("Error marking notification as read:", err);
        }
    };

    const markAllAsRead = async () => {
        if (localNotifications.length === 0) return;
        
        try {
            const token = localStorage.getItem('access_token');
            const promises = localNotifications.map(n => 
                API.post(`notifications/read/${n.id}/`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );
            await Promise.all(promises);
            
            setLocalNotifications([]);
            if (onNotificationCountChange) onNotificationCountChange(0);
            if (fetchNotifications) fetchNotifications();
            
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    // ✅ FIXED: Only load once on mount
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        isMounted.current = true;
        loadNotifications();
        
        return () => {
            isMounted.current = false;
        };
    }, [loadNotifications]);

    const unreadCount = localNotifications.filter(n => !n.is_read).length;

    if (loading && localNotifications.length === 0) {
        return <div className="patient-notifications-loading">Loading notifications...</div>;
    }

    return (
        <div className="patient-notifications-container">
            <div className="patient-notif-header">
                <div className="patient-notif-title">
                    <span>🔔</span>
                    <h3>Notifications</h3>
                    {unreadCount > 0 && <span className="patient-unread-count">{unreadCount} Unread</span>}
                </div>
                {localNotifications.length > 0 && (
                    <button className="patient-mark-all-btn" onClick={markAllAsRead}>
                        Mark all as read
                    </button>
                )}
            </div>

            {localNotifications.length === 0 ? (
                <div className="patient-empty-notif">
                    <span>📭</span>
                    <p>No notifications</p>
                </div>
            ) : (
                <div className="patient-notif-list">
                    {localNotifications.map(notif => (
                        <div key={notif.id} className={`patient-notif-card ${!notif.is_read ? 'unread' : ''}`}>
                            <div className="patient-notif-icon">
                                {notif.title.includes('Completed') ? '🎉'
                                    : notif.title.includes('Confirmed') ? '✅'
                                    : notif.title.includes('Cancelled') ? '❌'
                                    : notif.title.includes('Request') ? '📅'
                                    : notif.title.includes('Report') ? '📋'
                                    : '🔔'}
                            </div>
                            <div className="patient-notif-content">
                                <div className="patient-notif-title-text">
                                    <strong>{notif.title}</strong>
                                    {!notif.is_read && <span className="new-badge-small">NEW</span>}
                                </div>
                                <div className="patient-notif-message">{notif.message}</div>
                                <div className="patient-notif-time">
                                    {new Date(notif.created_at).toLocaleString()}
                                </div>
                            </div>
                            <div className="patient-notif-actions">
                                {!notif.is_read && (
                                    <button 
                                        className="patient-read-btn"
                                        onClick={() => markAsRead(notif.id)}
                                        title="Mark as read"
                                    >
                                        ✓ Read
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PatientNotifications;