# Development stage
FROM node:18-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage - serve with gatsby serve
FROM node:18-alpine AS prod
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY --from=build /app/public ./public
COPY --from=build /app/gatsby-config.js ./gatsby-config.js
EXPOSE 9000
CMD ["npx", "gatsby", "serve", "--host", "0.0.0.0"]
