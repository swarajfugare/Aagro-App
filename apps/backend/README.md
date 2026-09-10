# Agriculture Supply Chain Platform — Shared Backend API

## 1. Overview & Purpose
This is the **single shared REST API backend** for the entire **Agriculture Supply Chain Management System**, serving all client applications:
1. **Farmer Android Mobile App**
2. **Driver Android Mobile App**
3. **Buyer / User Android Mobile App**
4. **React Admin Web Panel**

The backend is built as a **Modular Monolith** designed for deployment on **Hostinger Business hosting** (Node.js + MySQL + Hostinger file storage).

---

## 2. Technology Stack
- **Runtime:** Node.js (v18+)
- **Framework:** NestJS (v10)
- **Language:** TypeScript
- **Database & ORM:** MySQL with Prisma ORM
- **Authentication:** Firebase Authentication (verified via Firebase Admin SDK) + Backend RBAC
- **API Documentation:** OpenAPI 3.0 / Swagger UI
- **Security:** Helmet, CORS, Class-Validator, Custom Error Filters

---

## 3. Directory Structure

```text
apps/backend/
│
├── src/
│   ├── auth/              # Firebase token verification & auth guards
│   ├── firebase/          # Firebase Admin SDK initialization service
│   ├── prisma/            # PrismaService lifecycle connection manager
│   ├── config/            # Centralized environment configuration
│   ├── common/            # Global filters, interceptors, and DTOs
│   ├── health/            # System health check endpoint
│   │
│   ├── users/             # User profiles & role associations
│   ├── roles/             # Role definitions & RBAC
│   ├── permissions/       # Fine-grained access control
│   │
│   ├── farmers/           # Farmer verification & profiles
│   ├── farms/             # Farm lands, geolocation & acreage
│   ├── crops/             # Crop types & varieties catalog
│   ├── production/        # Crop lifecycle tracking
│   ├── harvests/          # Harvest estimation & scheduling
│   ├── supply/            # Farmer supply declarations
│   │
│   ├── buyers/            # Buyer verification & business profiles
│   ├── demand/            # Buyer crop requirements
│   ├── matching/          # Supply-Demand matching engine
│   ├── orders/            # Order state machine & order items
│   │
│   ├── drivers/           # Driver verification & profiles
│   ├── vehicles/          # Vehicle capacities & documentation
│   ├── trips/             # Dispatch & trip management
│   ├── pickups/           # Multi-stop farm pickup workflows
│   ├── deliveries/        # Buyer delivery execution & POD
│   ├── routes/            # OpenStreetMap-based routing service
│   ├── locations/         # Driver GPS location updates
│   │
│   ├── notifications/     # Firebase FCM push notifications
│   ├── market-prices/     # APMC market price feeds
│   ├── weather/           # Weather advisories & forecasts
│   ├── payments/          # Payment records, driver earnings & invoices
│   ├── uploads/           # Hostinger/local file storage abstraction
│   │
│   ├── reports/           # Analytical reporting
│   ├── support/           # Support tickets & complaints
│   ├── audit/             # Immutable audit trail
│   ├── admin/             # Central administrative operations
│   │
│   ├── app.module.ts      # Root application module
│   └── main.ts            # Application bootstrap entry point
│
├── prisma/
│   ├── schema.prisma      # Prisma schema for MySQL
│   ├── migrations/        # Database schema migrations
│   └── seed.ts            # Database seed script
│
├── test/                  # E2E test suites
├── .env.example           # Environment template
├── package.json           # Backend dependencies and scripts
└── tsconfig.json          # Strict TypeScript configuration
```

---

## 4. Setup & Installation

### Step 1: Install Dependencies
From the repository root or backend directory:
```bash
npm install
```

### Step 2: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your MySQL database connection:
```env
DATABASE_URL="mysql://username:password@localhost:3306/agri_supply_chain"
```

### Step 3: Prisma Setup & Generation
Generate the Prisma Client:
```bash
npm run prisma:generate
```
Apply migrations to your MySQL database:
```bash
npm run prisma:migrate:dev --name init
```

---

## 5. Running the Application

### Development Mode (with hot-reload):
```bash
npm run start:dev
```

### Production Build & Run:
```bash
npm run build
npm run start:prod
```

---

## 6. Endpoints & Documentation

- **Base API URL:** `http://localhost:3000/api/v1`
- **Swagger / OpenAPI Documentation:** `http://localhost:3000/api/docs`
- **System Health Check (Public):** `GET http://localhost:3000/api/v1/health`
- **Current User Profile (Protected):** `GET http://localhost:3000/api/v1/auth/me`
  - Header: `Authorization: Bearer <Firebase ID Token>`

### Authentication Profile Response (`/api/v1/auth/me`):
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "firebaseUid": "firebase-uid-12345",
    "email": "farmer@example.com",
    "phone": "+919876543210",
    "fullName": "Ramesh Patil",
    "avatarUrl": null,
    "status": "ACTIVE",
    "role": "FARMER",
    "permissions": [
      "crops:read",
      "supply:create",
      "supply:read"
    ]
  },
  "message": "Authenticated user profile retrieved successfully"
}
```

---

## 7. Testing Commands

```bash
# Run unit tests
npm test

# Run end-to-end integration tests
npm run test:e2e

# Run test coverage
npm run test:cov
```

---

## 8. Architectural Principles
1. **Single Source of Truth:** `Goal.md` is the primary architectural reference.
2. **One Shared Backend:** Never create fragmented backend APIs for individual apps.
3. **Layer Separation:** Business logic resides in domain services, never in controllers or PrismaService.
4. **Graceful Degradation:** The backend starts cleanly even in offline/local environments where external services (Firebase, MySQL, OpenRouteService) are pending configuration.
