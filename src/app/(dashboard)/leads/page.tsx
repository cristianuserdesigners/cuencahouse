import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users } from "lucide-react";
import LeadsFilters from "./leads-filters";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  qualifying: "bg-orange-100 text-orange-700 border-orange-200",
  qualified: "bg-green-100 text-green-700 border-green-200",
  negotiating: "bg-purple-100 text-purple-700 border-purple-200",
  won: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  new: "Nuevo", contacted: "Contactado", qualifying: "Calificando",
  qualified: "Calificado", negotiating: "Negociando", won: "Ganado", lost: "Perdido",
};

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp", tiktok_dm: "TikTok", instagram_dm: "Instagram",
  web_form: "Web", referral: "Referido", portal: "Portal", manual: "Manual",
};

const INTENT_LABELS: Record<string, string> = {
  buy: "Comprar", sell: "Vender", rent: "Arrendar",
};

function ScorePill({ score }: { score: number }) {
  const color = score >= 70 ? "text-green-600" : score >= 40 ? "text-[#c9a84c]" : "text-gray-400";
  return <span className={`font-bold text-sm ${color}`}>{score}</span>;
}

type PageProps = {
  searchParams: Promise<{
    status?: string;
    source?: string;
    intent?: string;
    score?: string;
    q?: string;
  }>;
};

export default async function LeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = createAdminClient();

  let query = supabase
    .from("leads")
    .select("id, status, score, source, intent, language, segment, name, phone, email, budget_min, budget_max, created_at")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.source) query = query.eq("source", params.source);
  if (params.intent) query = query.eq("intent", params.intent);
  if (params.score === "hot") query = query.gte("score", 70);
  if (params.score === "warm") query = query.gte("score", 40).lt("score", 70);
  if (params.score === "cold") query = query.lt("score", 40);
  if (params.q) query = query.or(`name.ilike.%${params.q}%,phone.ilike.%${params.q}%,email.ilike.%${params.q}%`);

  const { data: leads } = await query;
  const total = leads?.length ?? 0;

  const activeFilters = [params.status, params.source, params.intent, params.score, params.q]
    .filter(Boolean).length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} prospecto{total !== 1 ? "s" : ""}
            {activeFilters > 0 && <span className="text-[#c9a84c]"> · {activeFilters} filtro{activeFilters !== 1 ? "s" : ""} activo{activeFilters !== 1 ? "s" : ""}</span>}
          </p>
        </div>
      </div>

      <LeadsFilters current={params} />

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-4">
        {!leads?.length ? (
          <div className="p-16 text-center">
            <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              {activeFilters > 0 ? "Sin resultados para estos filtros" : "Sin leads todavía"}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {activeFilters > 0 ? "Prueba ajustando los filtros" : "Los leads aparecen cuando llegan mensajes de WhatsApp o desde el formulario web."}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Lead</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Score</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Intención</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Presupuesto</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fuente</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="block">
                      <p className="font-medium text-gray-900">{lead.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{lead.phone ?? lead.email ?? "Sin contacto"}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {STATUS_LABELS[lead.status] ?? lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ScorePill score={lead.score ?? 0} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lead.intent ? INTENT_LABELS[lead.intent] ?? lead.intent : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {lead.budget_min || lead.budget_max
                      ? `$${(lead.budget_min ?? 0).toLocaleString()} – $${(lead.budget_max ?? 0).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-xs">
                      {SOURCE_LABELS[lead.source ?? ""] ?? lead.source ?? "—"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(lead.created_at).toLocaleDateString("es-EC", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
