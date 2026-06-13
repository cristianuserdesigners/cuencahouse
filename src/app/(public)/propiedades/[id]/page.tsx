import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Bed, Bath, Maximize2, MessageCircle, ChevronLeft, Phone, Building2, Layers } from "lucide-react";
import { WA_LINK } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";

const TYPE_LABELS: Record<string, string> = {
  house: "Casa", apartment: "Departamento", office: "Oficina",
  land: "Terreno", commercial: "Local comercial",
};
const LINE_LABELS: Record<string, string> = {
  vip: "Proyecto VIP", segunda: "Segunda mano", rentas: "Arriendo", proyectos: "Proyecto",
};
const STATUS_LABELS: Record<string, string> = {
  new: "Por estrenar",
  construction: "En construcción",
  used: "Segunda mano",
};
const STATUS_STYLES: Record<string, string> = {
  new: "bg-emerald-500/80",
  construction: "bg-amber-500/80",
  used: "bg-slate-500/80",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: p } = await supabase
    .from("properties").select("title, price, neighborhood, city, description, cover_photo_url, type, bedrooms, bathrooms, area_m2")
    .eq("id", id).single();

  if (!p) return { title: "Propiedad no encontrada" };

  const loc = [p.neighborhood, p.city].filter(Boolean).join(", ");
  const title = `${p.title} — $${p.price.toLocaleString("es-EC")} | Cuenca House`;
  const desc = p.description ||
    `${TYPE_LABELS[p.type] ?? p.type} en ${loc}. ${p.bedrooms ? `${p.bedrooms} habitaciones, ` : ""}${p.bathrooms ? `${p.bathrooms} baños, ` : ""}${p.area_m2 ? `${p.area_m2}m². ` : ""}Precio: $${p.price.toLocaleString("es-EC")} USD.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: p.cover_photo_url ? [p.cover_photo_url] : ["/og-image.png"],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description: desc },
  };
}

export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: p } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", WORKSPACE_ID)
    .in("status", ["available", "new", "construction", "used"])
    .single();

  if (!p) notFound();

  const loc = [p.neighborhood, p.city].filter(Boolean).join(", ");
  const price = `$${p.price.toLocaleString("es-EC")}`;
  const waMsg = `Hola, me interesó la propiedad: ${p.title} (${price}). ¿Puede darme más información?`;
  const waUrl = `${WA_LINK.es.split("?")[0]}?text=${encodeURIComponent(waMsg)}`;

  // JSON-LD RealEstateListing
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description ?? `${TYPE_LABELS[p.type] ?? p.type} en ${loc}`,
    url: `https://cuenca.house/propiedades/${p.id}`,
    image: p.cover_photo_url ?? "https://cuenca.house/og-image.png",
    price: p.price,
    priceCurrency: "USD",
    address: {
      "@type": "PostalAddress",
      streetAddress: p.address ?? loc,
      addressLocality: p.city,
      addressRegion: "Azuay",
      addressCountry: "EC",
    },
    numberOfRooms: p.bedrooms ?? undefined,
    numberOfBathroomsTotal: p.bathrooms ?? undefined,
    floorSize: p.area_m2 ? { "@type": "QuantitativeValue", value: p.area_m2, unitCode: "MTK" } : undefined,
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "RealEstateAgent",
        name: "Cuenca House",
        url: "https://cuenca.house",
        telephone: "+593988114497",
      },
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: "https://cuenca.house" },
        { "@type": "ListItem", position: 2, name: "Propiedades", item: "https://cuenca.house/#propiedades" },
        { "@type": "ListItem", position: 3, name: p.title },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Nav mínimo */}
      <header className="bg-white border-b border-gray-100 px-5 h-14 flex items-center justify-between sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#c9a84c]" />
          <span className="font-bold text-sm uppercase tracking-wide text-[#1a2744]">
            Cuenca <span className="text-[#c9a84c]">House</span>
          </span>
        </Link>
        <a href={waUrl} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-[#1ebe5a] transition-colors">
          <MessageCircle className="w-3.5 h-3.5" />
          Consultar
        </a>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Breadcrumb */}
        <Link href="/#propiedades" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Todas las propiedades
        </Link>

        {/* Foto principal */}
        <div className="rounded-2xl overflow-hidden mb-6 bg-gradient-to-br from-[#1a2744] to-[#2d4270] relative" style={{ height: "360px" }}>
          {p.cover_photo_url ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${p.cover_photo_url})` }} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="w-20 h-20 text-white/10" />
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-[#c9a84c]/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              {LINE_LABELS[p.line] ?? p.line}
            </span>
            {STATUS_LABELS[p.status] && (
              <span className={`${STATUS_STYLES[p.status] ?? "bg-gray-500/80"} text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm`}>
                {STATUS_LABELS[p.status]}
              </span>
            )}
            {p.external_code && (
              <span className="bg-black/40 text-white/80 text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                #{p.external_code}
              </span>
            )}
          </div>
          {/* Link álbum */}
          {p.photos_album_url && p.photos_album_url !== "[URL]" && (
            <a href={p.photos_album_url} target="_blank" rel="noopener noreferrer"
              className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors">
              📸 Ver todas las fotos
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info principal */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-[#1a2744] mb-2">{p.title}</h1>
              <p className="text-gray-500 flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-[#c9a84c]" />
                {loc}
              </p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Building2 className="w-4 h-4" />, label: "Tipo", value: TYPE_LABELS[p.type] ?? p.type },
                ...(p.area_m2 ? [{ icon: <Maximize2 className="w-4 h-4" />, label: "Área", value: `${p.area_m2} m²` }] : []),
                ...(p.bedrooms ? [{ icon: <Bed className="w-4 h-4" />, label: "Habitaciones", value: String(p.bedrooms) }] : []),
                ...(p.bathrooms ? [{ icon: <Bath className="w-4 h-4" />, label: "Baños", value: String(p.bathrooms) }] : []),
                ...(p.parking ? [{ icon: <Layers className="w-4 h-4" />, label: "Parqueos", value: String(p.parking) }] : []),
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="text-[#c9a84c] mb-1">{s.icon}</div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="font-semibold text-[#1a2744] text-sm">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Descripción */}
            {p.description && (
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h2 className="font-semibold text-[#1a2744] mb-3">Descripción</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{p.description}</p>
              </div>
            )}

            {/* Ubicación */}
            {p.address && (
              <div className="bg-white rounded-xl p-5 border border-gray-100">
                <h2 className="font-semibold text-[#1a2744] mb-2">Ubicación</h2>
                <p className="text-gray-500 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#c9a84c]" />
                  {p.address}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar precio + CTA */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20">
              <p className="text-3xl font-bold text-[#1a2744] mb-1">
                {price}
              </p>
              <p className="text-gray-400 text-xs mb-6">
                {p.operation === "rent" ? "/ mes" : "precio de venta"} · USD
              </p>

              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3.5 rounded-xl hover:bg-[#1ebe5a] transition-colors mb-3">
                <MessageCircle className="w-5 h-5" />
                Consultar por WhatsApp
              </a>

              <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs">
                <Phone className="w-3 h-3" />
                +593 98 811 4497
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 text-xs text-gray-400 space-y-1">
                <p>✅ Respuesta en menos de 5 minutos</p>
                <p>✅ Visita coordinada sin costo</p>
                <p>✅ Comisión 3% — solo al cerrar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer mínimo */}
      <footer className="border-t border-gray-100 py-6 px-5 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-gray-400 text-xs">© 2026 Cuenca House · cuenca.house</p>
          <Link href="/" className="text-[#1a2744] text-xs hover:text-[#c9a84c] transition-colors">
            Ver todas las propiedades →
          </Link>
        </div>
      </footer>
    </div>
  );
}
