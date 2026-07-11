import { NextResponse } from "next/server";
import { getZoneDetail } from "@parksverige/prototype-data";

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ zoneId: string }>;
  }
) {
  const { zoneId } = await context.params;
  const zone = getZoneDetail(zoneId);

  if (!zone) {
    return NextResponse.json({ message: `Zone ${zoneId} was not found.` }, { status: 404 });
  }

  return NextResponse.json(zone);
}

