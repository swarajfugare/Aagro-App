# Agriculture Supply Chain Management System

> **Source of Truth:** `Goal.md` is the primary source of truth for this project. All architectural, technological, and functional decisions are aligned with the master specification defined in `Goal.md`.

---

## 1. Project Purpose

The **Agriculture Supply Chain Management System** is a unified digital platform designed to streamline and connect the entire agricultural lifecycle:
**Crop Planning → Production → Supply Declaration → Demand Matching → Order Fulfillment → Logistics/Pickup → Routing → Delivery → Payment → Reporting/Analytics**.

The platform connects four key stakeholders:
- **Farmers**: Supply declaration, crop management, harvest tracking, market prices, and order visibility.
- **Drivers**: Logistics management, vehicle capacity tracking, pickup & delivery execution, and navigation.
- **Buyers**: Demand requirement posting, supply discovery, order placement, and delivery tracking.
- **Administrators**: Central operations control, user verification, matching supervision, logistics tracking, pricing, reporting, and audit logs.

---

## 2. Current Development Phase

**Current Phase:** `PHASE 2 — DATABASE FOUNDATION`

> **Note:** At Phase 2, the production Prisma schema for MySQL is implemented (`apps/backend/prisma/schema.prisma`) with all core domain entities (Users, Roles, Permissions, Locations, Farmers, Farms, Crops, Harvests, Supply, Buyers, Requirements, Matches, Orders, Drivers, Vehicles, Trips, Pickups, Deliveries, Routes, GPS, Market Prices, Weather, Payments, Invoices, Notifications, Uploads, Support, and Audit Logs). **Client application interfaces and business logic workflows will be built in subsequent phases.**

---

## 3. High-Level System Architecture

```text
                         AGRICULTURE SUPPLY CHAIN PLATFORM
                                      |
                    +-----------------+------------------+
                    |                                    |
              ADMIN PANEL                            MOBILE APPS
           React + TypeScript                         Flutter
                    |                                    |
                    |                     +--------------+--------------+
                    |                     |              |              |
                    |                 FARMER APP    DRIVER APP     BUYER APP
                    |                     |              |              |
                    +---------------------+--------------+--------------+
                                          |
                                          | HTTPS REST API (/api/v1)
                                          v
                              +---------------------------+
                              |     SHARED BACKEND        |
                              | Node.js + NestJS           |
                              | TypeScript                 |
                              +-------------+-------------+
                                            |
                              +-------------+-------------+
                              |                           |
                              v                           v
                       Firebase Auth                 MySQL Database
                    (Authentication)                  (Prisma ORM)
                              |
                              v
                       Firebase FCM
                    (Push Notifications)
```

- **Single Shared Backend:** One NestJS backend API serving all mobile apps and the web Admin Panel with Role-Based Access Control (RBAC).
- **Target Hosting:** Modular monolith designed for Hostinger Business hosting (Node.js, MySQL, Hostinger file storage).

---

## 4. Planned Technology Stack

| Layer / Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend API** | Node.js / NestJS / TypeScript | Modular REST API (`/api/v1`) with Prisma ORM |
| **Database** | MySQL | Relational data store for users, crops, orders, trips, audits |
| **Authentication** | Firebase Authentication | Identity provider (Phone / Email / Google) verified by backend |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Event-driven alerts for farmers, drivers, buyers, and admins |
| **Admin Panel** | React / TypeScript / Vite | Tailwind CSS, shadcn/ui, TanStack Query, Leaflet maps |
| **Mobile Applications** | Flutter / Dart | Unified codebase with entry points for Farmer, Driver, and Buyer |
| **Maps & Routing** | Leaflet / flutter_map / openrouteservice | OpenStreetMap-based map layers and routing service |
| **File Storage** | Hostinger Storage | Abstracted file upload storage for KYC, crop photos, PODs |
| **API Documentation** | OpenAPI / Swagger UI | Auto-generated interactive API documentation |

---

## 5. Repository Structure

```text
agri-supply-chain/
│
├── Goal.md                   # Master product & architecture specification (Source of Truth)
│
├── apps/                     # Application packages
│   ├── backend/              # Shared NestJS / Node.js API
│   ├── admin/                # React + Vite Admin Web Panel
│   ├── farmer-app/           # Flutter Mobile Application for Farmers
│   ├── driver-app/           # Flutter Mobile Application for Drivers
│   └── buyer-app/            # Flutter Mobile Application for Buyers
│
├── packages/                 # Reusable shared packages
│   ├── shared-types/         # Shared TypeScript interfaces and data models
│   ├── shared-config/        # Shared configuration presets and constants
│   └── shared-utils/         # Generic utility functions
│
├── docs/                     # Documentation
│   ├── architecture/         # Architecture diagrams & decision records
│   ├── database/             # Relational schemas & ER diagrams
│   ├── api/                  # API contracts and endpoint documentation
│   └── deployment/           # Deployment guides for Hostinger & production
│
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore configuration
├── package.json              # Monorepo root workspace configuration
└── README.md                 # Project overview and repository documentation
```

---

## 6. Development Approach

Development proceeds incrementally in strictly controlled phases:
1. **Phase 0:** Project Foundation *(Completed)*
2. **Phase 1:** Backend Foundation *(Completed)*
3. **Phase 2:** Database Foundation *(Completed / Current)*
4. **Phase 3:** Authentication + RBAC *(Next)*
5. **Phase 4:** Admin Panel Foundation
6. **Phase 5:** Farmer App Implementation
7. **Phase 6:** Buyer App Implementation
8. **Phase 7:** Supply/Demand + Matching Engine
9. **Phase 8:** Order Management & State Machine
10. **Phase 9:** Driver App & Logistics Management
11. **Phase 10:** OpenStreetMap Maps, GPS Tracking & Routing
12. **Phase 11:** Firebase Cloud Messaging Notifications
13. **Phase 12:** Market Prices & Weather Advisories
14. **Phase 13:** Admin Reports, Analytics & Audit Logging
15. **Phase 14:** Security Hardening & End-to-End Testing
16. **Phase 15:** Production Deployment to Hostinger
