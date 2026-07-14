# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY . .

# Generate Prisma Client
RUN npx prisma generate --schema=src/database/prisma/schema.prisma

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/database/prisma ./src/database/prisma

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
