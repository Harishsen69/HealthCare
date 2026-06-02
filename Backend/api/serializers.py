from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Doctor, Appointment, UserProfile, MedicalReport, DoctorAvailability

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'phone', 'address']

    def create(self, validated_data):
        phone = validated_data.pop('phone', '')
        address = validated_data.pop('address', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        UserProfile.objects.create(user=user, phone=phone, address=address)
        return user

class DoctorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    doctor_specialty = serializers.ReadOnlyField(source='doctor.specialization')
    doctor_fee = serializers.ReadOnlyField(source='doctor.fee')
    
    class Meta:
        model = Appointment
        fields = ['id', 'doctor', 'doctor_name', 'doctor_specialty', 'doctor_fee',
                  'patient_name', 'patient_email', 'patient_phone', 'date', 'time', 'status', 'created_at']
        read_only_fields = ['id', 'created_at']

class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    user_type = serializers.CharField(max_length=20)

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    user_type = serializers.CharField(max_length=20)

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ['id', 'doctor', 'date', 'start_time', 'end_time', 'break_start', 'break_end', 'is_available']
        read_only_fields = ['id', 'created_at']

class MedicalReportSerializer(serializers.ModelSerializer):
    patient_name = serializers.ReadOnlyField(source='patient.get_full_name')
    patient_email = serializers.ReadOnlyField(source='patient.email')
    doctor_name = serializers.ReadOnlyField(source='doctor.name')
    doctor_specialization = serializers.ReadOnlyField(source='doctor.specialization')
    appointment_date = serializers.ReadOnlyField(source='appointment.date')
    appointment_time = serializers.ReadOnlyField(source='appointment.time')
    
    class Meta:
        model = MedicalReport
        fields = '__all__'
        read_only_fields = ['id', 'report_number', 'created_at', 'updated_at']

# ========== USER PROFILE SERIALIZER (NEW) ==========
class UserProfileSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = ['id', 'phone', 'address', 'dob', 'blood_group', 'gender', 
                  'father_name', 'mother_name', 'age']
    
    def get_age(self, obj):
        return obj.get_age()