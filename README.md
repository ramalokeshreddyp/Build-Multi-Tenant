# Multi-Tenant SaaS Platform

This is a production-ready, multi-tenant SaaS application with project and task management features.

## Features
- **Multi-Tenancy**: Data isolation via `tenant_id`. Subdomain support.
- **Auth**: JWT-based authentication with RBAC (Super Admin, Tenant Admin, User).
- **Subscription Management**: Free, Pro, Enterprise plans with limits.
- **Project & Task Management**: Create projects, assign tasks, track status.

## Tech Stack
- **Frontend**: React, Vite, Shadcn UI, Tailwind CSS, TanStack Query.
- **Backend**: Node.js, Express.
- **Database**: PostgreSQL with Drizzle ORM.
- **Docker**: Dockerfile and docker-compose.yml included.

## Running Locally (Replit)
1.  The app is already running!
2.  Frontend: Port 3000 (proxied via 5000 in dev) or 5000 directly.
3.  Backend: Port 5000.

## Running with Docker
1.  Ensure you have Docker and Docker Compose installed.
2.  Run:
    ```bash
    docker-compose up -d
    ```
3.  Access Frontend at `http://localhost:3000`.
4.  Access Backend at `http://localhost:5000`.



## Test Credentials
See `submission.json` for login credentials.

- **Super Admin**: superadmin@platform.com / supersecret
- **Tenant Admin**: admin@acme.com / admin123 (Subdomain: acme)
- **User**: user@acme.com / user123 (Subdomain: acme)

- 
## Documentation
- API routes are defined in `shared/routes.ts`.
- Schema is defined in `shared/schema.ts`.


## Documentation
- API routes are defined in `shared/routes.ts`.
- Schema is defined in `shared/schema.ts`.
