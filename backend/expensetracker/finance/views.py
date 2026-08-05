"""REST API views for registration and authenticated finance data management."""

from rest_framework.response import Response # type: ignore
from rest_framework import status, generics # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.exceptions import ValidationError # type: ignore
from finance.models import Category, Transaction # type: ignore
from finance.pagination import CustomPagination # type: ignore
from .serializers import CategorySerializer, TransactionSerializer, RegisterSerializer # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore
from django.db.models import Q # type: ignore

class RegisterView(APIView):
    """Register a new user from username, email, and matching passwords."""

    def post(self, request):
        """Validate registration data and return the new user's public details."""

        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class SecretDataView(APIView):
    """Provide a minimal endpoint for verifying JWT-protected access."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return content that is available only to the authenticated user."""

        return Response({
            "message": "This is secret data accessible only to authenticated users.",
            "user": request.user.username,
        })

class CategoryListCreateView(generics.ListCreateAPIView): # type: ignore
    """List and create categories that belong to the authenticated user."""

    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer

    def get_queryset(self):
        """Limit results to the current user so categories remain private."""

        queryset = Category.objects.filter(user=self.request.user)

        search = self.request.query_params.get('search')

        if search: 
            queryset = queryset.filter(
                Q(category_name__icontains=search)
                |
                Q(frequency__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        """Assign ownership server-side instead of accepting it from the request."""

        serializer.save(user=self.request.user)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView): # type: ignore
    """Retrieve, update, or delete a category owned by the authenticated user."""

    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer

    def get_queryset(self):
        """Restrict detail operations to categories owned by the current user."""

        return Category.objects.filter(user=self.request.user)
    
class TransactionListCreateView(generics.ListCreateAPIView): # type: ignore
    """List and create authenticated user's transactions.

    Supports optional filtering through month and year query parameters.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        """Return private transactions, optionally narrowed to a reporting period."""

        queryset = Transaction.objects.filter(user=self.request.user)

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        search = self.request.query_params.get('search')
        

        if month:
            # Validate the calendar month before applying the date filter.
            try:
                month = int(month)
            except ValueError:
                    raise ValidationError({"month": "Month must be an integer."})
            
            if not 1 <= month <= 12: 
                raise ValidationError({"month": "Month must be between 1 and 12."})   
            
            queryset = queryset.filter(transaction_date__month=month)
            

        if year:
            # Validate the optional reporting year before querying by date.
            try:
                year = int(year)
            except ValueError:
                raise ValidationError({"year": "Year must be an integer."}) 
             
            queryset = queryset.filter(transaction_date__year=year)

        if search:
            queryset = queryset.filter(
                Q(category__category_name__icontains=search)
                |
                Q(transaction_type__icontains=search)
                |
                Q(description__icontains=search)
            )

        return queryset 

    def perform_create(self, serializer):
        """Assign transaction ownership from the authenticated request."""

        serializer.save(user=self.request.user)

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView): # type: ignore
    """Retrieve, update, or delete a transaction owned by the current user."""

    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        """Restrict detail operations to transactions owned by the current user."""

        return Transaction.objects.filter(user=self.request.user)
