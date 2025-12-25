# Technical Specification

## Project Structure
- `client/`: React frontend source code.
- `server/`: Express backend source code.
- `shared/`: Shared types, schemas, and API contracts.
- `docs/`: Project documentation.
- `database/`: Migrations and seed data.

## Development Setup

### Prerequisites
- Node.js 20+
- PostgreSQL
- Docker & Docker Compose

### Running Locally
1. Install dependencies: `npm install`
2. Set up environment variables in `.env`.
3. Push schema: `npm run db:push`
4. Start development server: `npm run dev`

### Docker Deployment
1. Build and start containers: `docker-compose up -d`
2. Access the app at `http://localhost:3000`.
