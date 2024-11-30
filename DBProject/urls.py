from django.urls import path
from .views import SignupView, LoginView, ViewUsers, UpdateUser, DeleteUser, api_root, ResetPasswordView, csrf
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', api_root),
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    
    # Custom Password Reset View
    path('reset_password/', ResetPasswordView.as_view(), name='reset_password'),
    
    # These are standard views provided by Django, not needed if you are handling the password reset manually
    # path('reset_password_sent/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    # path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    # path('reset_password_complete/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),

    path('view_users/', ViewUsers.as_view(), name='view_users'),
    path('update_user/<int:user_id>/', UpdateUser.as_view(), name='update_user'),
    path('delete_user/<int:user_id>/', DeleteUser.as_view(), name='delete_user'),

    # CSRF Token endpoint
    path('csrf/', csrf, name='csrf_token'),
]
