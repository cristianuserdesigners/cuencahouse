"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { X } from "lucide-react";

type Filters = {
  status?: string;
  source?: string;
  intent?: string;
  score?: string;
  q?: string;
};

const STATUS_OPTIONS = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "qualifying", label: "Calificando" },
  { value: "qualified", label: "Calificado" },
  { value: "negotiating", label: "Negociando" },
  { value: "won", label: "Ganado" },
  { value: "lost", label: "Perdido" },
];

const SOURCE_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "tiktok_dm", label: "TikTok" },
  { value: "instagram_dm", label: "Instagram" },
  { value: "web_form", label: "Web" },
  { value: "referral", label: "Referido" },
  { value: "portal", label: "Portal" },
  { value: "manual", label: "Manual" },
];

const INTENT_OPTIONS = [
  { value: "buy", label: "Comprar" },
  { value: "rent", label: "Arrendar" },
  { value: "sell", label: "Vender" },
];

const SCORE_OPTIONS = [
  { value: "hot", label: "🔥 Hot (≥70)" },
  { value: "warm", label: "🟡 Warm (40-69)" },
  { value: "cold", label: "❄️ Cold (<40)" },
];

const select = "text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] text-gray-700 cursor-pointer";

export default function LeadsFilters({ current }: { current: Filters }) {
  const router = useRouter();
  const pathname = usePathname();

  const apply = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(current as Record<string, string>);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }, [current, pathname, router]);

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const hasFilters = Object.values(current).some(Boolean);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Búsqueda por nombre/teléfono */}
      <input
        type="search"
        placeholder="Buscar nombre, teléfono..."
        defaultValue={current.q ?? ""}
        onChange={(e) => apply("q", e.target.value)}
        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] w-48 placeholder:text-gray-400"
      />

      {/* Estado */}
      <select
        value={current.status ?? ""}
        onChange={(e) => apply("status", e.target.value)}
        className={select}
      >
        <option value="">Todos los estados</option>
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Fuente */}
      <select
        value={current.source ?? ""}
        onChange={(e) => apply("source", e.target.value)}
        className={select}
      >
        <option value="">Todas las fuentes</option>
        {SOURCE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Intención */}
      <select
        value={current.intent ?? ""}
        onChange={(e) => apply("intent", e.target.value)}
        className={select}
      >
        <option value="">Todas las intenciones</option>
        {INTENT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Score */}
      <select
        value={current.score ?? ""}
        onChange={(e) => apply("score", e.target.value)}
        className={select}
      >
        <option value="">Todos los scores</option>
        {SCORE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Limpiar */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar
        </button>
      )}
    </div>
  );
}
