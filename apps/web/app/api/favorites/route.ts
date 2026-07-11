import { NextResponse } from "next/server";
import { favoriteLocations } from "@parksverige/prototype-data";

export async function GET() {
  return NextResponse.json({
    items: favoriteLocations
  });
}

