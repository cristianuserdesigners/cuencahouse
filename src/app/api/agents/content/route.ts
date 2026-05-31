import { NextRequest, NextResponse } from "next/server";
import { generatePropertyContent } from "@/agents/content/agent";
import { createAdminClient } from "@/lib/supabase/admin";

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { propertyId } = await req.json();
    if (!propertyId) {
      return NextResponse.json({ error: "propertyId requerido" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: property, error } = await supabase
      .from("properties")
      .select("title, type, operation, price, area_m2, bedrooms, bathrooms, neighborhood, city, description, photos_album_url, line")
      .eq("id", propertyId)
      .single();

    if (error || !property) {
      return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    const content = await generatePropertyContent(
      {
        titulo: property.title,
        tipo: property.type,
        operacion: property.operation,
        precio: property.price,
        area_m2: property.area_m2,
        habitaciones: property.bedrooms,
        banos: property.bathrooms,
        sector: property.neighborhood,
        ciudad: property.city,
        descripcion: property.description,
        fotos_url: property.photos_album_url,
        linea: property.line,
      },
      WORKSPACE_ID
    );

    return NextResponse.json({ ok: true, content });
  } catch (e) {
    console.error("[content-agent]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
