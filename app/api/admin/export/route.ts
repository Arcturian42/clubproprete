import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { exportModerationQueue } from "@/lib/actions/admin";

export async function GET() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "admin" && role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const csv = await exportModerationQueue();
  const filename = `moderation-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
