/**
 * Google Sheets → Supabase sync
 * Sheet debe ser "Cualquiera con el enlace puede ver" — no requiere API key.
 *
 * Headers esperados (fila 1):
 * Código | Tipo | Ubicación | Link de google maps | Precio |
 * # Área de construcción | Área (m²) | Habitaciones | Baños |
 * Estado | Nombre de Captador | Link álbum de fotos
 */

import { createAdminClient } from "@/lib/supabase/admin";

export type SheetProperty = {
  codigo: string;
  tipo: string;
  ubicacion: string;
  precio: number;
  area_m2: number | null;
  habitaciones: number | null;
  banos: number | null;
  estado: string;
  captador: string | null;
  fotos_url: string | null;
};

// Parser CSV robusto: maneja campos entre comillas con comas internas
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    if (!line.trim()) continue;
    const cells: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        // campo entre comillas
        let j = i + 1;
        while (j < line.length) {
          if (line[j] === '"' && line[j + 1] === '"') { j += 2; continue; }
          if (line[j] === '"') break;
          j++;
        }
        cells.push(line.slice(i + 1, j).replace(/""/g, '"'));
        i = j + 2; // skip closing quote + comma
      } else {
        const j = line.indexOf(",", i);
        if (j === -1) { cells.push(line.slice(i)); break; }
        cells.push(line.slice(i, j));
        i = j + 1;
      }
    }
    rows.push(cells);
  }
  return rows;
}

function parsePrecio(raw: string): number {
  const clean = raw.replace(/[$,.\s]/g, "").replace(/[^0-9]/g, "");
  if (!clean) return 0;
  // Si el precio original tiene decimales (punto o coma como separador decimal)
  const withDecimals = raw.replace(/[$\s]/g, "").replace(/,(?=\d{3})/g, "");
  const num = parseFloat(withDecimals.replace(",", "."));
  return isNaN(num) ? 0 : num;
}

function normalizeArea(raw: string): number | null {
  const v = raw.replace(/[^0-9.]/g, "");
  return v ? parseFloat(v) : null;
}

function normalizeTipo(raw: string): string {
  const map: Record<string, string> = {
    casa: "house", departamento: "apartment", depto: "apartment",
    terreno: "land", oficina: "office", local: "commercial",
    "local comercial": "commercial",
  };
  return map[raw.toLowerCase().trim()] ?? "apartment";
}

function normalizeOperacion(precio: number): string {
  // Sin columna de operación: precio < 5000 USD = arriendo, mayor = venta
  return precio > 0 && precio < 5000 ? "rent" : "sale";
}

function normalizeStatus(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes("disponible") || r.includes("available")) return "available";
  if (r.includes("alquilado") || r.includes("rented")) return "rented";
  if (r.includes("vendido") || r.includes("sold")) return "sold";
  if (r.includes("contrato") || r.includes("reserv")) return "reserved";
  return "available";
}

export async function fetchSheetTab(
  sheetsId: string,
  gid: string = "0"
): Promise<SheetProperty[]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetsId}/export?format=csv&gid=${gid}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) throw new Error(`HTTP ${res.status} al leer el Sheet`);

  const csv = await res.text();
  const rows = parseCSV(csv);
  if (rows.length < 2) return [];

  // Normalizar headers: lowercase, sin tildes, sin espacios extras
  const headers = rows[0].map((h) =>
    h.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim()
  );

  const idx = (names: string[]) => {
    for (const n of names) {
      const i = headers.findIndex((h) => h.includes(n));
      if (i >= 0) return i;
    }
    return -1;
  };

  const iCodigo = idx(["codigo", "cod"]);
  const iTipo = idx(["tipo"]);
  const iUbicacion = idx(["ubicacion", "direccion"]);
  const iPrecio = idx(["precio"]);
  const iArea = idx(["area (m", "area m", "m²", "m2"]);
  const iHab = idx(["habitaciones", "hab"]);
  const iBanos = idx(["banos", "baños"]);
  const iEstado = idx(["estado"]);
  const iCaptador = idx(["captador", "agente"]);
  const iFotos = idx(["album", "fotos", "foto"]);

  const get = (row: string[], i: number) => (i >= 0 ? (row[i] ?? "").trim() : "");

  return rows
    .slice(1)
    .filter((row) => row.some((c) => c?.trim()))
    .map((row, rowIdx) => ({
      codigo: get(row, iCodigo) || `ROW-${rowIdx + 2}`,
      tipo: get(row, iTipo),
      ubicacion: get(row, iUbicacion),
      precio: parsePrecio(get(row, iPrecio)),
      area_m2: normalizeArea(get(row, iArea)),
      habitaciones: get(row, iHab) ? parseInt(get(row, iHab)) || null : null,
      banos: get(row, iBanos) ? parseFloat(get(row, iBanos)) || null : null,
      estado: get(row, iEstado) || "Disponible",
      captador: get(row, iCaptador) || null,
      fotos_url: get(row, iFotos) || null,
    }));
}

type TabConfig = { name: string; line: "vip" | "segunda" | "rentas" | "proyectos" };

function buildTitle(tipo: string, sector: string | null, ciudad: string): string {
  const labels: Record<string, string> = {
    house: "Casa", apartment: "Departamento", land: "Terreno",
    office: "Oficina", commercial: "Local",
  };
  return `${labels[normalizeTipo(tipo)] ?? tipo} en ${sector ?? ciudad}`;
}

export async function syncWorkspaceProperties(workspaceId: string): Promise<{
  upserted: number;
  errors: string[];
  tabs: string[];
}> {
  const supabase = createAdminClient();

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("google_sheets_id, sheets_tabs")
    .eq("id", workspaceId)
    .single();

  if (!workspace?.google_sheets_id) {
    throw new Error("Workspace sin Google Sheets configurado");
  }

  const tabs: TabConfig[] = (workspace.sheets_tabs as TabConfig[] | null) ?? [];
  const errors: string[] = [];
  const processedTabs: string[] = [];
  const allUpserts: ReturnType<typeof buildUpsert>[] = [];

  if (tabs.length === 0) {
    // Sin tabs configuradas: sync de la primera pestaña (gid=0) como "segunda"
    try {
      const rows = await fetchSheetTab(workspace.google_sheets_id, "0");
      allUpserts.push(...rows.map((p) => buildUpsert(p, workspaceId, "segunda")));
      processedTabs.push("gid=0");
    } catch (e) {
      errors.push(`gid=0: ${(e as Error).message}`);
    }
  } else {
    for (const tab of tabs) {
      try {
        const rows = await fetchSheetTab(workspace.google_sheets_id, tab.name);
        allUpserts.push(...rows.map((p) => buildUpsert(p, workspaceId, tab.line)));
        processedTabs.push(tab.name);
      } catch (e) {
        errors.push(`Tab "${tab.name}": ${(e as Error).message}`);
      }
    }
  }

  if (!allUpserts.length) return { upserted: 0, errors, tabs: processedTabs };

  const { error } = await supabase
    .from("properties")
    .upsert(allUpserts, { onConflict: "workspace_id,external_code", ignoreDuplicates: false });

  if (error) errors.push(`Supabase: ${error.message}`);

  await supabase
    .from("workspaces")
    .update({ last_sheets_sync: new Date().toISOString() })
    .eq("id", workspaceId);

  return { upserted: allUpserts.length, errors, tabs: processedTabs };
}

function buildUpsert(p: SheetProperty, workspaceId: string, line: TabConfig["line"]) {
  const parts = p.ubicacion.split(",").map((s) => s.trim());
  const ciudad = parts[parts.length - 1] || "Cuenca";
  const sector = parts.length > 1 ? parts[parts.length - 2] : null;
  const operation = line === "rentas" ? "rent" : normalizeOperacion(p.precio);

  return {
    workspace_id: workspaceId,
    external_code: p.codigo,
    title: buildTitle(p.tipo, sector, ciudad),
    type: normalizeTipo(p.tipo),
    operation,
    line,
    status: normalizeStatus(p.estado),
    price: p.precio,
    area_m2: p.area_m2,
    bedrooms: p.habitaciones,
    bathrooms: p.banos,
    address: p.ubicacion || null,
    neighborhood: sector,
    city: ciudad,
    photos_album_url: p.fotos_url || null,
    description: null,
    notes: p.captador ? `Captador: ${p.captador}` : null,
    features: [] as string[],
    synced_at: new Date().toISOString(),
  };
}

// Para inyectar en el prompt del agente — solo propiedades disponibles
export function formatPropertiesForAgent(
  properties: {
    external_code: string | null; title: string; type: string; operation: string;
    price: number; area_m2: number | null; bedrooms: number | null; bathrooms: number | null;
    neighborhood: string | null; city: string; photos_album_url: string | null;
    description: string | null; line: string;
  }[]
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
    null, 2
  );
}
