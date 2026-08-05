"""Expose the ExpenseTracker ASGI application."""

import os

from django.core.asgi import get_asgi_application  # type: ignore[import-untyped]

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expensetracker.settings')

application = get_asgi_application()
