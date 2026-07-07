from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Appointment, Doctor, DoctorProfile, PatientProfile, AdminProfile


@receiver(post_save, sender=User)
def update_appointment_patient_names(sender, instance, **kwargs):
    """
    Jab bhi User update ho, uske saare appointments mein patient_name update karo
    """
    full_name = f"{instance.first_name} {instance.last_name}".strip()
    if not full_name:
        full_name = instance.username
    
    appointments = Appointment.objects.filter(
        user=instance,
        status__in=['pending', 'confirmed', 'completed']
    )
    
    for apt in appointments:
        if apt.patient_name != full_name:
            apt.patient_name = full_name
            apt.save(update_fields=['patient_name'])


# 🔥 Doctor create hone par DoctorProfile auto-create
@receiver(post_save, sender=Doctor)
def create_doctor_profile(sender, instance, created, **kwargs):
    if created:
        DoctorProfile.objects.create(
            user=instance.user,
            doctor=instance,
            name=instance.name,
            specialization=instance.specialization,
            fee=instance.fee,
            experience=instance.experience,
            clinic_name=instance.clinic_name,
            clinic_address=instance.clinic_address,
            city=instance.city,
            state=instance.state,
            pincode=instance.pincode,
            clinic_timings=instance.clinic_timings
        )
        print(f"✅ DoctorProfile created for: {instance.name}")


# 🔥 PatientProfile create karne ka signal (jab bhi koi naya user register ho)
@receiver(post_save, sender=User)
def create_patient_profile_for_new_user(sender, instance, created, **kwargs):
    """
    Jab bhi koi naya user register ho, uske liye PatientProfile create karo
    (Agar wo doctor nahi hai aur admin nahi hai)
    """
    if created:
        # Check karo ki user doctor toh nahi hai
        is_doctor = Doctor.objects.filter(user=instance).exists()
        
        # Agar doctor nahi hai aur admin nahi hai toh patient profile banao
        if not is_doctor and not instance.is_superuser:
            PatientProfile.objects.create(
                user=instance,
                total_visits=0,
                medical_conditions='',
                allergies='',
                emergency_contact_name='',
                emergency_contact_phone='',
                emergency_contact_relation='',
                last_visit_date=None
            )
            print(f"✅ PatientProfile created for: {instance.username}")


# 🔥 Admin create hone par AdminProfile auto-create
@receiver(post_save, sender=User)
def create_admin_profile(sender, instance, created, **kwargs):
    if created and instance.is_superuser:
        AdminProfile.objects.create(
            user=instance,
            name=instance.get_full_name() or instance.username,
            email=instance.email,
            is_super_admin=True
        )
        print(f"✅ AdminProfile created for: {instance.username}")


# 🔥 Doctor update hone par DoctorProfile update
@receiver(post_save, sender=Doctor)
def update_doctor_profile(sender, instance, **kwargs):
    try:
        profile = DoctorProfile.objects.get(doctor=instance)
        profile.name = instance.name
        profile.specialization = instance.specialization
        profile.fee = instance.fee
        profile.experience = instance.experience
        profile.clinic_name = instance.clinic_name
        profile.clinic_address = instance.clinic_address
        profile.city = instance.city
        profile.state = instance.state
        profile.pincode = instance.pincode
        profile.clinic_timings = instance.clinic_timings
        profile.save()
        print(f"✅ DoctorProfile updated for: {instance.name}")
    except DoctorProfile.DoesNotExist:
        DoctorProfile.objects.create(
            user=instance.user,
            doctor=instance,
            name=instance.name,
            specialization=instance.specialization,
            fee=instance.fee,
            experience=instance.experience,
            clinic_name=instance.clinic_name,
            clinic_address=instance.clinic_address,
            city=instance.city,
            state=instance.state,
            pincode=instance.pincode,
            clinic_timings=instance.clinic_timings
        )
        print(f"✅ DoctorProfile created for: {instance.name}")


# 🔥 User update hone par PatientProfile update (agar patient hai toh)
@receiver(post_save, sender=User)
def update_patient_profile(sender, instance, **kwargs):
    """
    Jab bhi User update ho, agar wo patient hai toh PatientProfile bhi update karo
    """
    # Check karo ki user doctor toh nahi hai
    is_doctor = Doctor.objects.filter(user=instance).exists()
    
    if not is_doctor and not instance.is_superuser:
        try:
            profile = PatientProfile.objects.get(user=instance)
            # User ki basic details update karo
            profile.save()
            print(f"✅ PatientProfile updated for: {instance.username}")
        except PatientProfile.DoesNotExist:
            # Agar profile nahi hai toh create karo
            PatientProfile.objects.create(
                user=instance,
                total_visits=0,
                medical_conditions='',
                allergies='',
                emergency_contact_name='',
                emergency_contact_phone='',
                emergency_contact_relation='',
                last_visit_date=None
            )
            print(f"✅ PatientProfile created for: {instance.username}")


# 🔥 Admin update hone par AdminProfile update
@receiver(post_save, sender=User)
def update_admin_profile(sender, instance, **kwargs):
    if instance.is_superuser:
        try:
            profile = AdminProfile.objects.get(user=instance)
            profile.name = instance.get_full_name() or instance.username
            profile.email = instance.email
            profile.save()
            print(f"✅ AdminProfile updated for: {instance.username}")
        except AdminProfile.DoesNotExist:
            AdminProfile.objects.create(
                user=instance,
                name=instance.get_full_name() or instance.username,
                email=instance.email,
                is_super_admin=True
            )
            print(f"✅ AdminProfile created for: {instance.username}")