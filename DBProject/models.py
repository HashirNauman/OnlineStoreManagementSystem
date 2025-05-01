from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.db.models import JSONField


class User(models.Model):
    ROLE_CHOICES = [
        ('Admin', 'Admin'),
        ('Cashier', 'Cashier'),
        ('Customer', 'Customer'),
        ('DeliveryPerson', 'DeliveryPerson'),
    ]
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    last_visited = models.DateTimeField(null=True, blank=True)
    password_hash = models.CharField(
        max_length=128,
        default=make_password('defaultpassword')
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

    def __str__(self):
        return self.name


class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.username


class Cashier(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'Cashier'}
    )
    shift_start_time = models.TimeField(null=True, blank=True)
    shift_end_time = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"Cashier: {self.user.name}"


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'Customer'})
    address = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)

    def __str__(self):
        return f"Customer: {self.user.name}"


class InventoryItem(models.Model):
    CATEGORY_CHOICES = [
        ('biscuits', 'Biscuits'),
        ('snacks', 'Snacks'),
        ('fast_food', 'Fast Food'),
        ('stationary', 'Stationary Items'),
        ('electronics', 'Small Electronics'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='Biscuits')
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    available_quantity = models.PositiveIntegerField()
    image_url = models.URLField(max_length=200, null=True, blank=True)  # Add this line to store image URLs

    def __str__(self):
        return self.name
class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"Transaction {self.id} by {self.user.name}"


class TransactionItem(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity} x {self.item.name}"


class CashierSlot(models.Model):
    max_cashiers = models.PositiveIntegerField()
    current_cashiers = models.PositiveIntegerField()

    def __str__(self):
        return f"Max Cashiers: {self.max_cashiers}, Current Cashiers: {self.current_cashiers}"


class DeliveryPerson(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    vehicle_number = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"Delivery Person: {self.user.name}"


class AuditLog(models.Model):
    OPERATION_CHOICES = [
        ('INSERT', 'INSERT'),
        ('UPDATE', 'UPDATE'),
        ('DELETE', 'DELETE'),
    ]
    operation_type = models.CharField(max_length=10, choices=OPERATION_CHOICES)
    table_name = models.CharField(max_length=50)
    operation_time = models.DateTimeField(auto_now_add=True)
    executed_query = models.TextField()

    def __str__(self):
        return f"{self.operation_type} on {self.table_name} at {self.operation_time}"


class Feedback(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'Customer'})
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    feedback_text = models.TextField()
    rating = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for {self.item.name} by {self.customer.name}"


class CustomerHistory(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE, null=True, blank=True)
    purchase_date = models.DateField()
    items = JSONField()

    def __str__(self):
        return f"History for {self.customer.user.name} on {self.purchase_date}"


class Metrics(models.Model):
    total_revenue = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    revenue_change = models.IntegerField(default=0)
    active_users = models.IntegerField(default=0)
    new_users = models.IntegerField(default=0)
    total_orders = models.IntegerField(default=0)
    order_change = models.IntegerField(default=0)
    customer_satisfaction = models.IntegerField(default=0)
    reviews_count = models.IntegerField(default=0)

    def __str__(self):
        return "Metrics"


class Activity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    time = models.DateTimeField(auto_now_add=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.name} - {self.action}"


class Revenue(models.Model):
    month = models.CharField(max_length=10)
    year = models.IntegerField()
    revenue = models.FloatField()

    def __str__(self):
        return f"{self.month} {self.year}: {self.revenue}"


class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    order_date = models.DateField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=[
            ('Pending', 'Pending'),
            ('Processing', 'Processing'),
            ('Delivered', 'Delivered'),
        ],
    )
    delivery_time = models.CharField(
        max_length=10,
        choices=[
            ('1 PM', '1 PM'),
            ('5 PM', '5 PM'),
        ],
        default='1 PM',
    )
    payment_method = models.CharField(  # Add this field
        max_length=50,
        choices=[
            ('credit-card', 'Credit Card'),
            ('easypaisa', 'EasyPaisa'),
            ('jazzcash', 'JazzCash'),
            ('cash-on-delivery', 'Cash on Delivery'),
        ],
        default='cash-on-delivery',
    )

    def __str__(self):
        return f"Order {self.id} - {self.status}"
class OrderItem(models.Model):  # Added this new model
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.quantity} x {self.item.name} in Order {self.order.id}"


class Wishlist(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('customer', 'item')  # Enforces uniqueness

    def __str__(self):
        return f"{self.customer.user.name}'s Wishlist Item: {self.item.name}"


class LoyaltyPoints(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    points = models.PositiveIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.customer.user.name}: {self.points} points"


class RecommendedProduct(models.Model):
    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )
    item = models.ForeignKey(InventoryItem, on_delete=models.CASCADE)
    recommendation_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Recommendation: {self.item.name} for {self.customer.user.name if self.customer else 'General'}"
class Notification(models.Model):
    message = models.TextField()
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE)  # Assuming Customer model exists
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.message[:50]  # Show first 50 chars of message


# Signal to delete dependent objects
@receiver(post_delete, sender=User)
def cascade_delete_related(sender, instance, **kwargs):
    if instance.role == 'Admin':
        Admin.objects.filter(user=instance).delete()
    elif instance.role == 'Cashier':
        Cashier.objects.filter(user=instance).delete()
    elif instance.role == 'Customer':
        Customer.objects.filter(user=instance).delete()
        Feedback.objects.filter(customer=instance).delete()
        Transaction.objects.filter(user=instance).delete()
