import { Injectable } from "@nestjs/common";
import { getZoneDetail, nearbyParking, searchParking } from "../../data/stockholm.stub";

@Injectable()
export class ParkingService {
  getNearby(lat?: string, lng?: string) {
    return {
      ...nearbyParking,
      query: {
        lat,
        lng
      }
    };
  }

  search(query?: string) {
    return {
      items: searchParking(query)
    };
  }

  getZone(zoneId: string) {
    return getZoneDetail(zoneId);
  }
}
