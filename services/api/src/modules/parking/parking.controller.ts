import { Controller, Get, Query } from "@nestjs/common";

@Controller("parking")
export class ParkingController {
  @Get("nearby")
  getNearby(@Query("lat") lat?: string, @Query("lng") lng?: string) {
    return {
      status: "stub",
      city: "stockholm",
      message: "Nearby parking lookup will be backed by PostGIS-served zone data.",
      input: {
        lat,
        lng
      }
    };
  }
}

