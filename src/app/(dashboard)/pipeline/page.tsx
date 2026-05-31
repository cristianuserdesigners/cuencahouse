import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STAGES = [
  { key: "initial", label: "Inicial", color: "border-gray-300" },
  { key: "visit_scheduled", label: "Visita agendada", color: "border-blue-400" },
  { key: "visit_done", label: "Visita hecha", color: "border-yellow-400" },
  { key: "offer_sent", label: "Oferta enviada", color: "border-orange-400" },
  { key: "negotiation", label: "Negociación", color: "border-purple-400" },
  { key: "closing", label: "Cerrando", color: "border-pink-400" },
  { key: "closed_won", label: "Ganado ✓", color: "border-green-500" },
  { key: "closed_lost", label: "Perdido", color: "border-gray-200" },
];

export default async function PipelinePage() {
  const supabase = createAdminClient();
  const { data: rawDeals } = await supabase
    .from("deals")
    .select("*, leads(name, phone, score, intent), properties(title, price, type)")
    .order("created_at", { ascending: false });

  type Deal = {
    id: string;
    stage: string;
    offer_price: number | null;
    created_at: string;
    leads: { name: string | null; phone: string | null; score: number; intent: string } | null;
    properties: { title: string; price: number; type: string } | null;
  };
  const deals = rawDeals as Deal[] | null;

  const byStage = STAGES.reduce<Record<string, typeof deals>>((acc, s) => {
    acc[s.key] = (deals ?? []).filter((d) => d.stage === s.key);
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Pipeline</h1>
        <p className="text-sm text-gray-500 mt-1">{deals?.length ?? 0} deals activos</p>
      </div>

      {!deals?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center max-w-md mx-auto">
          <p className="text-gray-400 text-sm">Sin deals todavía.</p>
          <p className="text-gray-400 text-xs mt-1">Los deals se crean cuando un lead calificado avanza en el proceso.</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const cards = byStage[stage.key] ?? [];
            return (
              <div key={stage.key} className="shrink-0 w-64">
                <div className={`flex items-center justify-between mb-2 pb-2 border-b-2 ${stage.color}`}>
                  <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    {stage.label}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {cards.map((deal) => {
                    const lead = deal.leads as { name: string; phone: string; score: number; intent: string } | null;
                    const property = deal.properties as { title: string; price: number; type: string } | null;
                    return (
                      <div key={deal.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {lead?.name ?? lead?.phone ?? "—"}
                        </p>
                        {property && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">{property.title}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          {property?.price && (
                            <span className="text-xs font-semibold text-[#1a2744]">
                              ${property.price.toLocaleString()}
                            </span>
                          )}
                          {lead?.score !== undefined && (
                            <span className="text-xs text-gray-400">Score {lead.score}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
