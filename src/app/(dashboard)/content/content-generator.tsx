"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, MessageCircle, FileText, Video, Camera, Palette, ExternalLink } from "lucide-react";
import type { GeneratedContent } from "@/agents/content/types";

type Property = {
  id: string;
  title: string;
  type: string;
  operation: string;
  price: number;
  neighborhood: string | null;
  city: string;
  status: string | null;
};

const OP_LABELS: Record<string, string> = { sale: "Venta", rent: "Arriendo", both: "V/A" };
const TYPE_LABELS: Record<string, string> = {
  house: "Casa", apartment: "Depto", office: "Oficina", land: "Terreno", commercial: "Local",
};

type CopiedKey = keyof GeneratedContent | null;

export default function ContentGenerator({ properties }: { properties: Property[] }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [canvaUrl, setCanvaUrl] = useState<string | null>(null);
  const [canvaLoading, setCanvaLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<CopiedKey>(null);

  async function handleCanva() {
    if (!selectedId) return;
    setCanvaLoading(true);
    setCanvaUrl(null);
    try {
      const res = await fetch("/api/agents/canva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: selectedId }),
      });
      const data = await res.json();
      if (data.ok && data.edit_url) {
        setCanvaUrl(data.edit_url);
      } else if (data.setup_required) {
        alert("Canva no está configurado aún. Agrega CANVA_ACCESS_TOKEN en las variables de entorno.");
      } else {
        alert(data.error ?? "Error al generar diseño en Canva");
      }
    } catch {
      alert("Error de conexión con Canva");
    } finally {
      setCanvaLoading(false);
    }
  }

  async function handleGenerate() {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    setContent(null);
    try {
      const res = await fetch("/api/agents/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: selectedId }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error ?? "Error desconocido");
      setContent(data.content);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(key: keyof GeneratedContent, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const selected = properties.find((p) => p.id === selectedId);

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Selecciona una propiedad
        </label>
        <div className="flex gap-3">
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setContent(null); }}
            className="flex-1 px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] bg-white"
          >
            <option value="">— Elige una propiedad —</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} · {TYPE_LABELS[p.type] ?? p.type} · {OP_LABELS[p.operation] ?? p.operation} · ${p.price.toLocaleString("es-EC")}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerate}
            disabled={!selectedId || loading}
            className="flex items-center gap-2 bg-[#1a2744] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a2744]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-4 h-4 ${loading ? "animate-pulse" : ""}`} />
            {loading ? "Generando..." : "Generar copy"}
          </button>
          <button
            onClick={handleCanva}
            disabled={!selectedId || canvaLoading}
            className="flex items-center gap-2 bg-[#c9a84c] text-[#1a2744] px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#d4b55e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Palette className={`w-4 h-4 ${canvaLoading ? "animate-spin" : ""}`} />
            {canvaLoading ? "Generando arte..." : "Arte en Canva"}
          </button>
        </div>

        {selected && (
          <p className="text-xs text-gray-400 mt-2">
            {[selected.neighborhood, selected.city].filter(Boolean).join(", ")} · ${selected.price.toLocaleString("es-EC")}
          </p>
        )}
      </div>

      {canvaUrl && (
        <div className="flex items-center gap-3 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl px-4 py-3">
          <Palette className="w-5 h-5 text-[#c9a84c] shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1a2744]">¡Diseño listo en Canva!</p>
            <p className="text-xs text-gray-400">Fotos reales + datos de la propiedad aplicados automáticamente</p>
          </div>
          <a
            href={canvaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#c9a84c] text-[#1a2744] text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#d4b55e] transition-colors"
          >
            Abrir en Canva
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Sparkles className="w-8 h-8 text-[#c9a84c] animate-pulse mx-auto mb-3" />
          <p className="text-sm text-gray-500">Claude está generando el contenido...</p>
          <p className="text-xs text-gray-400 mt-1">Tarda unos segundos</p>
        </div>
      )}

      {content && (
        <div className="space-y-4">
          <ContentCard
            icon={<FileText className="w-4 h-4" />}
            label="Descripción del listing"
            sublabel="CRM · Web pública"
            content={content.descripcion_listing}
            field="descripcion_listing"
            copied={copied}
            onCopy={handleCopy}
            rows={6}
          />
          <ContentCard
            icon={<Video className="w-4 h-4" />}
            label="Hook TikTok"
            sublabel="Primeros 3 segundos del video"
            content={content.hook_tiktok}
            field="hook_tiktok"
            copied={copied}
            onCopy={handleCopy}
            rows={2}
            highlight
          />
          <ContentCard
            icon={<Camera className="w-4 h-4" />}
            label="Caption Instagram"
            sublabel="Con emojis y hashtags"
            content={content.caption_instagram}
            field="caption_instagram"
            copied={copied}
            onCopy={handleCopy}
            rows={6}
          />
          <ContentCard
            icon={<MessageCircle className="w-4 h-4" />}
            label="Mensaje WhatsApp"
            sublabel="Para enviar a prospectos"
            content={content.mensaje_whatsapp}
            field="mensaje_whatsapp"
            copied={copied}
            onCopy={handleCopy}
            rows={4}
          />
        </div>
      )}
    </div>
  );
}

function ContentCard({
  icon, label, sublabel, content, field, copied, onCopy, rows, highlight,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  content: string;
  field: keyof GeneratedContent;
  copied: CopiedKey;
  onCopy: (key: keyof GeneratedContent, text: string) => void;
  rows: number;
  highlight?: boolean;
}) {
  const isCopied = copied === field;

  return (
    <div className={`bg-white rounded-xl border ${highlight ? "border-[#c9a84c]/40" : "border-gray-200"} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`${highlight ? "text-[#c9a84c]" : "text-gray-400"}`}>{icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-400">{sublabel}</p>
          </div>
        </div>
        <button
          onClick={() => onCopy(field, content)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isCopied ? (
            <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-500">Copiado</span></>
          ) : (
            <><Copy className="w-3.5 h-3.5" />Copiar</>
          )}
        </button>
      </div>
      <textarea
        readOnly
        value={content}
        rows={rows}
        className="w-full text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 resize-none border-0 focus:outline-none leading-relaxed"
      />
    </div>
  );
}
