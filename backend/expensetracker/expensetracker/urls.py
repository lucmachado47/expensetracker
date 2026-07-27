"""URL routes for the Django admin, JWT authentication, and finance API."""
from django.contrib import admin  # type: ignore
from django.urls import path  # type: ignore
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from finance.views import CategoryListCreateView, CategoryDetailView, RegisterView, SecretDataView, TransactionListCreateView, TransactionDetailView  # type: ignore

urlpatterns = [
    path('admin/', admin.site.urls),

    # Simple JWT issues and refreshes the tokens used by protected API requests.
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/secret/', SecretDataView.as_view(), name='secret_data'),

    path('api/categories/', CategoryListCreateView.as_view(), name='category_list_create'),
    path('api/categories/<int:pk>/', CategoryDetailView.as_view(), name='category_detail'),
    path('api/transactions/', TransactionListCreateView.as_view(), name='transaction_list_create'),
    path('api/transactions/<int:pk>/', TransactionDetailView.as_view(), name='transaction_detail'),
]
