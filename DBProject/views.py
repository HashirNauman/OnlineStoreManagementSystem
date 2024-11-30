from django.contrib.auth.hashers import make_password, check_password
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.sessions.models import Session
from django.contrib.auth import authenticate, login
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.shortcuts import get_object_or_404
from .models import User
import re
from django.middleware.csrf import get_token


# Helper function to validate email using Django's built-in validator
def is_valid_email(email):
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False

# CSRF Token View
def csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})

# API Root View
def api_root(request):
    return JsonResponse({
        'message': 'Welcome to the DBProject API!',
        'endpoints': {
            'login': '/api/login/',
            'signup': '/api/signup/',
            'view_users': '/api/view_users/',
            'reset_password': '/api/reset_password/',
            # Add other available endpoints here
        }
    })

# Signup View
class SignupView(APIView):
    def post(self, request):
        try:
            data = request.data
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role', 'user')  # Default to 'user' if no role is provided

            # Validation
            if not name or not email or not password:
                return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

            if not is_valid_email(email):
                return Response({'error': 'Invalid email address'}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

            if role not in dict(User.ROLE_CHOICES).keys():
                return Response({'error': 'Invalid role provided'}, status=status.HTTP_400_BAD_REQUEST)

            # Save user with hashed password
            user = User(
                name=name,
                email=email,
                password_hash=make_password(password),
                role=role  # Save the role
            )
            user.save()

            return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Login View
class LoginView(APIView):
    def post(self, request):
        try:
            data = request.data
            email = data.get('email')
            password = data.get('password')
            print(f"Email: {email}")
            print(f"Password: {password}")

            # Validation
            if not email or not password:
                return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the user based on email
            user = get_object_or_404(User, email=email)

            # Check the password against the stored hash
            if check_password(password, user.password_hash):
                # You can create a custom session for the user here
                return Response({'message': 'Login successful!'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Logout View
class LogoutView(APIView):
    def post(self, request):
        try:
            request.session.flush()  # Clear the session
            return Response({'message': 'Logged out successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Password Reset View
class ResetPasswordView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')

            if not email or not is_valid_email(email):
                return Response({'error': 'Valid email is required'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

            new_password = get_random_string(length=10)  # Generate a random new password
            user.password_hash = make_password(new_password)
            user.save()

            # Send email with the new password
            send_mail(
                'Password Reset Request',
                f'Hello {user.name},\n\nYour new password is: {new_password}\n\nPlease change it after logging in.',
                'no-reply@dbproject.com',
                [email],
                fail_silently=False,
            )

            return Response({'message': 'Password reset successfully. Check your email for the new password.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View All Users
class ViewUsers(APIView):
    def get(self, request):
        users = User.objects.all().values('id', 'name', 'email', 'phone', 'last_visited')
        return Response({'users': list(users)}, status=status.HTTP_200_OK)

# Update User
class UpdateUser(APIView):
    def put(self, request, user_id):
        try:
            data = request.data
            user = get_object_or_404(User, id=user_id)
            user.name = data.get('name', user.name)
            user.email = data.get('email', user.email)
            user.phone = data.get('phone', user.phone)
            user.save()

            return Response({'message': 'User updated successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Delete User
class DeleteUser(APIView):
    def delete(self, request, user_id):
        try:
            user = get_object_or_404(User, id=user_id)
            user.delete()
            return Response({'message': 'User deleted successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
