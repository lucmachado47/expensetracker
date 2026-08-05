"""Expose the ExpenseTracker WSGI application."""

import os

from django.core.wsgi import get_wsgi_application # type: ignore[import-untyped]

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'expensetracker.settings')

application = get_wsgi_application()
