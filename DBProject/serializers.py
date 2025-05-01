from rest_framework import serializers
from .models import (
    InventoryItem, Feedback, User, Admin, Cashier, Customer, CustomerHistory, 
    DeliveryPerson, Transaction, TransactionItem, Metrics, Activity, 
    Revenue, Order, Wishlist, LoyaltyPoints, RecommendedProduct, OrderItem,
    Notification
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'role', 'last_visited', 'created_at']

class AdminSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Admin
        fields = ['id', 'user', 'username']

class CashierSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Cashier
        fields = ['id', 'user', 'shift_start_time', 'shift_end_time']

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create(**user_data)
        cashier = Cashier.objects.create(user=user, **validated_data)
        return cashier

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user')
        user_serializer = UserSerializer(instance=instance.user, data=user_data, partial=True)
        
        if user_serializer.is_valid():
            user_serializer.save()
        
        # Update the cashier instance
        instance.shift_start_time = validated_data.get('shift_start_time', instance.shift_start_time)
        instance.shift_end_time = validated_data.get('shift_end_time', instance.shift_end_time)
        instance.save()
        
        return instance
class CustomerSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Customer
        fields = ['id', 'user', 'address', 'phone_number']

class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ['id', 'name', 'description', 'price', 'available_quantity', 'image_url', 'category']

class FeedbackSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = Feedback
        fields = ['id', 'customer', 'customer_name', 'item', 'item_name', 'feedback_text', 'rating', 'created_at']

class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = Transaction
        fields = ['id', 'user', 'user_name', 'transaction_date', 'total_amount']

class TransactionItemSerializer(serializers.ModelSerializer):
    transaction_id = serializers.IntegerField(source='transaction.id', read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = TransactionItem
        fields = ['id', 'transaction', 'transaction_id', 'item', 'item_name', 'quantity']

class CustomerHistorySerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.name', read_only=True)
    transaction_id = serializers.IntegerField(source='transaction.id', read_only=True)

    class Meta:
        model = CustomerHistory
        fields = ['id', 'customer', 'customer_name', 'transaction', 'transaction_id', 'purchase_date', 'items']

class DeliveryPersonSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = DeliveryPerson
        fields = ['id', 'user', 'vehicle_number']

class MetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metrics
        fields = [
            'id', 'total_revenue', 'revenue_change', 'active_users', 'new_users', 
            'total_orders', 'order_change', 'customer_satisfaction', 'reviews_count'
        ]

class ActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)

    class Meta:
        model = Activity
        fields = ['id', 'user', 'user_name', 'action', 'time', 'description']

class RevenueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Revenue
        fields = ['id', 'month', 'year', 'revenue']

class OrderItemSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    quantity = serializers.IntegerField()

class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()  # Use OrderItemSerializer to handle item details
    delivery_time = serializers.CharField(write_only=True, default="1 PM")
    image_url = serializers.SerializerMethodField()  # Add image_url to serializer

    class Meta:
        model = Order
        fields = ['id', 'order_date', 'total_amount', 'status', 'items', 'image_url', 'delivery_time']  # Include delivery_time

    def validate_customer(self, value):
        if not Customer.objects.filter(id=value.id).exists():
            raise serializers.ValidationError("Customer not found.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        total_amount = sum(
            float(InventoryItem.objects.get(id=item['item_id']).price) * item['quantity']
            for item in items_data
        )
        order = Order.objects.create(total_amount=total_amount, **validated_data)
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                item_id=item_data['item_id'],
                quantity=item_data['quantity']
            )
        return order

    def get_image_url(self, obj):
        # Assuming OrderItem has the InventoryItem, and you want the image of the first item in the order
        order_item = obj.order_items.first()  # Change this logic based on your needs
        if order_item:
            return order_item.item.image_url
        return None

    def get_items(self, obj):
        return [
            {
                "item_name": item.item.name,
                "quantity": item.quantity,
                "image_url": item.item.image_url,
            }
            for item in obj.order_items.all()
        ]
class WishlistSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.name', read_only=True)
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_id = serializers.IntegerField(write_only=True)  # For item ID in POST requests
    image_url = serializers.CharField(source='item.image_url', read_only=True)  # Add image_url
    price = serializers.DecimalField(source='item.price', max_digits=10, decimal_places=2, read_only=True)  # Retrieve price from InventoryItem

    class Meta:
        model = Wishlist
        fields = ['id', 'item_id','customer_name', 'item_name', 'image_url', 'price']

    def create(self, validated_data):
        item_id = validated_data.pop('item_id')
        validated_data['item'] = InventoryItem.objects.get(id=item_id)
        return super().create(validated_data)

class LoyaltyPointsSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.name', read_only=True)

    class Meta:
        model = LoyaltyPoints
        fields = ['id', 'customer', 'customer_name', 'points', 'last_updated']

class RecommendedProductSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.user.name', read_only=True, allow_null=True)
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = RecommendedProduct
        fields = ['id', 'customer', 'customer_name', 'item', 'item_name', 'recommendation_reason']
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'message', 'date']
