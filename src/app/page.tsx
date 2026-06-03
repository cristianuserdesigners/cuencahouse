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

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, type, operation, price, area_m2, bedrooms, bathrooms, neighborhood, city, photos_album_url, line, status")
    .eq("workspace_id", WORKSPACE_ID)
    .eq("status", "available")
    .order("price", { ascending: true })
    .limit(9);

  // Tomar la primera foto del álbum de la primera propiedad disponible con fotos
  const firstWithPhotos = (properties ?? []).find(
    (p) => p.photos_album_url && p.photos_album_url !== "[URL]"
  );
  const heroPhoto = firstWithPhotos?.photos_album_url
    ? await getFirstPhotoFromAlbum(firstWithPhotos.photos_album_url)
    : null;

  return <LandingClient properties={properties ?? []} heroPhoto={heroPhoto} />;
}
