import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, MessageSquare, User } from "lucide-react";
import type { ConversationMessage } from "@/agents/lead-qualifier";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualifying: "bg-orange-100 text-orange-700",
  qualified: "bg-green-100 text-green-700",
  negotiating: "bg-purple-100 text-purple-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-gray-100 text-gray-500",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: lead }, { data: conversations }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).single(),
    supabase
      .from("conversations")
      .select("*")
      .eq("lead_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!lead) notFound();

  const collected = lead.ai_qualification as Record<string, unknown> | null;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/leads"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Leads
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* Lead info */}
        <div className="col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-700">Prospecto</CardTitle>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {lead.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#1a2744] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white/60" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{lead.name ?? "Sin nombre"}</p>
                  <p className="text-xs text-gray-400">{lead.phone ?? lead.email ?? "Sin contacto"}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-50 space-y-2">
                <Row label="Score" value={
                  <span className={`font-bold ${(lead.score ?? 0) >= 70 ? "text-green-600" : (lead.score ?? 0) >= 40 ? "text-[#c9a84c]" : "text-gray-500"}`}>
                    {lead.score ?? 0}/100
                  </span>
                } />
                <Row label="Fuente" value={lead.source ?? "—"} />
                <Row label="Idioma" value={lead.language === "en" ? "🇺🇸 English" : "🇪🇨 Español"} />
                <Row label="Segmento" value={lead.segment ?? "—"} />
                <Row label="Creado" value={new Date(lead.created_at).toLocaleDateString("es-EC", { day: "numeric", month: "long", year: "numeric" })} />
              </div>
            </CardContent>
          </Card>

          {/* Datos calificados */}
          {collected && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-700">Datos calificados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Row label="Intención" value={(collected.intent as string) ?? "—"} />
                <Row label="Propiedad" value={(collected.property_type as string) ?? "—"} />
                <Row label="Zona" value={(collected.location_preference as string) ?? "—"} />
                {(Boolean(collected.budget_min) || Boolean(collected.budget_max)) && (
                  <Row
                    label="Presupuesto"
                    value={`$${Number(collected.budget_min ?? 0).toLocaleString()} – $${Number(collected.budget_max ?? 0).toLocaleString()}`}
                  />
                )}
                <Row label="Urgencia" value={(collected.urgency as string) ?? "—"} />
                {collected.is_remote_purchase !== undefined && (
                  <Row label="Compra remota" value={(collected.is_remote_purchase as boolean) ? "Sí" : "No"} />
                )}
                {collected.has_residency !== undefined && (
                  <Row label="Tiene residencia" value={(collected.has_residency as boolean) ? "Sí" : "No"} />
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Summary */}
          {lead.ai_summary && (
            <Card className="border-[#c9a84c]/30 bg-[#c9a84c]/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-[#c9a84c] uppercase tracking-wide">Resumen IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">{lead.ai_summary}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Conversaciones */}
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-medium text-gray-700">
              Conversaciones ({conversations?.length ?? 0})
            </h2>
          </div>

          {!conversations?.length ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">Sin conversaciones registradas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((convo) => {
                const messages = (convo.messages ?? []) as ConversationMessage[];
                return (
                  <div key={convo.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{convo.channel}</Badge>
                        <span className="text-xs text-gray-400">{convo.phone}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(convo.created_at).toLocaleDateString("es-EC", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                      {messages.map((msg, i) => (
                        <div
                          key={i}
                          className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              msg.role === "user"
                                ? "bg-gray-100 text-gray-800 rounded-tl-sm"
                                : "bg-[#1a2744] text-white rounded-tr-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode | string | number }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-xs text-gray-700 text-right font-medium">{value}</span>
    </div>
  );
}
