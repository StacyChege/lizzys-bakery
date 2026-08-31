import os

from django.core.files import File
from django.core.management.base import BaseCommand

from menu.models import Category, Product, ProductImage

SEED_IMAGES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'seed_data', 'images')

# Existing catalog products that ship with no photo — attach a stock placeholder to each.
EXISTING_PRODUCT_IMAGES = {
    'Double Chocolate Fudge Cake': 'chocolate_fudge_cake.jpg',
    'Red Velvet Celebration Cake': 'red_velvet_cake.jpg',
    'Assorted Party Cupcakes (6-Pack)': 'assorted_cupcakes.jpg',
    'Zesty Lemon Blueberry Cupcakes': 'lemon_cake.jpg',
    'Scholarly Cap & Tassel Cake': 'sheet_cake.jpg',
    'Bakery-Style Blueberry Muffins': 'blueberry_muffins.jpg',
    'Buttery Chocolate Croissants': 'chocolate_croissant.jpg',
    'Classic Vanilla Tiered Cake': 'wedding_cake.jpg',
}

NEW_PRODUCTS = [
    {
        'category_slug': 'coffee-beverages',
        'name': 'Kenyan Coffee',
        'description': 'Freshly brewed, full-bodied Kenyan coffee, served hot.',
        'base_price': 200,
        'available_flavours': [],
        'available_sizes': [
            {'label': 'Small', 'price_modifier': 0},
            {'label': 'Regular', 'price_modifier': 50},
            {'label': 'Large', 'price_modifier': 100},
        ],
        'image_file': 'black_coffee.jpg',
    },
    {
        'category_slug': 'coffee-beverages',
        'name': 'Cappuccino',
        'description': 'Espresso topped with steamed milk and a thick layer of foam.',
        'base_price': 300,
        'available_flavours': [],
        'available_sizes': [
            {'label': 'Regular', 'price_modifier': 0},
            {'label': 'Large', 'price_modifier': 80},
        ],
        'image_file': 'cappuccino.jpg',
    },
    {
        'category_slug': 'coffee-beverages',
        'name': 'Iced Latte',
        'description': 'Chilled espresso and milk served over ice, perfect with a slice of cake.',
        'base_price': 350,
        'available_flavours': ['Classic', 'Vanilla', 'Caramel'],
        'available_sizes': [
            {'label': 'Regular', 'price_modifier': 0},
            {'label': 'Large', 'price_modifier': 80},
        ],
        'image_file': 'iced_coffee.jpg',
    },
    {
        'category_slug': 'muffins-pastries',
        'name': 'Almond Croissant',
        'description': 'Buttery croissant filled with almond cream and topped with sliced almonds.',
        'base_price': 350,
        'available_flavours': [],
        'available_sizes': [
            {'label': 'Single Pastry', 'price_modifier': 0},
            {'label': 'Pack of 4', 'price_modifier': 1000},
        ],
        'image_file': 'almond_croissant.jpg',
    },
    {
        'category_slug': 'muffins-pastries',
        'name': 'Mini Doughnuts (6-Pack)',
        'description': 'Bite-sized glazed doughnuts in assorted flavours, great for sharing.',
        'base_price': 400,
        'available_flavours': ['Glazed', 'Chocolate', 'Cinnamon Sugar'],
        'available_sizes': [
            {'label': 'Box of 6', 'price_modifier': 0},
            {'label': 'Box of 12', 'price_modifier': 350},
        ],
        'image_file': 'donuts.jpg',
    },
]


class Command(BaseCommand):
    help = (
        "Seeds demo product photos and a Coffee & Beverages category with sample items. "
        "Safe to re-run — skips anything that already exists. Intended as a starting point "
        "for a fresh deployment; replace the stock photos with real ones via /admin/menu or "
        "the Django admin once available."
    )

    def attach_image(self, product, filename):
        if product.images.exists():
            return
        path = os.path.join(SEED_IMAGES_DIR, filename)
        if not os.path.exists(path):
            self.stdout.write(self.style.WARNING(f'  missing seed image file: {filename}'))
            return
        with open(path, 'rb') as f:
            img = ProductImage(product=product, sort_order=0)
            img.image.save(filename, File(f), save=True)
        self.stdout.write(f'  attached {filename} -> {product.name}')

    def handle(self, *args, **options):
        self.stdout.write('Attaching photos to existing products...')
        for name, filename in EXISTING_PRODUCT_IMAGES.items():
            try:
                product = Product.objects.get(name=name)
            except Product.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'  no product named "{name}" — skipping'))
                continue
            self.attach_image(product, filename)

        coffee_cat, created = Category.objects.get_or_create(
            slug='coffee-beverages',
            defaults={
                'name': 'Coffee & Beverages',
                'description': "Freshly brewed coffee and drinks to go with your treats.",
            },
        )
        self.stdout.write(f"Category 'Coffee & Beverages' {'created' if created else 'already existed'}")

        self.stdout.write('Creating new menu items...')
        for item in NEW_PRODUCTS:
            image_file = item['image_file']
            try:
                category = Category.objects.get(slug=item['category_slug'])
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f"  category '{item['category_slug']}' not found — skipping {item['name']}"))
                continue

            product, created = Product.objects.get_or_create(
                name=item['name'],
                defaults={
                    'category': category,
                    'description': item['description'],
                    'base_price': item['base_price'],
                    'available_flavours': item['available_flavours'],
                    'available_sizes': item['available_sizes'],
                    'is_available': True,
                    'is_made_to_order': False,
                },
            )
            self.stdout.write(f"  {'created' if created else 'already existed'}: {product.name}")
            self.attach_image(product, image_file)

        self.stdout.write(self.style.SUCCESS('Done.'))
