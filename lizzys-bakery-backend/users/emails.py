from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def send_password_reset_email(user) -> None:
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = f'{settings.FRONTEND_URL}/reset-password/{uid}/{token}'

    send_mail(
        subject="Reset your password — Lizzy's Bakery",
        message=(
            f'Hi {user.full_name},\n\n'
            f'Click the link below to reset your password. This link expires in 30 minutes.\n\n'
            f'{reset_link}\n\n'
            f"If you didn't request this, you can safely ignore this email — your password "
            f"hasn't been changed.\n\n"
            f"Lizzy's Bakery"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )
