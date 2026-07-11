import { NextResponse } from "next/server";
import { demoVehicles } from "@parksverige/prototype-data";
import type { UserVehicle, VehicleType } from "@parksverige/shared-types";

interface CreateVehiclePayload {
  licensePlate: string;
  country: string;
  vehicleType: VehicleType;
  nickname?: string;
}

export async function GET() {
  return NextResponse.json({
    items: demoVehicles
  });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CreateVehiclePayload;

  const vehicle: UserVehicle = {
    id: `veh_${demoVehicles.length + 1}`,
    licensePlate: payload.licensePlate,
    country: payload.country,
    vehicleType: payload.vehicleType,
    nickname: payload.nickname
  };

  return NextResponse.json({
    item: vehicle,
    saved: false,
    note: "This is a scaffold response until database persistence is connected."
  });
}

