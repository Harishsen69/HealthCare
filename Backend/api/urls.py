from django.urls import path
from . import views

urlpatterns = [
    # ========== OTP & AUTH ==========
    path('send-otp/', views.send_otp, name='send_otp'),
    path('verify-otp/', views.verify_otp, name='verify_otp'),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('profile/', views.get_user_profile, name='profile'),
    path('profile/update/', views.update_user_profile, name='update_profile'),
    path('check-email/', views.check_email, name='check_email'),
    path('forgot-password/', views.forgot_password, name='forgot_password'),
    
    # ========== DOCTORS ==========
    path('doctors/', views.get_doctors, name='doctors'),
    path('doctors/<int:id>/', views.get_doctor, name='doctor'),
    
    # ========== APPOINTMENTS ==========
    path('appointments/', views.get_appointments, name='appointments'),
    path('appointments/create/', views.create_appointment, name='create_appointment'),
    path('appointments/cancel/<int:id>/', views.cancel_appointment, name='cancel_appointment'),
    
    # ========== DOCTOR APPOINTMENTS ==========
    path('doctor-all-appointments/', views.doctor_all_appointments, name='doctor_all_appointments'),
    path('doctor-pending-count/', views.doctor_pending_count, name='doctor_pending_count'),
    path('update-appointment/<int:id>/', views.update_appointment_status, name='update_appointment_status'),
    
    # ========== NOTIFICATIONS ==========
    path('notifications/', views.get_notifications, name='notifications'),
    path('notifications/read/<int:id>/', views.mark_notification_read, name='mark_notification_read'),
    path('update-appointment-from-notification/', views.update_appointment_from_notification, name='update_appointment_from_notification'),
    
    # ========== ADMIN ==========
    path('admin/users/', views.admin_all_users, name='admin_users'),
    path('admin/doctors/', views.admin_all_doctors, name='admin_doctors'),
    path('admin/appointments/', views.admin_all_appointments, name='admin_appointments'),
    path('admin/add-doctor/', views.admin_add_doctor, name='admin_add_doctor'),
    
    # ========== PROFILE ==========
    path('patient-profile/', views.get_patient_profile, name='patient_profile'),
    path('delete-avatar/', views.delete_avatar, name='delete_avatar'),
    
    # ========== AVAILABILITY ==========
    path('booked-slots/', views.get_booked_slots, name='booked_slots'),
    path('doctor-availability/', views.doctor_availability, name='doctor_availability'),
    path('doctor-availability/<int:id>/', views.delete_doctor_availability, name='delete_doctor_availability'),
    
    # ========== REPORTS ==========
    path('reports/patient/', views.get_patient_reports, name='patient_reports'),
    path('reports/doctor/', views.get_doctor_reports, name='doctor_reports'),
    path('reports/pending/', views.get_pending_reports, name='pending_reports'),
    path('reports/create/', views.create_report, name='create_report'),
    path('reports/<int:id>/', views.get_report, name='get_report'),
    path('reports/<int:id>/update/', views.update_report, name='update_report'),
    path('reports/<int:id>/delete/', views.delete_report, name='delete_report'),
    path('reports/<int:id>/download/', views.download_report_pdf, name='download_report_pdf'),

    # Add these to urlpatterns
    path('send-reset-otp/', views.send_reset_otp, name='send_reset_otp'),
    path('verify-reset-otp/', views.verify_reset_otp, name='verify_reset_otp'),
    path('reset-password/', views.reset_password, name='reset_password'),

    path('reports/mark-viewed/', views.mark_report_viewed, name='mark_report_viewed'),
    path('reports/with-status/', views.get_patient_reports_with_status, name='reports_with_status'),
    path('reports/unviewed-count/', views.get_unviewed_reports_count, name='unviewed_reports_count'),
]