import os
import google.generativeai as genai
from dotenv import load_dotenv
from datetime import datetime, timedelta
from django.db.models import Q
from api.models import Doctor, Appointment
from django.contrib.auth.models import User
import re

load_dotenv()

# 🔥 3 API Keys - Round Robin Support
API_KEYS = [
    'AQ.Ab8RN6JSUlpNLRZ2pTMjx34c02WkYU97HK_5X1Q9vMzloV12EQ',  # Key 1
    'AQ.Ab8RN6Lm5SpIXnQVAmAG6hB38Irz18Y2VZeF42uKwJEvXIHViw',  # Key 2
    'AQ.Ab8RN6JcuFqI7qZM1qowHWloMWlJo_ac21d0jEwhacsvYMQHNQ',  # Key 3
]

current_key_index = 0

def get_next_api_key():
    """Get next API key (Round Robin)"""
    global current_key_index
    key = API_KEYS[current_key_index]
    current_key_index = (current_key_index + 1) % len(API_KEYS)
    print(f"🔄 Using API Key {current_key_index + 1}/{len(API_KEYS)}")
    return key

print(f"✅ {len(API_KEYS)} API Keys loaded successfully")

def detect_language(text):
    """Detect if text is Hindi, English, or Hinglish"""
    hindi_chars = set('अआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह')
    hindi_count = sum(1 for char in text if char in hindi_chars)
    if hindi_count > len(text) * 0.1:
        return 'hindi'
    elif any(word in text.lower() for word in ['hai', 'hain', 'hoon', 'hum', 'aap', 'kya', 'kaise', 'nahi', 'hoga', 'sakta', 'chahiye', 'mera', 'tera', 'uska', 'iska']):
        return 'hinglish'
    else:
        return 'english'

def convert_to_12hr(time_str):
    try:
        if 'AM' in str(time_str) or 'PM' in str(time_str):
            return str(time_str)
        if not time_str:
            return "N/A"
        time_str = str(time_str).strip()
        if ':' not in time_str:
            return time_str
        hours, minutes = time_str.split(':')
        hours = int(hours)
        minutes = int(minutes)
        ampm = 'AM' if hours < 12 else 'PM'
        hour12 = hours % 12
        if hour12 == 0:
            hour12 = 12
        return f"{hour12:02d}:{minutes:02d} {ampm}"
    except Exception as e:
        print(f"Error converting time {time_str}: {e}")
        return str(time_str)

def get_doctors_list():
    try:
        doctors = Doctor.objects.filter(is_doctor=True).values(
            'id', 'name', 'specialization', 'fee', 'experience', 'email', 'phone'
        )
        print(f"✅ Total doctors: {doctors.count()}")
        if doctors.count() == 0:
            print("⚠️ No doctors found in database")
            return []
        return list(doctors)
    except Exception as e:
        print(f"❌ Error in get_doctors_list: {e}")
        return []

def get_doctors_by_specialty(specialty_name):
    try:
        doctors = Doctor.objects.filter(
            is_doctor=True,
            specialization__icontains=specialty_name
        ).values('id', 'name', 'specialization', 'fee', 'experience', 'email', 'phone')
        return list(doctors)
    except Exception as e:
        print(f"❌ Error in get_doctors_by_specialty: {e}")
        return []

def get_patient_appointments(patient_email):
    try:
        user = User.objects.filter(email=patient_email).first()
        if not user:
            return None, "User not found"
        appointments = Appointment.objects.filter(
            user=user
        ).select_related('doctor').order_by('-date', '-time')
        print(f"✅ Found {appointments.count()} appointments for {patient_email}")
        return list(appointments), None
    except Exception as e:
        print(f"❌ Error in get_patient_appointments: {e}")
        return None, str(e)

def get_patient_info(patient_email):
    try:
        user = User.objects.filter(email=patient_email).first()
        if not user:
            return None, "User not found"
        return {
            'name': user.get_full_name() or user.username,
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name
        }, None
    except Exception as e:
        return None, str(e)

def get_todays_appointments():
    try:
        today = datetime.now().date()
        appointments = Appointment.objects.filter(
            date=today
        ).select_related('doctor')
        return list(appointments)
    except Exception as e:
        print(f"Error fetching today's appointments: {e}")
        return []

def get_upcoming_appointments(patient_email):
    try:
        user = User.objects.filter(email=patient_email).first()
        if not user:
            return None, "User not found"
        today = datetime.now().date()
        appointments = Appointment.objects.filter(
            user=user,
            date__gte=today,
            status__in=['pending', 'confirmed']
        ).select_related('doctor').order_by('date', 'time')
        print(f"✅ Found {appointments.count()} upcoming appointments for {patient_email}")
        return list(appointments), None
    except Exception as e:
        print(f"❌ Error in get_upcoming_appointments: {e}")
        return None, str(e)

def get_doctor_availability(doctor_name, date=None):
    try:
        if not date:
            date = datetime.now().date().isoformat()
        doctor = Doctor.objects.filter(name__icontains=doctor_name).first()
        if not doctor:
            return None, "Doctor not found"
        appointments = Appointment.objects.filter(
            doctor=doctor,
            date=date,
            status__in=['pending', 'confirmed']
        ).values('time')
        booked_slots = [apt['time'] for apt in appointments]
        available_slots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]
        available = [slot for slot in available_slots if slot not in booked_slots]
        return {
            'doctor': doctor.name,
            'date': date,
            'available_slots': available,
            'booked_slots': booked_slots,
            'is_available': len(available) > 0
        }, None
    except Exception as e:
        return None, str(e)

def get_todays_available_doctors():
    try:
        today = datetime.now().date().isoformat()
        all_doctors = get_doctors_list()
        available_doctors = []
        for doc in all_doctors:
            availability, _ = get_doctor_availability(doc['name'], today)
            if availability and availability['is_available']:
                available_doctors.append(doc)
        return available_doctors
    except Exception as e:
        print(f"Error getting today's available doctors: {e}")
        return []

def get_doctor_by_name(doctor_name):
    try:
        doctor = Doctor.objects.filter(
            name__icontains=doctor_name,
            is_doctor=True
        ).values('id', 'name', 'specialization', 'fee', 'experience', 'email', 'phone').first()
        return doctor
    except Exception as e:
        print(f"Error getting doctor: {e}")
        return None

def extract_doctor_name(user_message, doctors):
    user_message_lower = user_message.lower().strip()
    
    user_message_clean = user_message_lower
    for prefix in ['dr. ', 'dr ', 'doctor ', 'dr,', 'dr.', 'dr', 'डॉ. ', 'डॉ ', 'डॉक्टर ', 'डाक्टर ']:
        user_message_clean = user_message_clean.replace(prefix, '')
    user_message_clean = user_message_clean.strip()
    
    print(f"🔍 Extracting doctor from: {user_message_lower}")
    print(f"🔍 Clean message: {user_message_clean}")
    
    for doc in doctors:
        doc_name_lower = doc['name'].lower()
        doc_name_clean = doc_name_lower.replace('dr.', '').replace('dr ', '').replace('डॉ.', '').replace('डॉ ', '').strip()
        
        if doc_name_lower == user_message_lower or doc_name_lower in user_message_lower:
            print(f"✅ Found: {doc['name']} (exact match)")
            return doc['name']
        
        if doc_name_clean == user_message_clean or doc_name_clean in user_message_clean:
            print(f"✅ Found: {doc['name']} (clean match)")
            return doc['name']
        
        doc_parts = doc_name_clean.split()
        for part in doc_parts:
            if len(part) > 2 and part in user_message_clean:
                print(f"✅ Found: {doc['name']} (part match: {part})")
                return doc['name']
    
    print(f"❌ No doctor found in: {user_message}")
    return None

def extract_specialty(user_message):
    specialties = [
        'dentist', 'dentistry', 'dental', 'cardiology', 'cardiologist', 'heart',
        'neurology', 'neurologist', 'brain', 'pediatrics', 'pediatrician', 'child',
        'orthopedics', 'orthopedic', 'orthopaedics', 'bone', 'joint',
        'dermatology', 'dermatologist', 'skin', 'psychiatry', 'psychiatrist', 'mental',
        'therapist', 'therapy', 'eye', 'ophthalmology', 'ophthalmologist',
        'gynecology', 'gynecologist', 'women', 'emergency', 'critical care',
        'general physician', 'gp', 'family medicine', 'internal medicine'
    ]
    
    user_message_lower = user_message.lower()
    for specialty in specialties:
        if specialty in user_message_lower:
            return specialty
    return None

def get_gemini_response(user_message, patient_email=None):
    try:
        user_message_lower = user_message.lower()
        language = detect_language(user_message)
        
        # ========================================
        # RULE: Today's Available Doctors Count
        # ========================================
        if any(keyword in user_message_lower for keyword in ['kitne doctor', 'how many doctors', 'available doctors today', 'doctor available today', 'aaj kitne doctor']):
            doctors = get_todays_available_doctors()
            total_doctors = len(doctors)
            
            if total_doctors == 0:
                if language == 'hindi':
                    return "⚠️ आज कोई डॉक्टर उपलब्ध नहीं है। कृपया कल चेक करें।"
                elif language == 'hinglish':
                    return "⚠️ Aaj koi doctor available nahi hai. Kal check karein."
                else:
                    return "⚠️ No doctors are available today. Please check tomorrow."
            
            doctor_list = []
            for doc in doctors[:5]:
                doctor_list.append(f"🩺 Dr. {doc['name']} - {doc['specialization']}")
            
            if language == 'hindi':
                return f"📋 **आज {total_doctors} डॉक्टर उपलब्ध हैं**\n\n" + "\n".join(doctor_list) + (f"\n\n*और {total_doctors - 5} डॉक्टर*" if total_doctors > 5 else "") + "\n\n💡 क्या आप किसी से अपॉइंटमेंट बुक करना चाहेंगे?"
            elif language == 'hinglish':
                return f"📋 **Aaj {total_doctors} doctor available hain**\n\n" + "\n".join(doctor_list) + (f"\n\n*Aur {total_doctors - 5} doctor*" if total_doctors > 5 else "") + "\n\n💡 Kya aap kisi se appointment book karna chahenge?"
            else:
                return f"📋 **{total_doctors} doctors available today**\n\n" + "\n".join(doctor_list) + (f"\n\n*And {total_doctors - 5} more doctors*" if total_doctors > 5 else "") + "\n\n💡 Would you like to book an appointment with any of them?"

        # ========================================
        # RULE: Specific Doctor Availability Check
        # ========================================
        doctor_availability_patterns = [
            'dr available', 'available hai', 'available today', 'doctor available',
            'available for today', 'is dr', 'is doctor', 'available now',
            'डॉक्टर उपलब्ध', 'available hain', 'available hai kya'
        ]
        
        if any(pattern in user_message_lower for pattern in doctor_availability_patterns) and any(doc['name'].lower() in user_message_lower for doc in get_doctors_list()):
            doctors = get_doctors_list()
            doctor_name = extract_doctor_name(user_message, doctors)
            
            if doctor_name:
                today = datetime.now().date().isoformat()
                availability, error = get_doctor_availability(doctor_name, today)
                
                if error:
                    if language == 'hindi':
                        return f"❌ Error: {error}"
                    elif language == 'hinglish':
                        return f"❌ Error: {error}"
                    else:
                        return f"❌ Error: {error}"
                
                doctor = get_doctor_by_name(doctor_name)
                
                if availability['is_available']:
                    slots_12hr = [convert_to_12hr(slot) for slot in availability['available_slots']]
                    slots = ", ".join(slots_12hr)
                    
                    if language == 'hindi':
                        return f"✅ **Dr. {doctor_name}** आज उपलब्ध हैं!\n\n🩺 **विशेषज्ञता:** {doctor['specialization'] if doctor else 'N/A'}\n💰 **फीस:** ₹{doctor['fee'] if doctor else 'N/A'}\n⏰ **उपलब्ध समय:** {slots}\n\n💡 क्या आप अपॉइंटमेंट बुक करना चाहेंगे?"
                    elif language == 'hinglish':
                        return f"✅ **Dr. {doctor_name}** aaj available hain!\n\n🩺 **Specialization:** {doctor['specialization'] if doctor else 'N/A'}\n💰 **Fee:** ₹{doctor['fee'] if doctor else 'N/A'}\n⏰ **Available slots:** {slots}\n\n💡 Kya aap appointment book karna chahenge?"
                    else:
                        return f"✅ **Dr. {doctor_name}** is available today!\n\n🩺 **Specialization:** {doctor['specialization'] if doctor else 'N/A'}\n💰 **Fee:** ₹{doctor['fee'] if doctor else 'N/A'}\n⏰ **Available slots:** {slots}\n\n💡 Would you like to book an appointment?"
                else:
                    if language == 'hindi':
                        return f"❌ **Dr. {doctor_name}** आज उपलब्ध नहीं हैं।\n\n💡 कृपया दूसरी तारीख चेक करें या किसी अन्य डॉक्टर से बुक करें।"
                    elif language == 'hinglish':
                        return f"❌ **Dr. {doctor_name}** aaj available nahi hain.\n\n💡 Kripya doosri date check karein ya kisi aur doctor se book karein."
                    else:
                        return f"❌ **Dr. {doctor_name}** is not available today.\n\n💡 Please check another date or book with another doctor."

        # ========================================
        # RULE: Doctor by Specialty with Full Details
        # ========================================
        specialty_keywords = [
            'dentist doctor', 'dentist list', 'dental doctor', 'cardiology doctor',
            'neurology doctor', 'pediatrics doctor', 'orthopedics doctor',
            'dermatology doctor', 'psychiatry doctor', 'therapist doctor',
            'skin specialist', 'heart specialist', 'brain specialist',
            'child specialist', 'bone specialist', 'mental health doctor',
            'eye specialist', 'gynecology doctor', 'women specialist',
            'best doctor for', 'acha doctor', 'good doctor'
        ]
        
        if any(keyword in user_message_lower for keyword in specialty_keywords) or extract_specialty(user_message):
            specialty = extract_specialty(user_message)
            if not specialty:
                for keyword in specialty_keywords:
                    if keyword in user_message_lower:
                        specialty = keyword.replace('doctor', '').replace('list', '').replace('specialist', '').replace('speciality', '').replace('best', '').replace('for', '').replace('acha', '').replace('good', '').strip()
                        break
            
            if specialty:
                doctors = get_doctors_by_specialty(specialty)
                
                if not doctors:
                    if language == 'hindi':
                        return f"🔍 **{specialty.title()}** विशेषज्ञ नहीं मिले।\n\n⚠️ अभी कोई {specialty} डॉक्टर उपलब्ध नहीं है।\n\n💡 कृपया 'Doctor list' कहकर सभी डॉक्टर देखें।"
                    elif language == 'hinglish':
                        return f"🔍 **{specialty.title()}** specialist nahi mile.\n\n⚠️ Abhi koi {specialty} doctor available nahi hai.\n\n💡 Kripya 'Doctor list' keh kar sabhi doctor dekhein."
                    else:
                        return f"🔍 **{specialty.title()}** specialists not found.\n\n⚠️ No {specialty} doctors available currently.\n\n💡 Please say 'Doctor list' to see all doctors."
                
                doctor_list = []
                for doc in doctors:
                    doctor_list.append(
                        f"🩺 Dr. {doc['name']}\n   📌 {doc['specialization']}\n   💰 ₹{doc['fee']}\n   📅 {doc['experience']} years\n   📧 {doc['email']}\n   📞 {doc['phone'] or 'N/A'}"
                    )
                
                if language == 'hindi':
                    return f"📋 **{specialty.title()} विशेषज्ञ ({len(doctors)} मिले)**\n\n" + "\n\n".join(doctor_list) + "\n\n💡 क्या आप इनमें से किसी के साथ बुक करना चाहेंगे? **'Dr. [name] se book karo'** कहें।"
                elif language == 'hinglish':
                    return f"📋 **{specialty.title()} specialists ({len(doctors)} mile)**\n\n" + "\n\n".join(doctor_list) + "\n\n💡 Kya aap inme se kisi ke saath book karna chahenge? **'Dr. [name] se book karo'** kahein."
                else:
                    return f"📋 **{specialty.title()} Specialists ({len(doctors)} found)**\n\n" + "\n\n".join(doctor_list) + "\n\n💡 Would you like to book with any of them? Say **'Book with Dr. [name]'**"

        # ========================================
        # RULE: Personal Questions
        # ========================================
        personal_keywords = [
            'how are you', 'kaise ho', 'kya haal hai', 'how are you doing',
            'aap kaise ho', 'aap kaha se ho', 'where are you from',
            'aap kaha rehte ho', 'where do you live', 'your location',
            'aap ka naam kya hai', 'what is your name', 'aap kon ho',
            'who are you', 'what can you do', 'aap kya kar sakte ho',
            'are you real', 'real doctor', 'ai ho', 'kya tum real ho',
            'hyy', 'hello', 'hii', 'hi', 'hey', 'namaste', 'नमस्ते'
        ]
        
        if any(keyword in user_message_lower for keyword in personal_keywords):
            patient_info, _ = get_patient_info(patient_email) if patient_email else (None, None)
            name = patient_info['name'] if patient_info else ""
            
            if 'how are you' in user_message_lower or 'kaise ho' in user_message_lower or 'kya haal' in user_message_lower:
                if language == 'hindi':
                    return f"नमस्ते {name}! मैं बहुत अच्छा हूँ, पूछने के लिए धन्यवाद! 😊\n\nमैं MediBot हूँ, आपका हेल्थकेयर असिस्टेंट। आज मैं आपकी क्या मदद कर सकता हूँ?"
                elif language == 'hinglish':
                    return f"Namaste {name}! Main bahut acha hoon, poochhne ke liye dhanyavaad! 😊\n\nMain MediBot hoon, aapka healthcare assistant. Aaj main aapki kya madad kar sakta hoon?"
                else:
                    return f"Hello {name}! I'm doing great, thank you for asking! 😊\n\nI'm MediBot, your healthcare assistant. How can I help you today?"
            
            elif 'where are you from' in user_message_lower or 'aap kaha se ho' in user_message_lower or 'aap kaha rehte ho' in user_message_lower:
                if language == 'hindi':
                    return "मैं डिजिटल दुनिया से हूँ! 🌐\n\nमैं एक हेल्थकेयर AI असिस्टेंट हूँ, जो आपको अपॉइंटमेंट, डॉक्टर की जानकारी और स्वास्थ्य संबंधी सवालों में मदद करने के लिए बनाया गया है। मैं 24/7 आपके ऐप में उपलब्ध हूँ!"
                elif language == 'hinglish':
                    return "Main digital duniya se hoon! 🌐\n\nMain ek healthcare AI assistant hoon, jo aapko appointment, doctor ki jaankari aur health-related sawalon mein madad karne ke liye banaya gaya hai. Main 24/7 aapke app mein available hoon!"
                else:
                    return "I'm from the digital world! 🌐\n\nI'm a healthcare AI assistant created to help you with appointments, doctor information, and health-related queries. I'm available 24/7 right here in your app!"
            
            elif 'what is your name' in user_message_lower or 'aap ka naam kya hai' in user_message_lower or 'aap kon ho' in user_message_lower:
                if language == 'hindi':
                    return "मेरा नाम MediBot है 🤖\n\nमैं आपका AI हेल्थकेयर असिस्टेंट हूँ। मैं आपकी मदद कर सकता हूँ:\n- 📅 अपॉइंटमेंट बुक करने में\n- 📋 आपके अपॉइंटमेंट देखने में\n- 🩺 विशेषज्ञता के अनुसार डॉक्टर खोजने में\n- 💰 डॉक्टर की फीस चेक करने में\n- ❓ स्वास्थ्य संबंधी सवालों के जवाब देने में"
                elif language == 'hinglish':
                    return "Mera naam MediBot hai 🤖\n\nMain aapka AI healthcare assistant hoon. Main aapki madad kar sakta hoon:\n- 📅 Appointment book karne mein\n- 📋 Aapke appointments dekhne mein\n- 🩺 Specialization ke hisaab se doctor dhoondhne mein\n- 💰 Doctor ki fee check karne mein\n- ❓ Health-related sawalon ke jawab dene mein"
                else:
                    return "My name is MediBot 🤖\n\nI'm your AI healthcare assistant. I'm here to help you with:\n- 📅 Booking appointments\n- 📋 Viewing your appointments\n- 🩺 Finding doctors by specialty\n- 💰 Checking doctor fees\n- ❓ Answering health-related questions"
            
            elif 'hyy' in user_message_lower or 'hello' in user_message_lower or 'hii' in user_message_lower or 'hi' in user_message_lower or 'hey' in user_message_lower or 'namaste' in user_message_lower or 'नमस्ते' in user_message_lower:
                if language == 'hindi':
                    return f"नमस्ते {name}! 👋\n\nमैं MediBot हूँ, आपका AI हेल्थकेयर असिस्टेंट।\n\nमैं आपकी कैसे मदद कर सकता हूँ?\n💡 आप मुझसे पूछ सकते हैं:\n• 🩺 डॉक्टर की सूची\n• 📅 अपॉइंटमेंट बुक करना\n• 📋 मेरे अपॉइंटमेंट\n• 💰 डॉक्टर की फीस"
                elif language == 'hinglish':
                    return f"Namaste {name}! 👋\n\nMain MediBot hoon, aapka AI healthcare assistant.\n\nMain aapki kaise madad kar sakta hoon?\n💡 Aap mujhse poochh sakte hain:\n• 🩺 Doctor ki list\n• 📅 Appointment book karna\n• 📋 Mere appointments\n• 💰 Doctor ki fee"
                else:
                    return f"Hi {name}! 👋\n\nI'm MediBot, your AI healthcare assistant.\n\nHow can I help you today?\n💡 You can ask me about:\n• 🩺 List of doctors\n• 📅 Booking appointments\n• 📋 My appointments\n• 💰 Doctor fees"
            
            else:
                if language == 'hindi':
                    return f"नमस्ते {name}! 👋\n\nमैं MediBot हूँ, आपका AI हेल्थकेयर असिस्टेंट। मैं आपकी सभी हेल्थकेयर जरूरतों में मदद करने के लिए यहाँ हूँ। मुझसे कुछ भी पूछने में संकोच न करें!"
                elif language == 'hinglish':
                    return f"Namaste {name}! 👋\n\nMain MediBot hoon, aapka AI healthcare assistant. Main aapki sabhi healthcare zarooraton mein madad karne ke liye yahan hoon. Mujhse kuch bhi poochhne mein sankoch na karein!"
                else:
                    return f"Hi there {name}! 👋\n\nI'm MediBot, your AI healthcare assistant. I'm here to help you with all your healthcare needs. Feel free to ask me anything!"

        # ========================================
        # RULE: Best Doctor for Disease
        # ========================================
        best_doctor_keywords = [
            'best doctor for', 'best doctor', 'best specialist', 'best doctor in',
            'best doctor for', 'acha doctor', 'good doctor', 'recommended doctor',
            'accha doctor', 'best treatment', 'best care'
        ]
        
        if any(keyword in user_message_lower for keyword in best_doctor_keywords):
            disease_match = re.search(r'for\s+([a-zA-Z\s]+)', user_message_lower)
            if disease_match:
                disease = disease_match.group(1).strip()
            else:
                disease = user_message_lower.replace('best doctor', '').replace('best specialist', '').replace('acha doctor', '').replace('good doctor', '').strip()
            
            if disease:
                specialty_map = {
                    'heart': 'Cardiology', 'chest': 'Cardiology', 'cardiac': 'Cardiology',
                    'brain': 'Neurology', 'nerve': 'Neurology', 'headache': 'Neurology',
                    'child': 'Pediatrics', 'baby': 'Pediatrics', 'kid': 'Pediatrics',
                    'bone': 'Orthopedics', 'joint': 'Orthopedics', 'fracture': 'Orthopedics',
                    'skin': 'Dermatology', 'hair': 'Dermatology', 'rash': 'Dermatology',
                    'mental': 'Psychiatry', 'depression': 'Psychiatry', 'anxiety': 'Psychiatry',
                    'eye': 'Ophthalmology', 'vision': 'Ophthalmology',
                    'women': 'Gynecology', 'pregnancy': 'Gynecology',
                    'tooth': 'Dentist', 'dental': 'Dentist', 'gum': 'Dentist'
                }
                
                specialty = None
                for key, value in specialty_map.items():
                    if key in disease:
                        specialty = value
                        break
                
                if specialty:
                    doctors = get_doctors_by_specialty(specialty)
                    if doctors:
                        if language == 'hindi':
                            return f"🩺 **{disease.title()}** के लिए सबसे अच्छे डॉक्टर:\n\n" + "\n".join([f"• Dr. {doc['name']} - {doc['specialization']} (₹{doc['fee']})" for doc in doctors[:3]]) + f"\n\n💡 ये {specialty} विशेषज्ञ हैं। क्या आप इनमें से किसी के साथ बुक करना चाहेंगे?"
                        elif language == 'hinglish':
                            return f"🩺 **{disease.title()}** ke liye best doctor:\n\n" + "\n".join([f"• Dr. {doc['name']} - {doc['specialization']} (₹{doc['fee']})" for doc in doctors[:3]]) + f"\n\n💡 Ye {specialty} specialists hain. Kya aap inme se kisi ke saath book karna chahenge?"
                        else:
                            return f"🩺 **Best doctors for {disease.title()}**:\n\n" + "\n".join([f"• Dr. {doc['name']} - {doc['specialization']} (₹{doc['fee']})" for doc in doctors[:3]]) + f"\n\n💡 These are {specialty} specialists. Would you like to book with any of them?"
                
                # Fallback: search in all doctors
                doctors = get_doctors_list()
                matched_doctors = []
                for doc in doctors:
                    if disease in doc['specialization'].lower() or any(word in doc['specialization'].lower() for word in disease.split()):
                        matched_doctors.append(doc)
                
                if matched_doctors:
                    if language == 'hindi':
                        return f"🩺 **{disease.title()}** के लिए डॉक्टर:\n\n" + "\n".join([f"• Dr. {doc['name']} - {doc['specialization']} (₹{doc['fee']})" for doc in matched_doctors[:3]]) + "\n\n💡 क्या आप इनमें से किसी के साथ बुक करना चाहेंगे?"
                    elif language == 'hinglish':
                        return f"🩺 **{disease.title()}** ke liye doctor:\n\n" + "\n".join([f"• Dr. {doc['name']} - {doc['specialization']} (₹{doc['fee']})" for doc in matched_doctors[:3]]) + "\n\n💡 Kya aap inme se kisi ke saath book karna chahenge?"
                    else:
                        return f"🩺 **Doctors for {disease.title()}**:\n\n" + "\n".join([f"• Dr. {doc['name']} - {doc['specialization']} (₹{doc['fee']})" for doc in matched_doctors[:3]]) + "\n\n💡 Would you like to book with any of them?"

        # ========================================
        # RULE: Appointment Check (Today + Upcoming)
        # ========================================
        appointment_check_keywords = [
            'today my appointment', 'today appointment', 'any appointment today',
            'do i have appointment', 'is there any appointment', 'appointment today',
            'my appointment today', 'check my appointment', 'today any appointment',
            'upcoming appointment', 'future appointment', 'any appointment',
            'do i have any appointment', 'have any appointment',
            'आज मेरा अपॉइंटमेंट', 'आज अपॉइंटमेंट है क्या', 'मेरा अपॉइंटमेंट',
            'कोई अपॉइंटमेंट है', 'आने वाला अपॉइंटमेंट', 'अपकमिंग अपॉइंटमेंट',
            'आज का अपॉइंटमेंट', 'मेरा कोई अपॉइंटमेंट है',
            'मुझे कोई अपॉइंटमेंट है', 'अपॉइंटमेंट चेक करो',
            'aaj mera appointment', 'aaj appointment hai kya', 'mera appointment',
            'koi appointment hai', 'aane wale din appointment', 'aane wala appointment',
            'aaj ka appointment', 'mera koi appointment hai',
            'mujhe koi appointment hai', 'appointment check karo',
            'aaj ya aane wale dino me mera koi appointment hai kya'
        ]
        
        if any(keyword in user_message_lower for keyword in appointment_check_keywords):
            if not patient_email:
                if language == 'hindi':
                    return "🔒 कृपया पहले लॉगिन करें।\n\n🔒 Please login first to check your appointments."
                elif language == 'hinglish':
                    return "🔒 Kripya pehle login karein.\n\n🔒 Please login first to check your appointments."
                else:
                    return "🔒 Please login first to check your appointments."
            
            patient_info, error = get_patient_info(patient_email)
            if error:
                return f"Error: {error}"
            
            appointments, error = get_patient_appointments(patient_email)
            if error:
                return f"Error: {error}"
            
            today = datetime.now().date()
            today_appointments = [apt for apt in appointments if apt.date == today]
            upcoming_appointments = [apt for apt in appointments if apt.date > today and apt.status in ['pending', 'confirmed']]
            
            if language == 'hindi':
                response_parts = [f"👋 **नमस्ते {patient_info['name']}!**", "---"]
                if today_appointments:
                    response_parts.append(f"📅 **आज के अपॉइंटमेंट**")
                    for apt in today_appointments:
                        response_parts.append(f"   ⏰ {convert_to_12hr(apt.time)} | 👨‍⚕️ Dr. {apt.doctor.name} | 📌 {apt.status}")
                else:
                    response_parts.append("📅 **आज:** ❌ कोई अपॉइंटमेंट नहीं")
                if upcoming_appointments:
                    response_parts.append(f"\n📅 **आने वाले अपॉइंटमेंट**")
                    for apt in upcoming_appointments[:5]:
                        response_parts.append(f"   📆 {apt.date} | ⏰ {convert_to_12hr(apt.time)} | 👨‍⚕️ Dr. {apt.doctor.name} | 📌 {apt.status}")
                else:
                    response_parts.append("\n📅 **आने वाले:** ❌ कोई अपॉइंटमेंट नहीं")
                response_parts.append(f"\n📊 **कुल:** {len(today_appointments) + len(upcoming_appointments)} (आज: {len(today_appointments)}, आने वाले: {len(upcoming_appointments)})")
                return "\n".join(response_parts)
            
            elif language == 'hinglish':
                response_parts = [f"👋 **Namaste {patient_info['name']}!**", "---"]
                if today_appointments:
                    response_parts.append(f"📅 **Aaj ke appointments**")
                    for apt in today_appointments:
                        response_parts.append(f"   ⏰ {convert_to_12hr(apt.time)} | 👨‍⚕️ Dr. {apt.doctor.name} | 📌 {apt.status}")
                else:
                    response_parts.append("📅 **Aaj:** ❌ Koi appointment nahi")
                if upcoming_appointments:
                    response_parts.append(f"\n📅 **Aane wale appointments**")
                    for apt in upcoming_appointments[:5]:
                        response_parts.append(f"   📆 {apt.date} | ⏰ {convert_to_12hr(apt.time)} | 👨‍⚕️ Dr. {apt.doctor.name} | 📌 {apt.status}")
                else:
                    response_parts.append("\n📅 **Aane wale:** ❌ Koi appointment nahi")
                response_parts.append(f"\n📊 **Total:** {len(today_appointments) + len(upcoming_appointments)} (Aaj: {len(today_appointments)}, Aane wale: {len(upcoming_appointments)})")
                return "\n".join(response_parts)
            
            else:
                response_parts = [f"👋 **Hello {patient_info['name']}!**", "---"]
                if today_appointments:
                    response_parts.append(f"📅 **Today's Appointments**")
                    for apt in today_appointments:
                        response_parts.append(f"   ⏰ {convert_to_12hr(apt.time)} | 👨‍⚕️ Dr. {apt.doctor.name} | 📌 {apt.status}")
                else:
                    response_parts.append("📅 **Today:** ❌ No appointments")
                if upcoming_appointments:
                    response_parts.append(f"\n📅 **Upcoming Appointments**")
                    for apt in upcoming_appointments[:5]:
                        response_parts.append(f"   📆 {apt.date} | ⏰ {convert_to_12hr(apt.time)} | 👨‍⚕️ Dr. {apt.doctor.name} | 📌 {apt.status}")
                else:
                    response_parts.append("\n📅 **Upcoming:** ❌ No appointments")
                response_parts.append(f"\n📊 **Total:** {len(today_appointments) + len(upcoming_appointments)} (Today: {len(today_appointments)}, Upcoming: {len(upcoming_appointments)})")
                return "\n".join(response_parts)

        # ========================================
        # RULE 1: Book Appointment
        # ========================================
        booking_keywords = [
            'book appointment', 'schedule appointment', 'new appointment', 'book with', 'appointment with',
            'i want to book', 'want to book', 'need appointment', 'make appointment', 'book a appointment',
            'book an appointment', 'appointment book', 'book appointment for', 'appointment with dr',
            'अपॉइंटमेंट बुक करें', 'अपॉइंटमेंट', 'बुक करें', 'नया अपॉइंटमेंट',
            'मुझे अपॉइंटमेंट चाहिए', 'अपॉइंटमेंट लेना है', 'डॉक्टर से मिलना है',
            'बुक करवाना है', 'अपॉइंटमेंट करवाना है',
            'appointment book karo', 'appointment karna hai', 'book karna hai',
            'doctor se milna hai', 'checkup karna hai', 'dikhaana hai',
            'dr.', 'dr ', 'doctor', 'डॉ.', 'डॉ ',
            'kl', 'kal', 'tomorrow', 'aaj', 'today', 'कल', 'आज'
        ]
        
        if any(keyword in user_message_lower for keyword in booking_keywords):
            print(f"🔍 Book/Doctor request: {user_message}")
            
            doctors = get_doctors_list()
            if not doctors:
                if language == 'hindi':
                    return "⚠️ अभी कोई डॉक्टर उपलब्ध नहीं है। कृपया बाद में चेक करें।"
                elif language == 'hinglish':
                    return "⚠️ Abhi koi doctor available nahi hai. Kripya baad mein check karein."
                else:
                    return "⚠️ No doctors are currently available. Please check back later."
            
            tomorrow_date = None
            date_display_text = "today"
            
            if any(keyword in user_message_lower for keyword in ['kl', 'kal', 'tomorrow', 'कल']):
                tomorrow = datetime.now().date() + timedelta(days=1)
                tomorrow_date = tomorrow.isoformat()
                date_display_text = "kal" if language != 'english' else "tomorrow"
            
            if any(keyword in user_message_lower for keyword in ['aaj', 'today', 'आज']):
                tomorrow_date = None
                date_display_text = "aaj" if language != 'english' else "today"
            
            date_match = re.search(r'(\d{4}-\d{2}-\d{2})', user_message)
            if date_match:
                tomorrow_date = date_match.group(1)
                date_display_text = date_match.group(1)
            
            is_just_doctor_name = any(doc['name'].lower() in user_message_lower for doc in doctors)
            
            if is_just_doctor_name or any(keyword in user_message_lower for keyword in ['dr.', 'dr ', 'doctor', 'डॉ.', 'डॉ ', 'डॉक्टर']):
                doctor_name = extract_doctor_name(user_message, doctors)
                
                if doctor_name:
                    doctor = None
                    for doc in doctors:
                        if doc['name'] == doctor_name:
                            doctor = doc
                            break
                    
                    check_date = tomorrow_date if tomorrow_date else datetime.now().date().isoformat()
                    
                    availability, error = get_doctor_availability(doctor_name, check_date)
                    if error:
                        return f"Error: {error}"
                    
                    if availability['is_available']:
                        slots_12hr = []
                        for slot in availability['available_slots']:
                            slots_12hr.append(convert_to_12hr(slot))
                        slots = ", ".join(slots_12hr)
                        
                        if language == 'hindi':
                            return f"""✅ Dr. **{doctor_name}** {date_display_text} ke liye available hain!

🩺 **विशेषज्ञता:** {doctor['specialization']}
💰 **फीस:** ₹{doctor['fee']}
⏰ **उपलब्ध समय:** {slots}

💡 क्या आप अपॉइंटमेंट बुक करना चाहेंगे? बस अपना पसंदीदा समय बताएं!
Example: **'Book at 10:00 AM'** या **'सुबह 10 बजे'**"""
                        elif language == 'hinglish':
                            return f"""✅ Dr. **{doctor_name}** {date_display_text} ke liye available hain!

🩺 **Specialization:** {doctor['specialization']}
💰 **Fee:** ₹{doctor['fee']}
⏰ **Available slots:** {slots}

💡 Kya aap appointment book karna chahenge? Bas apna preferred time bataayein!
Example: **'Book at 10:00 AM'** ya **'Subah 10 baje'**"""
                        else:
                            return f"""✅ Dr. **{doctor_name}** is available {date_display_text}!

🩺 **Specialization:** {doctor['specialization']}
💰 **Fee:** ₹{doctor['fee']}
⏰ **Available slots:** {slots}

💡 Would you like to book an appointment? Just tell me your preferred time!
Example: **'Book at 10:00 AM'**"""
                    else:
                        if language == 'hindi':
                            return f"""❌ Dr. **{doctor_name}** {date_display_text} के लिए पूरी तरह बुक हैं।

💡 क्या आप दूसरी तारीख चेक करना चाहेंगे?
Example: **'Check availability on 2026-06-23'**"""
                        elif language == 'hinglish':
                            return f"""❌ Dr. **{doctor_name}** {date_display_text} ke liye puri tarah booked hain.

💡 Kya aap doosri date check karna chahenge?
Example: **'Check availability on 2026-06-23'**"""
                        else:
                            return f"""❌ Dr. **{doctor_name}** is fully booked {date_display_text}.

💡 Would you like to check another date?
Example: **'Check availability on 2026-06-23'**"""
                else:
                    doctor_list = []
                    for doc in doctors:
                        doctor_list.append(
                            f"• Dr. {doc['name']} - {doc['specialization']} (₹{doc['fee']})"
                        )
                    if language == 'hindi':
                        return f"""📋 **उपलब्ध डॉक्टर**

{chr(10).join(doctor_list)}

💡 कृपया बताएं कि आप किस डॉक्टर से बुक करवाना चाहते हैं!
Example: **'Dr. Mahadev se book karo'**"""
                    elif language == 'hinglish':
                        return f"""📋 **Available Doctors**

{chr(10).join(doctor_list)}

💡 Kripya bataayein ki aap kis doctor se book karwana chahte hain!
Example: **'Dr. Mahadev se book karo'**"""
                    else:
                        return f"""📋 **Available Doctors**

{chr(10).join(doctor_list)}

💡 Please tell me which doctor you want to book with!
Example: **'Book with Dr. Mahadev'**"""
            else:
                doctor_list = []
                for doc in doctors:
                    doctor_list.append(
                        f"• Dr. {doc['name']} - {doc['specialization']} (₹{doc['fee']})"
                    )
                if language == 'hindi':
                    return f"""📋 **उपलब्ध डॉक्टर**

{chr(10).join(doctor_list)}

💡 कृपया बताएं कि आप किस डॉक्टर से बुक करवाना चाहते हैं!
Example: **'Dr. Mahadev se book karo'**"""
                elif language == 'hinglish':
                    return f"""📋 **Available Doctors**

{chr(10).join(doctor_list)}

💡 Kripya bataayein ki aap kis doctor se book karwana chahte hain!
Example: **'Dr. Mahadev se book karo'**"""
                else:
                    return f"""📋 **Available Doctors**

{chr(10).join(doctor_list)}

💡 Please tell me which doctor you want to book with!
Example: **'Book with Dr. Mahadev'**"""

        # ========================================
        # RULE: Doctor List (Default)
        # ========================================
        if any(keyword in user_message_lower for keyword in ['doctor list', 'show doctors', 'list of doctors', 'available doctors', 'all doctors', 'doctors', 'डॉक्टर लिस्ट', 'डॉक्टर दिखाओ', 'सभी डॉक्टर', 'doctor ki list', 'doctor dikhao', 'sab doctor']):
            doctors = get_doctors_list()
            if not doctors:
                if language == 'hindi':
                    return "⚠️ अभी कोई डॉक्टर उपलब्ध नहीं है।"
                elif language == 'hinglish':
                    return "⚠️ Abhi koi doctor available nahi hai."
                else:
                    return "⚠️ No doctors are currently available."
            
            doctor_list = []
            for doc in doctors:
                doctor_list.append(
                    f"🩺 Dr. {doc['name']} - {doc['specialization']} (₹{doc['fee']}) - {doc['experience']} years"
                )
            
            if language == 'hindi':
                return f"""📋 **उपलब्ध डॉक्टर**

{chr(10).join(doctor_list)}

💡 क्या आप इनमें से किसी डॉक्टर से अपॉइंटमेंट बुक करना चाहेंगे?"""
            elif language == 'hinglish':
                return f"""📋 **Available Doctors**

{chr(10).join(doctor_list)}

💡 Kya aap inme se kisi doctor se appointment book karna chahenge?"""
            else:
                return f"""📋 **Available Doctors**

{chr(10).join(doctor_list)}

💡 Would you like to book an appointment with any of them?"""

        # ========================================
        # RULE: My Appointments
        # ========================================
        if any(keyword in user_message_lower for keyword in ['my appointments', 'show appointments', 'my booking', 'appointments list', 'मेरे अपॉइंटमेंट', 'मेरी बुकिंग', 'meri appointment', 'mera appointment']):
            if not patient_email:
                if language == 'hindi':
                    return "🔒 कृपया पहले लॉगिन करें।"
                elif language == 'hinglish':
                    return "🔒 Kripya pehle login karein."
                else:
                    return "🔒 Please login first to view your appointments."
            
            appointments, error = get_patient_appointments(patient_email)
            if error:
                return f"Error: {error}"
            
            if not appointments:
                if language == 'hindi':
                    return "📋 आपका कोई अपॉइंटमेंट नहीं है। क्या आप नया बुक करना चाहेंगे?"
                elif language == 'hinglish':
                    return "📋 Aapka koi appointment nahi hai. Kya aap naya book karna chahenge?"
                else:
                    return "📋 You don't have any appointments yet. Would you like to book one?"
            
            appointment_list = []
            for idx, apt in enumerate(appointments[:10], 1):
                time_12hr = convert_to_12hr(apt.time)
                appointment_list.append(
                    f"{idx}. 📅 **{apt.date}** | ⏰ {time_12hr} | 👨‍⚕️ Dr. {apt.doctor.name} | 📌 {apt.status}"
                )
            
            total = len(appointments)
            if language == 'hindi':
                response = f"📋 **आपके अपॉइंटमेंट** ({total} total)\n\n"
                response += "\n".join(appointment_list)
                if total > 10:
                    response += f"\n\n*Showing 10 of {total} appointments*"
                response += "\n\n💡 नया अपॉइंटमेंट बुक करने के लिए कहें **'Book appointment'**!"
                return response
            elif language == 'hinglish':
                response = f"📋 **Aapke Appointments** ({total} total)\n\n"
                response += "\n".join(appointment_list)
                if total > 10:
                    response += f"\n\n*Showing 10 of {total} appointments*"
                response += "\n\n💡 Naya appointment book karne ke liye kahein **'Book appointment'**!"
                return response
            else:
                response = f"📋 **Your Appointments** ({total} total)\n\n"
                response += "\n".join(appointment_list)
                if total > 10:
                    response += f"\n\n*Showing 10 of {total} appointments*"
                response += "\n\n💡 To book a new appointment, say **'Book appointment'**!"
                return response

        # ========================================
        # RULE: Next Appointment
        # ========================================
        if any(keyword in user_message_lower for keyword in ['next appointment', 'upcoming appointment', 'when is my appointment', 'अगला अपॉइंटमेंट', 'आने वाला अपॉइंटमेंट', 'agla appointment']):
            if not patient_email:
                if language == 'hindi':
                    return "🔒 कृपया पहले लॉगिन करें।"
                elif language == 'hinglish':
                    return "🔒 Kripya pehle login karein."
                else:
                    return "🔒 Please login first to view your appointments."
            
            appointments, error = get_patient_appointments(patient_email)
            if error:
                return f"Error: {error}"
            
            if not appointments:
                if language == 'hindi':
                    return "📋 आपका कोई अपकमिंग अपॉइंटमेंट नहीं है।"
                elif language == 'hinglish':
                    return "📋 Aapka koi upcoming appointment nahi hai."
                else:
                    return "📋 You don't have any upcoming appointments."
            
            today = datetime.now().date()
            upcoming = [apt for apt in appointments if apt.date >= today and apt.status in ['pending', 'confirmed']]
            
            if not upcoming:
                if language == 'hindi':
                    return "📋 आपका कोई अपकमिंग अपॉइंटमेंट नहीं है।"
                elif language == 'hinglish':
                    return "📋 Aapka koi upcoming appointment nahi hai."
                else:
                    return "📋 You don't have any upcoming appointments."
            
            next_apt = upcoming[0]
            time_12hr = convert_to_12hr(next_apt.time)
            
            if language == 'hindi':
                return f"""📅 **आपका अगला अपॉइंटमेंट**

📅 **तारीख:** {next_apt.date}
⏰ **समय:** {time_12hr}
👨‍⚕️ **डॉक्टर:** Dr. {next_apt.doctor.name}
📌 **स्थिति:** {next_apt.status}"""
            elif language == 'hinglish':
                return f"""📅 **Aapka Agla Appointment**

📅 **Date:** {next_apt.date}
⏰ **Time:** {time_12hr}
👨‍⚕️ **Doctor:** Dr. {next_apt.doctor.name}
📌 **Status:** {next_apt.status}"""
            else:
                return f"""📅 **Your Next Appointment**

📅 **Date:** {next_apt.date}
⏰ **Time:** {time_12hr}
👨‍⚕️ **Doctor:** Dr. {next_apt.doctor.name}
📌 **Status:** {next_apt.status}"""

        # ========================================
        # RULE: Doctor Availability
        # ========================================
        if any(keyword in user_message_lower for keyword in ['is doctor available', 'availability', 'free slot', 'booked', 'डॉक्टर उपलब्ध है', 'doctor available hai']):
            doctors = get_doctors_list()
            if not doctors:
                if language == 'hindi':
                    return "⚠️ कोई डॉक्टर उपलब्ध नहीं है।"
                elif language == 'hinglish':
                    return "⚠️ Koi doctor available nahi hai."
                else:
                    return "⚠️ No doctors available."
            
            doctor_name = extract_doctor_name(user_message, doctors)
            if doctor_name:
                availability, error = get_doctor_availability(doctor_name)
                if error:
                    return f"Error: {error}"
                if availability['is_available']:
                    slots_12hr = [convert_to_12hr(slot) for slot in availability['available_slots']]
                    slots = ", ".join(slots_12hr)
                    if language == 'hindi':
                        return f"✅ Dr. **{doctor_name}** उपलब्ध हैं!\n\n⏰ **उपलब्ध समय:** {slots}"
                    elif language == 'hinglish':
                        return f"✅ Dr. **{doctor_name}** available hain!\n\n⏰ **Available slots:** {slots}"
                    else:
                        return f"✅ Dr. **{doctor_name}** is available!\n\n⏰ **Available slots:** {slots}"
                else:
                    if language == 'hindi':
                        return f"❌ Dr. **{doctor_name}** आज पूरी तरह बुक हैं।"
                    elif language == 'hinglish':
                        return f"❌ Dr. **{doctor_name}** aaj puri tarah booked hain."
                    else:
                        return f"❌ Dr. **{doctor_name}** is fully booked today."
            else:
                if language == 'hindi':
                    return "🔍 कृपया बताएं कि आप किस डॉक्टर की उपलब्धता चेक करना चाहते हैं।"
                elif language == 'hinglish':
                    return "🔍 Kripya bataayein ki aap kis doctor ki availability check karna chahte hain."
                else:
                    return "🔍 Please tell me which doctor's availability you want to check."

        # ========================================
        # RULE: Doctor Fee/Info
        # ========================================
        if any(keyword in user_message_lower for keyword in ['doctor fee', 'consultation fee', 'doctor charges', 'how much', 'डॉक्टर फीस', 'fee kitna hai']):
            doctors = get_doctors_list()
            doctor_name = extract_doctor_name(user_message, doctors)
            if doctor_name:
                for doc in doctors:
                    if doc['name'].lower() == doctor_name.lower():
                        if language == 'hindi':
                            return f"""💰 **Dr. {doc['name']}**

🩺 **विशेषज्ञता:** {doc['specialization']}
💰 **फीस:** ₹{doc['fee']}
📅 **अनुभव:** {doc['experience']} years"""
                        elif language == 'hinglish':
                            return f"""💰 **Dr. {doc['name']}**

🩺 **Specialization:** {doc['specialization']}
💰 **Fee:** ₹{doc['fee']}
📅 **Experience:** {doc['experience']} years"""
                        else:
                            return f"""💰 **Dr. {doc['name']}**

🩺 **Specialization:** {doc['specialization']}
💰 **Fee:** ₹{doc['fee']}
📅 **Experience:** {doc['experience']} years"""
            else:
                if language == 'hindi':
                    return "🔍 कृपया बताएं कि आप किस डॉक्टर की फीस जानना चाहते हैं।"
                elif language == 'hinglish':
                    return "🔍 Kripya bataayein ki aap kis doctor ki fee janna chahte hain."
                else:
                    return "🔍 Which doctor's fee would you like to know?"

        # ========================================
        # RULE: Default - Gemini AI (Multi-Language)
        # ========================================
        else:
            try:
                # 🔥 Round Robin: Next API key use karo
                active_key = get_next_api_key()
                genai.configure(api_key=active_key)
                model = genai.GenerativeModel('gemini-2.5-flash')
                
                patient_info = None
                if patient_email:
                    patient_info, _ = get_patient_info(patient_email)
                patient_name = patient_info['name'] if patient_info else ""
                
                # 🔥 Multi-Language Prompt
                enhanced_prompt = f"""User Message: {user_message}
Patient Name: {patient_name}
Patient Email: {patient_email}
Detected Language: {language}

🔥 IMPORTANT: Respond in the EXACT SAME language as the user!

LANGUAGE RULES:
- If user wrote in HINDI (Devanagari script) → Respond in HINDI (Devanagari script)
- If user wrote in HINGLISH (Roman script with Hindi words) → Respond in HINGLISH (Roman script)
- If user wrote in ENGLISH → Respond in ENGLISH

EXAMPLES:
- User: "kaise ho" → Hinglish: "Main theek hoon! Aap kaise ho?"
- User: "नमस्ते" → Hindi: "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?"
- User: "Hello" → English: "Hello! How can I help you?"

ABOUT YOU:
- You are MediBot - a healthcare AI assistant
- Be helpful, professional, empathetic
- Add medical disclaimer when giving health advice
- Suggest booking appointments when relevant
- Keep responses friendly and conversational
- Use patient name if available

DISCLAIMER: You are an AI assistant, not a real doctor. Always advise consulting a qualified healthcare professional for medical concerns.

RESPOND ONLY IN: {language} language

User said: {user_message}"""
                
                response = model.generate_content(enhanced_prompt)
                
                # 🔥 Response language double-check
                response_text = response.text
                return response_text
                
            except Exception as e:
                error_str = str(e)
                if '429' in error_str or 'quota' in error_str.lower():
                    # 🔥 Multi-language quota exceeded message
                    if language == 'hindi':
                        return """⚠️ **आज का फ्री कोटा खत्म हो गया है!**

🔹 आप आज 20 बार chatbot use kar chuke hain.
🔹 **कल सुबह** फिर से try karein (मिडनाइट के बाद रीसेट होगा)।
🔹 या फिर **Google Cloud Billing** enable karke paid plan use karein.

💡 ये commands अभी भी काम करती हैं:
   - 📋 Doctor list
   - 📅 My appointments  
   - 📌 Next appointment
   - ✅ Doctor availability"""
                    elif language == 'hinglish':
                        return """⚠️ **Aaj ka free quota khatam ho gaya hai!**

🔹 Aap aaj 20 baar chatbot use kar chuke hain.
🔹 **Kal subah** phir se try karein (midnight ke baad reset hoga).
🔹 Ya phir **Google Cloud Billing** enable karke paid plan use karein.

💡 Ye commands abhi bhi kaam karti hain:
   - 📋 Doctor list
   - 📅 My appointments  
   - 📌 Next appointment
   - ✅ Doctor availability"""
                    else:
                        return """⚠️ **Today's free quota exceeded!**

🔹 You've used 20 free requests today.
🔹 Try again **tomorrow** (resets at midnight).
🔹 Or enable **Google Cloud Billing** for higher limits.

💡 These commands still work:
   - 📋 Doctor list
   - 📅 My appointments  
   - 📌 Next appointment
   - ✅ Doctor availability"""
                elif '401' in error_str or 'invalid' in error_str.lower():
                    # 🔥 API Key invalid - try next key
                    try:
                        active_key = get_next_api_key()
                        genai.configure(api_key=active_key)
                        model = genai.GenerativeModel('gemini-2.5-flash')
                        response = model.generate_content(enhanced_prompt)
                        return response.text
                    except:
                        if language == 'hindi':
                            return "❌ सभी API keys काम नहीं कर रही हैं। कृपया .env फ़ाइल में नई API key डालें।"
                        elif language == 'hinglish':
                            return "❌ Sabhi API keys kaam nahi kar rahi hain. Kripya .env file mein nayi API key daalein."
                        else:
                            return "❌ All API keys are not working. Please add new API keys in .env file."
                else:
                    if language == 'hindi':
                        return f"❌ Error: {error_str}"
                    elif language == 'hinglish':
                        return f"❌ Error: {error_str}"
                    else:
                        return f"❌ Error: {error_str}"
            
    except Exception as e:
        print(f"❌ Error in get_gemini_response: {e}")
        language = detect_language(user_message) if 'user_message' in locals() else 'english'
        if language == 'hindi':
            return f"❌ Error: {str(e)}"
        elif language == 'hinglish':
            return f"❌ Error: {str(e)}"
        else:
            return f"❌ Error: {str(e)}"