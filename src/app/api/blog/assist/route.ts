import { NextResponse } from "next/server";
import { getCurrentUser, isAdminUser } from "@/lib/auth-service";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!isAdminUser(user)) {
    return NextResponse.json({ message: "Admin access required." }, { status: 403 });
  }

  const { topic = "UK car boot sale planning" } = await request.json();

  const draft = {
    title: `Draft: ${topic}`,
    summary: [
      "Lead with a practical pain point buyers or organisers recognise immediately.",
      "Add one trust-building section about verification, weather, or event freshness.",
      "Finish with a clear internal link to a relevant listing or category page.",
    ],
    suggestedHeadings: [
      `Why ${topic} matters this season`,
      "What buyers should check before setting off",
      "How organisers can make listings more trustworthy",
      "Where to link deeper into the site structure",
    ],
  };

  return NextResponse.json(draft);
}
