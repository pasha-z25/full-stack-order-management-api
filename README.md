# Order Management API

A full-stack application with a Node.js/TypeScript backend (Express, TypeORM, PostgreSQL) and a Next.js frontend. Docker Compose runs the frontend, the API, and Postgres.

The HTTP contract lives in [`server/README.md`](server/README.md).

## Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [npm](https://www.npmjs.com/) (v10+)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) ([Docker Desktop](https://www.docker.com/products/docker-desktop/) is enough)

## Project structure

- `server/` — Express API on port 8888, prefix `/api`
- `web/` — Next.js app on port 3000
- `docker-compose.yml` — frontend, API, and Postgres

## Setup

```bash
git clone https://github.com/pasha-z25/full-stack-order-management-api.git
cd full-stack-order-management-api
cp server/.env.example server/.env
```

Fill in `JWT_SECRET` in `server/.env`. It must be at least 32 characters (`openssl rand -hex 32`). The API exits on startup when the secret is missing or shorter. Do not commit `.env`.

`server/.env.example` targets Postgres on the host (`localhost`, database `dev_db`). Docker Compose overrides `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` for the API container and still reads `JWT_SECRET` from `server/.env`.

## Running

### Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:8888
- Postgres: `localhost:5432`

A successful start logs `Database initialized successfully`. Compose also seeds users, products, and a few pending orders. Stop with `docker compose down`.

### Locally

Start only the database, then the two apps:

```bash
docker compose up db
```

```bash
cd server
npm install
npm run seed
npm run dev
```

```bash
cd web
npm install
npm run dev
```

The API is at http://localhost:8888 and the frontend at http://localhost:3000. `npm run seed` uses `DB_*` from the environment, otherwise the defaults in `.env.example` (`localhost`, `dev_db`).

## Frontend

The UI currently covers login and the product catalog at http://localhost:3000. Creating and editing a cart is available on the API; the screens for that are not wired up yet.

## API

| Method | Endpoint                                  | Auth   | Description                       |
| ------ | ----------------------------------------- | ------ | --------------------------------- |
| POST   | `/api/auth/login`                         |        | Sign in                           |
| POST   | `/api/auth/register`                      |        | Create an account and sign in     |
| GET    | `/api/products`                           |        | List products                     |
| GET    | `/api/products/:id`                       |        | Get one product                   |
| GET    | `/api/users`                              | Bearer | List users                        |
| GET    | `/api/users/:id`                          |        | Get one user                      |
| GET    | `/api/orders`                             | Bearer | List the current user's orders    |
| POST   | `/api/orders`                             | Bearer | Add a product to the pending cart |
| PATCH  | `/api/orders/:orderId/product/:productId` | Bearer | Set a line's quantity             |
| DELETE | `/api/orders/:orderId/product/:productId` | Bearer | Remove a line                     |

`POST /api/orders` takes `{ "productId": "<uuid>", "quantity": 2 }`. The user comes from the access token, not the body. Request and response details, seed logins, and curl examples are in [`server/README.md`](server/README.md).
