import CreatePropertyForm from "@/components/crm/create-property-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function NewPropertyPage() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/properties" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Propiedades
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Nueva propiedad</h1>
      <CreatePropertyForm />
    </div>
  );
}
