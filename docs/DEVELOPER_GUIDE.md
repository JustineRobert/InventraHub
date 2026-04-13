# InventraHub Developer Guide

## Purpose

This guide helps developers understand the project structure, run the app locally, extend functionality, and ship production-ready changes.

## Repo Structure

- `backend/` — Express API server written in TypeScript.
- `frontend/` — React admin dashboard built with Vite and TypeScript.
- `.github/workflows/ci.yml` — CI workflow for linting and testing.
- `docker-compose.yml` — Local development container orchestration.

## Getting Started

### Requirements

- Node.js 20+
- npm 10+ or yarn
- PostgreSQL 15+ for local development

### Install Dependencies

From the repository root:

```bash
npm install
npm run bootstrap
```

### Environment Setup

Copy the backend example env file:

```bash
cp backend/.env.example backend/.env
```

Update values as needed, especially:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `UPLOAD_DIR`

The frontend does not require an env file by default, but you can add one for custom settings.

### Run Locally

```bash
npm run dev
```

This starts both backend and frontend concurrently:

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:5173`

## Backend Overview

### Key Technologies

- Express
- Prisma
- PostgreSQL
- TypeScript
- Zod validation
- JWT authentication
- Multer file uploads

### Important Files

- `backend/src/app.ts` — Express app setup
- `backend/src/index.ts` — Server bootstrap
- `backend/prisma/schema.prisma` — Database schema
- `backend/src/routes/` — API route modules
- `backend/src/middleware/` — Authentication, authorization, error handling
- `backend/src/services/mobileMoney.ts` — Mobile money payment stub
- `backend/src/utils/prisma.ts` — Prisma client instance

### API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `POST /api/auth/otp-verify`
- `POST /api/auth/reset-password`
- `POST /api/business`
- `GET /api/business`
- `PUT /api/business/:id`
- `POST /api/inventory`
- `GET /api/inventory`
- `GET /api/inventory/low-stock`
- `PUT /api/inventory/:id`
- `DELETE /api/inventory/:id`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `POST /api/payments`
- `GET /api/payments/verify/:reference`
- `GET /api/reports/sales`
- `GET /api/reports/inventory`
- `GET /api/reports/profit`
- `POST /api/uploads/file`
- `POST /api/uploads/import`

### Migrating Database

After updating Prisma schema:

```bash
cd backend
npx prisma migrate dev --name init
```

### Notes for Production

- Replace `backend/src/services/mobileMoney.ts` with real provider integrations for MTN MoMo and Airtel Money.
- Implement secure OTP and password reset flows.
- Add strong input validation and request rate limiting.
- Configure environment variables for staging/production.

## Frontend Overview

### Key Technologies

- React
- Vite
- TypeScript
- React Router
- Axios

### Important Files

- `frontend/src/main.tsx` — App entry point
- `frontend/src/App.tsx` — Routes and layout logic
- `frontend/src/pages/` — Feature pages
- `frontend/src/components/` — Shared UI components
- `frontend/src/services/api.ts` — Axios client with auth token injection
- `frontend/src/index.css` — Global styling

### Development Notes

- Frontend proxies API calls to `http://localhost:4000` via Vite config.
- Authentication uses token storage in `localStorage`.
- Build-ready assets are produced by `npm run build`.

## Testing & Linting

### Run Lint

```bash
npm run lint
```

### Run Backend Tests

```bash
cd backend
npm test
```

### Run Frontend Tests

Currently no frontend tests are configured. Add Jest or Vitest as needed.

## Deployment

### Docker Compose

Use `docker-compose.yml` for local containerized development. Start with:

```bash
docker compose up --build
```

### CI/CD

The GitHub Actions workflow at `.github/workflows/ci.yml` runs lint and test on `push` and `pull_request`.

## Contribution Guidelines

- Keep features modular and follow the existing route/service structure.
- Add API validation in both backend routes and Prisma schema.
- Write security-focused code for authentication, authorization, and file uploads.
- Document new endpoints and environment variables.

## Extension Points

- Add real mobile money APIs in `backend/src/services/mobileMoney.ts`.
- Implement CSV/XLSX import in `backend/src/routes/upload.ts`.
- Add invoice PDF generation and export support.
- Build production dashboards in the frontend.
