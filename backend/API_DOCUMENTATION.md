# API Documentation

Generated: 2025-08-14

## Auth & Conventions
- Auth: JWT (Bearer token) via `Authorization: Bearer <token>` unless noted.
- Content-Type: `application/json` for JSON endpoints; image upload uses `multipart/form-data`.
- Roles: `admin`, `user` (legacy references to doctor/marketer may appear in code).
- Timestamps: ISO 8601 unless otherwise formatted (some endpoints use `%Y-%m-%d %H:%M:%S`).
- Errors generally return `{ "error": "message" }`; success often `{ "message": "..." }` plus resource IDs.

## Summary of Route Groups
| Group | Prefix | Description |
|-------|--------|-------------|
| Auth | (none) | Login, register (admin-only), token-protected user fetch |
| Categories | /categories | CRUD for product categories |
| Products | /products | CRUD for products (with embedded images) |
| Images | /images | Image upload (Cloudinary/local) + listing + delete |
| Users | /users | Admin user management & self profile endpoints |
| User Groups | /usergroups | Admin management of user groups & membership |
| Reports | /report | Reports & visits reporting (header-based role check) |
| Visits | /visit | Logging & managing user visits |
| Notifications | /notifications | User notifications (admin create, user manage) |
| Dashboard | /dashboard | Role-based dashboard panels (identity structure differs) |

---
## Auth Endpoints

### POST /login (Public)
Body: `{ "email": string, "password": string }`
Response 200: `{ "token": string, "role": "admin|user" }`
Errors: 401 wrong credentials, 500 server.

### POST /register (Admin Only, JWT)
Body: `{ "username", "email", "password", "role"? (default user), "group_id"? }`
Response 201: `{ "message": "User registered successfully" }`
Errors: 400 validation, 403 non-admin, 404 user not found (token user), 500.

### GET /protected (JWT)
Returns current user basic profile.

### POST /logout (Public)
Body must be JSON (even though not used). Returns 200 message.

---
## Categories (/categories)
### POST /categories/ (JWT)
Body: `{ "name": string, "description"?: string }`
201: `{ "message", "category_id" }`
Errors: 400 missing/duplicate, 404 user.

### GET /categories/ (JWT)
200: `{ "categories": [ { id, name, description, user_id } ] }`

### GET /categories/{id} (JWT)
200: single category or 404.

### PUT /categories/{id} (JWT)
Body: partial updates. 200 or 404.

### DELETE /categories/{id} (JWT)
200 or 404.

---
## Products (/products)
### POST /products/ (JWT)
Body: `{ name, description?, price:number, category_id }`
201: `{ message, product_id }`
Errors: 400 missing fields, 404 user/category.

### GET /products/ (JWT)
200: `{ products: [ { id, name, description, price, user_id, category_id, images:[{ id, name, url, color }] } ] }`

### GET /products/{id} (JWT)
200: product object or 404.

### PUT /products/{id} (JWT)
Body: optional fields.
200 or 404.

### DELETE /products/{id} (JWT)
200 or 404.

---
## Images (/images)
### POST /images/upload (JWT, multipart/form-data)
Fields: `file` (binary), `name` (string), `color` (string?), `product_id` (int/string)
Process: Attempts Cloudinary upload (needs `CLOUDINARY_URL` or individual credentials) then falls back to local `static/images`.
201: `{ message, image_id, url }`
Errors: 400 missing fields, 404 user/product.
Note: Currently no explicit indication whether Cloudinary or local fallback used.

### GET /images/{product_id} (JWT)
200: `{ images: [ { id, name, url, color, user_id, product_id } ] }`

### DELETE /images/{image_id} (JWT owner or admin)
200: `{ message }`; 403 unauthorized; 404 not found.

---
## Users (/users)
NOTE: Blueprint prefix + route definitions produce paths like `/users/users`. Consider refactor.

### GET /users/users (Admin Only)
200: `[ { id, username, email, role, ... } ]`

### GET /users/users/{user_id} (JWT)
200 user object or 404.

### PUT /users/users/{user_id} (Admin Only)
Body: profile fields (camelCase in input for some).
200 or 404 / 403.

### PUT /users/users/{user_id}/change-password (Admin Only)
Body: `{ new_password }` (>=6 chars)
200 or validation errors.

### DELETE /users/users/{user_id} (Admin Only)
200 success; Errors: 400 (self-delete or last admin), 403, 404, 500.

### GET /users/me (JWT)
Current user profile.

### PUT /users/me (JWT)
Update subset of profile fields. 200.

---
## User Groups (/usergroups)
### GET /usergroups/all (JWT)
200: `{ groups: [ { id, name, description } ] }`

### GET /usergroups/user/{user_id}/role (JWT)
200: `{ user_id, role }` or 404.

### POST /usergroups/create (Admin)
Body: `{ name, description? }`
201: `{ message, group_id }`; 400 duplicates/validation.

### POST /usergroups/{group_id}/assign (Admin)
Body: `{ user_ids: [int] }`
200 message (notes count) or validation errors.

### POST /usergroups/{group_id}/remove (Admin)
Body: `{ user_ids: [int] }`
200 message.

### DELETE /usergroups/{group_id} (Admin)
200 or 404.

---
## Reports (/report)
Role logic uses `X-User-Role` header (inconsistent, potentially spoofable).

### GET /report/all-visits (Admin header required)
200: `{ report: { title, generated_at, total_visits, visits:[{ id, user_id, doctor_name, location, visit_date, notes, created_at, updated_at }] } }`

### GET /report/ (JWT)
Admin (header) sees all; user sees own.
200: `{ reports: [ { id, visit_id, user_id, title, report_text, created_at, updated_at, visit:{ doctor_name, location, visit_date } } ] }`

### GET /report/{report_id} (JWT)
Admin or owner. 200 or 403.

### POST /report/ (JWT)
Body: `{ visit_id, title, report_text }` (must own visit)
201: `{ message, report_id }`; 400 missing; 403 unauthorized.

### PUT /report/{report_id} (JWT)
Admin or owner. Body: `{ title?, report_text? }`
200 or 403/404.

### DELETE /report/{report_id} (JWT)
Admin or owner. 200 or 403/404.

---
## Visits (/visit)
### POST /visit/ (JWT)
Body: `{ doctor_name, location, visit_date:"YYYY-MM-DD HH:MM:SS", notes? }`
201: `{ message }`; 400 validation; 404 user.

### GET /visit/ (JWT)
Admin filters: `start_date`, `end_date` (YYYY-MM-DD), `user_id`, `doctor_name`.
200: `{ visits: [ { id, user_id, user_name, doctor_name, location, visit_date, notes } ] }`

### PUT /visit/{visit_id} (JWT owner/admin)
Body: partial fields (visit_date same format). 200 or 400/403/404.

### DELETE /visit/{visit_id} (JWT owner/admin)
200 or 403/404.

---
## Notifications (/notifications)
### POST /notifications/ (Admin)
Body: `{ user_id, message }`
201 or 400/403/404.

### GET /notifications/ (JWT)
200: `{ notifications: [ { id, user_id, message, is_read, created_at } ] }`

### PUT /notifications/{notification_id}/read (Owner)
200 or 403/404.

### DELETE /notifications/{notification_id} (Owner or Admin)
200 or 403/404.

---
## Dashboard (/dashboard)
Identity Expectation: Code assumes `get_jwt_identity()` returns an object/dict with role (unlike other modules using user id). Needs normalization.

### GET /dashboard/
200: `{ message, panel:"admin|user" }`

### GET /dashboard/admin/
Admin only. 200 or 403.

### GET /dashboard/admin/users
Admin only. 200 or 403.

### GET /dashboard/admin/settings
Admin only. 200 or 403.

### GET /dashboard/user/
User panel (any authenticated). 200.

### GET /dashboard/user/settings
User settings panel. 200.

---
## Environment Variables
- `CLOUDINARY_URL` (preferred) OR `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

---
## Known Inconsistencies / Improvements
| Issue | Recommendation |
|-------|----------------|
| Mixed JWT identity usage (string id vs dict) | Standardize identity to an object or consistently query DB for role | 
| `Query.get()` deprecated | Use `db.session.get(Model, id)` | 
| Reports rely on `X-User-Role` header | Derive role from JWT/DB to prevent spoofing | 
| Double `/users/users` path | Adjust route decorators to single `/users` namespace | 
| Images fallback not indicated | Include `source: "cloudinary"|"local"` in response | 
| Logout not JWT-protected | Optionally require JWT and implement token revocation/blacklist | 
| No rate limiting | Consider Flask-Limiter for auth-sensitive endpoints | 

---
## Sample Curl Commands
```bash
# Login
curl -X POST http://localhost:5000/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"secret"}'

# Create Category
curl -X POST http://localhost:5000/categories/ -H 'Authorization: Bearer <TOKEN>' -H 'Content-Type: application/json' \
  -d '{"name":"Electronics","description":"Devices"}'

# Upload Image (multipart)
curl -X POST http://localhost:5000/images/upload -H 'Authorization: Bearer <TOKEN>' \
  -F 'file=@/path/to/image.jpg' -F 'name=Front' -F 'color=red' -F 'product_id=1'
```

---
## Change Log
- Initial documentation created from code inspection (no runtime introspection).

---
## Disclaimer
This document reflects the current code snapshot; if routes change, regenerate to stay accurate.
