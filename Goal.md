# AGRICULTURE SUPPLY CHAIN MANAGEMENT SYSTEM
## AI MASTER PROJECT SPECIFICATION — FINAL END GOAL

> **Purpose of this document:** This is the single source of truth for an AI coding agent (including Antigravity) to understand what the final application must become. The AI must read this document before generating or modifying code.
>
> **Important:** Do not replace the selected technology stack with a different stack unless explicitly instructed by the project owner.

---

# 1. PROJECT VISION

Build a complete **Agriculture Supply Chain Management Platform** connecting:

1. Farmers — supply side
2. Drivers — logistics and transport
3. Buyers — demand side
4. Administrators — central control and operations

The final system must contain:

- **1 web-based Admin Panel**
- **1 shared Node.js backend/API**
- **1 MySQL database**
- **3 Android applications**
  - Farmer App
  - Driver App
  - Buyer/User App
- External integrations for:
  - Firebase Authentication
  - Firebase Cloud Messaging
  - OpenStreetMap-based mapping
  - Routing/navigation service
  - Weather API
  - Market-price data
- Hostinger Business hosting for the initial backend, database, admin panel and file storage.

The platform must manage the complete lifecycle:

**Crop Planning → Production → Supply → Demand → Matching → Order → Pickup → Logistics → Delivery → Payment → Reports/Analytics**

---

# 2. FINAL SYSTEM ARCHITECTURE

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
                                          | HTTPS REST API
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
                       Firebase Auth                 MySQL
                    Authentication only              Database
                              |
                              v
                       Firebase FCM
                     Push Notifications

External services:
- OpenStreetMap-based maps
- OpenStreetMap-based routing service
- Weather API
- Market price API/data source
```

### Critical architecture rule

There must be **ONE shared backend** serving:

- Admin Panel
- Farmer App
- Driver App
- Buyer App

Do NOT create four separate backends.

The backend must use role-based access control so the same API can safely serve different users.

---

# 3. TECHNOLOGY STACK — FINAL

## 3.1 Backend

- Node.js
- NestJS
- TypeScript
- REST API
- Prisma ORM
- MySQL
- Swagger/OpenAPI
- Pino or equivalent structured logging
- class-validator / class-transformer
- JWT handling only where required for backend authorization/session validation

## 3.2 Authentication

Use:

**Firebase Authentication**

Supported initial methods:

- Phone number authentication
- Email/password authentication
- Google authentication where appropriate

Firebase Authentication is the identity provider.

The backend must verify Firebase ID tokens before allowing protected API access.

Do NOT create a second independent password-authentication system unless explicitly required.

Backend flow:

```text
Mobile/Web
   |
Firebase Authentication
   |
Firebase ID Token
   |
NestJS API
   |
Verify Firebase Token
   |
Load application user + role from MySQL
   |
Authorize request
```

The application's business profile remains in MySQL.

Example:

```text
Firebase UID
    |
    +-- users table
          |
          +-- role = FARMER
          +-- farmer profile
          +-- farm profile
```

---

# 4. DATABASE

Use:

**MySQL**

ORM:

**Prisma**

The database must be relational and normalized.

Recommended main tables/modules:

```text
users
roles
permissions
role_permissions

farmers
farms
farmer_documents

villages
districts
states

crops
crop_varieties
farmer_crops
crop_production
crop_health
harvests
supply_batches

buyers
buyer_requirements

supply_demand_matches
match_items

orders
order_items
order_status_history

drivers
vehicles
driver_documents

trips
trip_stops
pickup_records
delivery_records
proof_of_delivery

driver_locations
routes
route_points

market_prices
weather_data

payments
payment_transactions
invoices

notifications
notification_logs

uploads
documents

support_tickets

audit_logs
system_settings
```

Use proper foreign keys, indexes, unique constraints and timestamps.

Every important operational table should have:

```text
id
created_at
updated_at
created_by where appropriate
status where appropriate
```

Use UUIDs or another stable non-sequential public identifier strategy where appropriate.

Never expose sensitive internal database identifiers unnecessarily.

---

# 5. FILE STORAGE

Initial file storage:

**Hostinger storage**

Files may include:

- Farmer profile photos
- Farm photos
- Crop photos
- KYC documents
- Driver documents
- Vehicle documents
- Delivery proof
- Invoices
- Reports
- Other business documents

The backend must store file metadata in MySQL.

Example:

```text
uploads
---------
id
owner_user_id
file_name
original_name
mime_type
size
storage_path
entity_type
entity_id
created_at
```

The code should use a storage abstraction/service so storage can later be moved to S3, Cloudinary or another provider without rewriting the whole application.

---

# 6. MAPS — FINAL APPROACH

Use an **OpenStreetMap-based free/open mapping stack** rather than Google Maps.

Recommended architecture:

### Map display

- Web: Leaflet
- Flutter: flutter_map
- Map data: OpenStreetMap-derived data

### Routing

Use **openrouteservice** initially for:

- Driving routes
- Distance
- ETA
- Route geometry
- Multiple stops
- Route optimization where suitable

The routing integration must be placed behind a backend `MapsService` / `RoutingService` abstraction.

Example:

```text
NestJS
  |
RoutingService
  |
openrouteservice
```

Do NOT call routing APIs directly from every mobile app.

The backend should control routing requests.

### Important production rule

OpenStreetMap data is free, but OpenStreetMap Foundation's public tile servers are not an unlimited free commercial tile CDN. The implementation must respect their tile usage policy, attribution, caching and identification requirements.

Therefore:

- Do not bulk-download OSM tiles.
- Do not implement prohibited offline tile prefetching using OSMF public tile servers.
- Always display required OpenStreetMap attribution.
- Do not hard-code the map provider throughout the application.
- Keep a configurable map/tile provider layer so it can later be switched to another OSM-based provider or self-hosted tiles.

For a larger production deployment, the system should be able to switch to a dedicated OSM-derived tile provider or self-hosted map tiles without changing business logic.

The routing service must also be configurable and replaceable.

---

# 7. API DOCUMENTATION

Use:

**OpenAPI + Swagger UI**

This is free/open-source and should be generated directly from the NestJS backend.

Expose development/staging documentation at something like:

```text
/api/docs
```

The API documentation must contain:

- Authentication
- All endpoints
- Request bodies
- Query parameters
- Response schemas
- Error responses
- Status codes
- Role requirements
- Example requests
- Example responses

The OpenAPI specification should be exportable as JSON/YAML.

Do not maintain API documentation separately from the actual backend implementation when it can be generated automatically.

---

# 8. ADMIN PANEL

Technology:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Query / TanStack Query
- Recharts or equivalent chart library
- Leaflet for maps

The Admin Panel is the central control center.

## Admin Dashboard

Show:

- Total farmers
- Verified farmers
- Active farmers
- Total buyers
- Active buyers
- Total drivers
- Active drivers
- Total vehicles
- Available supply
- Pending demand
- Active orders
- Pending pickups
- Active deliveries
- Completed deliveries
- Revenue/payment summary where applicable
- Crop-wise supply
- Crop-wise demand
- Supply vs demand
- Recent orders
- Recent registrations
- Alerts
- Live/near-live driver locations

## Admin modules

1. Dashboard
2. Farmers
3. Farmer Verification
4. Farms
5. Crops
6. Crop Varieties
7. Crop Production
8. Harvest Management
9. Supply Management
10. Buyers
11. Buyer Verification
12. Buyer Requirements
13. Demand Management
14. Supply-Demand Matching
15. Drivers
16. Vehicles
17. Driver Documents
18. Villages
19. Routes
20. Pickup Management
21. Delivery Management
22. Orders
23. Payments
24. Invoices
25. Market Prices
26. Weather
27. Notifications
28. Reports
29. Analytics
30. Documents
31. Support/Complaints
32. Users
33. Roles & Permissions
34. System Settings
35. API/Integration Settings
36. Audit Logs

---

# 9. FARMER ANDROID APP

Technology:

- Flutter
- Dart
- Riverpod
- GoRouter
- Dio
- Firebase Authentication
- Firebase Cloud Messaging
- flutter_map
- Geolocator
- Image Picker
- Secure/local storage

## Farmer registration

Fields should include appropriate:

- Name
- Mobile number
- Email if available
- Address
- Village
- District
- State
- Profile photo
- Optional identification/KYC information

Use Firebase Authentication for identity.

Business profile data goes to the NestJS API/MySQL.

## Farmer features

### Dashboard

- Greeting
- Weather
- Current crop summary
- Expected harvest
- Available supply
- Current market prices
- Alerts
- Notifications
- Important recommendations

### Farm management

- Add farm
- Farm location
- Farm area
- Land details
- Multiple farms per farmer

### Crop management

- Add crop
- Crop variety
- Sowing date
- Area
- Expected harvest date
- Expected production
- Crop health
- Crop photos
- Production updates

### Supply management

Farmer can:

- Declare quantity ready for sale
- Set expected availability date
- Select quality/grade
- Upload photos
- Set preferred price where allowed
- View supply status
- Edit/cancel eligible supply
- See matched supply

### Market information

Show:

- Crop prices
- Market-wise price
- Price trends
- Date
- Relevant alerts

### Decision support

Show:

- What to sow
- Where/which market has demand
- Expected harvest timing
- Price trends
- Weather advisories
- Crop recommendations
- Over-supply warnings

Do not present AI recommendations as guaranteed financial or agricultural outcomes.

### Orders / matching

Farmer should see:

- Matched buyer requirement
- Requested quantity
- Quality
- Expected pickup
- Buyer/order information allowed by privacy rules
- Order status
- Driver/pickup status

### Notifications

Examples:

```text
Your tomato supply has been matched.
Driver pickup assigned.
Pickup scheduled for tomorrow.
Your produce was delivered.
Payment status updated.
Weather alert for your area.
```

---

# 10. DRIVER ANDROID APP

Technology:

- Flutter
- Dart
- Riverpod
- GoRouter
- Dio
- Firebase Authentication
- Firebase FCM
- flutter_map
- Geolocator
- Camera/Image Picker

## Driver registration

- Name
- Mobile
- Profile
- License information
- Documents
- Vehicle details

## Vehicle

- Vehicle number
- Vehicle type
- Capacity
- Documents
- Status

## Driver dashboard

Show:

- Today's route
- Assigned trip
- Vehicle capacity
- Total planned load
- Pending pickups
- Completed pickups
- Destination
- Earnings summary

## Pickup workflow

```text
Assigned
  ↓
Navigate to farmer
  ↓
Arrived
  ↓
Confirm farmer
  ↓
Enter actual quantity
  ↓
Upload evidence if required
  ↓
Pickup completed
```

## Capacity management

The driver must always see:

```text
Vehicle Capacity
Current Load
Remaining Capacity
```

Prevent pickup confirmation if it would exceed vehicle capacity unless an authorized override is used.

## Route

Show:

- Pickup sequence
- Map
- Distance
- ETA
- Destination
- Completed stops
- Pending stops

## Delivery

```text
Navigate to buyer
  ↓
Arrived
  ↓
Enter delivered quantity
  ↓
Upload proof of delivery
  ↓
Buyer confirmation
  ↓
Trip completed
```

## Earnings

Show:

- Trip earnings
- Completed trips
- Pending payments
- Earnings history

---

# 11. BUYER / USER ANDROID APP

Technology:

- Flutter
- Dart
- Same shared mobile architecture as Farmer/Driver apps

## Buyer registration

- Name
- Business/company name
- Mobile
- Email
- Address
- Delivery locations
- Verification data where required

## Buyer features

### Requirement creation

Buyer can specify:

- Crop
- Variety where applicable
- Quantity
- Unit
- Quality/grade
- Required date
- Delivery location
- Preferred price
- Additional notes

### Supply discovery

Buyer can:

- View matching available supply
- Compare available quantities
- View quality
- View estimated delivery
- View source/farmer information permitted by policy
- Confirm supply

### Orders

- Place order
- View order
- Track order
- View driver/delivery status
- Receive notifications
- Confirm delivery
- View order history
- Download invoice/receipt where applicable

---

# 12. SUPPLY-DEMAND MATCHING ENGINE

This is a core business module.

The system must match farmer supply to buyer demand.

Initial matching factors:

1. Crop compatibility
2. Variety compatibility
3. Quantity
4. Quality
5. Availability date
6. Buyer required date
7. Geographic distance
8. Preferred price
9. Supply status
10. Vehicle/logistics feasibility

Example:

```text
Buyer requirement:
Tomato
5,000 KG
A Grade
Pune
Required: 25 Sept

Available:

Farmer A = 1,500 KG
Farmer B = 1,000 KG
Farmer C = 2,500 KG

Total = 5,000 KG
```

The engine can create a match consisting of multiple supply batches.

The matching engine must be implemented as a dedicated NestJS service.

Do not hard-code matching logic inside controllers.

---

# 13. LOGISTICS ENGINE

After an order/match is confirmed:

```text
MATCH
 ↓
ORDER
 ↓
PICKUP PLAN
 ↓
FIND SUITABLE DRIVER
 ↓
CHECK VEHICLE CAPACITY
 ↓
CREATE ROUTE
 ↓
DRIVER ACCEPTS/STARTS TRIP
 ↓
FARMER PICKUPS
 ↓
LOAD TRACKING
 ↓
BUYER DELIVERY
 ↓
PROOF OF DELIVERY
 ↓
BUYER CONFIRMATION
 ↓
ORDER COMPLETED
```

The system should support multiple farmer pickups for one buyer order.

Example:

```text
Farmer A → 1.2 Ton
Farmer B → 0.8 Ton
Farmer C → 2.0 Ton
Farmer D → 2.0 Ton

Driver Vehicle Capacity = 6 Ton
```

The route planner should consider:

- Pickup locations
- Delivery location
- Quantity
- Vehicle capacity
- Time/date
- Route distance
- Estimated travel time

---

# 14. GPS AND DRIVER LOCATION

Initial Hostinger-compatible implementation:

Use normal HTTPS API location updates.

Example:

```text
POST /api/v1/drivers/location
```

Driver sends:

- latitude
- longitude
- timestamp
- trip ID
- optional speed
- optional heading

Admin can request recent locations.

Do NOT require persistent WebSocket infrastructure for the first Hostinger Business deployment.

Use polling/periodic refresh initially.

Example:

```text
Driver App
   |
Every 10–20 seconds while active trip
   |
HTTPS
   |
NestJS
   |
MySQL
   |
Admin map refresh
```

The location update frequency must be configurable and battery-conscious.

If the project later moves to a VPS or dedicated infrastructure, real-time WebSocket/SSE functionality can be added without changing the core business model.

---

# 15. NOTIFICATIONS

Use:

**Firebase Cloud Messaging (FCM)**

Notification targets:

- Farmer
- Driver
- Buyer
- Admin/staff where required

Notification events:

### Farmer

- Registration approved
- Supply created
- Supply matched
- Pickup assigned
- Pickup completed
- Delivery completed
- Payment update
- Weather alert
- Market alert

### Driver

- New trip assigned
- Trip changed
- Pickup reminder
- Buyer delivery information
- Order cancelled
- Payment/earnings update

### Buyer

- Requirement created
- Supply matched
- Order confirmed
- Driver assigned
- Pickup started
- Delivery approaching
- Delivered
- Order completed

All important notifications should also be stored in MySQL so users can view notification history.

---

# 16. MARKET PRICE MODULE

Admin can manage market prices.

Fields:

```text
crop
variety
market
district
state
minimum_price
maximum_price
average_price
unit
date
source
```

The system should support both:

- Admin-entered market prices
- Future external API integration

Do not make the core application unusable if an external market-price API is unavailable.

---

# 17. WEATHER MODULE

Weather data should be associated with farmer/farm location.

Display:

- Current temperature
- Weather condition
- Rain probability
- Forecast
- Warnings
- Agriculture-related advisory messages where available

Weather provider must be behind an abstraction so it can be replaced later.

---

# 18. REPORTS AND ANALYTICS

Admin reports should include:

### Farmer reports

- Farmers by village
- Farmers by district
- Active farmers
- Verified/unverified farmers
- Crop-wise farmers

### Crop reports

- Crop area
- Expected production
- Harvest timeline
- Available supply
- Crop-wise supply

### Demand reports

- Buyer requirements
- Crop demand
- Quantity demand
- Unfulfilled demand

### Logistics reports

- Driver trips
- Completed pickups
- Failed pickups
- Delivery time
- Route distance
- Vehicle utilization

### Order reports

- Pending
- Confirmed
- In transit
- Delivered
- Cancelled

### Financial reports

- Orders
- Payments
- Invoices
- Driver earnings
- Revenue where applicable

### Analytics

- Supply vs demand
- Top crops
- High-demand crops
- Supply shortages
- Route efficiency
- Vehicle utilization
- Delivery performance

---

# 19. CORE BUSINESS MODULES

The platform must implement these modules:

```text
1. Authentication
2. User Management
3. Role & Permission Management
4. Farmer Management
5. Farm Management
6. Crop Management
7. Crop Production
8. Harvest Management
9. Supply Management
10. Buyer Management
11. Demand Management
12. Supply-Demand Matching
13. Order Management
14. Driver Management
15. Vehicle Management
16. Trip Management
17. Pickup Management
18. Route Management
19. Delivery Management
20. GPS/Location Management
21. Market Price Management
22. Weather Management
23. Notification Management
24. Payment Management
25. Invoice Management
26. File/Document Management
27. Support Management
28. Reporting
29. Analytics
30. Audit Logging
31. System Settings
```

---

# 20. SECURITY REQUIREMENTS

The AI must treat security as a first-class requirement.

Implement:

- Firebase token verification
- Role-based access control
- Permission checks
- Input validation
- SQL injection protection through Prisma
- Rate limiting
- CORS configuration
- Secure HTTP headers
- File upload validation
- File size limits
- MIME type validation
- Access control for private documents
- Audit logging
- Secure environment variables
- No secrets committed to Git
- No API keys in Flutter source code where avoidable
- No database credentials in frontend
- Sanitized error responses
- Proper logging without exposing secrets
- Authentication/session expiration handling

Never trust role information sent directly by a client.

Always determine authorization from verified backend identity and server-side user data.

---

# 21. ENVIRONMENT CONFIGURATION

Use environment variables.

Example categories:

```text
DATABASE_URL

FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY

MAP_TILE_PROVIDER
ROUTING_PROVIDER
ROUTING_API_KEY

WEATHER_API_KEY
MARKET_PRICE_API_KEY

FILE_STORAGE_PATH

APP_BASE_URL
API_BASE_URL

FCM_CONFIGURATION
```

Never commit `.env`.

Provide:

```text
.env.example
```

---

# 22. HOSTINGER DEPLOYMENT TARGET

Initial deployment target:

**Hostinger Business hosting**

Recommended deployment:

```text
api.example.com
   ↓
NestJS Node.js backend

admin.example.com
   ↓
React Admin Panel

MySQL/MariaDB
   ↓
Hostinger database

uploads/
   ↓
Hostinger storage
```

The backend must be designed to run without:

- Kubernetes
- Docker requirement
- Redis requirement
- Kafka
- RabbitMQ
- Microservices

The first release should be a **modular monolith**.

---

# 23. PROJECT STRUCTURE

Recommended repository:

```text
agri-supply-chain/
│
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── farmers/
│   │   │   ├── farms/
│   │   │   ├── crops/
│   │   │   ├── buyers/
│   │   │   ├── supply/
│   │   │   ├── demand/
│   │   │   ├── matching/
│   │   │   ├── drivers/
│   │   │   ├── vehicles/
│   │   │   ├── trips/
│   │   │   ├── routes/
│   │   │   ├── pickups/
│   │   │   ├── deliveries/
│   │   │   ├── orders/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   ├── market-prices/
│   │   │   ├── weather/
│   │   │   ├── reports/
│   │   │   ├── uploads/
│   │   │   ├── support/
│   │   │   └── admin/
│   │   ├── prisma/
│   │   └── package.json
│   │
│   ├── admin/
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   ├── layouts/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   └── stores/
│   │   └── package.json
│   │
│   └── mobile/
│       ├── lib/
│       │   ├── core/
│       │   ├── shared/
│       │   ├── farmer/
│       │   ├── driver/
│       │   └── buyer/
│       └── pubspec.yaml
│
├── packages/
│   ├── shared-types/
│   ├── shared-config/
│   └── shared-utils/
│
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── database/
│   └── deployment/
│
├── .env.example
├── README.md
└── package.json
```

---

# 24. MOBILE APP ARCHITECTURE

Prefer one Flutter workspace/codebase with separate application entry points/flavors:

```text
Farmer App
Driver App
Buyer App
```

Shared:

- Authentication
- API client
- Models
- Networking
- Notification service
- Map service
- File upload service
- Common widgets
- Theme
- Error handling
- Localization infrastructure

Role-specific screens remain separated.

Do not duplicate the entire Flutter codebase three times.

---

# 25. UI/UX REQUIREMENTS

The design must be professional, clean and production-ready.

### Farmer

Use a simple, agriculture-friendly UI.

Prioritize:

- Large touch targets
- Simple language
- Clear icons
- Important information first
- Low complexity
- Good network error handling

### Driver

Prioritize:

- Route
- Next stop
- Pickup status
- Vehicle capacity
- Navigation
- Delivery status

### Buyer

Prioritize:

- Requirements
- Available supply
- Orders
- Delivery tracking

### Admin

Use a professional enterprise dashboard.

Prioritize:

- Data tables
- Filters
- Search
- Bulk actions
- Charts
- Maps
- Status indicators
- Detailed records
- Audit history

The UI must be responsive.

Admin should work on desktop and tablet.

---

# 26. ORDER STATUS MODEL

Use a clear order state machine.

Example:

```text
DRAFT
 ↓
SUBMITTED
 ↓
MATCHING
 ↓
MATCHED
 ↓
CONFIRMED
 ↓
DRIVER_ASSIGNED
 ↓
PICKUP_SCHEDULED
 ↓
PICKUP_IN_PROGRESS
 ↓
PICKED_UP
 ↓
IN_TRANSIT
 ↓
DELIVERY_ATTEMPTED
 ↓
DELIVERED
 ↓
COMPLETED
```

Alternative terminal states:

```text
CANCELLED
FAILED
REJECTED
```

Every state transition must be validated.

Store order status history.

---

# 27. PICKUP STATUS

```text
PENDING
ASSIGNED
EN_ROUTE
ARRIVED
LOADING
COMPLETED
FAILED
CANCELLED
```

---

# 28. DELIVERY STATUS

```text
PENDING
IN_TRANSIT
ARRIVING
ARRIVED
DELIVERED
FAILED
CANCELLED
```

---

# 29. SUPPLY STATUS

```text
DRAFT
AVAILABLE
PARTIALLY_MATCHED
FULLY_MATCHED
RESERVED
SOLD
EXPIRED
CANCELLED
```

---

# 30. BUYER REQUIREMENT STATUS

```text
DRAFT
OPEN
MATCHING
PARTIALLY_MATCHED
FULLY_MATCHED
ORDERED
FULFILLED
EXPIRED
CANCELLED
```

---

# 31. AUDIT LOGGING

Admin/business-critical actions must be auditable.

Track:

- Who performed action
- Action
- Entity
- Entity ID
- Previous value where appropriate
- New value where appropriate
- IP/device metadata where appropriate
- Timestamp

Examples:

```text
Admin approved farmer
Admin changed order status
Driver completed pickup
Buyer confirmed delivery
Admin changed market price
Admin changed system setting
```

---

# 32. API DESIGN

Use versioned REST APIs:

```text
/api/v1/
```

Examples:

```text
POST   /api/v1/auth/verify
GET    /api/v1/farmers/me
POST   /api/v1/farms
GET    /api/v1/crops
POST   /api/v1/farmer-crops

POST   /api/v1/supply
GET    /api/v1/supply
POST   /api/v1/requirements

GET    /api/v1/matches
POST   /api/v1/orders
GET    /api/v1/orders/:id

GET    /api/v1/drivers/trips
POST   /api/v1/drivers/location
POST   /api/v1/pickups/:id/complete
POST   /api/v1/deliveries/:id/complete

GET    /api/v1/market-prices
GET    /api/v1/weather

GET    /api/v1/admin/dashboard
GET    /api/v1/admin/reports
```

Use consistent response formats.

Example:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

Errors should be structured consistently.

---

# 33. BUSINESS RULES

The system must enforce:

1. A farmer cannot create supply without a valid crop/farm context.
2. Supply quantity cannot be negative.
3. A buyer requirement cannot have negative quantity.
4. Matching cannot allocate more quantity than available supply.
5. A supply batch may be split among multiple orders if business rules allow.
6. Vehicle load cannot exceed capacity without authorized override.
7. Driver must have an active/approved profile before receiving trips.
8. Vehicle must be active/approved before assignment.
9. Order status transitions must follow the state machine.
10. Delivery cannot be completed without required delivery information.
11. Private documents must only be visible to authorized roles.
12. Admin actions must be logged.
13. Cancelled/expired supply cannot be matched.
14. Expired buyer requirements cannot receive new matches.
15. All quantities must have explicit units.
16. Dates and timestamps must be stored consistently.
17. Location data must be validated.
18. Matching must consider availability dates.
19. A completed order cannot be modified arbitrarily.
20. Financial records must be immutable or handled through correction/reversal records.

---

# 34. FUTURE-READY DESIGN

The first version must remain simple enough for Hostinger Business, but the architecture must allow future growth.

Possible future upgrades:

```text
Hostinger Business
       ↓
Hostinger VPS / Cloud
       ↓
Docker
       ↓
Redis
       ↓
WebSockets
       ↓
Background workers
       ↓
Advanced routing
       ↓
AI/ML prediction
       ↓
Microservices only if actually required
```

Do not build these prematurely.

The application should use interfaces/abstractions around:

- Storage
- Maps
- Routing
- Weather
- Market prices
- Notifications
- Payments

so external providers can be changed later.

---

# 35. AI/ML — FUTURE MODULE

The reference architecture includes an optimization/AI engine.

Do not make machine learning mandatory for the first release.

First implement deterministic business rules.

Later support:

- Demand forecasting
- Crop price prediction
- Harvest prediction
- Route optimization
- Supply-demand forecasting
- Crop recommendation
- Weather-risk analysis
- Over-supply prediction

Potential future stack:

- Python
- FastAPI
- Scikit-learn
- PyTorch
- Pandas

The AI/ML service should be a separate future service, not a reason to complicate the initial NestJS backend.

---

# 36. CORE DATA FLOW

```text
FARMER
  |
  +-- Farm
  |
  +-- Crop
  |
  +-- Production
  |
  +-- Harvest
  |
  +-- Supply
  |
  v
SUPPLY DATABASE
  |
  v
MATCHING ENGINE
  ^
  |
BUYER REQUIREMENT
  |
  +-- Crop
  +-- Quantity
  +-- Quality
  +-- Date
  +-- Location
  +-- Price
  |
  v
MATCH
  |
  v
ORDER
  |
  v
LOGISTICS
  |
  +-- Driver
  +-- Vehicle
  +-- Route
  +-- Pickups
  |
  v
DELIVERY
  |
  v
PROOF OF DELIVERY
  |
  v
BUYER CONFIRMATION
  |
  v
COMPLETED ORDER
```

---

# 37. ADMIN CONTROL FLOW

```text
ADMIN
 |
 +-- Manage Farmers
 |
 +-- Manage Buyers
 |
 +-- Manage Drivers
 |
 +-- Manage Vehicles
 |
 +-- Manage Crops
 |
 +-- Manage Supply
 |
 +-- Manage Demand
 |
 +-- Manage Matching
 |
 +-- Manage Orders
 |
 +-- Manage Routes
 |
 +-- Manage Deliveries
 |
 +-- Manage Payments
 |
 +-- Manage Notifications
 |
 +-- Manage Market Prices
 |
 +-- Manage Weather
 |
 +-- Reports
 |
 +-- Analytics
 |
 +-- Roles & Permissions
 |
 +-- Settings
 |
 +-- Audit Logs
```

---

# 38. DEVELOPMENT PHASES

The AI should build incrementally.

## Phase 1 — Foundation

- Repository
- NestJS backend
- React admin
- Flutter mobile workspace
- MySQL
- Prisma
- Firebase Auth
- Basic RBAC
- Environment configuration
- Swagger
- Logging
- Error handling

## Phase 2 — Farmer

- Farmer profile
- Farm
- Crops
- Production
- Harvest
- Supply

## Phase 3 — Buyer

- Buyer profile
- Requirements
- Supply discovery
- Matching

## Phase 4 — Orders

- Orders
- Order items
- Status state machine
- Order history

## Phase 5 — Driver

- Driver
- Vehicle
- Trips
- Pickup
- Capacity
- Delivery
- Proof of delivery

## Phase 6 — Maps

- OpenStreetMap-based map
- Location
- Routing
- Pickup route
- Delivery route

## Phase 7 — Notifications

- Firebase FCM
- Notification history
- Event-based notifications

## Phase 8 — Admin

- Complete dashboard
- Management screens
- Reports
- Analytics
- Audit logs

## Phase 9 — Integrations

- Weather
- Market prices
- Payments if required
- Advanced routing

## Phase 10 — Production hardening

- Security
- Validation
- Rate limits
- Performance
- Error monitoring
- Backups
- Deployment
- Testing
- Documentation

---

# 39. TESTING REQUIREMENTS

The project must include:

### Backend

- Unit tests
- Service tests
- Controller/API tests
- Matching-engine tests
- State-transition tests

### Admin

- Component tests where appropriate
- API integration tests
- Permission tests

### Flutter

- Widget tests
- Service tests
- Authentication flow tests
- Critical workflow tests

### End-to-end scenarios

At minimum test:

```text
Farmer registration
→ Farm creation
→ Crop creation
→ Supply creation

Buyer registration
→ Requirement creation

Supply
→ Matching
→ Order

Order
→ Driver assignment
→ Pickup
→ Delivery
→ Buyer confirmation
```

---

# 40. PERFORMANCE REQUIREMENTS

The system should be designed for:

- Pagination on all large lists
- Database indexes
- Efficient filtering
- Search
- Server-side sorting
- Avoiding N+1 database queries
- Lazy loading where appropriate
- Image/file size limits
- API rate limiting
- Efficient location updates

Do not load thousands of records into the browser/mobile app at once.

---

# 41. OFFLINE/POOR NETWORK HANDLING

Agricultural areas may have poor connectivity.

The mobile apps should handle:

- Network unavailable
- Request timeout
- Retry
- Loading state
- Empty state
- Error state

For critical driver operations, consider local temporary state/queueing so a temporary network failure does not lose the user's work.

Do not falsely report a pickup or delivery as completed if the server has not confirmed it.

---

# 42. LOCALIZATION

Build localization infrastructure from the beginning.

Initial language:

- English

Architecture should allow future:

- Marathi
- Hindi
- Other regional languages

Do not hard-code every UI string directly inside widgets/components.

---

# 43. IMPORTANT NON-GOALS FOR VERSION 1

Do NOT add unnecessary complexity:

- No Kubernetes
- No microservices
- No Kafka
- No RabbitMQ
- No Redis requirement
- No PostgreSQL
- No PostGIS requirement
- No AWS dependency
- No paid map dependency
- No machine-learning dependency
- No WebSocket requirement on Hostinger Business

These may be introduced later if the system grows.

---

# 44. FINAL TECHNOLOGY SUMMARY

```text
MOBILE
Flutter + Dart

ADMIN
React + TypeScript + Vite
Tailwind CSS + shadcn/ui

BACKEND
Node.js + NestJS + TypeScript

DATABASE
MySQL

ORM
Prisma

AUTHENTICATION
Firebase Authentication

PUSH NOTIFICATIONS
Firebase Cloud Messaging

MAPS
OpenStreetMap-based mapping
Leaflet for web
flutter_map for Flutter

ROUTING
openrouteservice initially
Provider abstraction for future replacement

FILE STORAGE
Hostinger initially

API DOCUMENTATION
OpenAPI + Swagger UI

VERSION CONTROL
Git + GitHub

INITIAL HOSTING
Hostinger Business

ARCHITECTURE
Modular Monolith

API
REST /api/v1

FUTURE
Redis + WebSockets + VPS + AI/ML only when required
```

---

# 45. FINAL PRODUCT DEFINITION

The final product is NOT just a farmer app.

It is a complete digital agriculture supply-chain platform.

The platform must connect:

```text
FARMER
  ↓
CROP / FARM / PRODUCTION
  ↓
AVAILABLE SUPPLY
  ↓
DEMAND
  ↓
MATCHING
  ↓
ORDER
  ↓
DRIVER
  ↓
PICKUP
  ↓
ROUTE
  ↓
DELIVERY
  ↓
BUYER
  ↓
CONFIRMATION
  ↓
PAYMENT / REPORTING
```

The Admin Panel controls and monitors the complete chain.

---

# 46. AI CODING AGENT INSTRUCTIONS

When an AI coding agent reads this document:

1. Treat this document as the primary product specification.
2. Do not change the technology stack without explicit approval.
3. Do not replace MySQL with PostgreSQL.
4. Do not replace Firebase Authentication with custom authentication.
5. Do not introduce Google Maps as a mandatory dependency.
6. Do not introduce paid infrastructure when a free/open alternative is specified.
7. Use one shared NestJS backend for all apps and the Admin Panel.
8. Keep business logic in backend services, not inside mobile/admin clients.
9. Keep provider integrations behind interfaces/services.
10. Build production-quality modular code.
11. Do not put secrets in source code.
12. Do not create fake APIs or fake database behavior in the final implementation.
13. If a feature cannot be fully implemented because an external credential is unavailable, create a proper integration interface and clearly document the required environment variables.
14. Use real database models and migrations.
15. Use real API endpoints.
16. Use proper validation and authorization.
17. Generate Swagger/OpenAPI documentation.
18. Include `.env.example`.
19. Include setup instructions.
20. Include database migration/seed instructions.
21. Include deployment instructions for Hostinger.
22. Do not skip security.
23. Do not skip error handling.
24. Do not skip loading/empty/error states in UI.
25. Do not generate only a visual prototype; implement the functional application architecture.
26. Maintain clean separation between:
    - UI
    - API client
    - business logic
    - database
    - external services
27. Keep the application ready for future scaling without prematurely introducing distributed infrastructure.
28. Complete one module properly before moving to the next.
29. After each major module, ensure existing functionality still works.
30. The final system must be deployable and understandable by another developer.

---

# 47. DEFINITION OF DONE

The project is considered complete only when:

- Admin can log in.
- Farmer can register/login using Firebase.
- Driver can register/login using Firebase.
- Buyer can register/login using Firebase.
- Admin can manage all three user types.
- Farmer can create farm and crop information.
- Farmer can create supply.
- Buyer can create demand.
- Matching engine can match supply and demand.
- Buyer can create/confirm an order.
- Driver can receive a trip.
- Driver can see pickup locations.
- Driver can manage vehicle capacity.
- Driver can record pickup.
- Driver can navigate using the map/routing system.
- Driver can record delivery.
- Driver can upload proof of delivery.
- Buyer can confirm delivery.
- Notifications work through Firebase FCM.
- Admin can monitor the complete workflow.
- Admin can view reports and analytics.
- File uploads work using Hostinger storage.
- MySQL data persists correctly.
- Swagger/OpenAPI documentation works.
- Role/permission security works.
- Audit logs work for critical operations.
- The backend can run on Hostinger Business.
- The system has proper `.env` configuration.
- The project has installation/deployment documentation.
- The project has automated tests for critical business logic.
- No core workflow depends on fake/mock data in production mode.

---

# 48. END GOAL IN ONE SENTENCE

> **Build a production-ready, modular Agriculture Supply Chain Management Platform using Flutter Android apps for Farmers, Drivers and Buyers, a React web Admin Panel, one shared NestJS/Node.js backend, MySQL database, Firebase Authentication/FCM, OpenStreetMap-based free mapping/routing services, Hostinger file storage and Hostinger Business hosting — covering the complete flow from farm production and supply through demand matching, order management, optimized pickup, logistics, delivery, payment, reporting and administration.**

---

## SOURCE / ARCHITECTURE NOTES

The mapping decision intentionally uses an OpenStreetMap-based architecture rather than treating OpenStreetMap's public tile servers as an unlimited production CDN. OpenStreetMap's published policy requires attribution, proper identification and caching, and prohibits bulk tile downloading/offline prefetching on its public tile service.

openrouteservice provides free/open routing services and supports driving/heavy-vehicle routing; its service has usage restrictions, so the project must keep routing provider configuration replaceable and must not assume unlimited API usage.

Swagger/OpenAPI is used because the Swagger specification and public Swagger tools are available under Apache 2.0/open-source licensing.
