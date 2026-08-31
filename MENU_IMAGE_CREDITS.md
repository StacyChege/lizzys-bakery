# Menu & Hero Image Credits

The photos seeded by `seed_demo_menu` and the homepage hero photo are **placeholders**,
not real photos of Lizzy's Bakery products. They're free, properly-licensed stock photos
from Wikimedia Commons, used to make the site look real while there are no product photos
yet. Replace them with real photography as soon as you can — via `/admin/menu` (once photo
upload is added there) or the Django admin in the meantime.

Several of these licenses (CC BY, CC BY-SA, GFDL) legally require attribution for as long as
the photo is displayed publicly. Keep this file until every placeholder below has been
replaced with a real photo.

| File | Product | Source | License |
|---|---|---|---|
| chocolate_fudge_cake.jpg | Double Chocolate Fudge Cake | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Chocolate_fudge_cake.jpg) — Tracy Hunter | CC BY 2.0 |
| red_velvet_cake.jpg | Red Velvet Celebration Cake | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Homemade_red_velvet_cake.jpg) — Jonathunder | GFDL 1.2 |
| assorted_cupcakes.jpg | Assorted Party Cupcakes (6-Pack) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Cupcakes_with_shiny_decorations.jpg) — Leon Brooks | Public Domain |
| lemon_cake.jpg | Zesty Lemon Blueberry Cupcakes | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Lemon_Cake.jpg) — Tracy Hunter | CC BY 2.0 |
| sheet_cake.jpg | Scholarly Cap & Tassel Cake | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Sheet_cake.jpg) | CC BY 2.0 |
| blueberry_muffins.jpg | Bakery-Style Blueberry Muffins | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Blueberry_muffins.jpg) | CC BY 2.0 |
| chocolate_croissant.jpg | Buttery Chocolate Croissants | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pain_au_chocolat_Luc_Viatour.jpg) — Luc Viatour | CC BY-SA |
| wedding_cake.jpg | Classic Vanilla Tiered Cake | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Wedding_cake_by_The_Sweet_Society_Co.jpg) — Kgbo | CC BY-SA 4.0 |
| black_coffee.jpg | Kenyan Coffee | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Black_coffee_cup_(Unsplash).jpg) | CC0 |
| cappuccino.jpg | Cappuccino | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Latte_art.jpg) | CC BY-SA 2.0 |
| iced_coffee.jpg | Iced Latte | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Iced_coffee.jpg) | CC0 |
| almond_croissant.jpg | Almond Croissant | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Almond_Croissant.jpg) — Gaurav Dhwaj Khadka | CC BY-SA 4.0 |
| donuts.jpg | Mini Doughnuts (6-Pack) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Free_Colorful_Donuts_(12097493966).jpg) | CC BY 2.0 |
| hero-cake-coffee.jpg | Homepage hero background | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Melange_coffee_and_Sacher_torte.JPG) | CC BY-SA 3.0 / GFDL 1.2+ |

Source images for the product photos live in `lizzys-bakery-backend/menu/seed_data/images/`
and are loaded by `python manage.py seed_demo_menu` (safe to re-run — skips anything that
already exists). The hero photo lives in `lizzys-bakery-frontend/src/assets/hero-cake-coffee.jpg`.
