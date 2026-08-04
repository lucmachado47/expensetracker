"""Serialization and validation rules for registration and finance API data."""

from django.contrib.auth import get_user_model # type: ignore
from rest_framework import serializers # type: ignore

from finance.models import Category, Transaction # type: ignore

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    """Create users while requiring a matching password confirmation."""

    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password2 = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2")

    def validate(self, attrs):
        """Reject registrations whose password confirmation does not match."""

        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        """Create the user through Django so the password is stored securely."""

        validated_data.pop("password2")
        password = validated_data.pop("password")

        return User.objects.create_user(
            password=password,
            **validated_data
        )

class CategorySerializer(serializers.ModelSerializer):
    """Expose category data while keeping ownership controlled by the API view."""

    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["user"]

class TransactionSerializer(serializers.ModelSerializer):
    """Expose transaction data and enforce ownership of the selected category."""

    category_name = serializers.CharField(
        source='category.category_name', 
        read_only=True
    )
    
    def validate_category(self, value):
        """Prevent users from attaching transactions to another user's category."""

        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("Category does not belong to the authenticated user.")
        return value

    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ["user"]

        
