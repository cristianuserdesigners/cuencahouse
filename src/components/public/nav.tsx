"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { t, WA_LINK, type Lang } from "@/lib/i18n";

type Props = { lang: Lang; onLangChange: (l: Lang) => void };

export default function PublicNav({ lang, onLangChange }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const tx = t[lang].nav;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/isotipo.png" alt="Cuenca House" width={32} height={32} className="rounded-lg" />
          <span className={`font-bold tracking-wide text-sm uppercase ${scrolled ? "text-[#1a2744]" : "text-white"}`}>
            Cuenca <span className="text-[#c9a84c]">House</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { href: "#propiedades", label: tx.properties },
            { href: "#por-que-nosotros", label: tx.whyUs },
            { href: "#contacto", label: tx.contact },
          ].map((item) => (
            <a key={item.href} href={item.href}
              className={`text-sm font-medium transition-colors ${scrolled ? "text-gray-600 hover:text-[#1a2744]" : "text-white/80 hover:text-white"}`}>
              {item.label}
            </a>
          ))}

          {/* Lang toggle */}
          <button onClick={() => onLangChange(lang === "es" ? "en" : "es")}
            className={`text-xs font-semibold px-2 py-1 rounded border transition-colors ${
              scrolled ? "border-gray-200 text-gray-500 hover:border-[#1a2744]" : "border-white/30 text-white/70 hover:border-white"
            }`}>
            {lang === "es" ? "EN" : "ES"}
          </button>

          <a href={WA_LINK[lang]} target="_blank" rel="noopener noreferrer"
            className="bg-[#1a2744] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#c9a84c] transition-colors">
            {tx.cta}
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open
            ? <X className={`w-5 h-5 ${scrolled ? "text-[#1a2744]" : "text-white"}`} />
            : <Menu className={`w-5 h-5 ${scrolled ? "text-[#1a2744]" : "text-white"}`} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-3">
          {[
            { href: "#propiedades", label: tx.properties },
            { href: "#por-que-nosotros", label: tx.whyUs },
            { href: "#contacto", label: tx.contact },
          ].map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}
              className="block text-sm font-medium text-gray-700 py-2">
              {item.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            <button onClick={() => onLangChange(lang === "es" ? "en" : "es")}
              className="text-xs font-semibold px-3 py-1.5 rounded border border-gray-200 text-gray-500">
              {lang === "es" ? "EN" : "ES"}
            </button>
            <a href={WA_LINK[lang]} target="_blank" rel="noopener noreferrer"
              className="flex-1 text-center bg-[#1a2744] text-white text-sm font-medium px-4 py-2 rounded-full">
              {tx.cta}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
