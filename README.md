# Shipment Status Tracker

A full-stack application for creating shipments and tracking them through their status lifecycle, with a complete history of every status change.

**Live app:** [shipment-status-tracker.vercel.app](https://shipment-status-tracker.vercel.app/) · **API health check:** [/api/health](https://shipment-status-tracker-uof9.onrender.com/api/health)

---

## 1. Overview

Shipment Status Tracker lets an operations user create shipments, find them by reference number or status, move them through a defined status flow, and review the full timeline of changes for each shipment.

It was built as a take-home technical assessment. The focus is on a clear data model, business rules enforced on the server, and code that is easy to read and reason about rather than production-level polish.

---

## 2. Features

- **Shipment creation** with a unique reference number, origin, destination, and expected delivery date
- **Dashboard** listing shipments, newest first, with their current status
- **Search** by reference number (case-insensitive, partial match)
- **Status filtering**
- **Server-side pagination** with page/limit and total-count metadata
- **Frontend pagination controls** (Previous / Next) on the dashboard
- **Shipment details page** for a single shipment
- **Status timeline** showing every status change in chronological order, with timestamp and optional note
- **Status updates** with an optional note
- **Valid transition enforcement**: the UI only offers valid next statuses, and the backend rejects invalid ones
- **Optimistic concurrency control** on status updates, returning HTTP 409 for stale concurrent requests
- **Loading, empty, validation, and API-error states**
- **Responsive UI** for desktop, tablet, and mobile
- **Direct-link support** on Vercel, so refreshing `/create` or `/shipments/:id` works

---

## 3. Tech Stack

| Technology | Purpose | Why it was chosen |
| --- | --- | --- |
| React 19 | Frontend UI | Component model suits the dashboard, form, and details views. |
| Vite | Frontend tooling | Fast dev server and simple production build. |
| TypeScript | Frontend and backend language | Typed API data, form inputs, and domain models on both sides. |
| React Router | Client-side routing | Separate routes for the dashboard, create form, and shipment details. |
| Axios | HTTP client | Consistent request handling and access to backend error messages. |
| Tailwind CSS | Styling | Consistent, responsive UI without a separate component library. |
| Node.js + Express 5 | REST API | Lightweight and straightforward for a small CRUD-style API. |
| Prisma 7 (with `pg` adapter) | ORM and migrations | Typed queries, a readable schema, and committed migration files. |
| PostgreSQL (Supabase) | Database | Relational data with constraints and indexes; managed hosting avoids local database setup. |
| Vercel / Render | Hosting | Frontend and backend deployed independently. |

---

## 4. Architecture

```
React / Vite frontend
        ↓
      Axios
        ↓
Express / TypeScript REST API   (routes → controllers)
        ↓
   Service layer
        ↓
     Prisma
        ↓
Supabase PostgreSQL
```

- **Routes** map HTTP endpoints to controller handlers.
- **Controllers** validate input, enforce status-transition rules, and translate errors into HTTP responses.
- **Service layer** (`shipment.service.ts`) contains the Prisma queries.
- **Prisma** talks to Supabase PostgreSQL through the `pg` driver adapter.

The frontend and backend are **deployed separately**: the frontend on Vercel and the API on Render. The frontend receives the API base URL through the `VITE_API_BASE_URL` environment variable.

---

## 5. Project Structure

```
Shipment-status-tracker/
├── client/
│   ├── src/
│   │   ├── components/        # SearchBar, ShipmentCard, StatusBadge, StatusTimeline
│   │   ├── pages/             # Dashboard, CreateShipment, ShipmentDetails
│   │   ├── services/api.ts    # Axios instance and API functions
│   │   ├── types/shipment.ts  # Shared frontend types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vercel.json            # Rewrites all routes to /index.html (SPA routing)
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/
│   │   ├── controllers/       # shipment.controller.ts
│   │   ├── routes/            # shipment.routes.ts
│   │   ├── services/          # shipment.service.ts
│   │   ├── lib/prisma.ts      # Prisma client and connection pool settings
│   │   ├── app.ts             # Express app, middleware, health check
│   │   └── server.ts          # Startup: connects to the DB, then listens
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/        # Committed SQL migrations
│   ├── prisma7.config.ts      # Prisma CLI configuration
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 6. Database Design

### `Shipment`

The current, operational view of a shipment.

| Field | Notes |
| --- | --- |
| `id` | UUID primary key |
| `referenceNumber` | Unique |
| `origin`, `destination` | Required text |
| `currentStatus` | Enum: `BOOKED`, `IN_TRANSIT`, `CUSTOMS_HOLD`, `DELIVERED`; defaults to `BOOKED` |
| `expectedDeliveryDate` | Required |
| `createdAt`, `updatedAt` | Timestamps |

### `ShipmentStatusHistory`

One row per status event.

| Field | Notes |
| --- | --- |
| `id` | UUID primary key |
| `shipmentId` | Foreign key to `Shipment` (cascade on delete) |
| `status` | The status the shipment moved into |
| `note` | Optional |
| `createdAt` | When the change happened |

### Relationship and rationale

One `Shipment` has many `ShipmentStatusHistory` records (**one-to-many**).

The current status is stored on `Shipment` so listing, filtering, and validating transitions never need to scan history. History is stored separately so every change is preserved with its timestamp and note instead of being overwritten.

Indexes: unique index on `Shipment.referenceNumber`, index on `Shipment.currentStatus`, and index on `ShipmentStatusHistory.shipmentId`.

---

## 7. Status Flow

```
BOOKED
  └── IN_TRANSIT
        ├── CUSTOMS_HOLD
        │     ├── IN_TRANSIT
        │     └── DELIVERED
        └── DELIVERED
```

| Current status | Allowed next status |
| --- | --- |
| `BOOKED` | `IN_TRANSIT` |
| `IN_TRANSIT` | `CUSTOMS_HOLD`, `DELIVERED` |
| `CUSTOMS_HOLD` | `IN_TRANSIT`, `DELIVERED` |
| `DELIVERED` | None |

**`DELIVERED` is a terminal status.** No further transitions are allowed once a shipment is delivered.

Every new shipment starts as `BOOKED` and gets an initial history record. Every later status update adds a new history record.

---

## 8. Pagination

`GET /api/shipments` is paginated on the server.

| Parameter | Default | Rules |
| --- | --- | --- |
| `page` | `1` | Positive integer |
| `limit` | `10` | Positive integer, maximum `100` |

- Implemented with Prisma offset pagination (`skip` / `take`), ordered by `createdAt` descending.
- The response includes `total` and `totalPages`.
- `search` and `status` filters are applied **before** pagination, so counts and pages reflect the filtered result.
- Invalid `page` or `limit` values return HTTP 400.
- On the dashboard, **Previous / Next** controls appear when there is more than one page, and changing the search text or status filter resets the page to 1.

**Example**

```http
GET /api/shipments?status=IN_TRANSIT&page=1&limit=10
```

```json
{
  "shipments": [
    {
      "id": "…",
      "referenceNumber": "SHP-1001",
      "origin": "Mumbai",
      "destination": "Rotterdam",
      "currentStatus": "IN_TRANSIT",
      "expectedDeliveryDate": "2026-10-05T00:00:00.000Z",
      "createdAt": "…",
      "updatedAt": "…"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## 9. Concurrency Control

Status updates use **optimistic concurrency control**.

1. The API reads the shipment and its `currentStatus`.
2. It validates the requested transition against that status.
3. It updates the shipment with a condition on both the `id` **and the status that was read**:

   ```ts
   where: { id, currentStatus: shipment.currentStatus }
   ```

4. If another request changed the status in the meantime, no row matches. Prisma raises `P2025`, and the API converts it into **HTTP 409 Conflict** with a message asking the user to refresh and retry.

**Conceptual example**

```
Request A reads IN_TRANSIT
Request B reads IN_TRANSIT

A updates WHERE id = X AND currentStatus = IN_TRANSIT
  → succeeds (status is now DELIVERED)

B attempts the same condition
  → no longer matches
  → 409 Conflict
```

This prevents two stale requests from both overwriting the same shipment.

The status update and the history record are written together with a single Prisma **nested write**, so a successful update always produces exactly one new history record. Interactive Prisma transactions are not used.

**Scope:** this is a status-based guard, not a row lock or a version column. It protects status changes from stale concurrent requests. It does not add other locking behavior.

**Verified with a test:** two simultaneous `PATCH` requests against the same shipment produced one `200` and one `409`, and only one new history record was created.

---

## 10. API Endpoints

Base URL (production): `https://shipment-status-tracker-uof9.onrender.com/api`

| Method | Endpoint | Description | Success | Error responses |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | Health check | `200` | – |
| `POST` | `/api/shipments` | Create a shipment (starts as `BOOKED`) | `201` | `400` validation, `409` duplicate reference number |
| `GET` | `/api/shipments` | List shipments (search, filter, pagination) | `200` | `400` invalid query parameter |
| `GET` | `/api/shipments/:id` | One shipment with its full status history (oldest to newest) | `200` | `404` not found |
| `PATCH` | `/api/shipments/:id/status` | Update status, with an optional note | `200` | `400` invalid status or transition, `404` not found, `409` stale concurrent update |

### `GET /api/shipments` query parameters

| Parameter | Description |
| --- | --- |
| `search` | Case-insensitive partial match on reference number |
| `status` | One of `BOOKED`, `IN_TRANSIT`, `CUSTOMS_HOLD`, `DELIVERED` |
| `page` | Page number (default `1`) |
| `limit` | Page size (default `10`, max `100`) |

### Request bodies

`POST /api/shipments`

```json
{
  "referenceNumber": "SHP-1001",
  "origin": "Mumbai",
  "destination": "Rotterdam",
  "expectedDeliveryDate": "2026-10-05"
}
```

`PATCH /api/shipments/:id/status`

```json
{
  "status": "IN_TRANSIT",
  "note": "Departed origin port"
}
```

Errors are returned as JSON in the form `{ "message": "…" }`.

---

## 11. Local Setup

**Prerequisites:** Node.js and npm, plus a PostgreSQL database (for example a Supabase project).

### Backend

```bash
cd server
npm install
```

Create `server/.env` (see `server/.env.example`):

```env
DATABASE_URL=<SUPABASE_SESSION_POOLER_URL>
DIRECT_URL=<SUPABASE_SESSION_POOLER_URL>
```

Then generate the Prisma client, apply the migrations, and start the dev server:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The API runs on `http://localhost:5000` unless `PORT` is set. The generated Prisma client is not committed, so `npx prisma generate` is required on a fresh clone.

### Frontend

In a second terminal:

```bash
cd client
npm install
```

Create `client/.env` (see `client/.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

```bash
npm run dev
```

### Backend scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the TypeScript source directly with `tsx` in watch mode (development) |
| `npm run build` | Compiles TypeScript to `dist/` (production build) |
| `npm start` | Runs the compiled backend (`node dist/server.js`) |

---

## 12. Environment Variables

| File | Variable | Purpose |
| --- | --- | --- |
| `client/.env` | `VITE_API_BASE_URL` | Base URL of the backend API, including the `/api` path. Read at build time by Vite. |
| `server/.env` | `DATABASE_URL` | PostgreSQL connection string used by the running application. |
| `server/.env` | `DIRECT_URL` | PostgreSQL connection string used by the Prisma CLI for migrations. |
| `server/.env` (optional) | `PORT` | Port the API listens on. Defaults to `5000`. |

Use environment-specific values for local and deployed environments. **Never commit real credentials.** Real `.env` files are git-ignored; only the `.env.example` files are committed.

---

## 13. Deployment

| Part | Platform |
| --- | --- |
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase PostgreSQL |

- Vercel deploys the `client` directory. `client/vercel.json` rewrites all routes to `/index.html`, so direct visits and refreshes of `/create` and `/shipments/:id` work.
- Render deploys the `server` directory. The Prisma client must be generated before the TypeScript build because generated files are not committed.
- The production API base URL is provided to the frontend through `VITE_API_BASE_URL`.
- The backend listens on `0.0.0.0` and uses the port provided by Render (`PORT`).
- If the Render service runs on a free instance, it may spin down when idle, so the first request after a quiet period can be slow.

---

## 14. Deployment Links

- **Frontend:** [https://shipment-status-tracker.vercel.app/](https://shipment-status-tracker.vercel.app/)
- **Backend API:** [https://shipment-status-tracker-uof9.onrender.com/api](https://shipment-status-tracker-uof9.onrender.com/api)
- **Health check:** [https://shipment-status-tracker-uof9.onrender.com/api/health](https://shipment-status-tracker-uof9.onrender.com/api/health)

---

## 15. Assumptions

- Authentication is out of scope, so there are no users or roles, and CORS is open to all origins.
- One shipment has exactly one current status.
- The reference number is unique (exact match, case-sensitive).
- The expected delivery date is required and must be a valid date. It is not restricted to future dates.
- A new shipment always starts as `BOOKED`.
- Every status change creates a history record.
- `DELIVERED` is terminal.
- The backend enforces transition rules; the frontend only mirrors them to show valid options.
- Optimistic concurrency control is implemented for status updates.
- Pagination is implemented with `page` and `limit`.

---

## 16. Scaling to 10,000+ Shipments and Multiple Concurrent Users

**Already implemented**

- Server-side pagination with a bounded page size (max 100), so the API never returns the full table
- Separate list and count queries, run in parallel
- Filters applied in the database before pagination
- Optimistic concurrency control on status updates
- Connection pooling (pool of up to 10 connections, with idle timeout and keep-alive settings)
- Indexes on `currentStatus`, `referenceNumber` (unique), and `ShipmentStatusHistory.shipmentId`

**Potential future improvements**

- Additional indexes based on real query patterns, such as a composite index on `(currentStatus, createdAt)` for filtered, sorted lists, and a trigram index if partial reference-number search needs to stay fast at scale
- Cursor-based pagination if deep offsets become slow
- Caching where freshness requirements allow
- Rate limiting and restricting CORS to the frontend origin
- Structured logging and monitoring
- Multiple backend instances behind a load balancer
- Stronger database backup and reliability strategy
- Background jobs for slow external workflows, if they are ever added

At 10,000 shipments, the current design (paginated queries, indexed filters, a bounded connection pool, and conflict-safe status updates) is already appropriate. The first changes I would make with more users and data are query-pattern-driven indexes and monitoring, then caching and horizontal scaling once measurements show they are needed.

---

## 17. Testing

Testing was done manually (API requests and UI walkthroughs). There is no automated test suite.

- Creating a shipment
- Listing shipments
- Searching by reference number
- Filtering by status
- Pagination: page 1, page 2, and page 3
- Pagination combined with search
- Pagination combined with a status filter
- Invalid `page` / `limit` validation
- Viewing shipment details
- Status updates
- Invalid status transitions
- Duplicate reference numbers
- Status history persistence
- Concurrent status updates: two simultaneous stale `PATCH` requests returned one `200` and one `409`, and only one new history record was created
- Production backend health check
- Vercel frontend deployment
- Direct refresh of `/create`
- Direct refresh of `/shipments/:id`

---

## 18. Development Approach

The project was built through incremental Git commits, one milestone at a time: backend foundation and Prisma schema, the shipment API endpoints, the React dashboard and forms, the details page and timeline, deployment fixes, and finally pagination and concurrency control.