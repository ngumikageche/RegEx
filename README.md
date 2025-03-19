# Marketing Reports Tracking System - Documentation

## Overview
The Marketing Reports Tracking System is designed to help businesses track their marketing team's visits to doctors, along with relevant details such as location and visit notes. This system does not require real-time GPS tracking but logs and manages visit reports for later analysis.

## Technology Stack
- **Frontend:** React.js
- **Backend:** Flask (Python)
- **Database:** PostgreSQL / MySQL
- **Deployment:** DigitalOcean (Droplet for Flask, App Platform or Nginx for React)

## Features
- User Authentication (JWT-based login)
- Role-based Access Control (Admin & Marketers)
- Log Doctor Visits (Doctor Name, Location, Date, Notes)
- Edit & Delete Visit Entries (Restricted to the creator)
- Generate Reports (Filter by Date, Doctor, Location)
- Export Reports to CSV/PDF
- Email Notifications for Admins
- Secure API Endpoints
- Mobile-Optimized Frontend
- Activity Logging for Changes

## User Stories

### 1. User Authentication
**As a Marketer, I want to log in securely so that I can access my dashboard.**
- **Stores:** Email, Password (hashed), JWT Token
- **Acceptance Criteria:**
  - The system should allow marketers to log in using their email and password.
  - A JWT token should be issued upon successful login.
  - Invalid login attempts should return appropriate error messages.

### 2. Logging Doctor Visits
**As a Marketer, I want to log my doctor visits so that I can keep track of whom I visited.**
- **Stores:** Doctor Name, Location, Date, Time, Visit Notes, User ID (who logged the visit)
- **Acceptance Criteria:**
  - Marketers can enter doctor name, location, date, and visit notes.
  - The data should be stored in the database securely.
  - Each visit should be linked to the marketer who logged it.
  - Users should be able to edit and delete their own visits but not others'.

### 3. Viewing Reports
**As an Admin, I want to view reports of doctor visits so that I can analyze marketing efforts.**
- **Stores:** Doctor Visits, User ID, Filters (Date, Location, Doctor Name)
- **Acceptance Criteria:**
  - Admins can filter reports by date, doctor, and location.
  - Reports should be accessible in tabular or graphical format.
  - The reports should be exportable to CSV or PDF.
  - Reports should aggregate visits per doctor when applicable.

### 4. Email Notifications
**As an Admin, I want to receive notifications when a marketer logs a visit so that I stay updated.**
- **Stores:** Admin Email, Visit Log Details (Doctor Name, Location, Date, Marketer)
- **Acceptance Criteria:**
  - The system should send a summary email to the admin when a new visit is logged.
  - Email should contain essential visit details.
  - Emails should be sent only once per visit log.

### 5. Role-Based Access Control
**As an Admin, I want to manage user roles so that only authorized users can perform specific actions.**
- **Stores:** User Roles (Admin, Marketer), Permissions
- **Acceptance Criteria:**
  - Admins can create, update, and delete user accounts.
  - Marketers can only log and view their own reports, while Admins can view all reports.
  - Unauthorized users should be restricted from accessing admin functionalities.

### 6. Editing and Deleting Visits
**As a Marketer, I want to edit or delete my visit logs so that I can correct mistakes or remove incorrect entries.**
- **Stores:** Visit ID, Modified Timestamp
- **Acceptance Criteria:**
  - Users can only edit or delete their own visit logs.
  - Admins can delete any visit entry if needed.
  - The system should store a history of changes for audit purposes.

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Doctor Visits
- `POST /visits` - Log a doctor visit
- `GET /visits` - Fetch all visits (Admin only)
- `GET /visits/{id}` - Fetch a specific visit
- `PUT /visits/{id}` - Edit a visit (Owner only)
- `DELETE /visits/{id}` - Delete a visit (Owner/Admin only)

### Reports
- `GET /reports` - Fetch reports with filters
- `GET /reports/export` - Export reports as CSV/PDF

## Deployment Steps

### Backend (Flask)
1. Create a DigitalOcean Droplet (Ubuntu 22.04).
2. Set up Python, Flask, and Gunicorn.
3. Configure PostgreSQL/MySQL database.
4. Deploy the API using Nginx as a reverse proxy.
5. Set up SSL using Let's Encrypt.
6. Implement logging for API requests.

### Frontend (React)
1. Build the React project (`npm run build`).
2. Deploy on DigitalOcean App Platform or Nginx.
3. Configure Nginx to serve the React frontend.
4. Ensure mobile responsiveness.

## Security Considerations
- Use HTTPS for secure data transfer.
- Store JWT tokens securely (HttpOnly cookies or local storage).
- Implement rate limiting on login and API endpoints.
- Use environment variables for database credentials.
- Implement activity logging for changes.

## Future Enhancements
- Implement a mobile app for easy access.
- Add AI-driven analytics for better report insights.
- Integrate with third-party CRM tools.
- Enable multi-user support for tracking visits per doctor.
- Optimize database queries with indexing for performance.
- Introduce Redis caching for faster report generation.

---
This documentation serves as a guide for the development, deployment, and usage of the Marketing Reports Tracking System. Further iterations may include additional features and optimizations based on user feedback.
