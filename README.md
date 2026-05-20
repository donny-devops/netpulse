# NetPulse 🔔

An **event-driven API gateway** built with Node.js + TypeScript that monitors, routes, and logs webhook activity from external services such as Make.com, Zapier, GitHub, and custom applications.

---

## ✨ Features

- **Express** web framework with modular router structure
- **TypeScript** (strict mode) throughout
- **REST endpoints** for webhook ingestion (`POST /webhook/:source`) and health checks (`GET /health`)
- **Authentication middleware** — API key validation via `x-api-key` header
- **Rate limiting middleware** — configurable via environment variables
- **Request logging middleware** — structured JSON logs in production (colorized in development) powered by **Winston**
- **Typed EventEmitter** for async, decoupled webhook processing
- **Redis queue integration** (via ioredis) — opt-in via `REDIS_ENABLED=true`
- **Jest** test suite with coverage reporting
- **GitHub Actions CI** workflow (Node 20 & 22 matrix)
- **Docker** multi-stage build (builder → slim production image)
- `.env.example` for easy local setup

---

## 🗂 Project Structure

```
netpulse/
├── src/
│   ├── index.ts              # Server entry point & graceful shutdown
│   ├── app.ts                # Express app factory (exported for testing)
│   ├── routes/
│   │   ├── health.ts         # GET /health
│   │   └── webhook.ts        # POST /webhook/:source
│   ├── middleware/
│   │   ├── auth.ts           # API key authentication
│   │   ├── logger.ts         # HTTP request logger
│   │   └── rateLimiter.ts    # express-rate-limit
│   ├── services/
│   │   ├── eventEmitter.ts   # Typed EventEmitter (webhook lifecycle events)
│   │   └── queueService.ts   # Redis-backed FIFO queue (opt-in)
│   └── utils/
│       ├── config.ts         # Environment config loader
│       └── logger.ts         # Winston logger
├── tests/
│   ├── setup.ts              # Jest global env setup
│   ├── health.test.ts
│   ├── webhook.test.ts
│   └── auth.test.ts
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI
├── .env.example
├── .gitignore
├── .dockerignore
├── Dockerfile
├── jest.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and **npm** 10+
- *(Optional)* **Redis** 7+ if queue integration is enabled

### 1. Clone & Install

```bash
git clone https://github.com/donny-devops/netpulse.git
cd netpulse
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and set a strong API_KEY
```

### 3. Run in Development

```bash
npm run dev
```

The server starts on `http://localhost:3000` (or the `PORT` you configured).

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🐳 Docker

### Build

```bash
docker build -t netpulse:latest .
```

### Run

```bash
docker run -p 3000:3000 \
  -e API_KEY=your-secret-key \
  -e NODE_ENV=production \
  netpulse:latest
```

### Docker Compose (with Redis)

```yaml
version: "3.9"
services:
  netpulse:
    build: .
    ports:
      - "3000:3000"
    environment:
      API_KEY: your-secret-key
      REDIS_ENABLED: "true"
      REDIS_HOST: redis
    depends_on:
      - redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

---

## 📡 API Reference

### `GET /health`

Returns service health status. No authentication required.

**Response 200**
```json
{
  "success": true,
  "status": "ok",
  "service": "NetPulse",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "uptime": 42.5
}
```

---

### `POST /webhook/:source`

Ingests a webhook event from the named source (e.g. `make`, `zapier`, `github`).

**Headers**

| Header      | Required | Description               |
|-------------|----------|---------------------------|
| x-api-key   | ✅       | Your configured API key   |
| Content-Type| ✅       | `application/json`        |

**URL Parameter**: `:source` — identifier for the sending service.

**Request body**: any valid JSON object.

**Response 202**
```json
{
  "success": true,
  "message": "Webhook accepted",
  "eventId": "a1b2c3d4-...",
  "source": "make",
  "receivedAt": "2024-01-15T12:00:00.000Z"
}
```

**Response 401** — missing or invalid `x-api-key`

**Response 429** — rate limit exceeded

---

## 🔧 Environment Variables

| Variable              | Default              | Description                              |
|-----------------------|----------------------|------------------------------------------|
| `PORT`                | `3000`               | HTTP listen port                         |
| `NODE_ENV`            | `development`        | Runtime environment                      |
| `API_KEY`             | `changeme-secret-key`| Shared API key for webhook authentication|
| `LOG_LEVEL`           | `info`               | Winston log level                        |
| `RATE_LIMIT_WINDOW_MS`| `60000`              | Rate limit window (ms)                   |
| `RATE_LIMIT_MAX`      | `100`                | Max requests per window per IP           |
| `REDIS_ENABLED`       | `false`              | Enable Redis queue integration           |
| `REDIS_HOST`          | `localhost`          | Redis host                               |
| `REDIS_PORT`          | `6379`               | Redis port                               |
| `REDIS_PASSWORD`      | *(unset)*            | Redis password (if auth is required)     |

---

## 🧪 Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

Tests use **Jest** + **ts-jest** + **supertest** and cover:

- Health endpoint responses
- Webhook ingestion (valid/invalid API keys, multiple sources, unique event IDs)
- Authentication middleware (missing, empty, wrong, and correct API keys)

---

## 🏗 Architecture Overview

```
Incoming HTTP Request
        │
        ▼
  Express Router
        │
  ┌─────────────────────────────┐
  │  Global Middleware           │
  │  ├── requestLogger           │
  │  └── rateLimiter             │
  └─────────────────────────────┘
        │
  ┌─────────────────────────────┐
  │  Routes                      │
  │  ├── GET  /health            │
  │  └── POST /webhook/:source   │
  │       └── authenticate       │
  └─────────────────────────────┘
        │
  WebhookEvent created (UUID)
        │
  ┌─────────────────────────────┐
  │  EventEmitter                │
  │  webhook:received  ──────────┼──► async listeners (logging, etc.)
  │  webhook:processed ──────────┼──► async listeners
  │  webhook:failed    ──────────┼──► error handling
  └─────────────────────────────┘
        │
  ┌─────────────────────────────┐
  │  QueueService (opt-in)       │
  │  Redis RPUSH → LPOP          │
  └─────────────────────────────┘
        │
   202 Accepted ◄────────────────
```

---

## 📄 License

MIT