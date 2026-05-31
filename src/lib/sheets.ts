/**
 * Google Sheets → Supabase sync
 * Requiere que el Spreadsheet sea "Anyone with link can view"
 * y GOOGLE_SHEETS_API_KEY en .env.local
 *
 * Estructura esperada del Sheet (primera fila = headers):
 * codigo | titulo | tipo | operacion | linea | estado | precio | area_m2 |
 * habitaciones | banos | parqueo | direccion | sector | ciudad | fotos_url | descripcion | notas
 */

import { createAdminClient } from "@/lib/supabase/admin";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;

export type SheetProperty = {
  codigo: string;
  titulo: string;
  tipo: string;           // casa | departamento | terreno | oficina | local
  operacion: string;      // venta | arriendo | ambas
  linea: string;          // proyectos | segunda | vip | rentas
  estado: string;         // Disponible | Alquilado | Bajo Contrato | Vendido
  precio: number;
  area_m2: number | null;
  habitaciones: number | null;
  banos: number | null;
  parqueo: number | null;
  direccion: string | null;
  sector: string | null;
  ciudad: string;
  fotos_url: string | null;
  descripcion: string | null;
  notas: string | null;
};

type SheetRow = string[];

function parseRow(headers: string[], row: SheetRow): SheetProperty {
  const get = (key: string) => row[headers.indexOf(key)]?.trim() ?? "";
  const num = (key: string) => {
    const v = get(key).replace(/[.$,\s]/g, "");
    return v ? Number(v) : null;
  };

  return {
    codigo: get("codigo") || `ROW-${Math.random().toString(36).slice(2, 7)}`,
    titulo: get("titulo") || get("descripcion") || "Propiedad sin título",
    tipo: normalizeTipo(get("tipo")),
    operacion: normalizeOperacion(get("operacion"), num("precio") ?? 0),
    linea: normalizeLine(get("linea")),
    estado: get("estado") || "Disponible",
    precio: num("precio") ?? 0,
    area_m2: num("area_m2"),
    habitaciones: num("habitaciones"),
    banos: num("banos"),
    parqueo: num("parqueo"),
    direccion: get("direccion") || null,
    sector: get("sector") || null,
    ciudad: get("ciudad") || "Cuenca",
    fotos_url: get("fotos_url") || null,
    descripcion: get("descripcion") || null,
    notas: get("notas") || null,
  };
}

function normalizeTipo(raw: string): string {
  const map: Record<string, string> = {
    casa: "house", departamento: "apartment", depto: "apartment",
    terreno: "land", oficina: "office", local: "commercial",
  };
  return map[raw.toLowerCase()] ?? raw.toLowerCase() ?? "apartment";
}

function normalizeOperacion(raw: string, precio: number): string {
  const r = raw.toLowerCase();
  if (r.includes("venta") || r.includes("sale")) return "sale";
  if (r.includes("arriendo") || r.includes("alquiler") || r.includes("rent")) return "rent";
  // Heurística: precios mensuales bajos son arriendo
  if (precio > 0 && precio < 2000) return "rent";
  return "sale";
}

function normalizeLine(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes("vip")) return "vip";
  if (r.includes("proyecto")) return "proyectos";
  if (r.includes("renta") || r.includes("arriendo")) return "rentas";
  return "segunda";
}

export async function fetchSheetTab(
  sheetsId: string,
  tabName: string
): Promise<SheetProperty[]> {
  if (!API_KEY) throw new Error("GOOGLE_SHEETS_API_KEY not set");

  const range = encodeURIComponent(tabName);
  const url = `${SHEETS_API}/${sheetsId}/values/${range}?key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API error ${res.status}: ${err}`);
  }

  const json = await res.json() as { values?: SheetRow[] };
  const rows = json.values ?? [];
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim().replace(/\s+/g, "_"));
  return rows.slice(1)
    .filter((row) => row.some((cell) => cell?.trim()))
    .map((row) => parseRow(headers, row));
}

export async function syncWorkspaceProperties(workspaceId: string): Promise<{
  upserted: number;
  errors: string[];
}> {
  const supabase = createAdminClient();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("google_sheets_id, sheets_tab_vip, sheets_tab_standard")
    .eq("id", workspaceId)
    .single();

  if (!workspace?.google_sheets_id) {
    throw new Error("Workspace has no Google Sheets ID configured");
  }

  const errors: string[] = [];
  let allProperties: (SheetProperty & { linea: string })[] = [];

  // Fetch both tabs
  for (const tab of [workspace.sheets_tab_vip, workspace.sheets_tab_standard]) {
    try {
      const rows = await fetchSheetTab(workspace.google_sheets_id, tab);
      allProperties = allProperties.concat(rows);
    } catch (e) {
      errors.push(`Tab "${tab}": ${(e as Error).message}`);
    }
  }

  if (!allProperties.length) return { upserted: 0, errors };

  // Upsert into Supabase — match by (workspace_id, external_code)
  const upserts = allProperties.map((p) => ({
    workspace_id: workspaceId,
    external_code: p.codigo,
    title: p.titulo,
    type: p.tipo,
    operation: p.operacion,
    line: p.linea,
    status: normalizeStatus(p.estado),
    price: p.precio,
    area_m2: p.area_m2,
    bedrooms: p.habitaciones,
    bathrooms: p.banos,
    parking: p.parqueo,
    address: p.direccion,
    neighborhood: p.sector,
    city: p.ciudad,
    photos_album_url: p.fotos_url,
    description: p.descripcion,
    notes: p.notas,
    features: [],
    synced_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("properties")
    .upsert(upserts, { onConflict: "workspace_id,external_code", ignoreDuplicates: false });

  if (error) errors.push(`Supabase upsert: ${error.message}`);

  // Update last_sheets_sync timestamp
  await supabase
    .from("workspaces")
    .update({ last_sheets_sync: new Date().toISOString() })
    .eq("id", workspaceId);

  return { upserted: upserts.length, errors };
}

function normalizeStatus(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes("disponible") || r.includes("available")) return "available";
  if (r.includes("alquilado") || r.includes("rented")) return "rented";
  if (r.includes("vendido") || r.includes("sold")) return "sold";
  if (r.includes("contrato") || r.includes("reserved")) return "reserved";
  return "available";
}

// Para inyectar en el prompt del agente — solo propiedades disponibles
export function formatPropertiesForAgent(
  properties: { external_code: string | null; title: string; type: string; operation: string;
    price: number; area_m2: number | null; bedrooms: number | null; bathrooms: number | null;
    neighborhood: string | null; city: string; photos_album_url: string | null;
    description: string | null; line: string; }[]
): string {
  if (!properties.length) return "[]";

  return JSON.stringify(
    properties.map((p) => ({
      codigo: p.external_code ?? "—",
      titulo: p.title,
      tipo: p.type,
      operacion: p.operation,
      linea: p.line,
      precio: p.price,
      area_m2: p.area_m2,
      habitaciones: p.bedrooms,
      banos: p.bathrooms,
      sector: p.neighborhood,
      ciudad: p.city,
      fotos: p.photos_album_url ?? null,
      descripcion: p.description ?? null,
    })),
    null,
    2
  );
}
