from django.contrib.auth import get_user_model # type: ignore
from rest_framework import serializers # type: ignore

from finance.models import Category, Transaction # type: ignore

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password2 = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta:
        model = User
        fields = ("username", "email", "password", "password2")

    def validate(self, attrs):
        if attrs.get("password") != attrs.get("password2"):
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password = validated_data.pop("password")

        return User.objects.create_user(
            password=password,
            **validated_data
        )

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = "__all__"
        read_only_fields = ["user"]

class TransactionSerializer(serializers.ModelSerializer):
    
    def validate_category(self, value):
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("Category does not belong to the authenticated user.")
        return value

    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ["user"]

        
