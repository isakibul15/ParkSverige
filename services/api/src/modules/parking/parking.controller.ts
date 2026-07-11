import { Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { ParkingService } from "./parking.service";

@Controller("parking")
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Get("search")
  search(@Query("q") q?: string) {
    return this.parkingService.search(q);
  }

  @Get("nearby")
  getNearby(@Query("lat") lat?: string, @Query("lng") lng?: string) {
    return this.parkingService.getNearby(lat, lng);
  }

  @Get("zones/:zoneId")
  getZone(@Param("zoneId") zoneId: string) {
    const zone = this.parkingService.getZone(zoneId);

    if (!zone) {
      throw new NotFoundException(`Zone ${zoneId} was not found.`);
    }

    return zone;
  }
}
