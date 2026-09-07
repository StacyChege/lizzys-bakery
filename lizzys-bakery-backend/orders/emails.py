from django.conf import settings
from django.core.mail import send_mail

from .models import Order

# Only statuses worth emailing a customer about — PENDING_CONFIRMATION is the
# state an order starts in, not a change worth announcing.
STATUS_UPDATE_MESSAGES = {
    Order.CONFIRMED: "we've confirmed your order and locked in your date.",
    Order.IN_KITCHEN: "we've started preparing your order in the kitchen!",
    Order.READY: 'your order is ready for pickup, or on its way to you.',
    Order.COMPLETED: 'your order has been completed. Thank you for choosing us!',
    Order.CANCELLED: 'your order has been cancelled. Please get in touch if you have questions.',
}


def send_order_confirmation_email(order: Order) -> None:
    if not order.contact_email:
        return

    item_lines = '\n'.join(
        f'  - {item.quantity} x {item.product_name}'
        + (f' ({item.flavour})' if item.flavour else '')
        + (f' — {item.size_label}' if item.size_label else '')
        for item in order.items.all()
    )
    message = (
        f'Hi {order.contact_name},\n\n'
        f"Thanks for your order! Here's what we've got:\n\n"
        f'{item_lines}\n\n'
        f'Date needed: {order.date_needed}\n'
        f'Fulfilment: {order.get_fulfilment_method_display()}\n'
        f'Total: KES {order.total}\n\n'
        f"Your order is currently Pending Confirmation — we'll be in touch by phone or "
        f'WhatsApp shortly to confirm the details and arrange payment via M-Pesa.\n\n'
        f'Order #{order.id}\n\n'
        f"Lizzy's Bakery — Made with love, just for you."
    )
    send_mail(
        subject=f"Order #{order.id} received — Lizzy's Bakery",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.contact_email],
        fail_silently=True,
    )


def send_order_status_email(order: Order) -> None:
    if not order.contact_email:
        return
    note = STATUS_UPDATE_MESSAGES.get(order.status)
    if not note:
        return

    message = (
        f'Hi {order.contact_name},\n\n'
        f'An update on your order #{order.id} — {note}\n\n'
        f"Lizzy's Bakery — Made with love, just for you."
    )
    send_mail(
        subject=f"Order #{order.id} update — Lizzy's Bakery",
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[order.contact_email],
        fail_silently=True,
    )
