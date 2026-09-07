from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .emails import send_password_reset_email
from .serializers import (
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()

# 1. Custom Serializer to include user details in the login response
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Serialize the user instance and inject it into the response payload
        user_serializer = UserSerializer(self.user)
        data['user'] = user_serializer.data
        return data

# 2. Custom Login View
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

# 3. Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        user_data = UserSerializer(user).data
        return Response({
            "message": "User registered successfully!",
            "user": user_data
        }, status=status.HTTP_201_CREATED)

# 4. User Profile View (The /me/ endpoint)
class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]  # Requires a valid JWT token in the Authorization header

    def get_object(self):
        # Returns the logged-in user making the request
        return self.request.user


# 5. Password Reset (PRD 2.1: link expires after 30 minutes — see
# PASSWORD_RESET_TIMEOUT in settings.py)
class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Always return the same response whether or not the email exists —
        # otherwise this endpoint becomes a way to check who has an account.
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
            send_password_reset_email(user)
        except User.DoesNotExist:
            pass

        return Response({'message': 'If an account exists for that email, a reset link has been sent.'})


class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'message': 'Your password has been reset. You can now log in.'})