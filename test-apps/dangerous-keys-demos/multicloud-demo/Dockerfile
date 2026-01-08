# Development stage
FROM node:18-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5174
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage - serve the build with vite preview
FROM node:18-alpine AS prod
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY --from=build /app/dist ./dist
EXPOSE 5174
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5174"]
