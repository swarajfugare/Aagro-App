# KrishiSetu — Admin Command Console

> **Tagline**: *“From Farm to Market, Connected.”*

The KrishiSetu Admin Panel is a high-performance web dashboard built for supply chain orchestrators, logistics dispatchers, and verification officers to manage all operations from farm aggregation to buyer fulfillment.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with KrishiSetu Design System Tokens (Forest `#1B4D3E`, Fresh Leaf `#2E7D32`, Amber `#F59E0B`, Cream `#FBFBEE`)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Geographic Mapping**: [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/)
- **Authentication**: Firebase Web SDK (`firebase/auth`) with JWT Bearer Token forwarding to NestJS Backend

---

## 📦 Implemented Operations Modules

1. **Operations Dashboard (`/dashboard`)**: Live KPI metrics (Active farmers, verified buyers, fleet drivers, available supply volume, open demand, total GMV), supply vs demand regional chart, crop distribution chart, operational alerts stream, live supply chain map, and recent orders feed.
2. **Farmer Management & KYC (`/farmers`, `/farmers/:id`)**: Searchable farmers directory, land size, experience, farm plots list with coordinates, crop batches, and KYC review modal (approve/reject).
3. **Buyer Directory & Verification (`/buyers`, `/buyers/:id`)**: Business list (wholesalers, retailers, processors, institutional), GST/PAN registration records, active purchase demands, and fulfillment orders history.
4. **Driver Fleet & Dispatch (`/drivers`, `/drivers/:id`)**: Driver directory, commercial driving license checks, assigned transport vehicles with payload capacity and refrigeration specs, live online status, and multi-stop dispatch trips.
5. **Crop Catalog & Agronomy Master (`/crops`, `/crops/:id`)**: Crop species registry with categories, shelf life, cold chain storage temperatures, cultivar varieties, maturity days, and yield expectations. Add Crop & Add Variety modals.
6. **Supply Batches & Harvest Inventory (`/supply`, `/supply/:id`)**: Farm produce listings, quality grading (Grade A/B/C), base prices, harvest timestamps, shelf life indicators, and matching allocations.
7. **Buyer Purchase Demand Requirements (`/demand`, `/demand/:id`)**: Purchase RFQs, target quantities, maximum willing unit prices, required fulfillment dates, and destination warehouses.
8. **Supply Chain Orders & Fulfillment (`/orders`, `/orders/:id`)**: Multi-party orders with the **12-state order state machine progression** (`CREATED` -> `CONFIRMED` -> `ASSIGNED_TO_TRIP` -> `PICKUP_IN_PROGRESS` -> `PICKED_UP` -> `IN_TRANSIT` -> `ARRIVED_AT_HUB` -> `SORTED` -> `OUT_FOR_DELIVERY` -> `DELIVERED`), line items breakdown, and status transition control.
9. **Logistics Trips & Fleet Dispatch (`/trips`, `/trips/:id`)**: Multi-stop dispatch itineraries, driver & vehicle capacity, Leaflet route visualization, and waypoint status progressions.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd apps/admin
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Configure your Firebase credentials and API endpoint:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Start Development Server
```bash
npm run dev
```
The Admin Panel will be accessible at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
