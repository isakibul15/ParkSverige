import { Module } from "@nestjs/common";
import { AuthController } from "./modules/auth/auth.controller";
import { FavoritesController } from "./modules/favorites/favorites.controller";
import { HealthController } from "./modules/health/health.controller";
import { NotificationsController } from "./modules/notifications/notifications.controller";
import { ParkingController } from "./modules/parking/parking.controller";
import { ParkingService } from "./modules/parking/parking.service";
import { VehiclesController } from "./modules/vehicles/vehicles.controller";

@Module({
  controllers: [
    HealthController,
    AuthController,
    FavoritesController,
    NotificationsController,
    ParkingController,
    VehiclesController
  ],
  providers: [ParkingService]
})
export class AppModule {}
