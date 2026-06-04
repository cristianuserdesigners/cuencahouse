import { createAdminClient } from "@/lib/supabase/admin";
import LandingClient from "@/components/public/landing-client";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Cuenca House — Tu inmobiliaria de confianza en Cuenca, Ecuador",
  description: "Encuentra casas, departamentos y proyectos VIP en Cuenca, Ecuador. Respondemos por WhatsApp en minutos.",
};

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";

export default async function HomePage() {
  const supabase = createAdminClient();

  const { data: allProperties } = await supabase
    .from("properties")
    .select("id, title, type, operation, price, area_m2, bedrooms, bathrooms, neighborhood, city, photos_album_url, cover_photo_url, line, status")
    .eq("workspace_id", WORKSPACE_ID)
    .eq("status", "available")   // solo disponibles en la web
    .order("line", { ascending: true })
    .order("price", { ascending: true });

  // Agrupar por álbum de fotos — un card por proyecto con precio mínimo y conteo de unidades
  type PropRow = NonNullable<typeof allProperties>[0];
  const groupMap = new Map<string, PropRow[]>();
  for (const p of (allProperties ?? [])) {
    const key = p.photos_album_url && p.photos_album_url !== "[URL]"
      ? p.photos_album_url
      : p.id;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(p);
  }

  const properties = Array.from(groupMap.values()).map((group) => {
    // Usar la propiedad con precio más bajo como representante del grupo
    const sorted = [...group].sort((a, b) => a.price - b.price);
    const rep = sorted[0];
    return {
      ...rep,
      coverPhoto: rep.cover_photo_url ?? null,
      unitCount: group.length,               // número de unidades en el proyecto
      fromPrice: sorted[0].price,            // precio mínimo del grupo
      isProject: group.length > 1,           // true si hay más de una unidad
    };
  });

  const heroPhoto = properties.find((p) => p.coverPhoto)?.coverPhoto ?? null;

  return <LandingClient properties={properties} heroPhoto={heroPhoto} />;
}
