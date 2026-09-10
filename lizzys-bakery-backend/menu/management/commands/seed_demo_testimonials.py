from django.core.management.base import BaseCommand

from menu.models import Testimonial

# Example testimonials so the homepage section isn't empty on a fresh
# deploy. These are placeholders — Lizzy should replace them with real
# customer words via /admin/testimonials or the Django admin.
TESTIMONIALS = [
    {
        'author_name': 'Wanjiru M.',
        'quote': "The wedding cake was beyond what we imagined — three tiers, exactly the shade of blush we asked for, and it tasted incredible. Guests are still talking about it.",
        'occasion': 'Wedding cake',
        'sort_order': 1,
    },
    {
        'author_name': 'Brian O.',
        'quote': "Ordered a graduation cake with five days' notice and it was ready right on time. Pickup in Kikuyu was easy and Lizzy walked me through everything on WhatsApp.",
        'occasion': 'Graduation cake',
        'sort_order': 2,
    },
    {
        'author_name': 'Aisha K.',
        'quote': "I do a monthly cupcake order for the office and it's the highlight of everyone's week. Always fresh, never the same flavour twice unless we ask.",
        'occasion': 'Cupcakes',
        'sort_order': 3,
    },
]


class Command(BaseCommand):
    help = 'Seeds a few example testimonials for the homepage. Safe to re-run — skips ones that already exist.'

    def handle(self, *args, **options):
        for item in TESTIMONIALS:
            obj, created = Testimonial.objects.get_or_create(
                author_name=item['author_name'],
                quote=item['quote'],
                defaults={'occasion': item['occasion'], 'sort_order': item['sort_order']},
            )
            self.stdout.write(f"  {'created' if created else 'already existed'}: {obj.author_name}")
        self.stdout.write(self.style.SUCCESS('Done.'))
