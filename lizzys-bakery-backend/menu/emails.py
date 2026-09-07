from django.conf import settings
from django.core.mail import send_mail

from .models import CustomCakeRequest

# Only statuses worth emailing a customer about — PENDING is the state a
# request starts in, not a change worth announcing.
STATUS_UPDATE_MESSAGES = {
    CustomCakeRequest.REVIEWED: "we've reviewed your custom cake request and are working on a quote.",
    CustomCakeRequest.QUOTED: "we've sent you a quote — check your phone/WhatsApp for the price and next steps.",
    CustomCakeRequest.CONFIRMED: "your custom cake is confirmed and your date is locked in!",
    CustomCakeRequest.DECLINED: "we're unable to take on this request. Please get in touch if you have questions.",
}


def send_custom_cake_confirmation_email(request: CustomCakeRequest) -> None:
    send_mail(
        subject="We've got your custom cake request — Lizzy's Bakery",
        message=(
            f'Hi {request.name},\n\n'
            f"Thanks for telling us about the cake you have in mind! Here's what we noted:\n\n"
            f'  Occasion: {request.occasion or "—"}\n'
            f'  Tiers: {request.tier_count}'
            + (f' (~{request.servings} servings)' if request.servings else '')
            + '\n'
            f'  Flavour: {request.flavour or "—"}\n'
            f'  Filling: {request.filling or "—"}\n'
            f'  Frosting: {request.frosting_style or "—"}\n'
            f'  Date needed: {request.date_needed}\n\n'
            f"We'll be in touch at this email or by phone/WhatsApp with a quote soon.\n\n"
            f"Lizzy's Bakery — Made with love, just for you."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[request.email],
        fail_silently=True,
    )


def send_custom_cake_status_email(request: CustomCakeRequest) -> None:
    note = STATUS_UPDATE_MESSAGES.get(request.status)
    if not note:
        return

    quote_line = (
        f'\nQuoted price: KES {request.quoted_price}\n' if request.status == CustomCakeRequest.QUOTED and request.quoted_price else ''
    )
    message = (
        f'Hi {request.name},\n\n'
        f'An update on your custom cake request — {note}\n'
        f'{quote_line}\n'
        f"Lizzy's Bakery — Made with love, just for you."
    )
    send_mail(
        subject="Update on your custom cake request — Lizzy's Bakery",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[request.email],
        fail_silently=True,
    )
