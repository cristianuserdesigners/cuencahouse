import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCanvaClient, TEMPLATE_ELEMENTS } from "@/lib/canva";
import { getFirstPhotoFromAlbum } from "@/lib/photos";

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";

/** Extrae hasta N URLs de fotos de un álbum de Google Photos */
async function getPhotoUrls(albumUrl: string, max = 3): Promise<string[]> {
  try {
    const res = await fetch(albumUrl, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return [];
    const html = await res.text();
    const matches = html.match(/https:\/\/lh3\.googleusercontent\.com\/pw\/[A-Za-z0-9_\-]+/g);
    if (!matches) return [];
    return [...new Set(matches)].slice(0, max).map(u => `${u}=w1200-h800-c`);
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  const canva = getCanvaClient();

  if (!canva) {
    return NextResponse.json({
      error: "CANVA_ACCESS_TOKEN no configurado. Ve a cuenca.house/crm/canva-auth para obtenerlo.",
      setup_required: true,
    }, { status: 503 });
  }

  try {
    const { propertyId } = await req.json();
    if (!propertyId) return NextResponse.json({ error: "propertyId requerido" }, { status: 400 });

    const supabase = createAdminClient();
    const { data: property } = await supabase
      .from("properties")
      .select("title, type, price, area_m2, bedrooms, bathrooms, neighborhood, city, description, photos_album_url, operation, line")
      .eq("id", propertyId)
      .eq("workspace_id", WORKSPACE_ID)
      .single();

    if (!property) return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });

    // ── 1. Obtener fotos ────────────────────────────────────────────────────
    const photoUrls = property.photos_album_url && property.photos_album_url !== "[URL]"
      ? await getPhotoUrls(property.photos_album_url, 3)
      : [];

    // ── 2. Subir fotos a Canva en paralelo ─────────────────────────────────
    const assetIds = await Promise.all(
      [0, 1, 2].map(i =>
        photoUrls[i]
          ? canva.uploadImage(photoUrls[i], `${property.title}-foto-${i + 1}`)
          : Promise.resolve(null)
      )
    );

    // ── 3. Copiar template ──────────────────────────────────────────────────
    const { design_id, edit_url } = await canva.copyTemplate();

    // ── 4. Iniciar sesión de edición ────────────────────────────────────────
    const { session_id } = await canva.startSession(design_id);

    // ── 5. Preparar textos ──────────────────────────────────────────────────
    const location = [property.neighborhood, property.city].filter(Boolean).join(", ") || "Cuenca, Ecuador";
    const specs = [
      property.bedrooms ? `${property.bedrooms} hab` : null,
      property.bathrooms ? `${property.bathrooms} baños` : null,
      property.area_m2 ? `${property.area_m2}m²` : null,
      property.line === "vip" ? "VIP" : null,
    ].filter(Boolean).join(" · ");
    const priceText = `Desde $ ${property.price.toLocaleString("es-EC")}`;
    const desc = specs ? `${specs} · ${location}` : location;

    // ── 6. Aplicar cambios ──────────────────────────────────────────────────
    const operations: unknown[] = [
      { type: "replace_text", element_id: TEMPLATE_ELEMENTS.title,       text: property.title },
      { type: "replace_text", element_id: TEMPLATE_ELEMENTS.subtitle,    text: location },
      { type: "replace_text", element_id: TEMPLATE_ELEMENTS.description, text: property.description || desc },
      { type: "replace_text", element_id: TEMPLATE_ELEMENTS.price,       text: priceText },
      { type: "replace_text", element_id: TEMPLATE_ELEMENTS.website,     text: "cuenca.house" },
    ];

    if (assetIds[0]) operations.push({ type: "update_fill", element_id: TEMPLATE_ELEMENTS.imgCenter, asset_type: "image", asset_id: assetIds[0], alt_text: property.title });
    if (assetIds[1]) operations.push({ type: "update_fill", element_id: TEMPLATE_ELEMENTS.imgRight,  asset_type: "image", asset_id: assetIds[1], alt_text: property.title });
    if (assetIds[2]) operations.push({ type: "update_fill", element_id: TEMPLATE_ELEMENTS.imgLeft,   asset_type: "image", asset_id: assetIds[2], alt_text: property.title });

    await canva.applyOperations(design_id, session_id, operations);

    // ── 7. Publicar ──────────────────────────────────────────────────────────
    await canva.publishSession(design_id, session_id);

    return NextResponse.json({
      ok: true,
      design_id,
      edit_url,
      photos: assetIds.filter(Boolean).length,
      title: property.title,
    });

  } catch (e) {
    console.error("[canva route]", e);
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
