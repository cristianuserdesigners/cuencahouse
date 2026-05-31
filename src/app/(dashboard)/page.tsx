import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Users, MessageSquare, TrendingUp, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  qualifying: "bg-orange-100 text-orange-700",
  qualified: "bg-green-100 text-green-700",
  negotiating: "bg-purple-100 text-purple-700",
  won: "bg-emerald-100 text-emerald-700",
  lost: "bg-gray-100 text-gray-500",
};

export default async function DashboardPage() {
  const supabase = createAdminClient();

  const [{ data: leads }, { data: conversations }, { data: approvals }] =
    await Promise.all([
      supabase.from("leads").select("id, status, score, source, created_at, name, phone"),
      supabase
        .from("conversations")
        .select("id, created_at, phone, channel")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("agent_approvals")
        .select("id")
        .eq("status", "pending"),
    ]);

  const total = leads?.length ?? 0;
  const qualified = leads?.filter((l) => l.status === "qualified").length ?? 0;
  const avgScore =
    total > 0
      ? Math.round((leads ?? []).reduce((s, l) => s + (l.score ?? 0), 0) / total)
      : 0;
  const pendingApprovals = approvals?.length ?? 0;

  const byStatus = (leads ?? []).reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Resumen de actividad de Cuenca House</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Leads</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
              </div>
              <Users className="w-8 h-8 text-[#1a2744]/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Calificados</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{qualified}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Score Promedio</p>
                <p className="text-3xl font-bold text-[#c9a84c] mt-1">{avgScore}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-[#c9a84c]/20" />
            </div>
          </CardContent>
        </Card>

        <Card className={pendingApprovals > 0 ? "border-orange-300" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Pendientes HITL</p>
                <p className={`text-3xl font-bold mt-1 ${pendingApprovals > 0 ? "text-orange-500" : "text-gray-900"}`}>
                  {pendingApprovals}
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Leads por estado */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700">Leads por estado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(byStatus).length === 0 ? (
              <p className="text-sm text-gray-400">Sin leads todavía</p>
            ) : (
              Object.entries(byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
                    {status}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Últimas conversaciones */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-700">Conversaciones recientes</CardTitle>
            <Link href="/leads" className="text-xs text-[#1a2744] hover:underline">Ver todos</Link>
          </CardHeader>
          <CardContent>
            {!conversations?.length ? (
              <p className="text-sm text-gray-400">Sin conversaciones todavía</p>
            ) : (
              <div className="space-y-3">
                {conversations.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{c.phone ?? "Sin teléfono"}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleDateString("es-EC", {
                          day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                        })}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {c.channel}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
