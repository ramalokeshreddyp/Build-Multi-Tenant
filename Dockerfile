# ---------- Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build   # builds TypeScript to /dist

# ---------- Runtime ----------
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

EXPOSE 5000
CMD ["sh", "-c", "npm run db:migrate && npm run start"]
