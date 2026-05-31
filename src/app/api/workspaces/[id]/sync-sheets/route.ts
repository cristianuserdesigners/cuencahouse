import { NextRequest, NextResponse } from "next/server";
import { syncWorkspaceProperties } from "@/lib/sheets";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  try {
    const result = await syncWorkspaceProperties(id);
    return NextResponse.json({
      ok: true,
      upserted: result.upserted,
      tabs: result.tabs,
      errors: result.errors,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
