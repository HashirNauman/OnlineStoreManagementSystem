from datetime import datetime
from DBProject.models import (
    User, Cashier, Customer, Item, Transaction, 
    TransactionItem, Admin, CashierSlot, DeliveryPerson, 
    AuditLog, InventoryItem, Feedback
)



cashier_user = User.objects.create(
    name="Usman",
    email="usman@gmail.com",
    phone="9876543210",
    role="Cashier",
    password_hash=User.objects.make_random_password()
)

customer_user = User.objects.create(
    name="Ali",
    email="ali@gmail.com.com",
    phone="5556667777",
    role="Customer",
    password_hash=User.objects.make_random_password()
)



# Add Cashier
cashier = Cashier.objects.create(
    user=cashier_user,
    shift_start_time="09:00:00",
    shift_end_time="17:00:00"
)

# Add Customer
customer = Customer.objects.create(
    user=customer_user,
    address="123 Main Street",
    phone_number="5556667777"
)

# Add Items
item1 = Item.objects.create(
    name="Item 1",
    description="Description for item 1",
    price=100.50,
    stock=50
)

item2 = Item.objects.create(
    name="Item 2",
    description="Description for item 2",
    price=200.75,
    stock=30
)

# Add Inventory Items
inventory_item = InventoryItem.objects.create(
    name="Chocolava",
    description="This is an inventory item",
    price=150.00,
    available_quantity=100
)

# Add Feedback
feedback = Feedback.objects.create(
    customer=customer_user,
    item=inventory_item,
    feedback_text="Great product!",
    rating=5
)

# Add Transaction
transaction = Transaction.objects.create(
    user=customer_user,
    transaction_date=datetime.now(),
    total_amount=300.25
)

# Add Transaction Item
transaction_item = TransactionItem.objects.create(
    transaction=transaction,
    item=item1,
    quantity=2
)

# Add Delivery Person
delivery_person = DeliveryPerson.objects.create(
    user=User.objects.create(
        name="Saeed",
        email="saeed@gmail.com.com",
        role="DeliveryPerson"
    ),
    vehicle_number="ABC1234"
)

# Add Cashier Slot
cashier_slot = CashierSlot.objects.create(
    max_cashiers=10,
    current_cashiers=5
)


print("Records added successfully!")
