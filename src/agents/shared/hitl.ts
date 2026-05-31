import { createAdminClient } from "@/lib/supabase/admin";

type HitlAction =
  | "send_offer"
  | "update_price"
  | "confirm_reservation"
  | "reassign_lead"
  | "share_partner_data";

type HitlRequest = {
  agent: string;
  leadId?: string;
  dealId?: string;
  action: HitlAction;
  payload: Record<string, unknown>;
  reason: string;
  expiresInHours?: number;
};

export async function requestApproval(
  request: HitlRequest
): Promise<{ approvalId: string }> {
  const supabase = createAdminClient();
  const expiresAt = new Date(
    Date.now() + (request.expiresInHours ?? 2) * 3_600_000
  ).toISOString();

  const { data, error } = await supabase
    .from("agent_approvals")
    .insert({
      agent: request.agent,
      lead_id: request.leadId ?? null,
      deal_id: request.dealId ?? null,
      action: request.action,
      payload: request.payload,
      reason: request.reason,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (error) throw new Error(`HITL insert failed: ${error.message}`);

  return { approvalId: data.id };
}

export async function resolveApproval(
  approvalId: string,
  decision: "approved" | "rejected",
  reviewedBy: string
): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("agent_approvals")
    .update({
      status: decision,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", approvalId);
}
