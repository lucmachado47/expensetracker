# Database Model

The application uses Django's configured authentication user model for account data. All finance records are scoped to that user and are deleted when the owning user is deleted.

## UserProfile

- `user`: one-to-one relationship with the configured user model.
- `profile_picture`: optional image stored under `profile_pictures/`.

## Category

- `category_name`: required label, up to 50 characters.
- `frequency`: `FIXED`, `VARIABLE`, or `ONE_TIME`.
- `user`: owning user.

A database constraint prevents the same user from creating two categories with the same name. Category names may be reused by different users. Deleting a category also deletes its transactions.

## Transaction

- `user`: owning user.
- `category`: required category.
- `transaction_type`: `INCOME`, `EXPENSE`, or `INVESTMENT`.
- `transaction_amount`: decimal amount with up to 10 digits and 2 decimal places.
- `transaction_date`: required calendar date.
- `description`: optional text.
- `created_at`: timestamp set when the record is created.

The API validates that a transaction's category belongs to the authenticated user and assigns transaction ownership from that user rather than accepting it from the request.
