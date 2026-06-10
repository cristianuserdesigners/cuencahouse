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

  // Prioridad de línea para elegir el representante del grupo
  const linePriority: Record<string, number> = { vip: 0, proyectos: 1, segunda: 2, rentas: 3 };

  const properties = Array.from(groupMap.values()).map((group) => {
    // Ordenar: primero por prioridad de línea, luego por precio mínimo
    const sorted = [...group].sort((a, b) => {
      const lp = (linePriority[a.line] ?? 9) - (linePriority[b.line] ?? 9);
      if (lp !== 0) return lp;
      return a.price - b.price;
    });
    const rep = sorted[0];

    // Es un proyecto real solo si las unidades tienen títulos distintos
    // (distintos precios o distintas unidades). Si todos tienen el mismo título
    // es la misma propiedad duplicada en varias pestañas del Sheet.
    const uniqueTitles = new Set(group.map((p) => p.title.toLowerCase().trim()));
    const uniquePrices = new Set(group.map((p) => p.price));
    const isRealProject = group.length > 1 && (uniqueTitles.size > 1 || uniquePrices.size > 1);

    return {
      ...rep,
      coverPhoto: rep.cover_photo_url ?? null,
      unitCount: isRealProject ? group.length : 1,
      fromPrice: sorted[0].price,
      isProject: isRealProject,
    };
  });

  const heroPhoto = properties.find((p) => p.coverPhoto)?.coverPhoto ?? null;

  return <LandingClient properties={properties} heroPhoto={heroPhoto} />;
}
