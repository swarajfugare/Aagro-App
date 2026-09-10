# Database Architecture & Specification (`docs/database`)

**Project:** Agriculture Supply Chain Management System  
**Primary Database:** MySQL (5.8+ / 8.0+)  
**ORM:** Prisma ORM  
**Location:** `apps/backend/prisma/schema.prisma`  
**Master Specification:** `Goal.md`

---

## 1. Core Architecture & Philosophy

The platform operates on **one shared, normalized relational database** serving all four client applications via a single NestJS backend:

```text
Farmer App (Flutter)
Driver App (Flutter)
Buyer App (Flutter)
Admin Panel (React)
        │
        ▼ (HTTPS REST /api/v1)
  NestJS Backend
        │
        ▼ (Prisma ORM)
  MySQL Database
```

### Key Architectural Principles:
1. **Single Source of Truth:** `Goal.md` governs all data models and lifecycle constraints.
2. **One Controlled Schema:** All applications share `apps/backend/prisma/schema.prisma`. No application-specific split schemas are permitted.
3. **Identity vs Business Profile Separation:** Firebase Authentication handles identity and credentials. MySQL stores domain user accounts, roles, and profiles (`users`, `farmers`, `buyers`, `drivers`). No passwords or auth secrets are stored in MySQL.
4. **Immutability of Historical Records:** Audits, payment transactions, order history logs, and delivery records are append-only.

---

## 2. Entity Relationship Overview

### High-Level Domain Model:

```text
User
 ├── Role & Permissions (RBAC)
 │
 ├── Farmer Profile
 │    └── Farms
 │         └── FarmerCrops
 │              ├── CropProduction
 │              ├── CropHealth
 │              ├── Harvests
 │              └── SupplyBatches
 │
 ├── Buyer Profile
 │    └── BuyerRequirements
 │
 └── Driver Profile
      ├── Vehicles
      └── Trips
           ├── TripStops
           ├── PickupRecords (from Farmers)
           ├── DeliveryRecords (to Buyers)
           ├── ProofOfDelivery
           ├── Routes & RoutePoints
           └── DriverLocations
```

### Supply, Order & Logistics Lifecycle:

```text
SupplyBatch (Farmer) ────┐
                         ├──► SupplyDemandMatch ──► Order ──► Trip (Driver/Vehicle)
BuyerRequirement (Buyer) ┘                             │         │
                                                       │         ├──► Multi-stop Pickups
                                                       ▼         └──► Buyer Deliveries
                                                   Invoices & Payments
```

---

## 3. Detailed Entity Modules

| Module | Core Tables | Purpose & Responsibilities |
| :--- | :--- | :--- |
| **1. User & Access** | `users`, `roles`, `permissions`, `role_permissions` | RBAC, Firebase UID mapping, user status management. |
| **2. Location** | `states`, `districts`, `villages` | Normalized geographic hierarchy for farms, markets, and delivery points. |
| **3. Farmer & Farm** | `farmers`, `farms`, `farmer_documents` | Farmer KYC, farm land boundaries, acreage, and farm GPS locations. |
| **4. Crops & Production** | `crops`, `crop_varieties`, `farmer_crops`, `crop_production`, `crop_health`, `harvests`, `supply_batches` | Reusable crop catalog, farmer crop cycles, projected harvests, and declared supply batches. |
| **5. Buyer & Demand** | `buyers`, `buyer_requirements` | Commercial buyer profiles, GST verification, and commodity demand posting. |
| **6. Matching Engine** | `supply_demand_matches`, `match_items` | Matches buyer requirements against one or multiple farmer supply batches. |
| **7. Orders & Lifecycle** | `orders`, `order_items`, `order_status_history` | Order state machine, line items, and historical transition audits. |
| **8. Driver & Vehicle** | `drivers`, `vehicles`, `driver_documents` | Driver verification, availability status, vehicle capacity limits, and licenses. |
| **9. Logistics & Trips** | `trips`, `trip_stops`, `pickup_records`, `delivery_records`, `proof_of_delivery` | Multi-farmer pickup dispatch, buyer delivery, quantity verification, and POD capture. |
| **10. Route & GPS** | `routes`, `route_points`, `driver_locations` | OpenStreetMap routing geometry and periodic driver GPS pings. |
| **11. Market & Weather** | `market_prices`, `weather_data` | APMC market price tracking and farm-level weather advisories. |
| **12. Financials** | `payments`, `payment_transactions`, `invoices` | Order payments, transaction references, and PDF invoice tracking. |
| **13. Notifications** | `notifications`, `notification_logs` | FCM notification records and delivery logs. |
| **14. Files & Support** | `uploads`, `support_tickets` | Hostinger file metadata storage and user support ticketing. |
| **15. System & Audit** | `audit_logs`, `system_settings`, `system_health` | Immutable audit trail and global application settings. |

---

## 4. Controlled Status State Machines (Enums)

### 4.1 Order Status State Machine (`OrderStatus`)
```text
DRAFT ──► SUBMITTED ──► MATCHING ──► MATCHED ──► CONFIRMED ──► DRIVER_ASSIGNED
                                                                     │
                                                                     ▼
COMPLETED ◄── DELIVERED ◄── DELIVERY_ATTEMPTED ◄── IN_TRANSIT ◄── PICKED_UP ◄── PICKUP_SCHEDULED ◄── PICKUP_IN_PROGRESS

* Terminal Failure States: CANCELLED, FAILED, REJECTED
```

### 4.2 Supply Batch Status (`SupplyStatus`)
- `DRAFT`: Initial draft by farmer.
- `AVAILABLE`: Ready for matching.
- `PARTIALLY_MATCHED`: A portion has been allocated to a match/order.
- `FULLY_MATCHED`: Total quantity allocated.
- `RESERVED`: Temporarily held during order confirmation.
- `SOLD`: Confirmed sold and fulfilled.
- `EXPIRED`: Availability window passed.
- `CANCELLED`: Withdrawn by farmer.

### 4.3 Buyer Requirement Status (`RequirementStatus`)
- `DRAFT` ──► `OPEN` ──► `MATCHING` ──► `PARTIALLY_MATCHED` ──► `FULLY_MATCHED` ──► `ORDERED` ──► `FULFILLED` (or `EXPIRED` / `CANCELLED`)

### 4.4 Logistics & Trip Statuses
- **Trip:** `PLANNED` ──► `ASSIGNED` ──► `ACCEPTED` ──► `IN_PROGRESS` ──► `COMPLETED` (`CANCELLED`)
- **Trip Stop:** `PENDING` ──► `EN_ROUTE` ──► `ARRIVED` ──► `COMPLETED` (`FAILED`, `SKIPPED`)
- **Pickup Record:** `PENDING` ──► `ASSIGNED` ──► `EN_ROUTE` ──► `ARRIVED` ──► `LOADING` ──► `COMPLETED` (`FAILED`, `CANCELLED`)
- **Delivery Record:** `PENDING` ──► `IN_TRANSIT` ──► `ARRIVING` ──► `ARRIVED` ──► `DELIVERED` (`FAILED`, `CANCELLED`)

---

## 5. Standards & Conventions

### 5.1 Primary Keys & IDs
- All models use stable **UUIDs** (`@id @default(uuid())`) to prevent sequential enumeration attacks and maintain cross-environment stability.

### 5.2 Timestamps
- Standardized across all tables:
  - `createdAt DateTime @default(now()) @map("created_at")`
  - `updatedAt DateTime @updatedAt @map("updated_at")`

### 5.3 Quantities and Measurement Units
- Quantities are stored as `Decimal(10, 2)` accompanied by explicit `QuantityUnit` enums (`KG`, `QUINTAL`, `METRIC_TON`, `LITRE`, `CRATE`, `BAG`).
- Farm land areas use `Decimal(10, 2)` with `AreaUnit` (`ACRE`, `HECTARE`, `GUNTHA`, `SQ_METER`).

### 5.4 Financial Precision & Currency
- Monetary amounts are stored as `Decimal(12, 2)` with currency explicit (default `'INR'`). Floating-point types are strictly forbidden for currency.

### 5.5 Geographic Coordinates
- Latitude: `Decimal(10, 8)`
- Longitude: `Decimal(11, 8)`

### 5.6 Foreign Key Constraints & Deletion Rules
- **Cascade Deletion:** Used only for tightly-coupled dependent metadata (e.g., `User` ➔ `Farmer`, `Crop` ➔ `CropVariety`, `Trip` ➔ `TripStop`, `Route` ➔ `RoutePoint`).
- **Restrict Deletion:** Applied to business-critical records (e.g., `Farmer` ➔ `SupplyBatch`, `Order` ➔ `Buyer`, `Trip` ➔ `Driver`, `Payment` ➔ `Order`) to prevent accidental deletion of historical transactions.
- **SetNull:** Used for optional audit or geographical references (e.g., `villageId`, `assignedToUserId`, `changedByUserId`).

---

## 6. Database Migration & Seed Workflow

### 6.1 Generate Prisma Client
```bash
npm run prisma:generate
```

### 6.2 Apply Migrations in Development
```bash
npx prisma migrate dev --name init_schema
```

### 6.3 Apply Migrations in Production (Hostinger)
```bash
npm run prisma:migrate:deploy
```

### 6.4 Execute Safe Reference Seed
```bash
npm run prisma:seed
```

> **Database Safety Policy:** Never run `prisma migrate reset` or destructive commands against production or staging databases.
