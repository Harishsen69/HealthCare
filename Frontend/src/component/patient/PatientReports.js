import React, { useState, useEffect, useRef, useCallback } from "react";
import API from "../../services/api";
import "./PatientReports.css";

function PatientReports({ onReportViewed }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(null);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const isMounted = useRef(true);
    const dataFetched = useRef(false);
    const fetchInProgress = useRef(false);

    // ========== FETCH REPORTS WITH VIEW STATUS FROM BACKEND ==========
    const fetchReports = useCallback(async () => {
        if (fetchInProgress.current || dataFetched.current) return;

        fetchInProgress.current = true;
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setLoading(false);
                fetchInProgress.current = false;
                return;
            }

            const response = await API.get('reports/with-status/', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!isMounted.current) return;

            const reportsWithStatus = response.data;
            reportsWithStatus.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setReports(reportsWithStatus);
            dataFetched.current = true;
            
            // Update sidebar badge count
            const unreadCount = reportsWithStatus.filter(r => !r.is_viewed).length;
            if (onReportViewed) {
                onReportViewed(unreadCount);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            if (isMounted.current) {
                setError("Failed to load reports");
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
            fetchInProgress.current = false;
        }
    }, [onReportViewed]);

    // ========== MARK REPORT AS VIEWED IN BACKEND ==========
    const markAsViewed = useCallback(async (reportId) => {
        try {
            const token = localStorage.getItem('access_token');
            await API.post('reports/mark-viewed/', 
                { report_id: reportId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update local state
            setReports(prevReports => {
                const updatedReports = prevReports.map(report =>
                    report.id === reportId ? { ...report, is_viewed: true } : report
                );
                const unreadCount = updatedReports.filter(r => !r.is_viewed).length;
                if (onReportViewed) {
                    onReportViewed(unreadCount);
                }
                return updatedReports;
            });
        } catch (error) {
            console.error("Error marking report as viewed:", error);
        }
    }, [onReportViewed]);

    // ========== DOWNLOAD PDF ==========
    const handleDownloadPDF = useCallback(async (reportId, reportNumber) => {
        setDownloading(reportId);
        try {
            const token = localStorage.getItem('access_token');
            const response = await API.get(`reports/${reportId}/download/`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `report_${reportNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            await markAsViewed(reportId);
        } catch (error) {
            console.error("Error downloading PDF:", error);
            alert("Failed to download PDF");
        } finally {
            setDownloading(null);
        }
    }, [markAsViewed]);

    // ========== VIEW REPORT MODAL ==========
const openReportModal = useCallback(async (report) => {
    await markAsViewed(report.id);
    setSelectedReport(report);
    setShowModal(true);
    // ✅ Disable background scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
}, [markAsViewed]);

const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedReport(null);
    // ✅ Enable background scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}, []);

    useEffect(() => {
        isMounted.current = true;
        fetchReports();

        return () => {
            isMounted.current = false;
        };
    }, [fetchReports]);

    // Report Modal Component
    const ReportModal = () => {
        if (!selectedReport) return null;

        let medicinesList = [];
        if (selectedReport.medicines) {
            try {
                medicinesList = JSON.parse(selectedReport.medicines);
            } catch {
                medicinesList = [];
            }
        }

        return (
            <div className="report-modal-overlay" onClick={closeModal}>
                <div className="report-modal-container" onClick={(e) => e.stopPropagation()}>
                    <div className="report-modal-header">
                        <div className="report-modal-title">
                            <span className="report-modal-icon">🏥</span>
                            <h2>Medical Report</h2>
                        </div>
                        <button className="report-modal-close" onClick={closeModal}>✕</button>
                    </div>

                    <div className="report-modal-body">
                        <div className="report-info-header">
                            <div className="report-info-group">
                                <label>Report Number</label>
                                <p>{selectedReport.report_number}</p>
                            </div>
                            <div className="report-info-group">
                                <label>Date</label>
                                <p>{new Date(selectedReport.created_at).toLocaleDateString()}</p>
                            </div>
                            <div className="report-info-group">
                                <label>Report Type</label>
                                <p className="report-type-highlight">
                                    {selectedReport.report_type === 'prescription' ? '💊 Prescription' :
                                        selectedReport.report_type === 'discharge' ? '🏥 Discharge Summary' :
                                            selectedReport.report_type === 'lab_report' ? '🔬 Lab Report' : '📄 Report'}
                                </p>
                            </div>
                        </div>

                        <div className="report-details-grid">
                            <div className="report-detail-card">
                                <div className="report-detail-icon">👨‍⚕️</div>
                                <div className="report-detail-content">
                                    <label>Doctor</label>
                                    <p>Dr. {selectedReport.doctor_name}</p>
                                    <span>{selectedReport.doctor_specialization}</span>
                                </div>
                            </div>
                            <div className="report-detail-card">
                                <div className="report-detail-icon">📅</div>
                                <div className="report-detail-content">
                                    <label>Appointment Date</label>
                                    <p>{selectedReport.appointment_date}</p>
                                </div>
                            </div>
                        </div>

                        <div className="report-section">
                            <div className="report-section-title">
                                <span>🏥</span>
                                <h3>Diagnosis</h3>
                            </div>
                            <div className="report-section-content">
                                <p>{selectedReport.diagnosis || 'N/A'}</p>
                            </div>
                        </div>

                        {selectedReport.symptoms && (
                            <div className="report-section">
                                <div className="report-section-title">
                                    <span>🤒</span>
                                    <h3>Symptoms</h3>
                                </div>
                                <div className="report-section-content">
                                    <p>{selectedReport.symptoms}</p>
                                </div>
                            </div>
                        )}

                        {medicinesList.length > 0 && (
                            <div className="report-section">
                                <div className="report-section-title">
                                    <span>💊</span>
                                    <h3>Prescribed Medicines</h3>
                                </div>
                                <div className="report-medicines-table">
                                    <table className="medicines-table">
                                        <thead>
                                            <tr>
                                                <th>Medicine Name</th>
                                                <th>Dosage</th>
                                                <th>Duration</th>
                                                <th>Timing</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {medicinesList.map((med, idx) => (
                                                <tr key={idx}>
                                                    <td><strong>{med.name}</strong></td>
                                                    <td>{med.dosage}</td>
                                                    <td>{med.duration}</td>
                                                    <td>{med.timing}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {selectedReport.tests_recommended && (
                            <div className="report-section">
                                <div className="report-section-title">
                                    <span>🔬</span>
                                    <h3>Tests Recommended</h3>
                                </div>
                                <div className="report-section-content">
                                    <p>{selectedReport.tests_recommended}</p>
                                </div>
                            </div>
                        )}

                        {selectedReport.doctor_notes && (
                            <div className="report-section">
                                <div className="report-section-title">
                                    <span>📝</span>
                                    <h3>Doctor's Notes</h3>
                                </div>
                                <div className="report-section-content">
                                    <p>{selectedReport.doctor_notes}</p>
                                </div>
                            </div>
                        )}

                        {selectedReport.follow_up_required && selectedReport.follow_up_date && (
                            <div className="report-followup">
                                <span>🔄</span>
                                <div>
                                    <strong>Follow-up Required</strong>
                                    <p>Please schedule a follow-up appointment on {selectedReport.follow_up_date}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="report-modal-footer">
                        <button className="report-modal-download" onClick={() => handleDownloadPDF(selectedReport.id, selectedReport.report_number)}>
                            📥 Download PDF
                        </button>
                        <button className="report-modal-close-btn" onClick={closeModal}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && reports.length === 0) {
        return <div className="patient-reports-loading">Loading reports...</div>;
    }

    if (error) {
        return <div className="patient-reports-error">{error}</div>;
    }

    if (reports.length === 0) {
        return (
            <div className="patient-reports-empty">
                <div className="empty-state-icon">📋</div>
                <h3>No Reports Found</h3>
                <p>Your medical reports will appear here after your appointments.</p>
            </div>
        );
    }

    return (
        <>
            <div className="patient-reports-container">
                <div className="patient-reports-header">
                    <h2>📋 My Medical Reports</h2>
                    <p>View and download your medical reports</p>
                </div>

                <div className="patient-reports-table-wrapper">
                    <table className="patient-reports-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Date</th>
                                <th>Doctor</th>
                                <th>Specialization</th>
                                <th>Report Type</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, index) => (
                                <tr key={report.id} className={!report.is_viewed ? "report-unread" : ""}>
                                    <td>{index + 1}</td>
                                    <td>{new Date(report.created_at).toLocaleDateString()}</td>
                                    <td><strong>Dr. {report.doctor_name}</strong></td>
                                    <td>{report.doctor_specialization}</td>
                                    <td>
                                        <span className="report-type-badge">
                                            {report.report_type === 'prescription' ? '💊 Prescription' :
                                                report.report_type === 'discharge' ? '🏥 Discharge Summary' :
                                                    report.report_type === 'lab_report' ? '🔬 Lab Report' : '📄 Report'}
                                        </span>
                                    </td>
                                    <td>
                                        {!report.is_viewed ? (
                                            <span className="report-status-new">🆕 NEW</span>
                                        ) : (
                                            <span className="report-status-viewed">✓ Viewed</span>
                                        )}
                                    </td>
                                    <td className="report-actions">
                                        <button className="report-btn-view" onClick={() => openReportModal(report)}>
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && <ReportModal />}
        </>
    );
}

export default PatientReports;