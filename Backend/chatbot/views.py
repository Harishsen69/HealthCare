from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .services import get_gemini_response
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User

@csrf_exempt
def chatbot_message(request):
    """
    Chatbot API endpoint
    """
    if request.method == 'POST':
        try:
            # User ka message lo
            data = json.loads(request.body)
            user_message = data.get('message', '')
            patient_email = data.get('patient_email', None)
            
            # 🔥 Agar frontend se email nahi aaya toh token se fetch karo
            if not patient_email:
                auth_header = request.headers.get('Authorization')
                if auth_header and auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                    try:
                        access_token = AccessToken(token)
                        user_id = access_token['user_id']
                        user = User.objects.get(id=user_id)
                        patient_email = user.email
                    except Exception as e:
                        print(f"Token error: {e}")
            
            if not user_message:
                return JsonResponse({'error': 'Message is required'}, status=400)
            
            bot_response = get_gemini_response(user_message, patient_email)
            
            return JsonResponse({
                'success': True,
                'response': bot_response
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Only POST method allowed'}, status=405)