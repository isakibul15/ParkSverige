import { NextResponse } from "next/server";
import { prototypeAlerts } from "@parksverige/prototype-data";

export async function GET() {
  return NextResponse.json({
    items: prototypeAlerts
  });
}

