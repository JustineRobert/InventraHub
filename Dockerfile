# Production Dockerfile for InventraHub monorepo
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm install

FROM deps AS frontend-build
WORKDIR /app/frontend
COPY frontend/tsconfig.json ./
COPY frontend/vite.config.ts ./
COPY frontend/package.json ./
COPY frontend/src ./src
COPY frontend/index.html ./index.html
COPY frontend/public ./public
RUN npm run build --workspace frontend

FROM deps AS backend-build
WORKDIR /app/backend
COPY backend/tsconfig.json ./
COPY backend/package.json ./
COPY backend/prisma ./prisma
COPY backend/src ./src
COPY backend/.env.example ./
COPY --from=frontend-build /app/frontend/dist ./public
RUN npm run build --workspace backend

FROM node:20-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY backend/prisma ./prisma
COPY backend/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/index.js"]
