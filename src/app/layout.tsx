import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Cuenca House — Inmobiliaria en Cuenca, Ecuador",
    template: "%s | Cuenca House",
  },
  description: "Encuentra casas, departamentos, terrenos y proyectos VIP en Cuenca, Ecuador. Compra, vende o arrienda con los expertos locales. Atención por WhatsApp 24/7.",
  keywords: ["inmobiliaria Cuenca Ecuador", "casas en Cuenca", "departamentos Cuenca", "bienes raíces Cuenca", "real estate Cuenca Ecuador", "expat housing Cuenca"],
  authors: [{ name: "Cuenca House" }],
  creator: "Cuenca House",
  publisher: "Cuenca House",
  metadataBase: new URL("https://cuenca.house"),
  alternates: {
    canonical: "/",
    languages: {
      "es": "/",
      "en": "/?lang=en",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    alternateLocale: "en_US",
    url: "https://cuenca.house",
    siteName: "Cuenca House",
    title: "Cuenca House — Tu inmobiliaria en Cuenca, Ecuador",
    description: "Casas, departamentos y proyectos VIP en Cuenca. Atención inmediata por WhatsApp.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cuenca House — Inmobiliaria en Cuenca, Ecuador",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cuenca House — Inmobiliaria en Cuenca, Ecuador",
    description: "Casas, departamentos y proyectos VIP en Cuenca, Ecuador.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: "/isotipo.png",
    shortcut: "/isotipo.png",
    apple: "/isotipo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
