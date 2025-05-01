from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SignupView,
    LoginView,
    ViewUsers,
    UpdateUser,
    DeleteUser,
    api_root,
    ResetPasswordView,
    csrf,
    InventoryItemViewSet,
    CashierViewSet,
    FeedbackViewSet,
    CustomerHistoryViewSet,
    AdminDashboardView,
    AddDeliveryPersonView,
    ViewFeedbackView,
    ManageCashiers,
    MetricsViewSet,
    ActivityViewSet,
    OrderViewSet,
    WishlistViewSet,
    LoyaltyPointsViewSet,
    RecommendedProductViewSet,
    TotalSpentView,
    RecentOrdersView,
    LoyaltyProgressView,
    OrderCountView,
    WishlistCountView,
    NotificationsView,
    NotifyUserView,
    get_orders
   
)
from .views import revenue_data

# Create a router for API endpoints
router = DefaultRouter()
router.register(r'inventory', InventoryItemViewSet, basename='inventory')
router.register(r'cashiers', CashierViewSet, basename='cashiers')
router.register(r'feedback', FeedbackViewSet, basename='feedback')
router.register(r'customer-history', CustomerHistoryViewSet, basename='customer-history')
router.register(r'metrics', MetricsViewSet, basename='metrics')
router.register(r'activities', ActivityViewSet, basename='activities')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')  # Wishlist count
router.register(r'loyalty-points', LoyaltyPointsViewSet, basename='loyalty-points')
router.register(r'recommended-products', RecommendedProductViewSet, basename='recommended-products')

urlpatterns = [
     
    path('', api_root, name='api-root'),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('users/', ViewUsers.as_view(), name='view-users'),
    path('api/orderslist/', get_orders, name='get_orders'),
    path('users/<int:pk>/', UpdateUser.as_view(), name='update-user'),
    path('users/<int:pk>/delete/', DeleteUser.as_view(), name='delete-user'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('csrf/', csrf, name='csrf'),
    path('admin-dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('add-delivery-person/', AddDeliveryPersonView.as_view(), name='add-delivery-person'),
    path('view-feedback/', ViewFeedbackView.as_view(), name='view-feedback'),
    path('api/manage-cashiers/', ManageCashiers.as_view(), name='manage-cashiers'),
    path('api/revenue/', revenue_data, name='revenue-data'),
    path('api/orders/total-spent/', TotalSpentView.as_view(), name='total-spent'),
    path('api/orders/recent/', RecentOrdersView.as_view(), name='recent-orders'),
    path('api/loyalty-progress/', LoyaltyProgressView.as_view(), name='loyalty-progress'),
    path('api/orders/count/', OrderCountView.as_view(), name='order-count'),
    path('api/wishlist/count/', WishlistCountView.as_view(), name='wishlist-count'),
    path('api/', include(router.urls)),
    path('api/notify/', NotifyUserView.as_view(), name='notify-user'),
    path('api/notifications/', NotificationsView.as_view(), name='notifications'),
    
]
