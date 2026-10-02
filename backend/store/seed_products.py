from .models import Product


PRODUCTS = [
    ("Fresh Milk 1L", "Dairy", 150, 100),
    ("Bread Loaf", "Bakery", 120, 100),
    ("Eggs (12)", "Dairy", 300, 100),
    ("Bananas 1kg", "Fruit", 180, 100),
    ("Rice 2kg", "Grains", 450, 100),
    ("Tomatoes 1kg", "Vegetables", 220, 100),
    ("Orange Juice 1L", "Beverages", 280, 60),
    ("Mineral Water 500ml", "Beverages", 60, 200),
    ("Soda 2L", "Beverages", 190, 80),
    ("Digestive Biscuits", "Snacks", 150, 70),
    ("Potato Crisps", "Snacks", 100, 90),
    ("Chicken 1kg", "Meat", 650, 30),
    ("Beef 1kg", "Meat", 800, 25),
    ("Apples 1kg", "Fruit", 320, 50),
    ("Onions 1kg", "Vegetables", 120, 80),
    ("Cooking Oil 1L", "Cooking", 380, 60),
    ("Sugar 2kg", "Cooking", 330, 70),
    ("Dish Soap 500ml", "Household", 210, 40),
    ("Toilet Paper (4)", "Household", 240, 55),
]


def seed():
    for name, category, price, stock in PRODUCTS:
        Product.objects.update_or_create(
            name=name,
            defaults={
                "category": category,
                "price": price,
                "stock": stock,
            },
        )

    print(f"FreshMart products ready: {Product.objects.count()}")
