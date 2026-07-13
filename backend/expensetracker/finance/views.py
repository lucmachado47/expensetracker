from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from rest_framework.views import APIView # type: ignore
from .serializers import RegisterSerializer # type: ignore
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