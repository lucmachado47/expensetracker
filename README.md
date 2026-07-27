# ExpenseTracker

ExpenseTracker is a personal-finance web application for recording and reviewing income, expenses, and investments. It gives each user a private workspace to organize transactions into categories and view a month-by-month financial summary.

The project was created as a practical learning exercise in Django, REST API design, database modeling, JWT authentication, and frontend integration.

<!-- Screenshot placeholder: add a dashboard screenshot here. -->

## Features

- User registration and login.
- JWT-protected API and user-scoped data access.
- Categories with **Fixed**, **Variable**, and **One-time** frequencies.
- Transactions for **Income**, **Expense**, and **Investment** types.
- Transaction fields for category, amount, date, and description.
- Category and transaction listing and creation screens.
- Dashboard filtered by month and year.
- Bar chart comparing income, expenses, and investments.
- Visual identification of future-dated expenses as pending.
- Automatic refresh of expired access tokens when a valid refresh token is available.

<!-- GIF placeholder: add a short walkthrough of registration, category creation, and transaction creation here. -->

## Technology stack

| Area | Technologies |
| --- | --- |
| Backend | Python, Django, Django REST Framework |
| Authentication | djangorestframework-simplejwt (JWT) |
| Database | SQLite |
| Frontend | HTML5, CSS3, vanilla JavaScript (ES modules) |
| Charts | Chart.js |
| Cross-origin requests | django-cors-headers |

## Project structure

```text
ExpenseTracker/
├── backend/
│   └── expensetracker/
│       ├── expensetracker/     # Django project configuration and routes
│       ├── finance/            # Models, serializers, views, and migrations
│       ├── api_tests.http      # Example HTTP request file
│       └── manage.py
├── frontend/
│   ├── css/                    # Page styles
│   ├── js/                     # API, auth, dashboard, category, and transaction logic
│   └── *.html                  # Static application pages
├── docs/
│   └── database-model.md
├── requirements.txt
└── README.md
```

## Installation

### Prerequisites

- Python 3.12+ (Django 6.0 is used)
- A modern web browser
- Optionally, Node.js and npm to install the frontend's declared Chart.js dependency. The application currently loads Chart.js from a CDN at runtime.

### 1. Clone the repository

```bash
git clone <repository-url>
cd ExpenseTracker
```

### 2. Create and activate a virtual environment

**Windows (PowerShell):**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS/Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure the Django secret key

The settings module imports a local file that is intentionally ignored by Git. Create `backend/expensetracker/expensetracker/secrets.py` with:

```python
SECRET_KEY = "replace-with-a-long-random-secret-key"
```

For development, generate a value with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### 5. Apply database migrations

```bash
cd backend/expensetracker
python manage.py migrate
```

### Optional: install frontend packages

```bash
cd ../../frontend
npm install
```

## Running locally

The backend is configured to accept frontend requests from `http://127.0.0.1:5500`.

1. From `backend/expensetracker`, start Django:

   ```bash
   python manage.py runserver
   ```

   The API is available at `http://127.0.0.1:8000`.

2. Serve the `frontend` directory at port `5500`—for example, using the VS Code **Live Server** extension configured for that port—and open:

   ```text
   http://127.0.0.1:5500/register.html
   ```

3. Register an account, sign in, create categories, and add transactions.

> If a different frontend origin or port is used, add it to `CORS_ALLOWED_ORIGINS` in `backend/expensetracker/expensetracker/settings.py`.

## API overview

Base URL: `http://127.0.0.1:8000/api`

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/register/` | No | Create a user with `username`, `email`, `password`, and `password2`. |
| `POST` | `/token/` | No | Obtain JWT access and refresh tokens with username and password. |
| `POST` | `/token/refresh/` | No | Issue a new access token from a refresh token. |
| `GET` | `/secret/` | Required | Return a protected sample response for the authenticated user. |
| `GET`, `POST` | `/categories/` | Required | List the current user's categories or create a category. |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/categories/{id}/` | Required | Retrieve, update, or delete one of the current user's categories. |
| `GET`, `POST` | `/transactions/` | Required | List the current user's transactions or create a transaction. Supports optional `month` (`1`–`12`) and `year` filters on `GET`. |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/transactions/{id}/` | Required | Retrieve, update, or delete one of the current user's transactions. |

Example category payload:

```json
{
  "category_name": "Groceries",
  "frequency": "VARIABLE"
}
```

Example transaction payload:

```json
{
  "category": 1,
  "transaction_type": "EXPENSE",
  "transaction_amount": "125.50",
  "transaction_date": "2026-07-26",
  "description": "Weekly groceries"
}
```

## Authentication (JWT)

Protected endpoints require an access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

The frontend stores the access and refresh tokens in browser `localStorage`. For authenticated requests, it sends the access token automatically. On a `401 Unauthorized` response, it requests a new access token from `/api/token/refresh/`, retries the request once, and redirects to the login page if renewal fails.

The backend scopes category and transaction queries to the authenticated user. It also prevents a transaction from being assigned to another user's category.

## Future improvements

- Add edit and delete controls to the frontend for categories and transactions.
- Add automated backend and frontend test coverage.
- Add pagination, sorting, and richer transaction filtering.
- Add expense budgets and spending insights.
- Improve error feedback and accessible UI states.
- Add production deployment settings, environment-based configuration, and security hardening.

## License

No license has been specified for this repository. Add a license file before distributing or reusing the project.
