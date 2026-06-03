export default function StructuredData() {
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": "https://cuenca.house",
    name: "Cuenca House",
    description: "Inmobiliaria especializada en Cuenca, Ecuador. Compra, venta y arriendo de casas, departamentos, terrenos y proyectos VIP.",
    url: "https://cuenca.house",
    telephone: "+593988114497",
    email: "ventas@cuenca.house",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Cuenca",
      addressRegion: "Azuay",
      addressCountry: "EC",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -2.9001,
      longitude: -79.0059,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
    areaServed: {
      "@type": "City",
      name: "Cuenca",
      "@id": "https://www.wikidata.org/wiki/Q178193",
    },
    sameAs: [
      "https://www.instagram.com/cuencahouse",
      "https://www.tiktok.com/@cuencahouse",
    ],
    priceRange: "$$",
    image: "https://cuenca.house/isotipo.png",
    logo: "https://cuenca.house/isotipo.png",
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "¿Cuánto cuesta vivir en Cuenca, Ecuador?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Una pareja puede vivir cómodamente en Cuenca con $1,500 a $2,000 USD al mes, incluyendo alquiler, alimentación, transporte y ocio. Cuenca es una de las ciudades más asequibles de América Latina para jubilados y nómadas digitales.",
        },
      },
      {
        "@type": "Question",
        name: "¿Cuánto cuesta una casa en Cuenca Ecuador?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Los precios de casas en Cuenca varían entre $80,000 y $300,000 USD dependiendo del sector y las características. En zonas como Misicata, Ricaurte o El Batán, puedes encontrar casas de 3 habitaciones desde $107,000 USD.",
        },
      },
      {
        "@type": "Question",
        name: "¿Es seguro vivir en Cuenca Ecuador?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Cuenca es considerada una de las ciudades más seguras de Ecuador y de América Latina. Tiene baja criminalidad, buena infraestructura y una comunidad de expatriados activa, lo que la hace muy atractiva para jubilados extranjeros.",
        },
      },
      {
        "@type": "Question",
        name: "¿Pueden los extranjeros comprar propiedades en Ecuador?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, los extranjeros pueden comprar propiedades en Ecuador con los mismos derechos que los ciudadanos ecuatorianos. No se requiere residencia para comprar. Cuenca House asesora a compradores internacionales en todo el proceso.",
        },
      },
      {
        "@type": "Question",
        name: "¿Qué comisión cobra Cuenca House?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Cuenca House cobra una comisión del 3% sobre el precio de venta. En caso de alianza con otro corredor, la comisión se divide 50/50. Para arriendos, la comisión equivale a un mes de renta.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
    </>
  );
}
