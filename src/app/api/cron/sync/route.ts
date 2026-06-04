import { NextRequest, NextResponse } from "next/server";
import { syncWorkspaceProperties } from "@/lib/sheets";

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";

// Vercel Cron Job — corre cada hora
// Protegido: solo Vercel puede llamarlo (Authorization: Bearer CRON_SECRET)
export async function GET(req: NextRequest): Promise<Response> {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // En producción, verificar el secret de Vercel Cron
  if (process.env.NODE_ENV === "production" && cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    console.log("[cron/sync] Iniciando sync automático de Google Sheets...");
    const result = await syncWorkspaceProperties(WORKSPACE_ID);

    console.log(`[cron/sync] ✅ ${result.upserted} propiedades sincronizadas`);
    if (result.errors.length) {
      console.log(`[cron/sync] ⚠️ Advertencias: ${result.errors.join(", ")}`);
    }

    return NextResponse.json({
      ok: true,
      upserted: result.upserted,
      tabs: result.tabs,
      warnings: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[cron/sync] ❌ Error:", e);
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
