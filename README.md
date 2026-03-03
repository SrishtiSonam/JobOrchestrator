# ⚡ Event-Driven Job Processing System

Production-grade MERN + Redis + BullMQ job processing system with real-time Socket.io notifications.

## Architecture

```
Client (React) → api-service (Express) → Redis (BullMQ) → worker-service → MongoDB
                        ↕ Socket.io ↕                                          ↑
                   Real-time updates ←─────────────────────────────────────────┘
```

## Services

| Service | Port | Description |
|---|---|---|
| api-service | 5000 | REST API + Socket.io server |
| worker-service | — | BullMQ job consumer |
| client | 3000 | React SPA |
| MongoDB | 27017 | Persistent storage |
| Redis | 6379 | Queue + rate limit store |

## Quick Start

### Prerequisites
- Node.js 20+
- MongoDB (running locally or Docker)
- Redis (running locally or Docker)

### With Docker
```bash
docker-compose up --build
```

### Without Docker

**1. Start infrastructure**
```bash
# MongoDB and Redis must be running
```

**2. API Service**
```bash
cd api-service
cp .env.example .env    # Fill in your values
npm install
npm run dev
```

**3. Worker Service**
```bash
cd worker-service
cp .env.example .env    # Fill in your values
npm install
npm run dev
```

**4. Client**
```bash
cd client
npm install
npm start
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✓ | Get profile |
| POST | /api/jobs | ✓ | Submit job |
| GET | /api/jobs | ✓ | List own jobs |
| GET | /api/jobs/:id | ✓ | Get job status |
| DELETE | /api/jobs/:id | ✓ | Cancel job |
| GET | /api/admin/jobs | Admin | All jobs |
| GET | /api/admin/stats | Admin | System stats |
| POST | /api/admin/jobs/:id/retry | Admin | Retry failed job |

## Socket.io Events

| Event | Direction | Description |
|---|---|---|
| job:submitted | Server → Client | Job created |
| job:processing | Server → Client | Worker picked up job |
| job:progress | Server → Client | Progress % update |
| job:completed | Server → Client | Job finished |
| job:failed | Server → Client | All retries exhausted |

## Job Types

- `PDF_GENERATION` — Generate PDF from template + data
- `IMAGE_COMPRESSION` — Compress/resize images (uses sharp)
- `REPORT_GENERATION` — Aggregate data into JSON/CSV reports

## Scaling Workers

```bash
# Scale to 3 worker instances
docker-compose up --scale worker-service=3
```

BullMQ uses Redis atomic operations — each job is processed exactly once regardless of worker count.

## Retry Mechanism

Jobs automatically retry 3 times with exponential backoff:
- Attempt 1 failure → retry after 2s
- Attempt 2 failure → retry after 4s  
- Attempt 3 failure → retry after 8s
- All failed → status = 'failed', admin can manually retry

## Stack

- **MongoDB** — Job records, user accounts
- **Express.js** — REST API
- **React** — Frontend SPA
- **Node.js** — Backend runtime
- **Redis** — BullMQ queue + rate limiting store
- **BullMQ** — Job queue with retry/backoff
- **Socket.io** — Real-time notifications
- **JWT** — Stateless authentication
- **Winston** — Structured logging
- **Docker** — Containerization
