# InventraHub

A production-grade Hardware Inventory Management System scaffold built for African SME and enterprise use cases.

## Overview

This monorepo contains:

- `backend`: TypeScript + Express API with role-based user management, inventory, orders, payments, mobile-money placeholders, file uploads, and reporting.
- `frontend`: React + TypeScript + Vite responsive admin interface with authentication, dashboards, inventory management, orders, and analytics.
- `docker-compose.yml`: local development setup with backend, frontend, and PostgreSQL support.
- GitHub Actions workflow for linting and testing.
- `docs/DEVELOPER_GUIDE.md` and `docs/ARCHITECTURE.md`: developer onboarding and architecture reference.

## Getting Started

1. Install dependencies:

```bash
npm install
npm run bootstrap
```

2. Configure environment files:

- `backend/.env.example` → `backend/.env`
- `frontend/.env.example` → `frontend/.env`

3. Start local development:

```bash
npm run dev
```

4. Backend will run on `http://localhost:4000`
5. Frontend will run on `http://localhost:5173`

## Production Readiness

The scaffold includes:

- API security with JWT, cookie-based authentication, rate limiting, helmet, and CORS
- Role-based access control and business-scoped data isolation
- Transaction tracking and printable record auditing support
- Modular service architecture and secure file uploads
- Mobile money integration hooks
- Responsive React admin dashboard with session verification
- CI workflow and lint/test scripts
- Production Dockerfile and local `docker-compose.yml` support

## Docker Deployment

A root `Dockerfile` is provided for production container builds. Use it to build the app and serve the backend API in production mode.

## Notes

This repo is a solid production foundation. Replace the mobile money stubs in `backend/src/services/mobileMoney.ts` with actual MTN MoMo and Airtel Money providers and add currency/tax configuration as needed.
