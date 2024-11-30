from django.db import models
from django.contrib.auth.hashers import make_password, check_password

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
        default=make_password('defaultpassword')  # Replace 'defaultpassword' with your desired default
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def set_password(self, raw_password):
        self.password_hash = make_password(raw_password)
    
    def check_password(self, raw_password):
        return check_password(raw_password, self.password_hash)

class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

class Transaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    transaction_date = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

class TransactionItem(models.Model):
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()

class Admin(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=50, unique=True)

class CashierSlot(models.Model):
    max_cashiers = models.PositiveIntegerField()
    current_cashiers = models.PositiveIntegerField()

class DeliveryPerson(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    vehicle_number = models.CharField(max_length=20, null=True, blank=True)

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
