# Backend Application (`apps/backend`)

## Planned Technology
- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript
- **ORM / Database:** Prisma ORM with MySQL
- **Authentication:** Firebase Admin SDK (token verification) + Backend Role-Based Access Control (RBAC)
- **API Documentation:** OpenAPI / Swagger UI

## Role in Architecture
This directory will contain the **single shared REST API** (`/api/v1`) serving all client applications:
1. Admin Panel (Web)
2. Farmer Mobile App (Android)
3. Driver Mobile App (Android)
4. Buyer Mobile App (Android)

> **Phase 0 Notice:** No controllers, services, database models, Prisma schemas, or business modules are implemented at this stage. Implementation will begin in Phase 1 as specified in `Goal.md`.
