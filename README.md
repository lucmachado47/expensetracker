# ExpenseTracker

ExpenseTracker is a full-stack personal finance application for recording, organizing, and reviewing income, expenses, and investments.

## Project Overview

Managing personal finances is easier when transactions are organized, searchable, and visible in a single monthly view. ExpenseTracker provides a private workspace where each authenticated user can maintain categories, record financial activity, and review selected-period totals.

The project is intended for individuals who want a focused, browser-based way to track their personal financial activity. It also demonstrates a Django REST API integrated with a vanilla JavaScript frontend and JWT-based authentication.

## Features

### Authentication

- User registration with username, email, password, and password confirmation.
- JWT-based sign-in using access and refresh tokens.
- Protected API endpoints and authenticated frontend pages.
- Automatic access-token renewal after an unauthorized API response when a valid refresh token is available.
- User-scoped categories and transactions.

### Finance Management

- Categories with fixed, variable, or one-time frequency.
- Transactions for income, expense, and investment activity.
- Transaction category, amount, date, and description fields.
- Category and transaction creation, editing, and deletion.
- Category search by name or frequency.
- Transaction search by category, type, or description.
- Paginated category and transaction lists.
- Month and year filtering for transactions.
- Dashboard totals for income, expenses, investments, and net balance.
- Bar chart comparing selected-period income, expenses, and investments.
- Pending labels for future-dated expenses on the dashboard.

### User Experience

- Responsive sidebar navigation on desktop and bottom navigation on smaller screens.
- Light and dark theme toggle with persisted preference.
- Skeleton rows and chart placeholders while dashboard and table data loads.
- Toast notifications for successful actions and request errors.
- Custom keyboard-accessible confirmation modal for deletions.
- Contextual empty states for category and transaction tables.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Backend | Python, Django, Django REST Framework |
| Frontend | HTML5, CSS3, Vanilla JavaScript (ES modules) |
| Database | SQLite |
| Authentication | JSON Web Tokens via `djangorestframework-simplejwt` |
| Charts | Chart.js |
| Deployment-ready technologies | Django WSGI and ASGI entry points, CORS middleware |

## Project Structure

```text
ExpenseTracker/
├── backend/
│   └── expensetracker/
│       ├── expensetracker/       # Django configuration, routing, WSGI, and ASGI entry points
│       ├── finance/              # Models, serializers, views, pagination, and migrations
│       ├── api_tests.http        # Example HTTP requests for the API
│       └── manage.py             # Django management command entry point
├── frontend/
│   ├── css/                      # Shared, responsive, and page-specific styles
│   ├── js/                       # API, authentication, dashboard, form, and UI helpers
│   ├── dashboard.html            # Dashboard page
│   ├── categories.html           # Category management page
│   ├── transactions.html         # Transaction management page
│   ├── index.html                # Sign-in page
│   └── register.html             # Registration page
├── docs/                         # Project documentation
├── requirements.txt              # Python dependencies
└── README.md
```

## Screenshots

### Dashboard

<p align="center">
  <img src="docs/screenshots/dashboard-dark.png" alt="Dashboard - Dark Mode" width="48%">
  <img src="docs/screenshots/dashboard-light.png" alt="Dashboard - Light Mode" width="48%">
</p>

---

### Transactions

<p align="center">
  <img src="docs/screenshots/transactions-dark.png" alt="Transactions - Dark Mode" width="48%">
  <img src="docs/screenshots/transactions-light.png" alt="Transactions - Light Mode" width="48%">
</p>

---

### Categories

<p align="center">
  <img src="docs/screenshots/categories-dark.png" alt="Categories - Dark Mode" width="48%">
  <img src="docs/screenshots/categories-light.png" alt="Categories - Light Mode" width="48%">
</p>

---

### Login

<p align="center">
  <img src="docs/screenshots/login-dark.png" alt="Login - Dark Mode" width="48%">
  <img src="docs/screenshots/login-light.png" alt="Login - Light Mode" width="48%">
</p>

---

### Register

<p align="center">
  <img src="docs/screenshots/register-dark.png" alt="Register - Dark Mode" width="48%">
  <img src="docs/screenshots/register-light.png" alt="Register - Light Mode" width="48%">
</p>

---

### Mobile

<p align="center">
  <img src="docs/screenshots/dashboard-mobile.png" alt="Dashboard - Mobile" width="30%">
  <img src="docs/screenshots/transactions-mobile.png" alt="Transactions - Mobile" width="30%">
  <img src="docs/screenshots/categories-mobile.png" alt="Categories - Mobile" width="30%">
</p>

## Installation

### Prerequisites

- Python 3.12 or later
- A modern web browser
- A static web server for the frontend, such as VS Code Live Server

### 1. Clone the repository

```bash
git clone <repository-url>
cd ExpenseTracker
```

### 2. Create and activate a virtual environment

**Windows (PowerShell)**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS/Linux**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install backend dependencies

```bash
pip install -r requirements.txt
```

### 4. Required Environment Variables

The current project does not read environment variables. Instead, the Django settings module requires a local secrets file. Create `backend/expensetracker/expensetracker/secrets.py`:

```python
SECRET_KEY = "replace-with-a-long-random-secret-key"
```

To generate a development key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

## Running Locally

### Backend

From the Django project directory, apply migrations and start the API server:

```bash
cd backend/expensetracker
python manage.py migrate
python manage.py runserver
```

The backend runs at `http://127.0.0.1:8000`.

### Create a Superuser

From `backend/expensetracker`, run:

```bash
python manage.py createsuperuser
```

The Django admin is available at `http://127.0.0.1:8000/admin/`.

### Frontend

Serve the `frontend` directory at `http://127.0.0.1:5500`. For example, use VS Code Live Server configured to use port `5500`, then open:

```text
http://127.0.0.1:5500/register.html
```

The backend currently permits this frontend origin through `CORS_ALLOWED_ORIGINS`. If a different host or port is used, update `backend/expensetracker/expensetracker/settings.py` accordingly.

### Running Both Servers

Keep the Django server running in one terminal and the frontend static server running in another. Register a user, sign in, create categories, and then add transactions.

## Authentication

1. The login form sends credentials to `POST /api/token/`.
2. The API returns an access token and a refresh token.
3. The frontend stores both tokens in browser `localStorage` and attaches the access token as `Authorization: Bearer <access_token>` to API requests.
4. If a request returns `401 Unauthorized`, the frontend posts the refresh token to `POST /api/token/refresh/`.
5. When refresh succeeds, the frontend stores the replacement access token and retries the original request once. If it fails, the stored tokens are removed and the user is redirected to the login page.

The backend restricts category and transaction querysets to the authenticated user. It also rejects transactions that reference a category owned by another user.

## API Overview

Base URL: `http://127.0.0.1:8000/api`

### Authentication

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/token/` | No | Obtain access and refresh tokens with username and password. |
| `POST` | `/token/refresh/` | No | Obtain a new access token from a refresh token. |

### Users

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/register/` | No | Create a user with username, email, password, and password confirmation. |
| `GET` | `/secret/` | Required | Return a protected sample response for the authenticated user. |

### Categories

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET`, `POST` | `/categories/` | Required | List or create the current user's categories. Supports `page`, `page_size`, and `search` query parameters. |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/categories/{id}/` | Required | Retrieve, update, or delete a current-user category. |

### Transactions

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET`, `POST` | `/transactions/` | Required | List or create the current user's transactions. Supports `page`, `page_size`, `month`, `year`, and `search` query parameters. |
| `GET`, `PUT`, `PATCH`, `DELETE` | `/transactions/{id}/` | Required | Retrieve, update, or delete a current-user transaction. |

### Dashboard

The dashboard uses the transactions collection endpoint with the selected `month` and `year`, requesting up to 1,000 records. It calculates totals and renders the chart in the frontend; there is no separate dashboard API endpoint.

## Design Highlights

- Responsive application shell that changes from a desktop sidebar to mobile bottom navigation.
- Theme-aware interface with persisted light and dark preferences.
- Loading skeletons to avoid empty table and chart areas during requests.
- Non-blocking toast feedback for success and error states.
- Custom confirmation modal that supports keyboard dismissal and focus containment.
- Empty-state messaging and paginated data tables for easier browsing.

## License

MIT License.

## Author

Author information: `Lucas Machado de Almeida`
