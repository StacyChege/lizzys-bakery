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