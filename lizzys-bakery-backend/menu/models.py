from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)  # auto-filled from name in save() below
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    sort_order = models.IntegerField(default=0)  # controls display order on the menu page

    class Meta:
        ordering = ['sort_order', 'name']
        verbose_name_plural = 'Categories'  # Django admin would otherwise show "Categorys"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    # PROTECT means you can't delete a Category while products still reference it —
    # deliberate, stops you from accidentally orphaning products
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)

    # JSONField keeps this simple — no separate Flavour/Size tables needed for an MVP
    available_flavours = models.JSONField(default=list, blank=True)   # e.g. ["Vanilla", "Chocolate", "Red Velvet"]
    available_sizes = models.JSONField(default=list, blank=True)      # e.g. [{"label": "Small", "price_modifier": 0}]

    is_available = models.BooleanField(default=True)       # toggled off when sold out
    is_made_to_order = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    sort_order = models.IntegerField(default=0)  # sort_order=0 is treated as the main photo

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return f"Image for {self.product.name}"


class CustomCakeRequest(models.Model):
    # A baker-reviewed inquiry, not an instant order — no price/availability
    # exists until Lizzy looks at it, so this is deliberately just contact
    # details + what they want, triaged in the admin.
    #
    # occasion/flavour/filling/frosting_style are plain CharFields rather than
    # Django `choices=` — the builder UI offers a preset list plus a
    # free-text "Other", and whatever the customer settles on is stored
    # as-is. colour_theme/toppings are comma-joined strings for the same
    # reason multipart form data doesn't round-trip JSON lists cleanly.
    PENDING = 'PENDING'
    REVIEWED = 'REVIEWED'
    QUOTED = 'QUOTED'
    CONFIRMED = 'CONFIRMED'
    DECLINED = 'DECLINED'
    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (REVIEWED, 'Reviewed'),
        (QUOTED, 'Quoted'),
        (CONFIRMED, 'Confirmed'),
        (DECLINED, 'Declined'),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    date_needed = models.DateField()
    budget = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    occasion = models.CharField(max_length=100, blank=True)
    tier_count = models.PositiveSmallIntegerField(default=1)
    servings = models.PositiveIntegerField(blank=True, null=True)
    flavour = models.CharField(max_length=100, blank=True)
    filling = models.CharField(max_length=100, blank=True)
    frosting_style = models.CharField(max_length=100, blank=True)
    colour_theme = models.CharField(max_length=255, blank=True)
    toppings = models.CharField(max_length=255, blank=True)
    custom_message = models.CharField(max_length=255, blank=True)
    special_notes = models.TextField(blank=True)  # free-text notes/allergies from step 7

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=PENDING)
    quoted_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} — {self.date_needed}"


class CustomCakeReferenceImage(models.Model):
    # Up to 3 per request (enforced in the view, not the DB) — inspiration
    # photos the customer uploads so the baker understands the desired look.
    request = models.ForeignKey(CustomCakeRequest, on_delete=models.CASCADE, related_name='reference_images')
    image = models.ImageField(upload_to='custom_cake_references/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Reference image for {self.request.name}'