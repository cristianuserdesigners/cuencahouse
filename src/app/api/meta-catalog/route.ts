import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";
const SITE_URL = "https://cuencahouse.vercel.app";

function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return '""';
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

function buildDescription(p: {
  title: string;
  description: string | null;
  ai_description: string | null;
  neighborhood: string | null;
  city: string;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  price: number;
  operation: string;
}): string {
  if (p.ai_description) return p.ai_description;
  if (p.description) return p.description;
  const parts: string[] = [`${p.title}.`];
  if (p.area_m2) parts.push(`${p.area_m2} m².`);
  if (p.bedrooms) parts.push(`${p.bedrooms} habitaciones.`);
  if (p.bathrooms) parts.push(`${p.bathrooms} baños.`);
  if (p.neighborhood) parts.push(`Ubicado en ${p.neighborhood}, ${p.city}.`);
  const op = p.operation === "rent" ? "Arriendo" : "Venta";
  parts.push(`${op}: $${p.price.toLocaleString("es-EC")}.`);
  parts.push("Cuenca House — Tu inmobiliaria de confianza en Cuenca, Ecuador.");
  return parts.join(" ");
}

const CSV_HEADERS = [
  "id", "title", "description", "availability", "condition",
  "price", "link", "image_link", "brand", "google_product_category", "product_type",
];

export async function GET(req: NextRequest): Promise<Response> {
  const token = req.nextUrl.searchParams.get("token");
  const expectedToken = process.env.META_CATALOG_TOKEN;
  if (expectedToken && token !== expectedToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { data: properties, error } = await supabase
      .from("properties")
      .select(
        "id, external_code, title, description, ai_description, type, operation, line, price, area_m2, bedrooms, bathrooms, address, neighborhood, city, cover_photo_url"
      )
      .eq("workspace_id", WORKSPACE_ID)
      .eq("status", "available")
      .not("price", "is", null)
      .gt("price", 0)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const typeLabel: Record<string, string> = {
      apartment: "Departamento", house: "Casa", land: "Terreno",
      office: "Oficina", commercial: "Local Comercial",
    };

    const rows = (properties ?? []).map((p) => {
      const condition = (p.line === "vip" || p.line === "proyectos") ? "new" : "used";
      return [
        csvEscape(p.external_code ?? p.id),
        csvEscape(p.title),
        csvEscape(buildDescription(p)),
        csvEscape("in stock"),
        csvEscape(condition),
        csvEscape(`${p.price}.00 USD`),
        csvEscape(`${SITE_URL}/propiedades/${p.id}`),
        csvEscape(p.cover_photo_url ?? ""),
        csvEscape("Cuenca House"),
        csvEscape("Real Estate > Residential Properties"),
        csvEscape(typeLabel[p.type] ?? p.type),
      ].join(",");
    });

    const csv = [CSV_HEADERS.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    console.error("[meta-catalog] Error:", e);
    return new Response("Internal server error", { status: 500 });
  }
}
