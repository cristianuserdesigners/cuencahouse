import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import EditPropertyForm from "@/components/crm/edit-property-form";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) notFound();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/properties" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Propiedades
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Editar propiedad</h1>
      <EditPropertyForm id={id} property={property} />
    </div>
  );
}
