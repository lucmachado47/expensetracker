from django.db import models # type: ignore
from django.conf import settings  # type: ignore

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)

    def __str__(self):
        return str(self.user)

class Frequency(models.TextChoices):
    FIXED = "FIXED", "Fixed"
    VARIABLE = "VARIABLE", "Variable"
    ONE_TIME = "ONE_TIME", "One-time"

class Category(models.Model):
    category_name = models.CharField(max_length=50)
    frequency = models.CharField(max_length=20, choices=Frequency.choices)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'category_name'],
                name='unique_category_per_user'
            )
        ]

    def __str__(self):
        return self.category_name

class TransactionType(models.TextChoices):
    INCOME = "INCOME", "Income"
    EXPENSE = "EXPENSE", "Expense"
    INVESTMENT = "INVESTMENT", "Investment"

class Transaction(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=20, choices=TransactionType.choices)
    transaction_amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.transaction_amount} on {self.transaction_date}"

