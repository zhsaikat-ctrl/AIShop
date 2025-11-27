from django.db import models
from django.contrib.auth.models import User


class Product(models.Model):
    # English
    title_en = models.CharField(max_length=200)
    description_en = models.TextField()

    # Bangla
    title_bn = models.CharField(max_length=200, blank=True)
    description_bn = models.TextField(blank=True)

    price = models.FloatField()
    image = models.ImageField(upload_to="products/", blank=True, null=True)
    category = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title_en


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Order {self.id} - {self.user.username}"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, related_name="items", on_delete=models.CASCADE
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product.title_en} x {self.quantity}"


class CartItem(models.Model):
    user = models.ForeignKey(
        User, related_name="cart_items", on_delete=models.CASCADE
    )
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")

    def __str__(self):
        return f"CART {self.user.username}: {self.product.title_en} x {self.quantity}"


class Payment(models.Model):
    METHOD_CHOICES = [
        ("BKASH", "bKash"),
        ("NAGAD", "Nagad"),
        ("STRIPE", "Stripe"),
        ("COD", "Cash On Delivery"),
    ]
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
    ]

    order = models.OneToOneField(
        Order, related_name="payment", on_delete=models.CASCADE
    )
    amount = models.FloatField()
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="PENDING"
    )
    transaction_id = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.order_id} - {self.method} - {self.status}"
