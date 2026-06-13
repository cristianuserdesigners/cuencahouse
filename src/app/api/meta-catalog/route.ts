import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";
const SITE_URL = "https://cuenca.house";

type Property = {
  id: string;
  external_code: string | null;
  title: string;
  description: string | null;
  ai_description: string | null;
  type: string;
  operation: string;
  line: string;
  status: string;
  price: number;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string | null;
  neighborhood: string | null;
  city: string;
  cover_photo_url: string | null;
};

function buildDescription(p: Property): string {
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

function csvEscape(val: string | number | null | undefined): string {
  if (val == null) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

const CSV_HEADERS = [
  "home_listing_id",
  "name",
  "availability",
  "description",
  "price",
  "listing_type",
  "property_type",
  "num_beds",
  "num_baths",
  "area_size",
  "area_size_unit",
  "images[0][url]",
  "url",
  "address[addr1]",
  "address[city]",
  "address[region]",
  "address[country]",
  "address[postal_code]",
];

function toCSVRow(p: Property): string {
  const propertyTypeMap: Record<string, string> = {
    apartment: "apartment", house: "house", land: "land",
    office: "other", commercial: "other",
  };
  const isNewConstruction = p.line === "vip" || p.line === "proyectos"
    || p.status === "construction" || p.status === "new";
  const listingType = isNewConstruction
    ? "new_construction"
    : p.operation === "rent" ? "for_rent_by_agent" : "for_sale_by_agent";

  const values = [
    p.external_code ?? p.id,
    p.title,
    p.operation === "rent" ? "for_rent" : "for_sale",
    buildDescription(p),
    `${p.price} USD`,
    listingType,
    propertyTypeMap[p.type] ?? "other",
    p.bedrooms ?? "",
    p.bathrooms ?? "",
    p.area_m2 ?? "",
    p.area_m2 ? "sq_m" : "",
    p.cover_photo_url ?? "",
    `${SITE_URL}/propiedades/${p.id}`,
    p.address ?? p.neighborhood ?? p.city,
    p.city,
    "Azuay",
    "EC",
    "",
  ];

  return values.map(csvEscape).join(",");
}

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
      .select("id, external_code, title, description, ai_description, type, operation, line, status, price, area_m2, bedrooms, bathrooms, address, neighborhood, city, cover_photo_url")
      .eq("workspace_id", WORKSPACE_ID)
      .in("status", ["available", "new", "construction", "used"])
      .not("price", "is", null)
      .gt("price", 0)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const rows = (properties ?? []).map(toCSVRow);
    const csv = [CSV_HEADERS.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    console.error("[meta-catalog] Error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
