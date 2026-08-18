from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import RegisterSerializer, UserSerializer

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