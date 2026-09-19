# Shipment Status Tracker

A full-stack shipment tracking application built as a take-home technical assessment. It provides a focused workflow for creating shipments, locating them by reference number or status, reviewing their complete history, and applying only valid status transitions.

## Overview

Shipment Status Tracker gives operations users a clear view of where each shipment is in its lifecycle. The application maintains both the current shipment status and a status history so that each transition, timestamp, and optional operational note can be reviewed from the shipment details page.

## Features

- Create a shipment with a unique reference number, route, and expected delivery date
- View a responsive shipment dashboard
- Search shipments by reference number
- Filter shipments by current status
- Open a dedicated shipment details view
- Review the full status-history timeline in chronological order
- Update a shipment's status with an optional note
- Present only valid next status options in the UI
- Enforce status-transition rules in the backend
- Provide loading, empty, validation, and API-error states
- Support responsive desktop, tablet, and mobile layouts

## Tech Stack

| Technology | Purpose | Why it was chosen |
| --- | --- | --- |
| React | Frontend UI | Component-based rendering keeps the dashboard, forms, and detail views maintainable. |
| Vite | Frontend tooling | Provides a fast local development experience and production build pipeline. |
| TypeScript | Frontend and backend language | Adds type safety around API data, forms, and domain models. |
| React Router | Client-side routing | Supports clear navigation between the dashboard, create form, and shipment details. |
| Axios | HTTP client | Keeps API requests and backend error handling consistent. |
| Tailwind CSS | Styling | Enables a responsive, consistent UI without introducing a separate component library. |
| Node.js + Express | Backend API | Provides a lightweight REST API layer. |
| Prisma | ORM | Supplies typed database access and schema/migration tooling. |
| PostgreSQL on Supabase | Database | Offers a managed relational database suitable for shipment and history records. |
| Vercel + Render | Deployment | Separates frontend hosting from the API service while keeping deployment simple. |

## Architecture

The frontend is a React, Vite, and TypeScript single-page application. It uses React Router for navigation and Axios to communicate with the REST API.

The backend is an Express and TypeScript service. It owns request validation and status-transition enforcement, keeping the API as the source of truth for business rules. Prisma accesses the Supabase-hosted PostgreSQL database.

The frontend is deployed to Vercel and the backend is deployed to Render. They are deployed independently; the frontend receives the backend API base URL through an environment variable.

## Project Structure

```text
Shipment_Tracker/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ShipmentCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── StatusTimeline.tsx
│   │   ├── pages/
│   │   │   ├── CreateShipment.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── ShipmentDetails.tsx
│   │   ├── services/api.ts
│   │   ├── types/shipment.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── controllers/shipment.controller.ts
│   │   ├── lib/prisma.ts
│   │   ├── routes/shipment.routes.ts
│   │   ├── services/shipment.service.ts
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
└── README.md
```

## Database Design

### Shipment

A shipment stores the current operational view of a delivery:

- `id`
- `referenceNumber`
- `origin`
- `destination`
- `currentStatus`
- `expectedDeliveryDate`
- `createdAt`
- `updatedAt`

### ShipmentStatusHistory

Each status event is stored independently:

- `id`
- `shipmentId`
- `status`
- `note`
- `createdAt`

Storing history separately from the current status preserves an auditable timeline. The `Shipment` record can answer the common "what is the current status?" question efficiently, while `ShipmentStatusHistory` records when and how the shipment arrived there. This avoids losing operational context when the latest status changes.

## Status Flow

New shipments are created with the `BOOKED` status and an initial history record.

```text
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
| `DELIVERED` | None (terminal status) |

## API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Health-check endpoint for the backend service. |
| `POST` | `/api/shipments` | Create a shipment; new shipments start as `BOOKED`. |
| `GET` | `/api/shipments` | List shipments. |
| `GET` | `/api/shipments?search=SHP-1001` | Search shipments by reference number. |
| `GET` | `/api/shipments?status=IN_TRANSIT` | Filter shipments by current status. |
| `GET` | `/api/shipments/:id` | Get one shipment and its complete status history. |
| `PATCH` | `/api/shipments/:id/status` | Update a shipment's status and optionally add a note. |

## Local Setup

### Prerequisites

- Node.js and npm
- A Supabase PostgreSQL project, or another compatible PostgreSQL database

### Frontend

From the repository root:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

### Backend

From the repository root:

```bash
cd server
npm install
```

Create `server/.env`:

```env
DATABASE_URL=<SUPABASE_SESSION_POOLER_URL>
DIRECT_URL=<SUPABASE_SESSION_POOLER_URL>
```

Never commit real database passwords, connection strings, or other secrets.

Generate the Prisma client, apply the database migrations, and start development mode:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

The backend runs on port `5000` locally unless `PORT` is set.

## Environment Variables

| Location | Variable | Purpose |
| --- | --- | --- |
| `client/.env` | `VITE_API_BASE_URL` | Base URL of the backend API, including the `/api` path. |
| `server/.env` | `DATABASE_URL` | PostgreSQL connection URL used by the application. |
| `server/.env` | `DIRECT_URL` | Direct PostgreSQL connection URL used for Prisma operations. |

Use environment-specific values for local and deployed environments. Do not place credentials in source control.

## Deployment

The frontend and backend are deployed separately:

- Frontend: Vercel
- Backend: Render
- Database: Supabase PostgreSQL

The deployed frontend uses the Render API URL configured through `VITE_API_BASE_URL`.

## Deployment Links

- Frontend: [https://shipment-status-tracker.vercel.app/](https://shipment-status-tracker.vercel.app/)
- Backend: [https://shipment-status-tracker-uof9.onrender.com/](https://shipment-status-tracker-uof9.onrender.com/)
- API health check: [https://shipment-status-tracker-uof9.onrender.com/api/health](https://shipment-status-tracker-uof9.onrender.com/api/health)

## Assumptions

- Authentication is intentionally not implemented because it is out of scope.
- One shipment has one current status.
- Every status change creates a history record.
- New shipments start as `BOOKED`.
- `DELIVERED` is terminal.
- The reference number is unique.
- Expected delivery date is required.
- Status transition rules are enforced by the backend.

## Scaling to 10,000+ Shipments and Multiple Concurrent Users

At larger scale, the list API should use server-side pagination and efficient, selective queries rather than returning every shipment. Database indexes should support frequently filtered and searched fields such as reference number, current status, and relevant sort timestamps. Connection pooling should be tuned for the deployment environment, while caching can be introduced for read-heavy data where freshness requirements allow it. The API would benefit from rate limiting, structured monitoring and logging, and explicit transaction/concurrency handling around state transitions. Multiple backend instances behind a load balancer can provide horizontal capacity, while database backups, reliability controls, and observability protect the data layer. If future workflows include slow external calls or batch work, those tasks can move to background jobs. These are scaling considerations, not claims about the current implementation.

## Testing

The main application flows tested include:

- Creating a shipment
- Listing shipments
- Searching by reference number
- Filtering by status
- Viewing shipment details
- Updating shipment status with and without a note
- Reviewing chronological status history
- Rejecting invalid status transitions
- Handling duplicate reference numbers
- Refreshing data and verifying persistence
- Checking the production deployment

## Development Approach

The project was developed incrementally through Git commits and feature milestones, rather than as one final commit. This kept each stage of the assessment focused and easier to validate.
