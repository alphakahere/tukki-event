# Base stage
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies stage
FROM base AS dependencies
COPY package*.json ./
RUN npm ci

# Build stage
FROM dependencies AS build
COPY . .
COPY prisma ./prisma
RUN npx prisma generate
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --only=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

# Development stage
FROM dependencies AS development
ENV NODE_ENV=development

COPY . .
COPY prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
