"""Tests for transaction list filtering, including type and date-cutoff filters."""

from django.contrib.auth import get_user_model # type: ignore
from rest_framework import status # type: ignore
from rest_framework.test import APITestCase # type: ignore

from finance.models import Category, Transaction, Frequency, TransactionType # type: ignore

User = get_user_model()


class TransactionFilterTests(APITestCase):
    """Verify the transactions endpoint's type and before query-param filters."""

    def setUp(self):
        """Create two users with categories and transactions to test filtering and isolation."""

        self.user = User.objects.create_user(username='owner', password='password123')
        self.other_user = User.objects.create_user(username='intruder', password='password123')

        self.category = Category.objects.create(
            user=self.user, category_name='Brokerage', frequency=Frequency.VARIABLE
        )
        self.other_category = Category.objects.create(
            user=self.other_user, category_name='Brokerage', frequency=Frequency.VARIABLE
        )

        self.investment_early = Transaction.objects.create(
            user=self.user, category=self.category, transaction_type=TransactionType.INVESTMENT,
            transaction_amount='100.00', transaction_date='2026-01-15',
        )
        self.investment_boundary = Transaction.objects.create(
            user=self.user, category=self.category, transaction_type=TransactionType.INVESTMENT,
            transaction_amount='200.00', transaction_date='2026-03-31',
        )
        self.investment_late = Transaction.objects.create(
            user=self.user, category=self.category, transaction_type=TransactionType.INVESTMENT,
            transaction_amount='300.00', transaction_date='2026-04-15',
        )
        self.expense = Transaction.objects.create(
            user=self.user, category=self.category, transaction_type=TransactionType.EXPENSE,
            transaction_amount='50.00', transaction_date='2026-01-15',
        )
        Transaction.objects.create(
            user=self.other_user, category=self.other_category, transaction_type=TransactionType.INVESTMENT,
            transaction_amount='999.00', transaction_date='2026-01-01',
        )

        self.client.force_authenticate(user=self.user)

    def test_type_filter_returns_only_matching_type(self):
        """The type filter should return only the requesting user's investment transactions."""

        response = self.client.get('/api/transactions/', {'type': 'INVESTMENT'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {item['id'] for item in response.data['results']}
        self.assertEqual(ids, {self.investment_early.id, self.investment_boundary.id, self.investment_late.id})

    def test_type_filter_invalid_value_returns_400(self):
        """An unrecognized type value should be rejected rather than silently ignored."""

        response = self.client.get('/api/transactions/', {'type': 'BOGUS'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('type', response.data)

    def test_before_filter_includes_boundary_date(self):
        """The before filter should include the cutoff date itself and exclude later dates."""

        response = self.client.get('/api/transactions/', {'type': 'INVESTMENT', 'before': '2026-03-31'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {item['id'] for item in response.data['results']}
        self.assertEqual(ids, {self.investment_early.id, self.investment_boundary.id})

    def test_before_filter_invalid_format_returns_400(self):
        """A malformed before value should be rejected rather than raising a server error."""

        response = self.client.get('/api/transactions/', {'before': 'not-a-date'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('before', response.data)

    def test_filters_respect_user_isolation(self):
        """Type and before filters must never surface another user's transactions."""

        response = self.client.get('/api/transactions/', {'type': 'INVESTMENT', 'before': '2026-12-31'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {item['id'] for item in response.data['results']}
        self.assertNotIn(999.00, [float(item['transaction_amount']) for item in response.data['results']])
        self.assertTrue(ids.issubset({self.investment_early.id, self.investment_boundary.id, self.investment_late.id}))


class TransactionAmountValidationTests(APITestCase):
    """Verify negative transaction_amount is only accepted for investment transactions."""

    def setUp(self):
        """Create a user and category to exercise create/update validation against."""

        self.user = User.objects.create_user(username='owner', password='password123')
        self.category = Category.objects.create(
            user=self.user, category_name='Brokerage', frequency=Frequency.VARIABLE
        )
        self.client.force_authenticate(user=self.user)

    def test_negative_amount_allowed_for_investment(self):
        """A negative amount should be accepted to represent an investment withdrawal."""

        response = self.client.post('/api/transactions/', {
            'category': self.category.id, 'transaction_type': TransactionType.INVESTMENT,
            'transaction_amount': '-150.00', 'transaction_date': '2026-05-01',
        })

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_negative_amount_rejected_for_income(self):
        """A negative amount on income should be rejected rather than silently accepted."""

        response = self.client.post('/api/transactions/', {
            'category': self.category.id, 'transaction_type': TransactionType.INCOME,
            'transaction_amount': '-150.00', 'transaction_date': '2026-05-01',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('transaction_amount', response.data)

    def test_negative_amount_rejected_for_expense(self):
        """A negative amount on an expense should be rejected rather than silently accepted."""

        response = self.client.post('/api/transactions/', {
            'category': self.category.id, 'transaction_type': TransactionType.EXPENSE,
            'transaction_amount': '-150.00', 'transaction_date': '2026-05-01',
        })

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('transaction_amount', response.data)

    def test_patch_amount_negative_rejected_using_existing_expense_type(self):
        """Patching only the amount must still validate against the instance's stored type."""

        expense = Transaction.objects.create(
            user=self.user, category=self.category, transaction_type=TransactionType.EXPENSE,
            transaction_amount='75.00', transaction_date='2026-05-01',
        )

        response = self.client.patch(f'/api/transactions/{expense.id}/', {'transaction_amount': '-75.00'})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('transaction_amount', response.data)

    def test_patch_amount_negative_allowed_using_existing_investment_type(self):
        """Patching only the amount on an investment should allow a negative value."""

        investment = Transaction.objects.create(
            user=self.user, category=self.category, transaction_type=TransactionType.INVESTMENT,
            transaction_amount='75.00', transaction_date='2026-05-01',
        )

        response = self.client.patch(f'/api/transactions/{investment.id}/', {'transaction_amount': '-75.00'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
