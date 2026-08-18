from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from .managers import UserManager  # we'll write this in Hr 2


class User(AbstractBaseUser, PermissionsMixin):
    # role choices — CUSTOMER is default, ADMIN is the baker
    CUSTOMER = 'CUSTOMER'
    ADMIN = 'ADMIN'
    ROLE_CHOICES = [
        (CUSTOMER, 'Customer'),
        (ADMIN, 'Admin'),
    ]

    email = models.EmailField(unique=True)          # used to log in instead of username
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=CUSTOMER)

    is_active = models.BooleanField(default=True)    # can this user log in
    is_staff = models.BooleanField(default=False)    # can this user access Django admin
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()  # tells Django to use our custom manager, not the default one

    USERNAME_FIELD = 'email'          # login with email, not username
    REQUIRED_FIELDS = ['full_name']   # asked for when running createsuperuser

    def __str__(self):
        return self.email
    