import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus, Home, Building2, Layers, Palette } from "lucide-react";
import SyncButton from "./sync-button";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  apartment: "Departamento", house: "Casa", office: "Oficina",
  land: "Terreno", commercial: "Local",
};
const OPERATION_LABELS: Record<string, string> = {
  sale: "Venta", rent: "Arriendo", both: "Venta/Arriendo",
};
const LINE_LABELS: Record<string, string> = {
  rentas: "Rentas", proyectos: "Proyectos", segunda: "Segunda", vip: "VIP",
};
const STATUS_STYLES: Record<string, string> = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-yellow-100 text-yellow-700",
  sold: "bg-gray-100 text-gray-500",
  rented: "bg-blue-100 text-blue-700",
};
const STATUS_LABELS: Record<string, string> = {
  available: "Disponible", reserved: "Reservado", sold: "Vendido", rented: "Alquilado",
};

export default async function PropertiesPage() {
  const supabase = createAdminClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .not("status", "eq", "sold")       // ocultar vendidas
    .order("created_at", { ascending: false });

  const total = properties?.length ?? 0;
  const available = properties?.filter((p) => p.status === "available").length ?? 0;
  const rented = properties?.filter((p) => p.status === "rented").length ?? 0;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Propiedades</h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} en total · {available} disponibles{rented > 0 ? ` · ${rented} arrendadas` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SyncButton />
          <Link
            href="/properties/new"
            className="flex items-center gap-2 bg-[#1a2744] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a2744]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva propiedad
          </Link>
        </div>
      </div>

      {!properties?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Home className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm font-medium">Sin propiedades todavía</p>
          <p className="text-gray-400 text-xs mt-1 mb-5">
            Agrega propiedades manualmente o sincroniza desde Google Sheets
          </p>
          <Link
            href="/properties/new"
            className="inline-flex items-center gap-2 bg-[#1a2744] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1a2744]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar primera propiedad
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/properties/${p.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:border-[#1a2744]/30 hover:shadow-sm transition-all group"
            >
              {/* Status + línea */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {STATUS_LABELS[p.status] ?? p.status}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  {LINE_LABELS[p.line] ?? p.line}
                </span>
              </div>

              {/* Título */}
              <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 group-hover:text-[#1a2744] transition-colors line-clamp-2">
                {p.title}
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                {p.neighborhood ? `${p.neighborhood}, ` : ""}{p.city}
              </p>

              {/* Precio */}
              <p className="text-lg font-bold text-[#1a2744] mb-3">
                ${p.price.toLocaleString("es-EC")}
                {p.operation === "rent" && <span className="text-xs font-normal text-gray-400">/mes</span>}
              </p>

              {/* Specs */}
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {TYPE_LABELS[p.type] ?? p.type}
                </span>
                {p.area_m2 && <span>{p.area_m2} m²</span>}
                {p.bedrooms && <span>{p.bedrooms} hab</span>}
                {p.bathrooms && <span>{p.bathrooms} baños</span>}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {OPERATION_LABELS[p.operation] ?? p.operation}
                </span>
                <div className="flex items-center gap-2">
                  {p.canva_story_url && (
                    <a
                      href={p.canva_story_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs bg-[#c9a84c]/10 text-[#c9a84c] px-2 py-1 rounded-lg hover:bg-[#c9a84c]/20 transition-colors"
                    >
                      <Palette className="w-3 h-3" />
                      Arte
                    </a>
                  )}
                  {p.external_code && (
                    <span className="text-xs text-gray-300">#{p.external_code}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
