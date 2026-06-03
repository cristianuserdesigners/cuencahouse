"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown, MapPin, Bed, Bath, Maximize2, Phone, Building2 } from "lucide-react";
import PublicNav from "./nav";
import { t, WA_LINK, type Lang } from "@/lib/i18n";

type Property = {
  id: string;
  title: string;
  type: string;
  operation: string;
  price: number;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  neighborhood: string | null;
  city: string;
  photos_album_url: string | null;
  coverPhoto?: string | null;
  line: string;
  status: string;
};

const TYPE_LABELS: Record<string, Record<string, string>> = {
  house: { es: "Casa", en: "House" },
  apartment: { es: "Departamento", en: "Apartment" },
  land: { es: "Terreno", en: "Land" },
  office: { es: "Oficina", en: "Office" },
  commercial: { es: "Local", en: "Commercial" },
};

const LINE_STYLES: Record<string, string> = {
  vip: "bg-[#c9a84c]/15 text-[#c9a84c] border-[#c9a84c]/30",
  segunda: "bg-blue-50 text-blue-700 border-blue-200",
  rentas: "bg-green-50 text-green-700 border-green-200",
  proyectos: "bg-purple-50 text-purple-700 border-purple-200",
};

const LINE_LABELS: Record<string, Record<string, string>> = {
  vip: { es: "VIP", en: "VIP" },
  segunda: { es: "Segunda mano", en: "Resale" },
  rentas: { es: "Arriendo", en: "Rental" },
  proyectos: { es: "Proyecto", en: "Project" },
};

export default function LandingClient({ properties, heroPhoto }: { properties: Property[]; heroPhoto?: string | null }) {
  const [lang, setLang] = useState<Lang>("es");
  const tx = t[lang];

  const available = properties.filter((p) => ["available", "reserved"].includes(p.status)).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <PublicNav lang={lang} onLangChange={setLang} />

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background: foto real si existe, gradiente como fallback */}
        {heroPhoto ? (
          <>
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroPhoto})` }} />
            {/* Overlay oscuro para legibilidad del texto */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0d1b2e]/80 via-[#1a2744]/70 to-[#0a1628]/90" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2e] via-[#1a2744] to-[#0a1628]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(201,168,76,0.15),transparent_60%)]" />
          </>
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-5 pt-24 pb-16 text-center">
          <span className="inline-flex items-center gap-2 text-[#c9a84c] text-xs font-semibold uppercase tracking-widest mb-6 border border-[#c9a84c]/30 rounded-full px-4 py-1.5">
            <MapPin className="w-3 h-3" />
            {tx.hero.badge}
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 whitespace-pre-line">
            {tx.hero.headline}
          </h1>

          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            {tx.hero.sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={WA_LINK[lang]} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-[#25D366] text-white font-semibold px-7 py-4 rounded-full text-sm hover:bg-[#1ebe5a] transition-all hover:scale-105 shadow-lg shadow-[#25D366]/30">
              <MessageCircle className="w-5 h-5" />
              {tx.hero.ctaPrimary}
            </a>
            <a href="#propiedades"
              className="flex items-center gap-2 border border-white/30 text-white/80 font-medium px-7 py-4 rounded-full text-sm hover:bg-white/10 transition-colors">
              {tx.hero.ctaSecondary}
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 mt-16 pt-10 border-t border-white/10">
            {tx.stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-[#c9a84c]">{s.value}</p>
                <p className="text-white/50 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <a href="#propiedades" className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70 transition-colors animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* ── PROPIEDADES ──────────────────────────────────────────────── */}
      <section id="propiedades" className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#c9a84c] text-xs font-semibold uppercase tracking-widest mb-2">{tx.properties.sub}</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2744]">{tx.properties.title}</h2>
            </div>
          </div>

          {available.length === 0 ? (
            <div className="text-center py-16 text-gray-400">{tx.properties.noProperties}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {available.map((p) => (
                <PropertyCard key={p.id} p={p} lang={lang} tx={tx.properties} waLink={WA_LINK[lang]} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── POR QUÉ CUENCA ───────────────────────────────────────────── */}
      <section className="py-20 px-5 bg-[#1a2744]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#c9a84c] text-xs font-semibold uppercase tracking-widest mb-2">{tx.whyCuenca.sub}</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">{tx.whyCuenca.title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tx.whyCuenca.items.map((item) => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ NOSOTROS ─────────────────────────────────────────── */}
      <section id="por-que-nosotros" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1a2744]">{tx.whyUs.title}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tx.whyUs.items.map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-14 h-14 bg-[#c9a84c]/10 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[#1a2744] mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────── */}
      <section id="contacto" className="py-20 px-5 bg-[#F7F6F2]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#1a2744] rounded-3xl p-10 sm:p-14 shadow-2xl shadow-[#1a2744]/20">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{tx.cta.title}</h2>
            <p className="text-white/60 mb-8">{tx.cta.sub}</p>
            <a href={WA_LINK[lang]} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold px-8 py-4 rounded-full text-base hover:bg-[#1ebe5a] transition-all hover:scale-105 shadow-lg shadow-[#25D366]/30 mb-6">
              <MessageCircle className="w-5 h-5" />
              {tx.cta.button}
            </a>
            <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
              <Phone className="w-3.5 h-3.5" />
              {tx.cta.phone}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-[#0d1b2e] px-5 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#c9a84c]" />
            <span className="text-white font-bold text-sm uppercase tracking-wide">
              Cuenca <span className="text-[#c9a84c]">House</span>
            </span>
          </div>
          <p className="text-white/30 text-xs">{tx.footer.tagline}</p>
          <p className="text-white/20 text-xs">© {new Date().getFullYear()} {tx.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}

function PropertyCard({ p, lang, tx, waLink }: {
  p: Property; lang: Lang;
  tx: { title: string; sub: string; viewAll: string; contact: string; available: string; reserved: string; sale: string; rent: string; beds: string; baths: string; noProperties: string };
  waLink: string;
}) {
  const typeLabel = TYPE_LABELS[p.type]?.[lang] ?? p.type;
  const lineStyle = LINE_STYLES[p.line] ?? "bg-gray-50 text-gray-600 border-gray-200";
  const lineLabel = LINE_LABELS[p.line]?.[lang] ?? p.line;
  const price = p.operation === "rent"
    ? `$${p.price.toLocaleString("es-EC")}/mes`
    : `$${p.price.toLocaleString("es-EC")}`;

  const waMsg = lang === "es"
    ? `Hola, me interesó la propiedad: ${p.title} (${price})`
    : `Hello, I'm interested in the property: ${p.title} (${price})`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
      {/* Foto de portada */}
      <div className="h-48 relative overflow-hidden">
        {p.coverPhoto ? (
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${p.coverPhoto})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2744] to-[#2d4270] flex items-center justify-center">
            <Building2 className="w-12 h-12 text-white/20" />
          </div>
        )}
        {/* Overlay sutil en hover */}
        <div className="absolute inset-0 bg-[#1a2744]/0 group-hover:bg-[#1a2744]/20 transition-colors duration-300" />
        {/* Ver fotos */}
        {p.photos_album_url && p.photos_album_url !== "[URL]" && (
          <a href={p.photos_album_url} target="_blank" rel="noopener noreferrer"
            className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full hover:bg-black/60 transition-colors">
            📸 {lang === "es" ? "Ver fotos" : "View photos"}
          </a>
        )}
        {/* Badge línea */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border backdrop-blur-sm ${lineStyle}`}>
            {lineLabel}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-[#1a2744] mb-1 group-hover:text-[#c9a84c] transition-colors line-clamp-1">
          {p.title}
        </h3>
        <p className="text-gray-400 text-xs flex items-center gap-1 mb-3">
          <MapPin className="w-3 h-3" />
          {[p.neighborhood, p.city].filter(Boolean).join(", ")}
        </p>

        <p className="text-xl font-bold text-[#1a2744] mb-4">
          {price}
          {p.operation === "rent" && <span className="text-xs font-normal text-gray-400 ml-1">/{lang === "es" ? "mes" : "mo"}</span>}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">{typeLabel}</span>
          {p.area_m2 && <span className="flex items-center gap-1"><Maximize2 className="w-3 h-3" />{p.area_m2}m²</span>}
          {p.bedrooms ? <span className="flex items-center gap-1"><Bed className="w-3 h-3" />{p.bedrooms}</span> : null}
          {p.bathrooms ? <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{p.bathrooms}</span> : null}
        </div>

        <a href={`${waLink.split("?")[0]}?text=${encodeURIComponent(waMsg)}`}
          target="_blank" rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-[#1a2744] text-white text-sm font-medium py-2.5 rounded-xl hover:bg-[#c9a84c] transition-colors">
          <MessageCircle className="w-4 h-4" />
          {tx.contact}
        </a>
      </div>
    </div>
  );
}
