from rest_framework.response import Response # type: ignore
from rest_framework import status, generics # type: ignore
from rest_framework.views import APIView # type: ignore
from rest_framework.exceptions import ValidationError # type: ignore
from finance.models import Category, Transaction # type: ignore
from .serializers import CategorySerializer, TransactionSerializer, RegisterSerializer # type: ignore
from rest_framework.permissions import IsAuthenticated # type: ignore

# Create your views here.

class RegisterView(APIView):
    """Endpoint for registering a new user. POST username, email, password, password2."""

    def post(self, request):
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
    """Endpoint for accessing secret data. Requires authentication."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "This is secret data accessible only to authenticated users.",
            "user": request.user.username,
        })

class CategoryListCreateView(generics.ListCreateAPIView): # type: ignore
    """Endpoint for listing and creating categories. Requires authentication."""

    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView): # type: ignore
    """Endpoint for retrieving, updating, and deleting a category. Requires authentication."""

    permission_classes = [IsAuthenticated]
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)
    
class TransactionListCreateView(generics.ListCreateAPIView): # type: ignore
    """Endpoint for listing and creating transactions. Requires authentication."""

    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')

        if month:
            try:
                month = int(month)
            except ValueError:
                    raise ValidationError({"month": "Month must be an integer."})
            
            if not 1 <= month <= 12: 
                raise ValidationError({"month": "Month must be between 1 and 12."})   
            
            queryset = queryset.filter(transaction_date__month=month)
            

        if year:
            try:
                year = int(year)
            except ValueError:
                raise ValidationError({"year": "Year must be an integer."}) 
             
            queryset = queryset.filter(transaction_date__year=year)

        return queryset 

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView): # type: ignore
    """Endpoint for retrieving, updating, and deleting a transaction. Requires authentication."""

    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)