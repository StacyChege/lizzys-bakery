from django.core.management.base import BaseCommand

from orders.models import DeliveryZone

# Starting point based on what comparable Nairobi-area bakeries and boda
# couriers actually charge (researched Sept 2026): CBD-adjacent deliveries
# run ~KES 100-350, Kikuyu/Kiambu/Uthiru-area boda delivery runs ~KES
# 500-800, and further Nairobi suburbs run higher still. Zoned around
# Kikuyu as the bakery's base — Lizzy can edit these anytime via
# /admin/menu delivery settings or the Django admin.
ZONES = [
    ('Kikuyu Town & Kinoo (Local)', 150),
    ('Kiambu, Uthiru, Regen, Kabete, Wangige', 300),
    ('Nairobi CBD, Westlands, Lavington, Kileleshwa', 500),
    ('Karen, Ngong, Rongai, Ruiru, Thika Road & Further Nairobi', 800),
]


class Command(BaseCommand):
    help = 'Seeds starter delivery zones/fees for the Bakery Delivery checkout option. Safe to re-run.'

    def handle(self, *args, **options):
        for name, fee in ZONES:
            zone, created = DeliveryZone.objects.get_or_create(name=name, defaults={'fee': fee})
            self.stdout.write(f"  {'created' if created else 'already existed'}: {zone.name} (KES {zone.fee})")
        self.stdout.write(self.style.SUCCESS('Done.'))
