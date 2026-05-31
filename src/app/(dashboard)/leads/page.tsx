import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 border-blue-200",
  contacted: "bg-yellow-100 text-yellow-700 border-yellow-200",
  qualifying: "bg-orange-100 text-orange-700 border-orange-200",
  qualified: "bg-green-100 text-green-700 border-green-200",
  negotiating: "bg-purple-100 text-purple-700 border-purple-200",
  won: "bg-emerald-100 text-emerald-700 border-emerald-200",
  lost: "bg-gray-100 text-gray-500 border-gray-200",
};

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  tiktok_dm: "TikTok",
  instagram_dm: "Instagram",
  web_form: "Web",
  referral: "Referido",
  portal: "Portal",
  manual: "Manual",
};

const INTENT_LABELS: Record<string, string> = {
  buy: "Comprar",
  sell: "Vender",
  rent: "Arrendar",
};

function ScorePill({ score }: { score: number }) {
  const color =
    score >= 70 ? "text-green-600" : score >= 40 ? "text-[#c9a84c]" : "text-gray-400";
  return <span className={`font-bold text-sm ${color}`}>{score}</span>;
}

export default async function LeadsPage() {
  const supabase = createAdminClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-1">{leads?.length ?? 0} prospectos en total</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {!leads?.length ? (
          <div className="p-16 text-center">
            <p className="text-gray-400 text-sm">Sin leads todavía.</p>
            <p className="text-gray-400 text-xs mt-1">Los leads aparecen cuando llegan mensajes de WhatsApp o desde el formulario web.</p>
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
                <tr
                  key={lead.id}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <Link href={`/leads/${lead.id}`} className="block">
                      <p className="font-medium text-gray-900">{lead.name ?? "—"}</p>
                      <p className="text-xs text-gray-400">{lead.phone ?? lead.email ?? "Sin contacto"}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[lead.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {lead.status}
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
                    <span className="text-xs text-gray-500">
                      {SOURCE_LABELS[lead.source ?? ""] ?? lead.source ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(lead.created_at).toLocaleDateString("es-EC", {
                      day: "numeric",
                      month: "short",
                    })}
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
