# Docker Setup Guide for Live Demo

This file contains the exact Docker configurations you need to create during the demo.

---

## 1. Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

---

## 2. Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host"]
```

**Explanation:**
- Much simpler than nginx setup!
- Vite dev server runs in the container
- `--host` flag makes it accessible from outside the container

---

## 3. Backend .dockerignore

Create `backend/.dockerignore`:

```
node_modules
npm-debug.log
.DS_Store
```

---

## 4. Frontend .dockerignore

Create `frontend/.dockerignore`:

```
node_modules
npm-debug.log
dist
.DS_Store
.vscode
```

---

## 5. Docker Compose Configuration

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
      - "5000:5000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: on-failure

  frontend:
    build: ./frontend
    container_name: todo-frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:5000/api
    depends_on:
      - backend
    restart: on-failure

volumes:
  postgres-data:
```

---

## 6. Run the Application

```bash
docker-compose up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432

**Stop:**
```bash
docker-compose down
```

**Stop and remove volumes (delete data):**
```bash
docker-compose down -v
```

---

## Key Differences from Complex Setup

✅ **No nginx configuration needed**
✅ **No multi-stage Dockerfile**  
✅ **Simple Vite dev server**
✅ **Easier to understand and teach**