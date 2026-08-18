from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'full_name', 'phone_number', 'password')

    def create(self, validated_data):
        # We use our custom create_user method to handle password hashing correctly
        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            phone_number=validated_data.get('phone_number', ''),
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """Used to serialize user data returned after successful actions or on profile retrieval"""
    class Meta:
        model = User
        fields = ('id', 'email', 'full_name', 'phone_number', 'role')