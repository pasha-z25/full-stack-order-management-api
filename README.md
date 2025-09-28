# Order Management API

A full-stack application with a Node.js/TypeScript backend (TypeORM, PostgreSQL, Express) and a React frontend. Deployed via Docker and tested with Jest.

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [npm](https://www.npmjs.com/) (v10+)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (we recommend using [Docker Desktop](https://www.docker.com/products/docker-desktop/))

## Project Structure

- `server/` — Backend
  - `src/db/` — TypeORM entities and DataSource
  - `src/services/` — Business logic
  - `test/` — Jest tests
- `web/` — React frontend
  - `src/` — Components, API calls, and styles
- `docker-compose.yml` — Docker setup

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/pasha-z25/full-stack-order-management-api.git
cd full-stack-order-management-api
```

### 2. Environment Variables

Create a `.env` file in the `server/` directory with the following:

```
DB_HOST=postgres_db_server
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=mydb_test
```

## Running the Application

### Via Docker

#### 1. Build and start containers:

```bash
docker compose up --build
```

- Backend: http://localhost:3000
- Frontend: http://localhost:8080
- Logs show Database initialized successfully on success.

#### 2. Stop:

```bash
docker compose down
```

### Locally

#### 1. Backend

- Install dependencies:

  ```bash
  cd server
  npm install
  ```

- Run:

  ```bash
  npm run dev
  ```

#### 2. Frontend

- Install dependencies:

  ```bash
  cd web
  npm install
  ```

- Run:

  ```bash
  npm run dev
  ```

- Open at http://localhost:3000.

## Running Tests

1. Ensure PostgreSQL is running (e.g., from local setup).

- Start PostgreSQL:

  ```bash
  docker compose db
  ```

2. Run backend tests:

   ```
   cd server
   npm run test
   ```

## Frontend Usage

The React app provides a UI to:

- View all users and products.
- Create orders with user ID, product ID, and quantity.
- Check order status and user balance/product stock updates.

Access it at http://localhost:3000 after starting the app.

## API Endpoints

| Method | Endpoint          | Description        | Request Body                      |
| ------ | ----------------- | ------------------ | --------------------------------- |
| GET    | `/users`          | List all users     | -                                 |
| GET    | `/users/:id`      | Get user by ID     | -                                 |
| GET    | `/products`       | List all products  | -                                 |
| POST   | `/orders`         | Create an order    | `{ userId, productId, quantity }` |
| GET    | `/orders/:userId` | List user’s orders | -                                 |

### Example API Call

```
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"userId": {uuid}, "productId": {uuid}, "quantity": 2}'
```
