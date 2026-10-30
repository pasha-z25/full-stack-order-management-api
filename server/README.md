# API

Express, TypeORM, and PostgreSQL. The process listens on port **8888**. Every route below is under `/api`.

From the repo root, copy `server/.env.example` to `server/.env` and set `JWT_SECRET` (at least 32 characters). The server exits on startup when that value is missing or shorter. How to start Postgres, the API, and the seed is in the [root README](../README.md).

`npm run seed` loads users, products, and a few pending carts. Seed passwords are `password` plus the user index:

| Email                       | Password    |
| --------------------------- | ----------- |
| `john.doe@example.com`      | `password0` |
| `jane.smith@example.com`    | `password1` |
| `alice.johnson@example.com` | `password2` |

## Auth

`POST /api/auth/login` and `POST /api/auth/register` return a session:

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "555-555-5555",
      "avatar": "https://api.dicebear.com/...",
      "address": null,
      "balance": 500
    },
    "accessToken": "<jwt>"
  }
}
```

The token expires in **1 hour**. Send it as `Authorization: Bearer <accessToken>`.

The `user` object never includes `password` or `registered`. The same shape is nested on each order. A new account starts with balance `100`. The client cannot set `id`, `balance`, `avatar`, or `registered`.

Login body: `{ "email": "...", "password": "..." }`. Unknown email and a wrong password both return **401** with `⚠️ Invalid email or password`. An empty email or password returns **400** with `{ "status": "error", "error": { "message": "Email or password is empty" } }`.

Register body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "secret1",
  "phone": "555-0100",
  "address": "London"
}
```

`phone` and `address` are optional. Name is 2–255 characters, email must look like an email, password is 6–72 characters. Success is **201** with the same session as login. A duplicate email is **409**. Validation failures are **400** with `{ "status": "error", "message": "..." }`.

Orders and `GET /api/users` require the Bearer token. Products and `GET /api/users/:id` do not. A missing or invalid token on a protected route is **401** `{ "message": "Access token is missing or invalid" }`.

## Orders

Each user has at most one order with status `pending`. That order is the cart.

`POST /api/orders` with `{ "productId": "<uuid>", "quantity": 2 }` adds the product or increases its line. `quantity` defaults to `1`. The handler creates the pending order when the user has none. It decreases product stock and the user's balance by `price * quantity`, and returns **201** with the order.

`PATCH /api/orders/:orderId/product/:productId` with `{ "quantity": 3 }` sets that line's quantity and applies the balance and stock difference. **200** with the order.

`DELETE /api/orders/:orderId/product/:productId` removes the line, restores stock, and refunds the balance. **200** with the order. If that was the last line, the order row is deleted and the response is **204**.

`GET /api/orders` returns **200** and the current user's orders. The id in the token is the only user id these routes accept. An order owned by someone else is reported as not found.

An order looks like this:

```json
{
  "id": "uuid",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "balance": 390.05
  },
  "items": [
    {
      "id": "uuid",
      "quantity": 1,
      "product": {
        "id": "uuid",
        "title": "Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops",
        "price": 109.95,
        "stock": 42
      }
    }
  ],
  "totalPrice": 109.95,
  "status": "pending",
  "createdAt": "2026-10-31T00:00:00.000Z",
  "updatedAt": "2026-10-31T00:00:00.000Z"
}
```

`price`, `totalPrice`, and `balance` are numbers. `status` is `pending`, `shipped`, `delivered`, or `canceled`. Item rows do not include the parent order.

Missing user, product, or order is **404**. Not enough balance or stock is **409**. A non-positive quantity or a missing `productId` is **400**.

## Products and users

`GET /api/products` and `GET /api/products/:id` are public. `GET /api/users` requires a token. `GET /api/users/:id` does not. Success is **200** `{ "status": "success", "data": ... }`. An unknown id returns `data: null`.

A product has `id`, `title`, `price`, `description`, `category`, `image`, `rating` (`{ "rate", "count" }`), and `stock`.

## Errors and limits

Handled errors use `{ "status": "error", "message": "..." }` and the status from the table above. Anything else is **500** `{ "status": "error", "message": "Internal server error" }`.

Limits are per client IP, per minute:

| Routes                                            | Limit |
| ------------------------------------------------- | ----- |
| `/api/auth` (login and register share one bucket) | 5     |
| `/api/products`                                   | 60    |
| `/api/orders`, `/api/users`                       | 30    |

Over the limit: **429** `{ "status": "error", "message": "⚠️ Too many requests, please try again later." }`.

Browser CORS allows `GET`, `POST`, `PATCH`, and `OPTIONS` from `http://localhost:3000`. `DELETE` is not in that list, so a browser on the frontend origin cannot call the remove-line route. `curl` and other non-browser clients can.

## Examples

```bash
curl -s -X POST http://localhost:8888/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"password0"}'
```

```bash
curl -s http://localhost:8888/api/products
```

```bash
curl -s -X POST http://localhost:8888/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"productId":"<uuid>","quantity":2}'
```

```bash
curl -s http://localhost:8888/api/orders \
  -H "Authorization: Bearer <accessToken>"
```
