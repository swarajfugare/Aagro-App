import { Module } from '@nestjs/common';
import { AppConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

// Structural Feature Modules
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { FarmersModule } from './farmers/farmers.module';
import { FarmsModule } from './farms/farms.module';
import { CropsModule } from './crops/crops.module';
import { ProductionModule } from './production/production.module';
import { HarvestsModule } from './harvests/harvests.module';
import { SupplyModule } from './supply/supply.module';
import { BuyersModule } from './buyers/buyers.module';
import { DemandModule } from './demand/demand.module';
import { MatchingModule } from './matching/matching.module';
import { OrdersModule } from './orders/orders.module';
import { DriversModule } from './drivers/drivers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { TripsModule } from './trips/trips.module';
import { PickupsModule } from './pickups/pickups.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { RoutesModule } from './routes/routes.module';
import { LocationsModule } from './locations/locations.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MarketPricesModule } from './market-prices/market-prices.module';
import { WeatherModule } from './weather/weather.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadsModule } from './uploads/uploads.module';
import { ReportsModule } from './reports/reports.module';
import { SupportModule } from './support/support.module';
import { AuditModule } from './audit/audit.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // Core Modules
    AppConfigModule,
    PrismaModule,
    FirebaseModule,
    AuthModule,
    HealthModule,

    // Structural Feature Modules (Modular Monolith Foundation)
    UsersModule,
    RolesModule,
    PermissionsModule,
    FarmersModule,
    FarmsModule,
    CropsModule,
    ProductionModule,
    HarvestsModule,
    SupplyModule,
    BuyersModule,
    DemandModule,
    MatchingModule,
    OrdersModule,
    DriversModule,
    VehiclesModule,
    TripsModule,
    PickupsModule,
    DeliveriesModule,
    RoutesModule,
    LocationsModule,
    NotificationsModule,
    MarketPricesModule,
    WeatherModule,
    PaymentsModule,
    UploadsModule,
    ReportsModule,
    SupportModule,
    AuditModule,
    AdminModule,
  ],
})
export class AppModule {}
