import { createAdminClient } from "@/lib/supabase/admin";
import { getFirstPhotoFromAlbum } from "@/lib/photos";
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
    .select("id, title, type, operation, price, area_m2, bedrooms, bathrooms, neighborhood, city, photos_album_url, line, status")
    .eq("workspace_id", WORKSPACE_ID)
    .in("status", ["available", "reserved"])
    .order("line", { ascending: true })
    .order("price", { ascending: true });

  // Deduplicar por álbum de fotos — un card por proyecto (no por unidad)
  const seen = new Set<string>();
  const uniqueProperties = (allProperties ?? []).filter((p) => {
    const key = p.photos_album_url && p.photos_album_url !== "[URL]"
      ? p.photos_album_url
      : p.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 6);

  // Extraer primera foto de cada propiedad en paralelo
  const propertiesWithPhotos = await Promise.all(
    uniqueProperties.map(async (p) => {
      const photoUrl = p.photos_album_url && p.photos_album_url !== "[URL]"
        ? await getFirstPhotoFromAlbum(p.photos_album_url).catch(() => null)
        : null;
      return { ...p, coverPhoto: photoUrl };
    })
  );

  // Hero: primera foto del primer proyecto con fotos
  const heroPhoto = propertiesWithPhotos.find((p) => p.coverPhoto)?.coverPhoto ?? null;

  return <LandingClient properties={propertiesWithPhotos} heroPhoto={heroPhoto} />;
}
