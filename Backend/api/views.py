from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta, date
from .models import Doctor, Appointment, OTP, Notification, DoctorAvailability, UserProfile, MedicalReport, ViewedReport
from .serializers import (
    UserSerializer, RegisterSerializer, DoctorSerializer,
    AppointmentSerializer, SendOTPSerializer, VerifyOTPSerializer,
    DoctorAvailabilitySerializer, MedicalReportSerializer, 
)

import json
from io import BytesIO
from django.http import HttpResponse
from django.core.files.base import ContentFile

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

# ========== HELPER FUNCTIONS ==========
def send_otp_email(email, otp, user_type):
    subject = f"MediCare - Your OTP for {user_type} Login"
    message = f"Hello,\n\nYour OTP for {user_type} login is: {otp}\n\nThis OTP is valid for 10 minutes.\n\nThanks,\nMediCare Team"
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
        return True
    except Exception:
        return False

def send_notification(user, title, message, appointment_id=None):
    if user and user.id:
        Notification.objects.create(user=user, title=title, message=message, appointment_id=appointment_id)

def detect_user_role(user):
    if user.is_superuser:
        return 'admin'
    elif Doctor.objects.filter(user=user, is_doctor=True).exists():
        return 'doctor'
    return 'patient'

def time_to_minutes(time_str):
    hours, minutes = map(int, time_str.split(':'))
    return hours * 60 + minutes

def format_to_12hr(time_str):
    if not time_str:
        return ''
    try:
        time_obj = datetime.strptime(time_str, '%H:%M')
        return time_obj.strftime('%I:%M %p').lstrip('0')
    except:
        return time_str

# ========== AUTH APIs ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def check_email(request):
    email = request.data.get('email')
    return Response({'exists': User.objects.filter(email=email).exists()})

@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    serializer = SendOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)
    
    email = serializer.validated_data['email']
    user_type = serializer.validated_data['user_type']
    
    if user_type == 'admin' and email != 'admin@gmail.com':
        return Response({'error': 'Invalid admin email'}, status=404)
    elif user_type == 'doctor' and not Doctor.objects.filter(email=email, is_doctor=True).exists():
        return Response({'error': 'Doctor not found'}, status=404)
    
    OTP.objects.filter(email=email).delete()
    otp_obj = OTP.objects.create(email=email, user_type=user_type)
    otp_obj.generate_otp()
    otp_obj.save()
    
    if send_otp_email(email, otp_obj.otp, user_type):
        return Response({'message': f'OTP sent to {email}'}, status=200)
    return Response({'error': 'Failed to send email'}, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    serializer = VerifyOTPSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)
    
    try:
        otp_obj = OTP.objects.get(
            email=serializer.validated_data['email'],
            otp=serializer.validated_data['otp'],
            user_type=serializer.validated_data['user_type'],
            is_verified=False
        )
        if timezone.now() - otp_obj.created_at > timedelta(minutes=10):
            otp_obj.delete()
            return Response({'error': 'OTP has expired'}, status=400)
        
        otp_obj.is_verified = True
        otp_obj.save()
        return Response({'message': 'OTP verified successfully!', 'verified': True, 'email': serializer.validated_data['email']}, status=200)
    except OTP.DoesNotExist:
        return Response({'error': 'Invalid OTP'}, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'User created successfully',
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username_or_email = request.data.get('username')
    password = request.data.get('password')
    user_type = request.data.get('user_type', 'auto')
    
    if not username_or_email or not password:
        return Response({'error': 'Email/username and password are required'}, status=400)
    
    user = None
    if '@' in username_or_email:
        try:
            user_obj = User.objects.get(email=username_or_email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    else:
        user = authenticate(username=username_or_email, password=password)
    
    if not user:
        return Response({'error': 'Invalid email/username or password'}, status=401)
    
    if user_type == 'auto':
        user_type = detect_user_role(user)
    else:
        if user_type == 'admin' and not user.is_superuser:
            return Response({'error': 'This is not an admin account.'}, status=401)
        elif user_type == 'doctor' and not Doctor.objects.filter(user=user, is_doctor=True).exists():
            return Response({'error': 'This is not a doctor account.'}, status=401)
        elif user_type == 'patient' and (user.is_superuser or Doctor.objects.filter(user=user, is_doctor=True).exists()):
            return Response({'error': 'Invalid role selection.'}, status=401)
    
    refresh = RefreshToken.for_user(user)
    
    # Get profile data
    profile_data = {}
    try:
        profile = UserProfile.objects.get(user=user)
        profile_data = {
            'phone': profile.phone or '',
            'address': profile.address or '',
            'state': profile.state or '',
            'dob': str(profile.dob) if profile.dob else '',
            'blood_group': profile.blood_group or '',
            'gender': profile.gender or '',
            'father_name': profile.father_name or '',
            'mother_name': profile.mother_name or '',
            'avatar': request.build_absolute_uri(profile.avatar.url) if profile.avatar else None
        }
    except UserProfile.DoesNotExist:
        pass
    
    # ✅ Create full name from first_name and last_name
    full_name = f"{user.first_name} {user.last_name}".strip()
    if not full_name:
        full_name = user.username
    
    return Response({
        'message': 'Login successful',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'name': full_name,  # ✅ This is important for display
            'user_type': user_type,
            'is_superuser': user.is_superuser,
            **profile_data
        },
        'access': str(refresh.access_token),
        'refresh': str(refresh)
    })

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email')
    try:
        user = User.objects.get(email=email)
        import secrets
        reset_token = secrets.token_urlsafe(32)
        send_mail(
            "MediCare - Password Reset Request",
            f"Click the link below to reset your password:\nhttp://localhost:3000/reset-password?token={reset_token}&email={email}",
            settings.DEFAULT_FROM_EMAIL,
            [email]
        )
        return Response({'message': 'Password reset link sent to your email'}, status=200)
    except User.DoesNotExist:
        return Response({'error': 'No account found with this email'}, status=404)

# ========== DOCTOR APIs ==========
@api_view(['GET'])
@permission_classes([AllowAny])
def get_doctors(request):
    doctors = Doctor.objects.all()
    serializer = DoctorSerializer(doctors, many=True, context={'request': request})
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_doctor(request, id):
    try:
        return Response(DoctorSerializer(Doctor.objects.get(id=id)).data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_all_appointments(request):
    try:
        doctor = Doctor.objects.get(user=request.user)
        pending = Appointment.objects.filter(doctor=doctor, status='pending').order_by('-date', '-time')
        confirmed = Appointment.objects.filter(doctor=doctor, status='confirmed').order_by('-date', '-time')
        completed = Appointment.objects.filter(doctor=doctor, status='completed').order_by('-date', '-time')
        
        return Response({
            'pending': AppointmentSerializer(pending, many=True).data,
            'confirmed': AppointmentSerializer(confirmed, many=True).data,
            'completed': AppointmentSerializer(completed, many=True).data,
            'pending_count': pending.count(),
            'unique_patients': Appointment.objects.filter(doctor=doctor).values('user').distinct().count()
        })
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def doctor_pending_count(request):
    try:
        doctor = Doctor.objects.get(user=request.user)
        pending_count = Appointment.objects.filter(doctor=doctor, status='pending').count()
        return Response({'has_pending': pending_count > 0, 'count': pending_count})
    except Doctor.DoesNotExist:
        return Response({'has_pending': False, 'count': 0})

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_appointment_status(request, id):
    try:
        appointment = Appointment.objects.get(id=id)
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=404)
    
    try:
        doctor = Doctor.objects.get(user=request.user)
        if appointment.doctor.id != doctor.id:
            return Response({'error': 'Not authorized'}, status=403)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=404)
    
    new_status = request.data.get('status')
    if new_status not in ['confirmed', 'completed', 'cancelled']:
        return Response({'error': 'Invalid status'}, status=400)
    
    if new_status == 'completed' and appointment.date > date.today():
        return Response({'error': 'Cannot complete a future appointment'}, status=400)
    
    appointment.status = new_status
    appointment.save()
    
    formatted_time = format_to_12hr(appointment.time)
    
    # Mark related notifications as read
    Notification.objects.filter(user=request.user, appointment_id=appointment.id, is_read=False).update(is_read=True)
    
    if new_status == 'confirmed':
        send_notification(appointment.user, '✅ Appointment Confirmed', f'Your appointment with Dr. {appointment.doctor.name} on {appointment.date} at {formatted_time} has been confirmed.', appointment.id)
    elif new_status == 'completed':
        send_notification(appointment.user, '🎉 Treatment Completed', f'Your treatment with Dr. {appointment.doctor.name} on {appointment.date} has been completed.', appointment.id)
    elif new_status == 'cancelled':
        send_notification(appointment.user, '❌ Appointment Cancelled', f'Your appointment with Dr. {appointment.doctor.name} on {appointment.date} at {formatted_time} has been cancelled.', appointment.id)
    
    return Response({'message': f'Appointment {new_status} successfully', 'status': appointment.status})

# ========== NOTIFICATION APIs ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    notifications = request.user.notifications.filter(is_read=False).order_by('-created_at')
    return Response([{'id': n.id, 'title': n.title, 'message': n.message, 'appointment_id': n.appointment_id, 'created_at': n.created_at, 'is_read': n.is_read} for n in notifications])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, id):
    try:
        notif = Notification.objects.get(id=id, user=request.user)
        notif.is_read = True
        notif.save()
        return Response({'message': 'Marked as read'})
    except Notification.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_appointment_from_notification(request):
    notification_id = request.data.get('notification_id')
    action = request.data.get('action')
    
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
        appointment = Appointment.objects.get(id=notification.appointment_id)
        doctor = Doctor.objects.get(user=request.user)
        
        if appointment.doctor.id != doctor.id:
            return Response({'error': 'Not authorized'}, status=403)
        
        if action == 'confirm':
            appointment.status = 'confirmed'
        elif action == 'complete':
            appointment.status = 'completed'
        elif action == 'cancel':
            appointment.status = 'cancelled'
        else:
            return Response({'error': 'Invalid action'}, status=400)
        
        appointment.save()
        notification.is_read = True
        notification.save()
        
        return Response({'message': f'Appointment {action}ed successfully'})
    except Exception:
        return Response({'error': 'Failed to process'}, status=400)

# ========== APPOINTMENT APIs (Patient) ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_appointments(request):
    return Response(AppointmentSerializer(Appointment.objects.filter(user=request.user), many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_appointment(request):
    try:
        doctor_id = request.data.get('doctor')
        date_str = request.data.get('date')
        time_str = request.data.get('time')
        patient_name = request.data.get('patient_name', '')
        patient_email = request.data.get('patient_email', '')
        patient_phone = request.data.get('patient_phone', '')
        
        if not patient_phone:
            try:
                profile = UserProfile.objects.get(user=request.user)
                if profile.phone:
                    patient_phone = profile.phone
            except:
                pass
        
        doctor = Doctor.objects.get(id=doctor_id)
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        today = datetime.now().date()
        
        if selected_date < today:
            return Response({'error': 'Cannot book appointment for a past date.'}, status=400)
        
        if selected_date == today:
            now = datetime.now()
            time_parts = time_str.split(':')
            selected_minutes = int(time_parts[0]) * 60 + int(time_parts[1])
            current_minutes = now.hour * 60 + now.minute
            if selected_minutes <= current_minutes:
                return Response({'error': f'Cannot book appointment at {format_to_12hr(time_str)}. Please select a future time.'}, status=400)
            if selected_minutes - current_minutes < 60:
                return Response({'error': f'Please book appointment at least 1 hour in advance.'}, status=400)
        
        if selected_date > today + timedelta(days=30):
            return Response({'error': 'Cannot book appointment more than 30 days in advance.'}, status=400)
        
        # Check conflicts
        if Appointment.objects.filter(user=request.user, date=date_str, time=time_str).exclude(status='cancelled').exists():
            return Response({'error': f'You already have an appointment on {date_str} at {format_to_12hr(time_str)}'}, status=400)
        
        if Appointment.objects.filter(user=request.user, doctor=doctor, date=date_str).exclude(status='cancelled').count() >= 2:
            return Response({'error': f'You can only book maximum 2 appointments per day with Dr. {doctor.name}'}, status=400)
        
        # ✅ Changed: 2 hours → 1 hour gap
        for existing in Appointment.objects.filter(user=request.user, date=date_str).exclude(status='cancelled'):
            if abs(time_to_minutes(time_str) - time_to_minutes(existing.time)) < 60:  # 1 hour
                return Response({'error': f'Please maintain at least 1 hour gap between appointments'}, status=400)
        
        if Appointment.objects.filter(user=request.user, date=date_str).exclude(status='cancelled').count() >= 3:
            return Response({'error': f'You cannot book more than 3 appointments in a single day'}, status=400)
        
        appointment = Appointment.objects.create(
            user=request.user, doctor=doctor, date=date_str, time=time_str,
            status='pending', patient_name=patient_name, patient_email=patient_email, patient_phone=patient_phone
        )
        
        send_notification(doctor.user, '📅 New Appointment Request', f'New appointment booked by {patient_name} on {date_str} at {format_to_12hr(time_str)}', appointment.id)
        
        return Response({'message': 'Appointment booked successfully', 'appointment': {'id': appointment.id, 'doctor_name': doctor.name, 'date': appointment.date, 'time': format_to_12hr(appointment.time), 'status': appointment.status}}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def cancel_appointment(request, id):
    try:
        appointment = Appointment.objects.get(id=id, user=request.user)
        appointment.status = 'cancelled'
        appointment.save()
        send_notification(appointment.doctor.user, '❌ Appointment Cancelled', f'Appointment on {appointment.date} at {format_to_12hr(appointment.time)} has been cancelled by patient', appointment.id)
        return Response({'message': 'Appointment cancelled successfully'})
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=404)

# ========== ADMIN APIs ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_all_users(request):
    if not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=403)
    return Response(UserSerializer(User.objects.all(), many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_all_doctors(request):
    if not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=403)
    return Response(DoctorSerializer(Doctor.objects.all(), many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_all_appointments(request):
    if not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=403)
    return Response(AppointmentSerializer(Appointment.objects.all(), many=True).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_add_doctor(request):
    if not request.user.is_superuser:
        return Response({'error': 'Admin access required'}, status=403)
    
    try:
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')
        phone = request.data.get('phone', '')
        specialization = request.data.get('specialization', '')
        experience = request.data.get('experience', '0')
        fee = request.data.get('fee', 0)
        image = request.FILES.get('image')  # ✅ Get image file
        
        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, status=400)
        
        username = email.split('@')[0]
        # Create username that is unique
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User.objects.create_user(
            username=username, 
            email=email, 
            password=password, 
            first_name=name.split()[0] if ' ' in name else name, 
            last_name=name.split()[1] if len(name.split()) > 1 else ''
        )
        doctor = Doctor.objects.create(
            user=user, 
            name=name, 
            email=email, 
            phone=phone, 
            specialization=specialization, 
            experience=experience, 
            fee=fee, 
            is_doctor=True
        )
        
        # ✅ Save image if provided
        if image:
            # Validate image type
            allowed_types = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
            if image.content_type not in allowed_types:
                return Response({'error': 'Invalid image type. Only JPEG, PNG, GIF allowed'}, status=400)
            
            # Validate image size (max 5MB)
            if image.size > 5 * 1024 * 1024:
                return Response({'error': 'Image size should be less than 5MB'}, status=400)
            
            doctor.image = image
            doctor.save()
        
        return Response({
            'message': 'Doctor added successfully', 
            'doctor': {
                'id': doctor.id, 
                'name': doctor.name, 
                'email': doctor.email, 
                'specialization': doctor.specialization, 
                'phone': doctor.phone, 
                'fee': doctor.fee,
                'image': doctor.image.url if doctor.image else None
            }
        }, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

# ========== PROFILE APIs ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    return Response(UserSerializer(request.user).data)

# ========== PROFILE APIs ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    return Response(UserSerializer(request.user).data)

# ========== UPDATE USER PROFILE ==========
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    user = request.user
    data = request.data
    profile, _ = UserProfile.objects.get_or_create(user=user)
    
    print("=" * 50)
    print("Received data:", data)
    print("=" * 50)
    
    # Handle full_name - split into first_name and last_name
    if 'full_name' in data and data['full_name']:
        name_parts = data['full_name'].strip().split(' ', 1)
        user.first_name = name_parts[0]
        user.last_name = name_parts[1] if len(name_parts) > 1 else ''
        print(f"Name split: first_name={user.first_name}, last_name={user.last_name}")
    
    # Update Profile fields
    try:
        if 'phone' in data:
            profile.phone = data['phone']
        if 'address' in data:
            profile.address = data['address']
        if 'state' in data:
            profile.state = data['state']
            print(f"Setting state: {data['state']}")
        if 'dob' in data and data['dob']:
            profile.dob = data['dob']
        if 'blood_group' in data:
            profile.blood_group = data['blood_group']
        if 'gender' in data:
            profile.gender = data['gender']
        if 'father_name' in data:
            profile.father_name = data['father_name']
        if 'mother_name' in data:
            profile.mother_name = data['mother_name']
        
        user.save()
        profile.save()
        print("✅ Profile saved successfully!")
        
    except Exception as e:
        print(f"❌ Error saving profile: {e}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)
    
    return Response({
        'message': 'Profile updated successfully',
        'user': {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'phone': profile.phone or '',
            'address': profile.address or '',
            'state': profile.state or '',
            'dob': str(profile.dob) if profile.dob else '',
            'blood_group': profile.blood_group or '',
            'gender': profile.gender or '',
            'father_name': profile.father_name or '',
            'mother_name': profile.mother_name or '',
            'age': profile.get_age(),
        }
    })


# ========== GET PATIENT PROFILE ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_profile(request):
    try:
        profile = request.user.profile
        return Response({
            'phone': profile.phone or '',
            'address': profile.address or '',
            'state': profile.state or '',
            'dob': str(profile.dob) if profile.dob else '',
            'blood_group': profile.blood_group or '',
            'gender': profile.gender or '',
            'father_name': profile.father_name or '',
            'mother_name': profile.mother_name or '',
            'age': profile.get_age(),
        })
    except UserProfile.DoesNotExist:
        return Response({
            'phone': '', 'address': '', 'state': '', 'dob': '', 
            'blood_group': '', 'gender': '', 'father_name': '', 
            'mother_name': '', 'age': None
        })

# ========== DELETE AVATAR ==========
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_avatar(request):
    try:
        profile = request.user.profile
        if profile.avatar:
            profile.avatar.delete(save=False)
            profile.avatar = None
            profile.save()
            return Response({'message': 'Avatar deleted successfully'})
        return Response({'message': 'No avatar to delete'}, status=404)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=404)

# ========== AVAILABILITY APIs ==========
@api_view(['GET'])
@permission_classes([AllowAny])
def get_booked_slots(request):
    doctor_id = request.query_params.get('doctor_id')
    date_str = request.query_params.get('date')
    
    if not doctor_id or not date_str:
        return Response({'error': 'doctor_id and date are required'}, status=400)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor not found'}, status=404)
    
    try:
        availability = DoctorAvailability.objects.get(doctor=doctor, date=date_str)
        if not availability.is_available:
            return Response({'booked_slots': [], 'is_available': False})
    except DoctorAvailability.DoesNotExist:
        pass
    
    booked_slots = [apt.time for apt in Appointment.objects.filter(doctor=doctor, date=date_str).exclude(status='cancelled')]
    return Response({'booked_slots': booked_slots, 'is_available': True})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def doctor_availability(request):
    try:
        doctor = Doctor.objects.get(user=request.user)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=404)
    
    if request.method == 'GET':
        availabilities = DoctorAvailability.objects.filter(doctor=doctor, date__gte=date.today())
        return Response(DoctorAvailabilitySerializer(availabilities, many=True).data)
    
    elif request.method == 'POST':
        req_date = request.data.get('date')
        is_available = request.data.get('is_available', True)
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        break_start = request.data.get('break_start')
        break_end = request.data.get('break_end')
        
        if not is_available:
            start_time = end_time = break_start = break_end = None
        
        availability, _ = DoctorAvailability.objects.update_or_create(
            doctor=doctor, date=req_date,
            defaults={'start_time': start_time, 'end_time': end_time, 'break_start': break_start, 'break_end': break_end, 'is_available': is_available}
        )
        return Response({'message': 'Availability saved successfully', 'availability': DoctorAvailabilitySerializer(availability).data}, status=201)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_doctor_availability(request, id):
    try:
        doctor = Doctor.objects.get(user=request.user)
        availability = DoctorAvailability.objects.get(id=id, doctor=doctor)
        availability.delete()
        return Response({'message': 'Availability deleted successfully'})
    except:
        return Response({'error': 'Not found'}, status=404)

# ========== REPORT APIs ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_reports(request):
    reports = MedicalReport.objects.filter(patient=request.user, is_final=True).order_by('-created_at')
    return Response(MedicalReportSerializer(reports, many=True).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_doctor_reports(request):
    try:
        doctor = Doctor.objects.get(user=request.user)
        return Response(MedicalReportSerializer(MedicalReport.objects.filter(doctor=doctor).order_by('-created_at'), many=True).data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pending_reports(request):
    try:
        doctor = Doctor.objects.get(user=request.user)
        appointments = Appointment.objects.filter(doctor=doctor, status='completed').exclude(medical_report__isnull=False)
        return Response(AppointmentSerializer(appointments, many=True).data)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor profile not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_report(request):
    try:
        appointment_id = request.data.get('appointment')
        if MedicalReport.objects.filter(appointment_id=appointment_id).exists():
            return Response({'error': 'Report already exists'}, status=400)
        
        appointment = Appointment.objects.get(id=appointment_id)
        doctor = Doctor.objects.get(user=request.user)
        
        if appointment.doctor.id != doctor.id:
            return Response({'error': 'You can only create report for your own appointments'}, status=403)
        
        medicines = request.data.get('medicines', '')
        if isinstance(medicines, str) and medicines:
            try:
                medicines = json.loads(medicines)
            except:
                medicines = medicines
        
        report = MedicalReport.objects.create(
            appointment=appointment, patient=appointment.user, doctor=doctor,
            report_type=request.data.get('report_type', 'prescription'),
            diagnosis=request.data.get('diagnosis', ''),
            symptoms=request.data.get('symptoms', ''),
            medicines=json.dumps(medicines) if isinstance(medicines, list) else medicines,
            tests_recommended=request.data.get('tests_recommended', ''),
            doctor_notes=request.data.get('doctor_notes', ''),
            follow_up_required=request.data.get('follow_up_required', False),
            follow_up_date=request.data.get('follow_up_date', None),
            is_final=True
        )
        
        if REPORTLAB_AVAILABLE:
            pdf_content = generate_report_pdf(report.id)
            if pdf_content:
                report.pdf_file.save(f'report_{report.report_number}.pdf', ContentFile(pdf_content))
                report.save()
        
        send_notification(appointment.user, '📋 New Medical Report', f'Dr. {doctor.name} has added a medical report for your appointment on {appointment.date}.', appointment.id)
        return Response(MedicalReportSerializer(report).data, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_report(request, id):
    try:
        report = MedicalReport.objects.get(id=id)
        if report.patient.id != request.user.id and report.doctor.user.id != request.user.id and not request.user.is_superuser:
            return Response({'error': 'Unauthorized'}, status=403)
        return Response(MedicalReportSerializer(report).data)
    except MedicalReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=404)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_report(request, id):
    try:
        report = MedicalReport.objects.get(id=id)
        doctor = Doctor.objects.get(user=request.user)
        
        if report.doctor.id != doctor.id:
            return Response({'error': 'You can only edit your own reports'}, status=403)
        
        medicines = request.data.get('medicines', '')
        if isinstance(medicines, str) and medicines:
            try:
                medicines = json.loads(medicines)
            except:
                medicines = medicines
        
        report.report_type = request.data.get('report_type', report.report_type)
        report.diagnosis = request.data.get('diagnosis', report.diagnosis)
        report.symptoms = request.data.get('symptoms', report.symptoms)
        report.medicines = json.dumps(medicines) if isinstance(medicines, list) else medicines
        report.tests_recommended = request.data.get('tests_recommended', report.tests_recommended)
        report.doctor_notes = request.data.get('doctor_notes', report.doctor_notes)
        report.follow_up_required = request.data.get('follow_up_required', report.follow_up_required)
        report.follow_up_date = request.data.get('follow_up_date', report.follow_up_date)
        report.save()
        
        if REPORTLAB_AVAILABLE:
            pdf_content = generate_report_pdf(report.id)
            if pdf_content:
                if report.pdf_file:
                    report.pdf_file.delete()
                report.pdf_file.save(f'report_{report.report_number}.pdf', ContentFile(pdf_content))
        
        return Response(MedicalReportSerializer(report).data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_report(request, id):
    try:
        report = MedicalReport.objects.get(id=id)
        doctor = Doctor.objects.get(user=request.user)
        
        if report.doctor.id != doctor.id:
            return Response({'error': 'You can only delete your own reports'}, status=403)
        
        if report.pdf_file:
            report.pdf_file.delete()
        report.delete()
        return Response({'message': 'Report deleted successfully'})
    except Exception as e:
        return Response({'error': str(e)}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_report_pdf(request, id):
    try:
        report = MedicalReport.objects.get(id=id)
        if report.patient.id != request.user.id and report.doctor.user.id != request.user.id and not request.user.is_superuser:
            return Response({'error': 'Unauthorized'}, status=403)
        
        if report.pdf_file:
            response = HttpResponse(report.pdf_file.read(), content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="report_{report.report_number}.pdf"'
            return response
        return Response({'error': 'PDF file not found'}, status=404)
    except MedicalReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=404)

# ========== PDF GENERATION FUNCTION ==========
def generate_report_pdf(report_id):
    if not REPORTLAB_AVAILABLE:
        return None
    
    try:
        report = MedicalReport.objects.get(id=report_id)
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        
        primary_color = colors.HexColor('#1e3a5f')
        border_color = colors.HexColor('#e2e8f0')
        
        title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'], fontSize=22, textColor=primary_color, alignment=TA_CENTER, spaceAfter=8, fontName='Helvetica-Bold')
        subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#666666'), alignment=TA_CENTER, spaceAfter=3)
        section_style = ParagraphStyle('Section', parent=styles['Heading2'], fontSize=11, textColor=primary_color, spaceAfter=6, spaceBefore=8, fontName='Helvetica-Bold')
        normal_style = ParagraphStyle('Normal', parent=styles['Normal'], fontSize=9, spaceAfter=3, leading=13)
        
        story = []
        
        # Header
        story.append(Paragraph("MEDICARE HOSPITAL", title_style))
        story.append(Paragraph("123, Healthcare Avenue, Medical District, City - 400001", subtitle_style))
        story.append(Paragraph("Phone: +91-XXXXXXXXXX | Email: info@medicare.com", subtitle_style))
        story.append(Spacer(1, 0.1 * inch))
        story.append(HRFlowable(width="100%", thickness=2, color=primary_color))
        story.append(Spacer(1, 0.15 * inch))
        
        # Report Title
        report_type_display = dict(MedicalReport.REPORT_TYPES).get(report.report_type, 'Medical Report')
        story.append(Paragraph(f"{report_type_display.upper()}", section_style))
        story.append(Spacer(1, 0.05 * inch))
        
        # Info Box
        info_data = [["Report ID", report.report_number], ["Date", report.created_at.strftime('%d %B, %Y')], ["Status", "FINAL"]]
        info_table = Table(info_data, colWidths=[1.5 * inch, 4.5 * inch])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'), ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')), ('GRID', (0, 0), (-1, -1), 0.5, border_color),
            ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5), ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 0.1 * inch))
        
        # Patient & Doctor Info
        patient_name = report.patient.get_full_name() or report.patient.username
        patient_data = [["PATIENT INFORMATION", ""], ["Name", patient_name], ["Email", report.patient.email], ["Patient ID", str(report.patient.id)], ["Appointment Date", report.appointment.date], ["Time", format_to_12hr(report.appointment.time)]]
        doctor_data = [["DOCTOR INFORMATION", ""], ["Name", f"Dr. {report.doctor.name}"], ["Specialization", report.doctor.specialization], ["Qualification", "MBBS, MD"], ["Doctor ID", f"DOC-{report.doctor.id}"]]
        
        patient_table = Table(patient_data, colWidths=[1.2 * inch, 1.8 * inch])
        patient_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'), ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 0), (-1, 0), primary_color), ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 1), (-1, -1), 0.5, border_color), ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        doctor_table = Table(doctor_data, colWidths=[1.2 * inch, 1.8 * inch])
        doctor_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'), ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('BACKGROUND', (0, 0), (-1, 0), primary_color), ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 1), (-1, -1), 0.5, border_color), ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        two_col_data = [[patient_table, doctor_table]]
        two_col_table = Table(two_col_data, colWidths=[3 * inch, 3 * inch])
        two_col_table.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP')]))
        story.append(two_col_table)
        story.append(Spacer(1, 0.1 * inch))
        
        # Diagnosis
        story.append(Paragraph("DIAGNOSIS", section_style))
        story.append(Paragraph(report.diagnosis, normal_style))
        story.append(Spacer(1, 0.05 * inch))
        
        # Symptoms
        if report.symptoms:
            story.append(Paragraph("SYMPTOMS", section_style))
            story.append(Paragraph(report.symptoms, normal_style))
            story.append(Spacer(1, 0.05 * inch))
        
        # Medicines
        if report.medicines:
            story.append(Paragraph("PRESCRIBED MEDICINES", section_style))
            try:
                medicines_list = json.loads(report.medicines) if isinstance(report.medicines, str) else report.medicines
                if isinstance(medicines_list, list) and medicines_list:
                    med_table_data = [['#', 'Medicine', 'Dosage', 'Duration', 'Timing']]
                    for idx, med in enumerate(medicines_list, 1):
                        med_table_data.append([str(idx), med.get('name', '-'), med.get('dosage', '-'), med.get('duration', '-'), med.get('timing', '-')])
                    med_table = Table(med_table_data, colWidths=[0.4 * inch, 1.6 * inch, 0.9 * inch, 1.0 * inch, 1.5 * inch])
                    med_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), primary_color), ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('FONTSIZE', (0, 0), (-1, -1), 7), ('GRID', (0, 0), (-1, -1), 0.5, border_color),
                        ('TOPPADDING', (0, 0), (-1, -1), 4), ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
                    ]))
                    story.append(med_table)
                else:
                    story.append(Paragraph(report.medicines, normal_style))
            except:
                story.append(Paragraph(report.medicines, normal_style))
            story.append(Spacer(1, 0.05 * inch))
        
        # Tests & Follow-up
        if report.tests_recommended or (report.follow_up_required and report.follow_up_date):
            test_follow_data = []
            if report.tests_recommended:
                test_follow_data.append(["TESTS RECOMMENDED", report.tests_recommended])
            if report.follow_up_required and report.follow_up_date:
                test_follow_data.append(["FOLLOW-UP", f"Follow-up on: {report.follow_up_date.strftime('%d %B, %Y')}"])
            
            test_follow_table = Table(test_follow_data, colWidths=[1.5 * inch, 4.5 * inch])
            test_follow_table.setStyle(TableStyle([
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'), ('FONTSIZE', (0, 0), (-1, -1), 8),
                ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f5f9')), ('GRID', (0, 0), (-1, -1), 0.5, border_color),
                ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(test_follow_table)
            story.append(Spacer(1, 0.05 * inch))
        
        # Doctor's Notes
        if report.doctor_notes:
            story.append(Paragraph("DOCTOR'S NOTES", section_style))
            story.append(Paragraph(report.doctor_notes, normal_style))
            story.append(Spacer(1, 0.05 * inch))
        
        # Footer
        story.append(Spacer(1, 0.15 * inch))
        story.append(HRFlowable(width="100%", thickness=1, color=primary_color))
        story.append(Spacer(1, 0.05 * inch))
        story.append(Paragraph(f"Dr. {report.doctor.name}", normal_style))
        story.append(Paragraph(report.doctor.specialization, normal_style))
        story.append(Spacer(1, 0.05 * inch))
        story.append(Paragraph("This is a computer-generated document. No physical signature required.", ParagraphStyle('Footer', parent=styles['Normal'], fontSize=7, textColor=colors.HexColor('#999999'), alignment=TA_CENTER)))
        story.append(Paragraph(f"Generated on: {datetime.now().strftime('%d %B, %Y at %I:%M %p')}", ParagraphStyle('FooterDate', parent=styles['Normal'], fontSize=7, textColor=colors.HexColor('#aaaaaa'), alignment=TA_CENTER)))
        
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        print(f"PDF generation error: {e}")
        return None
    
# ========== FORGOT PASSWORD - SEND OTP ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def send_reset_otp(request):
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=400)
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'No account found with this email'}, status=404)
    
    # Delete old OTPs
    OTP.objects.filter(email=email, user_type='reset').delete()
    
    # Create new OTP
    otp_obj = OTP.objects.create(email=email, user_type='reset')
    otp_obj.generate_otp()
    otp_obj.save()
    
    # Send OTP email
    subject = "MediCare - Password Reset OTP"
    message = f"""
    Hello {user.first_name or user.username},
    
    You requested to reset your password for MediCare account.
    
    Your OTP for password reset is: {otp_obj.otp}
    
    This OTP is valid for 10 minutes.
    
    If you didn't request this, please ignore this email.
    
    Thanks,
    MediCare Team
    """
    
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
        return Response({'message': 'OTP sent successfully'}, status=200)
    except Exception as e:
        return Response({'error': 'Failed to send email'}, status=500)


# ========== VERIFY RESET OTP ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_otp(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    
    if not email or not otp:
        return Response({'error': 'Email and OTP are required'}, status=400)
    
    try:
        otp_obj = OTP.objects.get(email=email, otp=otp, user_type='reset', is_verified=False)
        
        if timezone.now() - otp_obj.created_at > timedelta(minutes=10):
            otp_obj.delete()
            return Response({'error': 'OTP has expired'}, status=400)
        
        otp_obj.is_verified = True
        otp_obj.save()
        
        return Response({'message': 'OTP verified successfully'}, status=200)
        
    except OTP.DoesNotExist:
        return Response({'error': 'Invalid OTP'}, status=400)


# ========== RESET PASSWORD ==========
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    email = request.data.get('email')
    new_password = request.data.get('new_password')
    
    if not email or not new_password:
        return Response({'error': 'Email and new password are required'}, status=400)
    
    if len(new_password) < 6:
        return Response({'error': 'Password must be at least 6 characters'}, status=400)
    
    try:
        # Check if OTP was verified
        otp_obj = OTP.objects.filter(email=email, user_type='reset', is_verified=True).first()
        
        if not otp_obj:
            return Response({'error': 'Please verify OTP first'}, status=400)
        
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        
        # Delete used OTP
        otp_obj.delete()
        
        return Response({'message': 'Password reset successfully'}, status=200)
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    
# ========== MARK REPORT AS VIEWED ==========
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_report_viewed(request):
    report_id = request.data.get('report_id')
    
    if not report_id:
        return Response({'error': 'Report ID is required'}, status=400)
    
    try:
        report = MedicalReport.objects.get(id=report_id)
    except MedicalReport.DoesNotExist:
        return Response({'error': 'Report not found'}, status=404)
    
    # Check if already viewed
    viewed, created = ViewedReport.objects.get_or_create(
        user=request.user,
        report=report
    )
    
    if created:
        return Response({'message': 'Report marked as viewed', 'viewed': True}, status=200)
    else:
        return Response({'message': 'Report already viewed', 'viewed': True}, status=200)


# ========== GET PATIENT REPORTS WITH VIEW STATUS ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_patient_reports_with_status(request):
    reports = MedicalReport.objects.filter(patient=request.user, is_final=True).order_by('-created_at')
    
    # Get all viewed report IDs for this user
    viewed_ids = ViewedReport.objects.filter(user=request.user).values_list('report_id', flat=True)
    
    reports_data = []
    for report in reports:
        reports_data.append({
            'id': report.id,
            'report_number': report.report_number,
            'report_type': report.report_type,
            'diagnosis': report.diagnosis,
            'symptoms': report.symptoms,
            'medicines': report.medicines,
            'tests_recommended': report.tests_recommended,
            'doctor_notes': report.doctor_notes,
            'follow_up_required': report.follow_up_required,
            'follow_up_date': report.follow_up_date,
            'created_at': report.created_at,
            'doctor_name': report.doctor.name,
            'doctor_specialization': report.doctor.specialization,
            'appointment_date': report.appointment.date,
            'is_viewed': report.id in viewed_ids,
        })
    
    return Response(reports_data)


# ========== GET UNVIEWED REPORTS COUNT ==========
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unviewed_reports_count(request):
    reports = MedicalReport.objects.filter(patient=request.user, is_final=True)
    viewed_ids = ViewedReport.objects.filter(user=request.user).values_list('report_id', flat=True)
    unviewed_count = reports.exclude(id__in=viewed_ids).count()
    
    return Response({'unviewed_count': unviewed_count})