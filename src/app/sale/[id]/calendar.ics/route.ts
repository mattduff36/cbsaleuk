import { NextResponse } from "next/server";
import { getListingByIdOrSlug } from "@/lib/data";
import { createCalendarEvent, generateIcsContent } from "@/lib/utils";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const sale = await getListingByIdOrSlug(params.id);

  if (!sale) {
    return NextResponse.json({ message: "Listing not found." }, { status: 404 });
  }

  const event = createCalendarEvent(
    {
      name: sale.name,
      location: sale.location,
      address: sale.address,
      daysOfWeek: sale.daysOfWeek,
      startTime: sale.startTime,
      endTime: sale.endTime,
      carPrice: sale.carPrice,
      vanPrice: sale.vanPrice,
      organiserEmail: sale.organiserEmail,
      organiserPhone: sale.organiserPhone,
      otherInfo: sale.otherInfo || undefined,
      what3words: sale.what3words || undefined,
    },
    `https://carbootsale.com/sale/${sale.slug || sale.id}`,
  );

  return new NextResponse(generateIcsContent(event), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${sale.slug || sale.id}.ics"`,
    },
  });
}
