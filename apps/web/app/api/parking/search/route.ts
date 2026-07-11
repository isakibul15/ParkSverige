import { NextResponse } from "next/server";
import { searchParking } from "@parksverige/prototype-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return NextResponse.json({
    items: searchParking(searchParams.get("q") ?? undefined)
  });
}

