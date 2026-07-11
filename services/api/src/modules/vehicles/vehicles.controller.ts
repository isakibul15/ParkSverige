import { Body, Controller, Get, Post } from "@nestjs/common";
import { demoVehicles } from "../../data/stockholm.stub";
import type { UserVehicle, VehicleType } from "@parksverige/shared-types";

interface CreateVehiclePayload {
  licensePlate: string;
  country: string;
  vehicleType: VehicleType;
  nickname?: string;
}

@Controller("vehicles")
export class VehiclesController {
  @Get()
  listVehicles() {
    return {
      items: demoVehicles
    };
  }

  @Post()
  createVehicle(@Body() payload: CreateVehiclePayload) {
    const vehicle: UserVehicle = {
      id: `veh_${demoVehicles.length + 1}`,
      licensePlate: payload.licensePlate,
      country: payload.country,
      vehicleType: payload.vehicleType,
      nickname: payload.nickname
    };

    return {
      item: vehicle,
      saved: false,
      note: "This is a scaffold response until database persistence is connected."
    };
  }
}
