import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest): Promise<Response> {
  const { conversationId, label, note } = await req.json() as {
    conversationId: string;
    label: "good" | "bad";
    note?: string;
  };

  const supabase = createAdminClient();

  // Buscar el log más reciente de esta conversación
  const { data: log } = await supabase
    .from("agent_logs")
    .select("id")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  await supabase.from("agent_evals").insert({
    agent: "lead-qualifier",
    log_id: log?.id ?? null,
    label,
    note: note ?? null,
    tagged_by: "crm-chat",
  });

  return NextResponse.json({ ok: true });
}
