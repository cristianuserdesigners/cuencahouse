import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";
const SITE_URL = "https://cuencahouse.vercel.app";

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

// Formato home_listings para catálogos de tipo Real Estate en Meta
function toHomeListing(p: {
  id: string;
  external_code: string | null;
  title: string;
  description: string | null;
  ai_description: string | null;
  type: string;
  operation: string;
  line: string;
  price: number;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  address: string | null;
  neighborhood: string | null;
  city: string;
  cover_photo_url: string | null;
}) {
  const propertyTypeMap: Record<string, string> = {
    apartment: "apartment", house: "house", land: "land",
    office: "other", commercial: "other",
  };
  const listingTypeMap: Record<string, string> = {
    sale: "for_sale_by_agent", rent: "for_rent_by_agent",
  };
  const isNewConstruction = p.line === "vip" || p.line === "proyectos";

  const listing: Record<string, unknown> = {
    home_listing_id: p.external_code ?? p.id,
    name: p.title,
    availability: p.operation === "rent" ? "for_rent" : "for_sale",
    description: buildDescription(p),
    address: {
      addr1: p.address ?? p.neighborhood ?? p.city,
      city: p.city,
      region: "Azuay",
      country: "EC",
      postal_code: "",
    },
    price: `${p.price} USD`,
    url: `${SITE_URL}/propiedades/${p.id}`,
    property_type: propertyTypeMap[p.type] ?? "other",
    listing_type: isNewConstruction ? "new_construction" : (listingTypeMap[p.operation] ?? "for_sale_by_agent"),
  };

  if (p.cover_photo_url) listing.images = [{ url: p.cover_photo_url }];
  if (p.bedrooms != null) listing.num_beds = p.bedrooms;
  if (p.bathrooms != null) listing.num_baths = p.bathrooms;
  if (p.area_m2 != null) { listing.area_size = p.area_m2; listing.area_size_unit = "sq_m"; }

  return listing;
}

export async function GET(req: NextRequest): Promise<Response> {
  const token = req.nextUrl.searchParams.get("token");
  const expectedToken = process.env.META_CATALOG_TOKEN;
  if (expectedToken && token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    const { data: properties, error } = await supabase
      .from("properties")
      .select("id, external_code, title, description, ai_description, type, operation, line, price, area_m2, bedrooms, bathrooms, address, neighborhood, city, cover_photo_url")
      .eq("workspace_id", WORKSPACE_ID)
      .eq("status", "available")
      .not("price", "is", null)
      .gt("price", 0)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const listings = (properties ?? []).map(toHomeListing);

    return NextResponse.json(
      { data: listings },
      { headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      }}
    );
  } catch (e) {
    console.error("[meta-catalog] Error:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
