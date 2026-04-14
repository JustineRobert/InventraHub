# Prisma migration and client generation

This backend uses Prisma with the schema defined in `schema.prisma`.

To apply schema changes and generate the Prisma client:

```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:generate
```

If you want to open Prisma Studio:

```bash
cd backend
npm run prisma:studio
```

The migration command above will create a new migration under `backend/prisma/migrations` based on the current schema.
