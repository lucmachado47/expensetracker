from django.contrib import admin # type: ignore

from .models import UserProfile, Category, Transaction

admin.site.register(UserProfile)
admin.site.register(Category)
admin.site.register(Transaction)
