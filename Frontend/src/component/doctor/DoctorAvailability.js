import React, { useState, useEffect } from "react";
import API from "../../services/api";
import "./DoctorAvailability.css";

function DoctorAvailability() {
    const [availabilityDate, setAvailabilityDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [breakStart, setBreakStart] = useState("");
    const [breakEnd, setBreakEnd] = useState("");
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [savedAvailabilities, setSavedAvailabilities] = useState([]);
    const [fetchingAvailabilities, setFetchingAvailabilities] = useState(false);
    const [isAvailable, setIsAvailable] = useState(true);

    // ========== FORMAT TIME TO 12-HOUR ==========
    const formatTimeTo12Hour = (time24) => {
        if (!time24) return '';
        let [hours, minutes] = time24.split(':');
        let period = hours >= 12 ? 'PM' : 'AM';
        let hour12 = hours % 12 || 12;
        let hour12Str = hour12.toString().padStart(2, '0');
        return `${hour12Str}:${minutes} ${period}`;
    };

    // ========== FETCH SAVED AVAILABILITIES ==========
    const fetchSavedAvailabilities = async () => {
        setFetchingAvailabilities(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get('doctor-availability/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedAvailabilities(response.data || []);
        } catch (error) {
            console.error("Error fetching availabilities:", error);
        } finally {
            setFetchingAvailabilities(false);
        }
    };

    // ========== DELETE AVAILABILITY ==========
    const handleDeleteAvailability = async (availabilityId, date) => {
        if (!window.confirm(`Are you sure you want to delete availability for ${date}?`)) return;

        try {
            const token = localStorage.getItem('access_token');
            const response = await API.delete(`doctor-availability/${availabilityId}/`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200) {
                alert("Availability deleted successfully!");
                await fetchSavedAvailabilities();
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert(error.response?.data?.error || "Failed to delete availability");
        }
    };

    // ========== SET AVAILABILITY ==========
    const handleSetAvailability = async (e) => {
        e.preventDefault();

        if (!availabilityDate) {
            alert("Please select a date");
            return;
        }

        if (isAvailable && (!startTime || !endTime)) {
            alert("Please select start time and end time");
            return;
        }

        if (isAvailable && startTime >= endTime) {
            alert("End time must be after start time");
            return;
        }

        setAvailabilityLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.post('doctor-availability/', {
                date: availabilityDate,
                start_time: isAvailable ? startTime : null,
                end_time: isAvailable ? endTime : null,
                break_start: isAvailable ? (breakStart || null) : null,
                break_end: isAvailable ? (breakEnd || null) : null,
                is_available: isAvailable
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 201) {
                alert(isAvailable ? "Availability set successfully!" : "Marked as Not Available");
                setAvailabilityDate("");
                setStartTime("");
                setEndTime("");
                setBreakStart("");
                setBreakEnd("");
                setIsAvailable(true);
                await fetchSavedAvailabilities();
            }
        } catch (error) {
            console.error("Availability error:", error);
            alert(error.response?.data?.error || "Failed to set availability");
        } finally {
            setAvailabilityLoading(false);
        }
    };

    useEffect(() => {
        fetchSavedAvailabilities();
    }, []);

    return (
        <div className="doctor-availability-container">
            {/* Set Availability Form */}
            <div className="doctor-set-availability">
                <div className="doctor-section-header">
                    <h3>📅 Set Your Availability</h3>
                </div>
                <div className="doctor-availability-form">
                    <form onSubmit={handleSetAvailability}>
                        <div className="doctor-availability-row">
                            <div className="doctor-input-field">
                                <label>Date</label>
                                <input
                                    type="date"
                                    value={availabilityDate}
                                    onChange={(e) => setAvailabilityDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="doctor-input-field">
                                <label>Status</label>
                                <select
                                    value={isAvailable}
                                    onChange={(e) => setIsAvailable(e.target.value === 'true')}
                                >
                                    <option value="true">✅ Available</option>
                                    <option value="false">❌ Not Available</option>
                                </select>
                            </div>
                            {isAvailable && (
                                <>
                                    <div className="doctor-input-field">
                                        <label>Start Time</label>
                                        <select
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            required={isAvailable}
                                        >
                                            <option value="">Select</option>
                                            <option value="09:00">09:00 AM</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="11:00">11:00 AM</option>
                                            <option value="12:00">12:00 PM</option>
                                            <option value="13:00">01:00 PM</option>
                                            <option value="14:00">02:00 PM</option>
                                            <option value="15:00">03:00 PM</option>
                                            <option value="16:00">04:00 PM</option>
                                            <option value="17:00">05:00 PM</option>
                                            <option value="18:00">06:00 PM</option>
                                            <option value="19:00">07:00 PM</option>
                                            <option value="20:00">08:00 PM</option>
                                        </select>
                                    </div>
                                    <div className="doctor-input-field">
                                        <label>End Time</label>
                                        <select
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            required={isAvailable}
                                        >
                                            <option value="">Select</option>
                                            <option value="09:00">09:00 AM</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="11:00">11:00 AM</option>
                                            <option value="12:00">12:00 PM</option>
                                            <option value="13:00">01:00 PM</option>
                                            <option value="14:00">02:00 PM</option>
                                            <option value="15:00">03:00 PM</option>
                                            <option value="16:00">04:00 PM</option>
                                            <option value="17:00">05:00 PM</option>
                                            <option value="18:00">06:00 PM</option>
                                            <option value="19:00">07:00 PM</option>
                                            <option value="20:00">08:00 PM</option>
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="doctor-action-field">
                                <button
                                    type="submit"
                                    disabled={availabilityLoading}
                                    className="doctor-save-availability"
                                >
                                    {availabilityLoading ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Saved Availabilities Table */}
            <div className="doctor-saved-availability">
                <div className="doctor-section-header">
                    <h3>📋 Your Availabilities</h3>
                    {fetchingAvailabilities && <span className="doctor-loading-text">Loading...</span>}
                </div>

                {savedAvailabilities.length === 0 ? (
                    <div className="doctor-empty-table">No availabilities set yet</div>
                ) : (
                    <div className="doctor-table-responsive">
                        <table className="doctor-availability-list-table">
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Date</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Break</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {savedAvailabilities.map((avail, index) => (
                                    <tr key={avail.id}>
                                        <td>{index + 1}</td>
                                        <td>{avail.date}</td>
                                        <td>{!avail.is_available ? '-' : (avail.start_time ? formatTimeTo12Hour(avail.start_time) : '-')}</td>
                                        <td>{!avail.is_available ? '-' : (avail.end_time ? formatTimeTo12Hour(avail.end_time) : '-')}</td>
                                        <td>{!avail.is_available ? '-' : (avail.break_start && avail.break_end ? `${formatTimeTo12Hour(avail.break_start)} - ${formatTimeTo12Hour(avail.break_end)}` : '-')}</td>
                                        <td>
                                            <span className={`doctor-status-badge ${avail.is_available ? 'available' : 'unavailable'}`}>
                                                {avail.is_available ? '✅ Available' : '❌ Unavailable'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="doctor-delete-availability"
                                                onClick={() => handleDeleteAvailability(avail.id, avail.date)}
                                            >
                                                Delete
                                            </button>
                                        </td>
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

export default DoctorAvailability;