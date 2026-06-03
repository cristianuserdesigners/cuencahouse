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

  // Mostrar available + reserved (proyectos en construcción que sí se venden)
  // Priorizar VIP primero, luego por precio
  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, type, operation, price, area_m2, bedrooms, bathrooms, neighborhood, city, photos_album_url, line, status")
    .eq("workspace_id", WORKSPACE_ID)
    .in("status", ["available", "reserved"])
    .not("photos_album_url", "is", null)
    .not("photos_album_url", "eq", "[URL]")
    .order("line", { ascending: true }) // vip primero alfabéticamente
    .limit(6);

  // Extraer primera foto de cada propiedad en paralelo
  const propertiesWithPhotos = await Promise.all(
    (properties ?? []).map(async (p) => {
      const photoUrl = p.photos_album_url
        ? await getFirstPhotoFromAlbum(p.photos_album_url).catch(() => null)
        : null;
      return { ...p, coverPhoto: photoUrl };
    })
  );

  // Hero: usar la foto del primer proyecto VIP
  const heroPhoto = propertiesWithPhotos[0]?.coverPhoto ?? null;

  return <LandingClient properties={propertiesWithPhotos} heroPhoto={heroPhoto} />;
}
