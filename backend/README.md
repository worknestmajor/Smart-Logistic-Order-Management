# Logistics Order Management Backend

## Stack
- Django + DRF
- JWT (SimpleJWT)
- PostgreSQL-ready settings
- Redis + Celery-ready structure

## Architecture Summary
- `core/base_model.py`: UUID + timestamps + soft delete (`is_active`)
- `core/base_manager.py`: reusable CRUD layer with hooks
- `core/base_serializer.py`: shared serializer validation
- `core/base_pagination.py`: standard paginated response
- `core/base_response.py`: standard API response format
- Module-level managers in `*/services/managers.py`

## Modules
- `accounts`: User, Role, JWT auth, RBAC permissions
- `orders`: order lifecycle + tracking + status transition guard
- `vehicles`: vehicle catalog and availability
- `drivers`: driver catalog and availability
- `assignments`: order-driver-vehicle assignment validations
- `pricing`: pricing config + order pricing calculation
- `invoices`: invoice lifecycle and issuance rules
- `notifications`: notification storage + Celery task stub

## Order Workflow
`CREATED -> APPROVED -> ASSIGNED -> IN_TRANSIT -> DELIVERED -> INVOICED`

Invalid transitions are blocked in `OrderManager.VALID_TRANSITIONS`.

## Quick Setup
1. Create and activate venv.
2. Install dependencies:
   - `pip install django djangorestframework djangorestframework-simplejwt psycopg2-binary celery redis django-filter python-dotenv`
3. Update `.env` (DB/Redis/secret).
4. Run migrations:
   - `python manage.py makemigrations`
   - `python manage.py migrate`
5. Create admin user:
   - `python manage.py createsuperuser`
6. Run server:
   - `python manage.py runserver`

## API Prefixes
- `api/accounts/` (users, roles, JWT token endpoints)
- `api/orders/`
- `api/vehicles/`
- `api/drivers/`
- `api/assignments/`
- `api/pricing-configs/`
- `api/invoices/`
- `api/notifications/`

## Celery
- App config: `config/celery.py`
- Example async task: `notifications/tasks.py`
- Worker command:
  - `celery -A config worker -l info`
