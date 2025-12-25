# System Architecture

## Architecture Overview
The application follows a standard full-stack architecture with a React frontend and a Node.js/Express backend.

## System Architecture Diagram
(Conceptual representation)
- **Client**: Browser (React App)
- **API Gateway**: Express.js Server
- **Database**: PostgreSQL (Managed via Drizzle)
- **Auth**: JWT + Middleware

## Database ERD (Summary)
- **Tenants**: Central entity for all organization-level data.
- **Users**: Associated with a tenant (except Super Admins).
- **Projects**: Belongs to a tenant, created by a user.
- **Tasks**: Belongs to a project and a tenant.
- **Audit Logs**: Tracks user actions per tenant.

## API Endpoint List

### Auth
- `POST /api/auth/register`: Register a new tenant and admin.
- `POST /api/auth/login`: Authenticate and receive a JWT.
- `GET /api/auth/me`: Get current user info.

### Tenants
- `GET /api/tenants`: List all tenants (Super Admin only).
- `GET /api/tenants/:id`: Get tenant details.

### Users
- `GET /api/users`: List users in tenant.
- `POST /api/users`: Create a new user (Admin only).
- `PATCH /api/users/:id`: Update user details.
- `DELETE /api/users/:id`: Remove user.

### Projects
- `GET /api/projects`: List tenant projects.
- `POST /api/projects`: Create project.
- `GET /api/projects/:id`: Get project details.
- `DELETE /api/projects/:id`: Remove project.

### Tasks
- `GET /api/tasks`: List tasks (optional filter by project).
- `POST /api/tasks`: Create task.
- `PATCH /api/tasks/:id`: Update task.
- `DELETE /api/tasks/:id`: Remove task.
