import { createAdminClient } from "@/lib/supabase/admin";
import ContentGenerator from "./content-generator";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const supabase = createAdminClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, type, operation, price, neighborhood, city, status")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Generador de contenido</h1>
        <p className="text-sm text-gray-500 mt-1">
          Selecciona una propiedad y genera copy para TikTok, Instagram y WhatsApp con IA
        </p>
      </div>
      <ContentGenerator properties={properties ?? []} />
    </div>
  );
}
