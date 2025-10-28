# Docker & Docker Compose Tutorial - Todo Application

This tutorial will walk you through containerizing a full-stack Todo application using Docker and Docker Compose.

## 📚 Learning Objectives

By the end of this tutorial, you will:
- Understand how to containerize applications with Docker
- Create multi-service applications using Docker Compose
- Configure service dependencies and networking
- Persist data using Docker volumes

## 🏗️ Project Structure

```
├── backend/
│   ├── server.js          # Express API server
│   ├── init.sql           # Database initialization script
│   └── package.json       # Node.js dependencies
├── frontend/
│   └── public/
│       └── index.html     # Simple HTML/CSS/JS frontend
└── README.md             # This file
```

## 🎯 Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend    │────▶│   Database   │
│   Vite      │     │   Express    │     │  PostgreSQL  │
│   :3000     │     │    :5000     │     │    :5432     │
└─────────────┘     └──────────────┘     └──────────────┘
```

---

## Step 1: Create Backend Dockerfile

Create a file named `Dockerfile` in the `backend/` directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

**Explanation:**
- `FROM node:18-alpine`: Base image with Node.js 18 on lightweight Alpine Linux
- `WORKDIR /app`: Set working directory inside container
- `COPY package*.json ./`: Copy dependency files first (Docker layer caching)
- `RUN npm install`: Install dependencies
- `COPY . .`: Copy application code
- `EXPOSE 5000`: Document the port the app uses
- `CMD ["npm", "start"]`: Command to run when container starts

---

## Step 2: Create Frontend Dockerfile

Create a file named `Dockerfile` in the `frontend/` directory:

```dockerfile
FROM nginx:alpine

COPY public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Explanation:**
- Uses nginx to serve static HTML files
- Super simple and fast
- No build process needed
- Perfect for learning Docker basics

---

## Step 3: Create .dockerignore Files

Create `.dockerignore` in `backend/`:

```
node_modules
npm-debug.log
.DS_Store
```

**Why `.dockerignore`?**
- Excludes files from Docker build context
- Speeds up builds
- Reduces image size

---

## Step 4: Create Docker Compose Configuration

Create `docker-compose.yml` in the root directory:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: todo-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: todos
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./backend/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    container_name: todo-backend
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: todos
      DB_USER: postgres
      DB_PASSWORD: postgres
      PORT: 5000
    ports:
      - "5001:5000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: on-failure

  frontend:
    build: ./frontend
    container_name: todo-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: on-failure

volumes:
  postgres-data:
```

### Service Breakdown:

**PostgreSQL Service:**
- Official postgres image
- Environment variables for database configuration
- Volume for data persistence
- Health check to ensure database is ready
- `init.sql` automatically runs on first startup

**Backend Service:**
- Built from `./backend` Dockerfile
- Environment variables connect to postgres
- `depends_on` ensures postgres is healthy before starting
- Exposes port 5000

**Frontend Service:**
- Built from `./frontend` Dockerfile
- Simple HTML/CSS/JS frontend
- Served by nginx on port 80
- Exposes port 3000 (mapped to container's port 80)
- Depends on backend service

**Volumes:**
- `postgres-data`: Persistent storage for database data

---

## Step 5: Run the Application

### Build and Start Services:

```bash
docker-compose up --build
```

**What happens:**
1. Builds Docker images for backend and frontend
2. Pulls PostgreSQL image
3. Creates network for services to communicate
4. Creates volume for database persistence
5. Starts all services in correct order

### Access the Application:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Database**: localhost:5432 (postgres/postgres)

### Useful Commands:

```bash
# Start services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (delete data)
docker-compose down -v

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Rebuild specific service
docker-compose build frontend

# Restart a service
docker-compose restart backend
```

---

## 🔍 Understanding the Configuration

### Service Dependencies:

```
┌─────────────┐
│  postgres   │ (must be healthy first)
└──────┬──────┘
       │
┌──────▼──────┐
│   backend   │ (waits for postgres)
└──────┬──────┘
       │
┌──────▼──────┐
│  frontend   │ (waits for backend)
└─────────────┘
```

The `depends_on` and health check ensure services start in the correct order.

### Network Isolation:

Docker Compose creates a default network where services can communicate using their service names:
- `postgres` resolves to the postgres container
- `backend` resolves to the backend container

### Volume Persistence:

The `postgres-data` volume persists database data even after containers are removed.

---

## 🎓 Key Concepts Learned

1. **Simple Dockerfiles**: Containerize applications without complexity
2. **Service dependencies**: Control startup order with `depends_on` and health checks
3. **Volume persistence**: Keep data safe across container restarts
4. **Environment variables**: Configure services without hardcoding values
5. **Vite simplicity**: Modern dev environment without nginx complexity

---

## 🚀 Next Steps

Try these exercises:

1. Add a health check endpoint to the backend
2. Implement database migrations
3. Add a Redis service for caching
4. Configure environment-specific settings
5. Add logging to all services
6. Create production builds with optimized Dockerfiles

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Hub](https://hub.docker.com/)
- [Best Practices for Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

## 🐛 Troubleshooting

**Port already in use:**
```bash
# Change ports in docker-compose.yml
ports:
  - "3001:3000"  # Use different host port
```

**Database not connecting:**
- Check environment variables
- Verify postgres is healthy: `docker-compose ps`
- Check logs: `docker-compose logs postgres`

**Frontend not loading:**
- Verify Vite is running: `docker-compose logs frontend`
- Check backend is running: `docker-compose logs backend`
- Test API directly: `curl http://localhost:5000/health`

---

Happy containerizing! 🐳