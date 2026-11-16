# Doctor Tracker API

Express REST API for Doctor Tracker. It handles administrator authentication, doctor and patient records, and dashboard statistics stored in MongoDB.

## Setup

Requirements: Node.js 20 or newer, npm, and MongoDB.

```sh
cp .env.example .env
npm install
```

Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in `.env`. Use a private JWT secret and a unique admin password with at least 12 characters.

Create the initial administrator and seed doctors & patients, then start the API:

```sh
npm run seed:admin
npm run seed:doctors   # or npm run seed
npm run dev
```

The API listens on port 5000 by default. `GET /api/health` provides a health check. Do not commit `.env` or share credentials in source control.

## Authentication and access

The Next.js frontend forwards requests through its same-origin `/api/*` route. After a successful login, the frontend proxy stores the JWT in an HttpOnly, same-site cookie and forwards it to this API as a bearer token. There is no public registration route; create the initial admin through the seed command.

## Technical decisions

### Stateless JWT authentication behind the frontend proxy

The API signs a JWT after verifying the administrator's bcrypt-hashed password, then verifies that token on protected requests. The frontend proxy keeps the token in an HttpOnly cookie and forwards it as a bearer token, so client-side JavaScript does not need to read or store the JWT. This keeps authentication state out of a server-side session store while preserving a same-origin browser experience.

### MongoDB indexes and server-side aggregation

Doctor and patient searches, filters, and pagination run in MongoDB rather than against full collections in the browser. Schema indexes cover common text searches and filter/sort combinations; list handlers fetch the requested page and matching count concurrently. Dashboard totals and breakdowns use aggregation pipelines so only summary data is returned to the client.

## Endpoints

- `POST /api/auth/login`, `GET /api/auth/me`
- `GET`, `POST /api/doctors`; `GET`, `PATCH`, `DELETE /api/doctors/:id`
- `GET`, `POST /api/patients`; `PATCH`, `DELETE /api/patients/:id`
- `GET /api/dashboard/stats`

Doctor, patient, and dashboard routes require an admin JWT. List endpoints accept `page` and `limit` and return pagination metadata.
