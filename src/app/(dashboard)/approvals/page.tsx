import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  send_offer: "Enviar oferta",
  update_price: "Actualizar precio",
  confirm_reservation: "Confirmar reserva",
  reassign_lead: "Reasignar lead",
  share_partner_data: "Compartir datos con aliado",
};

const STATUS_STYLES: Record<string, { style: string; icon: React.ReactNode }> = {
  pending: { style: "bg-orange-100 text-orange-700", icon: <Clock className="w-3 h-3" /> },
  approved: { style: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3 h-3" /> },
  rejected: { style: "bg-red-100 text-red-700", icon: <XCircle className="w-3 h-3" /> },
  expired: { style: "bg-gray-100 text-gray-500", icon: <Clock className="w-3 h-3" /> },
};

export default async function ApprovalsPage() {
  const supabase = createAdminClient();
  const { data: rawApprovals } = await supabase
    .from("agent_approvals")
    .select("*, leads(name, phone)")
    .order("created_at", { ascending: false });

  const approvals = rawApprovals as Array<{
    id: string;
    agent: string;
    lead_id: string | null;
    deal_id: string | null;
    action: string;
    payload: Record<string, unknown>;
    reason: string | null;
    status: string;
    reviewed_by: string | null;
    reviewed_at: string | null;
    expires_at: string | null;
    created_at: string;
    leads: { name: string | null; phone: string | null } | null;
  }> | null;

  const pending = approvals?.filter((a) => a.status === "pending") ?? [];
  const rest = approvals?.filter((a) => a.status !== "pending") ?? [];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Aprobaciones HITL</h1>
        <p className="text-sm text-gray-500 mt-1">
          Acciones de alto impacto que requieren revisión humana
        </p>
      </div>

      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-3">
            Pendientes ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((a) => {
              const lead = a.leads as { name: string; phone: string } | null;
              return (
                <Card key={a.id} className="border-orange-200 bg-orange-50/30">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">
                            {ACTION_LABELS[a.action] ?? a.action}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                            <Clock className="w-3 h-3" /> pendiente
                          </span>
                        </div>
                        {lead && (
                          <p className="text-xs text-gray-500">
                            Lead: {lead.name ?? lead.phone ?? a.lead_id}
                          </p>
                        )}
                        {a.reason && (
                          <p className="text-sm text-gray-700 mt-2 italic">"{a.reason}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                          Expira: {a.expires_at
                            ? new Date(a.expires_at).toLocaleString("es-EC")
                            : "—"}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors font-medium">
                          Aprobar
                        </button>
                        <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition-colors font-medium">
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {!approvals?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <CheckCircle className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Sin aprobaciones pendientes.</p>
          <p className="text-gray-400 text-xs mt-1">Aparecerán aquí cuando el agente necesite confirmación para ofertas y reservas.</p>
        </div>
      ) : rest.length > 0 ? (
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Historial
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
            {rest.map((a) => {
              const lead = a.leads as { name: string; phone: string } | null;
              const s = STATUS_STYLES[a.status] ?? STATUS_STYLES.expired;
              return (
                <div key={a.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {ACTION_LABELS[a.action] ?? a.action}
                    </p>
                    <p className="text-xs text-gray-400">
                      {lead?.name ?? lead?.phone ?? "—"} ·{" "}
                      {new Date(a.created_at).toLocaleDateString("es-EC")}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${s.style}`}>
                    {s.icon} {a.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
