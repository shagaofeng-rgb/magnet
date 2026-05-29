import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const data = await request.json();

  if (!data?.name || !data?.email || !data?.country || !data?.message) {
    return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
  }

  // Replace this placeholder with email, CRM, or webhook delivery when credentials are available.
  console.info("New COWIN MAGNET inquiry", {
    name: data.name,
    email: data.email,
    country: data.country,
    requiredProduct: data.requiredProduct,
    sourcePath: data.sourcePath,
    utm: data.utm
  });

  return NextResponse.json({
    ok: true,
    message: "Thank you. Our sales team will contact you soon."
  });
}
