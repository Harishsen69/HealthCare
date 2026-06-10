from django.db import models
from django.contrib.auth.models import User
import random
import string
from datetime import datetime, date

class Doctor(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    specialization = models.CharField(max_length=100)
    experience = models.CharField(max_length=20, default='0')
    fee = models.DecimalField(max_digits=10, decimal_places=2)
    about = models.TextField(blank=True)
    education = models.CharField(max_length=200, blank=True)
    languages = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=100, blank=True)
    rating = models.FloatField(default=0.0)
    patients = models.IntegerField(default=0)
    available = models.BooleanField(default=True)
    is_doctor = models.BooleanField(default=True)
    image = models.ImageField(upload_to='doctors/', null=True, blank=True)

    def __str__(self):
        return self.name

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    patient_name = models.CharField(max_length=200, blank=True)
    patient_email = models.EmailField(blank=True)
    patient_phone = models.CharField(max_length=20, blank=True)
    date = models.DateField()
    time = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.doctor.name} - {self.date}"

class OTP(models.Model):
    USER_TYPE_CHOICES = [
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('admin', 'Admin'),
        ('reset', 'Password Reset'),
    ]
    
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='patient')
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    
    def generate_otp(self):
        self.otp = ''.join(random.choices(string.digits, k=6))
        return self.otp
    
    def __str__(self):
        return f"{self.email} - {self.otp} - {self.user_type}"

class UserProfile(models.Model):
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'),
        ('B+', 'B+'), ('B-', 'B-'),
        ('O+', 'O+'), ('O-', 'O-'),
        ('AB+', 'AB+'), ('AB-', 'AB-'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    father_name = models.CharField(max_length=200, null=True, blank=True)
    mother_name = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def get_age(self):
        if self.dob:
            dob_value = self.dob
            if isinstance(dob_value, str):
                try:
                    from datetime import datetime
                    dob_value = datetime.strptime(dob_value, '%Y-%m-%d').date()
                except:
                    return None
            
            today = date.today()
            return today.year - dob_value.year - ((today.month, today.day) < (dob_value.month, dob_value.day))
        return None
    
    def __str__(self):
        return f"{self.user.email}'s profile"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    appointment_id = models.IntegerField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email}: {self.title}"

class DoctorAvailability(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='availabilities')
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['doctor', 'date']

    def __str__(self):
        return f"{self.doctor.name} - {self.date}"

class MedicalReport(models.Model):
    REPORT_TYPES = [
        ('prescription', 'Prescription'),
        ('discharge', 'Discharge Summary'),
        ('lab_report', 'Lab Report'),
        ('other', 'Other'),
    ]
    
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='medical_report')
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_as_patient')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='reports_as_doctor')
    
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES, default='prescription')
    report_number = models.CharField(max_length=50, unique=True, blank=True)
    
    diagnosis = models.TextField()
    symptoms = models.TextField(blank=True)
    medicines = models.TextField(blank=True)
    tests_recommended = models.TextField(blank=True)
    doctor_notes = models.TextField(blank=True)
    
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)
    
    pdf_file = models.FileField(upload_to='reports/pdf/', null=True, blank=True)
    
    is_final = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.report_number:
            year = datetime.now().year
            random_str = ''.join(random.choices(string.digits, k=6))
            self.report_number = f"RPT/{year}/{random_str}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Report #{self.report_number} - {self.patient.username}"
    
class ViewedReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='viewed_reports')
    report = models.ForeignKey(MedicalReport, on_delete=models.CASCADE)
    viewed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'report']
    
    def __str__(self):
        return f"{self.user.email} viewed report {self.report.report_number}"