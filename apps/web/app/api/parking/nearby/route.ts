import { NextResponse } from "next/server";
import { nearbyParking } from "@parksverige/prototype-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return NextResponse.json({
    ...nearbyParking,
    query: {
      lat: searchParams.get("lat"),
      lng: searchParams.get("lng")
    }
  });
}

