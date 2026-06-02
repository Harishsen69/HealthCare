from django.contrib import admin
from .models import Doctor, Appointment, OTP, UserProfile, Notification, DoctorAvailability, MedicalReport

class DoctorAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'specialization', 'is_doctor', 'fee', 'available']
    search_fields = ['name', 'specialization', 'email']
    list_filter = ['specialization', 'available', 'is_doctor']
    fields = ['name', 'email', 'specialization', 'experience', 'rating', 'location', 
              'fee', 'available', 'image', 'patients', 'education', 'languages', 
              'about', 'is_doctor']

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'doctor', 'date', 'time', 'status', 'created_at']
    search_fields = ['user__username', 'doctor__name']
    list_filter = ['status', 'date']

@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = ['report_number', 'patient', 'doctor', 'report_type', 'created_at', 'is_final']
    search_fields = ['report_number', 'patient__username', 'doctor__name', 'diagnosis']
    list_filter = ['report_type', 'is_final', 'created_at']
    readonly_fields = ['report_number', 'created_at', 'updated_at']
    fields = ['report_number', 'appointment', 'patient', 'doctor', 'report_type',
              'diagnosis', 'symptoms', 'medicines', 'tests_recommended', 'doctor_notes',
              'follow_up_required', 'follow_up_date', 'pdf_file', 'is_final', 'created_at', 'updated_at']

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['email', 'otp', 'user_type', 'created_at', 'is_verified']
    list_filter = ['user_type', 'is_verified']

# ========== UPDATED USER PROFILE ADMIN (Fixed - Removed old fields) ==========
@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone', 'gender', 'dob', 'blood_group', 'father_name', 'mother_name']
    search_fields = ['user__username', 'user__email', 'phone', 'father_name', 'mother_name']
    list_filter = ['gender', 'blood_group']
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'avatar', 'phone', 'address', 'dob', 'blood_group', 'gender')
        }),
        ('Family Information', {
            'fields': ('father_name', 'mother_name')
        }),
    )

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['user__username', 'title']

@admin.register(DoctorAvailability)
class DoctorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'date', 'start_time', 'end_time', 'is_available']
    list_filter = ['is_available', 'date']
    search_fields = ['doctor__name']

admin.site.register(Doctor, DoctorAdmin)