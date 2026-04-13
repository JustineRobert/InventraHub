# InventraHub Architecture

## System Overview

InventraHub is a full-stack hardware inventory and sales operations platform with backend API services and a frontend admin dashboard. It is designed for extensibility, security, and African mobile money payment readiness.

## Backend Architecture

### Layers

- **API Layer**: Express routes under `backend/src/routes/` expose REST endpoints.
- **Service Layer**: Business logic lives in `backend/src/services/` for mobile money and payment orchestration.
- **Data Access**: `Prisma` is used as the ORM via `backend/src/utils/prisma.ts`.
- **Middleware**: Authentication and authorization are enforced in `backend/src/middleware/`.
- **Error Handling**: Central error handler returns organized JSON responses.

### Database Model

The Prisma schema defines core entities:

- `User`
- `Business`
- `Branch`
- `Category`
- `InventoryItem`
- `Customer`
- `Order`
- `OrderItem`
- `Payment`
- `FileUpload`
- `AuditLog`

Key relationships include:

- Businesses own inventory, orders, payments, branches, and users.
- Orders link customers, order items, payments, and the creating user.
- Inventory items are categorized and optionally tied to branches.

### Security

- JWT authentication for API access.
- Role-based guards for admin, manager, and sales personas.
- Helmet and CORS settings in `backend/src/app.ts`.
- File upload isolation using `multer` and an uploads directory.

### Third-Party Integrations

- Mobile money provider stubs live in `backend/src/services/mobileMoney.ts`.
- Replace stubs with actual MTN MoMo and Airtel Money API calls.

## Frontend Architecture

### Core Components

- `frontend/src/App.tsx` — App shell and routing
- `frontend/src/pages/` — Page-level components for dashboard, inventory, orders, payments, and reports
- `frontend/src/components/NavBar.tsx` — Navigation UI
- `frontend/src/services/api.ts` — Axios instance with auth header support

### UI/UX

- Responsive layout with sidebar navigation on desktop and horizontal navigation on smaller screens.
- Card-based dashboard UI.
- Accessible forms and table-based list views.

### Build & Deployment

- Vite for fast dev server and production builds.
- Proxy configuration supports backend API calls during development.
- `npm run build` produces optimized static assets.

## Deployment Diagram

1. User browser → React frontend
2. Frontend → Backend API via `/api` proxy
3. Backend → PostgreSQL via Prisma
4. Backend → MTN MoMo / Airtel Money provider (future)

## Future Enhancements

- Add offline-first mobile support
- Implement POS and barcode scanning
- Add WhatsApp notifications and AI demand forecasting
- Expand multi-currency/tax configuration and business branch management
- Add analytic dashboards with export capabilities
