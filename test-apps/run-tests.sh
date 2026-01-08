#!/bin/bash

# Helper script to run test apps with Docker Compose
# Usage: ./run-tests.sh [command] [options]

COMPOSE_FILE="/Users/steve/Code/Projects/GTM-Enterprises-LLC/chrome-extension-front-end-environment-variable-viewer/test-apps/docker-compose.yml"

case "$1" in
  "dev")
    echo "Starting all development servers..."
    docker compose -f "$COMPOSE_FILE" up react-demo-dev vite-demo-dev nextjs-demo-dev multicloud-demo-dev payment-demo-dev
    ;;
  "prod")
    echo "Starting all production builds..."
    docker compose -f "$COMPOSE_FILE" up react-demo-prod vite-demo-prod nextjs-demo-prod multicloud-demo-prod payment-demo-prod
    ;;
  "all")
    echo "Starting all services (dev + prod)..."
    docker compose -f "$COMPOSE_FILE" up
    ;;
  "build")
    echo "Building all services..."
    docker compose -f "$COMPOSE_FILE" build
    ;;
  "down")
    echo "Stopping all services..."
    docker compose -f "$COMPOSE_FILE" down
    ;;
  "clean")
    echo "Stopping and removing all containers, volumes, and images..."
    docker compose -f "$COMPOSE_FILE" down -v --rmi all
    ;;
  *)
    echo "Usage: $0 {dev|prod|all|build|down|clean}"
    echo ""
    echo "Commands:"
    echo "  dev    - Start all apps in development mode"
    echo "  prod   - Start all apps in production mode"
    echo "  all    - Start all apps (dev + prod)"
    echo "  build  - Build all Docker images"
    echo "  down   - Stop all running containers"
    echo "  clean  - Stop and remove everything"
    echo ""
    echo "For individual apps, use:"
    echo "  docker compose -f $COMPOSE_FILE up [service-name]"
    echo ""
    echo "Available services:"
    echo "  react-demo-dev, react-demo-prod"
    echo "  vite-demo-dev, vite-demo-prod"
    echo "  nextjs-demo-dev, nextjs-demo-prod"
    echo "  multicloud-demo-dev, multicloud-demo-prod"
    echo "  payment-demo-dev, payment-demo-prod"
    exit 1
    ;;
esac
