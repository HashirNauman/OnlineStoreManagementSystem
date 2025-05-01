from django.contrib.auth.hashers import make_password, check_password
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.contrib.auth import authenticate, login
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.shortcuts import get_object_or_404
from .models import (User, InventoryItem, Transaction, TransactionItem,
                    Admin, CashierSlot, DeliveryPerson, AuditLog, Cashier,
                    Customer, Feedback, CustomerHistory, Metrics, Activity,
                    Revenue, InventoryItem, Order,OrderItem, Wishlist, LoyaltyPoints, RecommendedProduct, Notification)
from django.middleware.csrf import get_token
from .serializers import (InventoryItemSerializer, CashierSerializer, FeedbackSerializer, 
                        CustomerHistorySerializer, MetricsSerializer, ActivitySerializer,
                        OrderSerializer, WishlistSerializer, LoyaltyPointsSerializer,
                        RecommendedProductSerializer, NotificationSerializer)
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from datetime import datetime  # Import datetime properly
def get_orders(request):
    orders = Order.objects.prefetch_related('order_items__item').select_related('customer').all()
    data = [
        {
            "id": order.id,
            "customer": order.customer.user.name,
            "total_amount": str(order.total_amount),
            "status": order.status,
            "order_items": [
                {
                    "id": item.id,
                    "quantity": item.quantity,
                    "item": {
                        "id": item.item.id,
                        "name": item.item.name,
                        "price": str(item.item.price),
                    },
                }
                for item in order.order_items.all()
            ],
        }
        for order in orders
    ]
    return JsonResponse(data, safe=False)
class NotifyUserView(APIView):
    def post(self, request):
        message = request.data.get('message')
        customer_id = request.data.get('customer_id')
        
        # Ensure both message and customer_id are provided
        if not message or not customer_id:
            return Response({"error": "Message and customer ID are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new notification
        notification = Notification.objects.create(
            message=message,
            customer_id=customer_id,
            date=datetime.now()
        )

        # Return the created notification
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class NotificationsView(APIView):
    def get(self, request):
        customer_id = request.query_params.get('customer_id')

        if not customer_id:
            return Response({"error": "Customer ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        notifications = Notification.objects.filter(customer_id=customer_id).order_by('-date')

        # Serialize and return notifications
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class OrderCountView(APIView):
    def get(self, request, *args, **kwargs):
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response({"error": "Customer ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        order_count = Order.objects.filter(customer_id=customer_id).count()
        return Response({"order_count": order_count}, status=status.HTTP_200_OK)
class WishlistCountView(APIView):
    def get(self, request, *args, **kwargs):
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response({"error": "Customer ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        wishlist_count = Wishlist.objects.filter(customer_id=customer_id).count()
        return Response({"wishlist_count": wishlist_count}, status=status.HTTP_200_OK)

class TotalSpentView(APIView):
    """
    API View to get the total amount spent by a customer.
    """
    def get(self, request, *args, **kwargs):
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response({"error": "Customer ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Calculate total spent by the customer based on their order history
            orders = Order.objects.filter(customer_id=customer_id)
            total_spent = sum(order.total_amount for order in orders)
            return Response({"total_spent": total_spent}, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response({"error": "Customer not found or no orders found."}, status=status.HTTP_404_NOT_FOUND)

class RecentOrdersView(APIView):
    """
    API View to get the recent orders of a customer.
    """
    def get(self, request, *args, **kwargs):
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response({"error": "Customer ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Get the most recent orders (limit to 5)
            orders = Order.objects.filter(customer_id=customer_id).order_by('-order_date')[:3]
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Order.DoesNotExist:
            return Response({"error": "Customer not found or no orders found."}, status=status.HTTP_404_NOT_FOUND)

class LoyaltyProgressView(APIView):
    """
    API View to get the loyalty points progress for a customer.
    """
    def get(self, request, *args, **kwargs):
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response({"error": "Customer ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            loyalty_points = LoyaltyPoints.objects.get(customer_id=customer_id)
            serializer = LoyaltyPointsSerializer(loyalty_points)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except LoyaltyPoints.DoesNotExist:
            return Response({"error": "Customer not found or no loyalty points found."}, status=status.HTTP_404_NOT_FOUND)

# InventoryItemViewSet
class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all()
    serializer_class = InventoryItemSerializer
    def perform_create(self, serializer):
        print(serializer.validated_data) 
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        instance.delete()
    @action(detail=False, methods=['get'])
    def filter_by_category(self, request):
        category = request.query_params.get('category', None)
        if category:
            items = self.queryset.filter(category=category)
            serializer = self.get_serializer(items, many=True)
            return Response(serializer.data)
        return Response({"detail": "Category not provided"}, status=400)

# Orders ViewSet
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        customer_id = request.data.get('customer_id')
        items = request.data.get('items', [])
        delivery_time = request.data.get('delivery_time', "1 PM")  # Default delivery time
        payment_method = request.data.get('payment_method')
        if not customer_id or not items:
            return Response({"error": "Customer ID and items are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = Customer.objects.get(id=customer_id)
        except Customer.DoesNotExist:
            return Response({"error": "Customer not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            total_amount = sum(
                float(InventoryItem.objects.get(id=item['item_id']).price) * item['quantity']
                for item in items
            )
        except InventoryItem.DoesNotExist:
            return Response({"error": "Invalid item ID."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the Order instance
        order = Order.objects.create(
            customer=customer,
            total_amount=total_amount,
            status="Pending",  # Default status
            delivery_time=delivery_time,
            payment_method=payment_method,
        )

        # Add items to the Order
        for item in items:
            OrderItem.objects.create(
                order=order,
                item_id=item['item_id'],
                quantity=item['quantity'],
            )

        # Serialize the created order
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    def destroy(self, request, order_id, item_id):
        try:
            order = Order.objects.get(id=order_id)
            order_item = OrderItem.objects.get(order=order, item_id=item_id)
            order_item.delete()
            return Response({"message": "Item deleted from order."}, status=status.HTTP_204_NO_CONTENT)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
        except OrderItem.DoesNotExist:
            return Response({"error": "Item not found in order."}, status=status.HTTP_404_NOT_FOUND)
    @action(detail=True, methods=['patch'])
    def mark_completed(self, request, pk=None):
        try:
            order = self.get_object()
            if order.status == 'Completed':
                return Response({"detail": "Order is already completed."}, status=status.HTTP_400_BAD_REQUEST)
            order.status = 'Completed'
            order.save()
            return Response(OrderSerializer(order).data)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

# Wishlist ViewSet
class WishlistViewSet(viewsets.ModelViewSet):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer

    def create(self, request, *args, **kwargs):
        customer_id = request.data.get('customer_id')
        item_id = request.data.get('item_id')

        if not customer_id or not item_id:
            return Response({"error": "Customer ID and item ID are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the item is already in the wishlist
        if Wishlist.objects.filter(customer_id=customer_id, item_id=item_id).exists():
            return Response({"detail": "Item already in wishlist."}, status=status.HTTP_400_BAD_REQUEST)

        # Add item to wishlist
        wishlist_item = Wishlist.objects.create(
            customer_id=customer_id,
            item_id=item_id,
        )
        return Response(WishlistSerializer(wishlist_item).data, status=status.HTTP_201_CREATED)
    # Custom delete method for removing items from wishlist
    def destroy(self, request, *args, **kwargs):
        wishlist_item = self.get_object()
        wishlist_item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Loyalty Points ViewSet
class LoyaltyPointsViewSet(viewsets.ModelViewSet):
    queryset = LoyaltyPoints.objects.all()
    serializer_class = LoyaltyPointsSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def get_customer_points(self, request):
        customer_id = request.query_params.get('customer_id')
        if customer_id:
            points = self.queryset.filter(customer_id=customer_id).first()
            if points:
                serializer = self.get_serializer(points)
                return Response(serializer.data)
            return Response({"detail": "No loyalty points found for this customer"}, status=404)
        return Response({"detail": "Customer ID not provided"}, status=400)

# Recommended Products ViewSet
class RecommendedProductViewSet(viewsets.ModelViewSet):
    queryset = RecommendedProduct.objects.all()
    serializer_class = RecommendedProductSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def get_recommendations(self, request):
        customer_id = request.query_params.get('customer_id', None)
        if customer_id:
            recommendations = self.queryset.filter(customer_id=customer_id)
        else:
            recommendations = self.queryset.filter(customer__isnull=True)  # General recommendations
        serializer = self.get_serializer(recommendations, many=True)
        return Response(serializer.data)
# CashierViewSet
class CashierViewSet(viewsets.ModelViewSet):
    queryset = Cashier.objects.all()
    serializer_class = CashierSerializer

class CustomerHistoryViewSet(viewsets.ModelViewSet):
    queryset = CustomerHistory.objects.all()
    serializer_class = CustomerHistorySerializer
# CustomerViewSet

# FeedbackViewSet
class FeedbackViewSet(viewsets.ModelViewSet):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer

    # Optional: You can filter by customer if you want (e.g., only feedback by a specific customer)
    def get_queryset(self):
        return Feedback.objects.all()
class MetricsViewSet(viewsets.ModelViewSet):
    queryset = Metrics.objects.all()
    serializer_class = MetricsSerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def get_metrics(self, request):
        # Assuming you have a single Metrics object (you can adjust based on your app's logic)
        metrics = Metrics.objects.first()  # Example: Get the first record or create one if needed
        if metrics:
            serializer = self.get_serializer(metrics)
            return Response(serializer.data)
        return Response({"detail": "Metrics not found"}, status=404)

class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def get_activities(self, request):
        # Optionally filter based on user role, for example, Admin
        activities = Activity.objects.filter(id = 2)  # Modify this to suit your needs (e.g., limit results)
        serializer = self.get_serializer(activities, many=True)
        return Response(serializer.data)
def revenue_data(request):
    data = Revenue.objects.all().order_by('year', 'month')  # Ensure proper sorting
    response = [
        {"month": revenue.month, "year": revenue.year, "revenue": revenue.revenue}
        for revenue in data
    ]
    return JsonResponse(response, safe=False)
# Helper function to validate email using Django's built-in validator
def is_valid_email(email):
    try:
        validate_email(email)
        return True
    except ValidationError:
        return False

# CSRF Token View
def csrf(request):
    return JsonResponse({'csrfToken': get_token(request)})

# API Root View
def api_root(request):
    return JsonResponse({
        'message': 'Welcome to the DBProject API!',
        'endpoints': {
            'login': '/api/login/',
            'signup': '/api/signup/',
            'view_users': '/api/view_users/',
            'reset_password': '/api/reset_password/',
            'view_items': '/api/view_items/',
            'view_transactions': '/api/view_transactions/',
            'view_feedback': '/api/view_feedback/',
            'manage_inventory': '/api/manage_inventory/',
            'manage_cashiers': '/api/manage_cashiers/',
            'manage_delivery_person': '/api/manage_delivery_person/',
        }
    })

# Signup View
class SignupView(APIView):
    def post(self, request):
        try:
            data = request.data
            name = data.get('name')
            email = data.get('email')
            password = data.get('password')
            role = data.get('role', 'Customer')  # Default to 'Customer' if no role is provided

            # Validation
            if not name or not email or not password:
                return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

            if not is_valid_email(email):
                return Response({'error': 'Invalid email address'}, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email=email).exists():
                return Response({'error': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)

            if role not in dict(User.ROLE_CHOICES).keys():
                return Response({'error': 'Invalid role provided'}, status=status.HTTP_400_BAD_REQUEST)

            # Save user with hashed password
            user = User(
                name=name,
                email=email,
                password_hash=make_password(password),
                role=role
            )
            user.save()

            return Response({'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Login View
class LoginView(APIView):
    def post(self, request):
        try:
            data = request.data
            email = data.get('email')
            password = data.get('password')

            # Validation
            if not email or not password:
                return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the user based on email
            user = get_object_or_404(User, email=email)

            # Check the password against the stored hash
            if check_password(password, user.password_hash):
                return Response({'message': 'Login successful!'}, status=status.HTTP_200_OK)
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Logout View
class LogoutView(APIView):
    def post(self, request):
        try:
            request.session.flush()  # Clear the session
            return Response({'message': 'Logged out successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Password Reset View
class ResetPasswordView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')

            if not email or not is_valid_email(email):
                return Response({'error': 'Valid email is required'}, status=status.HTTP_400_BAD_REQUEST)

            user = get_object_or_404(User, email=email)

            new_password = get_random_string(length=10)  # Generate a random new password
            user.password_hash = make_password(new_password)
            user.save()

            # Send email with the new password
            send_mail(
                'Password Reset Request',
                f'Hello {user.name},\n\nYour new password is: {new_password}\n\nPlease change it after logging in.',
                'no-reply@dbproject.com',
                [email],
                fail_silently=False,
            )

            return Response({'message': 'Password reset successfully. Check your email for the new password.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View All Users
class ViewUsers(APIView):
    def get(self, request):
        users = User.objects.all().values('id', 'name', 'email', 'phone', 'role', 'last_visited')
        return Response({'users': list(users)}, status=status.HTTP_200_OK)

# Update User
class UpdateUser(APIView):
    def put(self, request, user_id):
        try:
            data = request.data
            user = get_object_or_404(User, id=user_id)
            user.name = data.get('name', user.name)
            user.email = data.get('email', user.email)
            user.phone = data.get('phone', user.phone)
            user.save()

            return Response({'message': 'User updated successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Delete User
class DeleteUser(APIView):
    def delete(self, request, user_id):
        try:
            user = get_object_or_404(User, id=user_id)
            user.delete()
            return Response({'message': 'User deleted successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Manage Inventory Items
class ManageInventory(APIView):
    def get(self, request):
        items = InventoryItem.objects.all().values('id', 'name', 'description', 'price', 'stock')
        return Response({'items': list(items)}, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            data = request.data
            name = data.get('name')
            description = data.get('description')
            price = data.get('price')
            stock = data.get('stock')

            if not name or not price or stock is None:
                return Response({'error': 'Name, price, and stock are required'}, status=status.HTTP_400_BAD_REQUEST)

            item = InventoryItem(
                name=name,
                description=description,
                price=price,
                stock=stock
            )
            item.save()

            return Response({'message': 'Item added to inventory'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View Transactions
class ViewTransactions(APIView):
    def get(self, request):
        transactions = Transaction.objects.all().values('id', 'user', 'transaction_date', 'total_amount')
        return Response({'transactions': list(transactions)}, status=status.HTTP_200_OK)

# Manage Cashiers
class ManageCashiers(APIView):
    queryset = Cashier.objects.all()
    serializer_class = CashierSerializer
    def get(self, request):
        cashiers = (
            Cashier.objects.select_related('User')
            .filter(user__role='Cashier')
            .values(
                'id', 
                'user__name as user_name', 
                'user__email as user_email', 
                'user__phone as user_phone', 
                'shift_start_time', 
                'shift_end_time'
            )
        )
        return Response({'cashiers': list(cashiers)}, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            data = request.data
            user_data = data.get('user', {})
            shift_start_time = data.get('shift_start_time')
            shift_end_time = data.get('shift_end_time')

            if not user_data.get('name') or not user_data.get('email') or not user_data.get('phone'):
                return Response({'error': 'Name, email, and phone are required'}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.create(
                name=user_data['name'], 
                email=user_data['email'], 
                phone=user_data['phone'], 
                role='Cashier'
            )
            Cashier.objects.create(
                user=user,
                shift_start_time=shift_start_time,
                shift_end_time=shift_end_time
            )

            return Response({'message': 'Cashier added successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, cashier_id):
        try:
            data = request.data
            user_data = data.get('user', {})
            shift_start_time = data.get('shift_start_time')
            shift_end_time = data.get('shift_end_time')

            cashier = get_object_or_404(Cashier, id=cashier_id)
            user = cashier.user

            # Update user fields
            user.name = user_data.get('name', user.name)
            user.email = user_data.get('email', user.email)
            user.phone = user_data.get('phone', user.phone)
            user.save()

            # Update shift times
            cashier.shift_start_time = shift_start_time or cashier.shift_start_time
            cashier.shift_end_time = shift_end_time or cashier.shift_end_time
            cashier.save()

            return Response({'message': 'Cashier updated successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, cashier_id):
        try:
            cashier = get_object_or_404(Cashier, id=cashier_id)
            cashier.user.delete()  # Deletes the associated User as well
            return Response({'message': 'Cashier deleted successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Manage Delivery Person
class ManageDeliveryPerson(APIView):
    def get(self, request):
        delivery_persons = DeliveryPerson.objects.all().values('id', 'user', 'vehicle_number')
        return Response({'delivery_persons': list(delivery_persons)}, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            data = request.data
            user_id = data.get('user_id')
            vehicle_number = data.get('vehicle_number')

            user = get_object_or_404(User, id=user_id)

            delivery_person = DeliveryPerson(user=user, vehicle_number=vehicle_number)
            delivery_person.save()

            return Response({'message': 'Delivery person added successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AdminDashboardView(APIView):
    def get(self, request):
        # Admin Dashboard Data
        total_users = User.objects.count()
        total_cashiers = User.objects.filter(role='Cashier').count()
        total_customers = User.objects.filter(role='Customer').count()
        total_items = InventoryItem.objects.count()
        total_transactions = Transaction.objects.count()
        total_feedback = Feedback.objects.count()

        # Return aggregated data for dashboard
        return Response({
            'message': 'Admin Dashboard data',
            'total_users': total_users,
            'total_cashiers': total_cashiers,
            'total_customers': total_customers,
            'total_items': total_items,
            'total_transactions': total_transactions,
            'total_feedback': total_feedback,
        }, status=status.HTTP_200_OK)
# Add Delivery Person View
class AddDeliveryPersonView(APIView):
    def post(self, request):
        try:
            data = request.data
            user_id = data.get('user_id')
            vehicle_number = data.get('vehicle_number')

            # Validate user exists
            user = get_object_or_404(User, id=user_id)

            # Create and save the delivery person
            delivery_person = DeliveryPerson(user=user, vehicle_number=vehicle_number)
            delivery_person.save()

            return Response({'message': 'Delivery person added successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# View Feedback View
class ViewFeedbackView(APIView):
    def get(self, request):
        feedback = Feedback.objects.all().values('id', 'customer', 'item', 'feedback_text', 'rating', 'created_at')
        return Response({'feedback': list(feedback)}, status=status.HTTP_200_OK)
# View Customer History
class ViewCustomerHistory(APIView):
    def get(self, request):
        customer_id = request.query_params.get('customer_id')
        if not customer_id:
            return Response({'error': 'Customer ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Fetching transaction history for the customer
        customer = get_object_or_404(Customer, id=customer_id)
        transactions = Transaction.objects.filter(customer=customer).values('id', 'transaction_date', 'total_amount')

        return Response({'customer_history': list(transactions)}, status=status.HTTP_200_OK)

# Manage Delivery Person (Updated)
class ManageDeliveryPerson(APIView):
    def get(self, request):
        delivery_persons = DeliveryPerson.objects.all().values('id', 'user', 'vehicle_number')
        return Response({'delivery_persons': list(delivery_persons)}, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            data = request.data
            user_id = data.get('user_id')
            vehicle_number = data.get('vehicle_number')

            user = get_object_or_404(User, id=user_id)

            delivery_person = DeliveryPerson(user=user, vehicle_number=vehicle_number)
            delivery_person.save()

            return Response({'message': 'Delivery person added successfully'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, delivery_person_id):
        try:
            data = request.data
            delivery_person = get_object_or_404(DeliveryPerson, id=delivery_person_id)
            delivery_person.vehicle_number = data.get('vehicle_number', delivery_person.vehicle_number)
            delivery_person.save()

            return Response({'message': 'Delivery person updated successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, delivery_person_id):
        try:
            delivery_person = get_object_or_404(DeliveryPerson, id=delivery_person_id)
            delivery_person.delete()
            return Response({'message': 'Delivery person deleted successfully!'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Admin specific API Root View (for Admin Dashboard)
def admin_api_root(request):
    return JsonResponse({
        'message': 'Welcome to the Admin Dashboard API!',
        'endpoints': {
            'view_users': '/api/view_users/',
            'view_cashiers': '/api/manage_cashiers/',
            'view_inventory': '/api/manage_inventory/',
            'view_customer_history': '/api/view_customer_history/',
            'view_feedback': '/api/view_feedback/',
            'manage_delivery_person': '/api/manage_delivery_person/',
        }
    })