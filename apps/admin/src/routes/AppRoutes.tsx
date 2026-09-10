import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { FarmersPage } from '../pages/farmers/FarmersPage';
import { FarmerDetailPage } from '../pages/farmers/FarmerDetailPage';
import { BuyersPage } from '../pages/buyers/BuyersPage';
import { BuyerDetailPage } from '../pages/buyers/BuyerDetailPage';
import { DriversPage } from '../pages/drivers/DriversPage';
import { DriverDetailPage } from '../pages/drivers/DriverDetailPage';
import { CropsPage } from '../pages/crops/CropsPage';
import { CropDetailPage } from '../pages/crops/CropDetailPage';
import { SupplyPage } from '../pages/supply/SupplyPage';
import { SupplyDetailPage } from '../pages/supply/SupplyDetailPage';
import { DemandPage } from '../pages/demand/DemandPage';
import { DemandDetailPage } from '../pages/demand/DemandDetailPage';
import { OrdersPage } from '../pages/orders/OrdersPage';
import { OrderDetailPage } from '../pages/orders/OrderDetailPage';
import { TripsPage } from '../pages/trips/TripsPage';
import { TripDetailPage } from '../pages/trips/TripDetailPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin Console Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />

        {/* 1. Farmers Module */}
        <Route path="farmers" element={<FarmersPage />} />
        <Route path="farmers/:id" element={<FarmerDetailPage />} />

        {/* 2. Buyers Module */}
        <Route path="buyers" element={<BuyersPage />} />
        <Route path="buyers/:id" element={<BuyerDetailPage />} />

        {/* 3. Drivers Module */}
        <Route path="drivers" element={<DriversPage />} />
        <Route path="drivers/:id" element={<DriverDetailPage />} />

        {/* 4. Crops Catalog Module */}
        <Route path="crops" element={<CropsPage />} />
        <Route path="crops/:id" element={<CropDetailPage />} />

        {/* 5. Supply Batches Module */}
        <Route path="supply" element={<SupplyPage />} />
        <Route path="supply/:id" element={<SupplyDetailPage />} />

        {/* 6. Purchase Demand Module */}
        <Route path="demand" element={<DemandPage />} />
        <Route path="demand/:id" element={<DemandDetailPage />} />

        {/* 7. Orders Module */}
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />

        {/* 8. Trips & Dispatch Module */}
        <Route path="trips" element={<TripsPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
