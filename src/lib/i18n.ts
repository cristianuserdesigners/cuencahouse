export type Lang = "es" | "en";

export const t = {
  es: {
    nav: {
      properties: "Propiedades",
      whyUs: "¿Por qué nosotros?",
      contact: "Contacto",
      cta: "Escríbenos",
    },
    hero: {
      badge: "Inmobiliaria en Cuenca, Ecuador",
      headline: "Tu hogar ideal\nen Cuenca",
      sub: "Casas, departamentos y proyectos VIP. Te ayudamos a encontrar la propiedad perfecta — rápido, transparente y sin complicaciones.",
      ctaPrimary: "Escríbenos por WhatsApp",
      ctaSecondary: "Ver propiedades",
    },
    stats: [
      { value: "12+", label: "Propiedades disponibles" },
      { value: "3%", label: "Comisión de venta" },
      { value: "24h", label: "Tiempo de respuesta" },
    ],
    properties: {
      title: "Propiedades disponibles",
      sub: "Inventario actualizado en tiempo real",
      viewAll: "Ver todas",
      contact: "Consultar",
      available: "Disponible",
      reserved: "Reservado",
      sale: "Venta",
      rent: "Arriendo",
      beds: "hab",
      baths: "baños",
      noProperties: "Cargando propiedades...",
    },
    whyCuenca: {
      title: "¿Por qué Cuenca?",
      sub: "La ciudad más elegida por locales y extranjeros",
      items: [
        {
          icon: "🌤️",
          title: "Clima de primavera eterna",
          desc: "17–22°C todo el año. Sin estaciones extremas. La ciudad más agradable de Ecuador.",
        },
        {
          icon: "💰",
          title: "Costo de vida accesible",
          desc: "Vivir bien por $1,500–2,000/mes. Ideal para jubilados y nómadas digitales.",
        },
        {
          icon: "🏛️",
          title: "Patrimonio de la Humanidad",
          desc: "Centro histórico declarado por UNESCO. Cultura, gastronomía y arquitectura colonial.",
        },
        {
          icon: "🏥",
          title: "Salud de primer nivel",
          desc: "Hospitales modernos, médicos especializados a precios accesibles.",
        },
      ],
    },
    whyUs: {
      title: "¿Por qué Cuenca House?",
      items: [
        {
          icon: "⚡",
          title: "Respuesta inmediata",
          desc: "Nuestro asistente virtual responde al instante — 24/7, en español e inglés.",
        },
        {
          icon: "🏠",
          title: "Inventario exclusivo",
          desc: "Proyectos VIP, casas de segunda, arriendos y terrenos. Todo en un solo lugar.",
        },
        {
          icon: "🤝",
          title: "Sin letra pequeña",
          desc: "Comisión del 3% en venta. Transparencia total desde el primer mensaje.",
        },
      ],
    },
    cta: {
      title: "¿Listo para encontrar tu propiedad?",
      sub: "Escríbenos ahora — respondemos en menos de 5 minutos",
      button: "Abrir WhatsApp",
      phone: "+593 98 811 4497",
    },
    footer: {
      tagline: "Tu inmobiliaria de confianza en Cuenca, Ecuador.",
      rights: "Todos los derechos reservados.",
    },
  },
  en: {
    nav: {
      properties: "Properties",
      whyUs: "Why us?",
      contact: "Contact",
      cta: "Message us",
    },
    hero: {
      badge: "Real Estate in Cuenca, Ecuador",
      headline: "Your perfect home\nin Cuenca",
      sub: "Houses, apartments and VIP projects. We help you find the perfect property — fast, transparent, and hassle-free.",
      ctaPrimary: "Message us on WhatsApp",
      ctaSecondary: "View properties",
    },
    stats: [
      { value: "12+", label: "Available properties" },
      { value: "3%", label: "Sales commission" },
      { value: "24h", label: "Response time" },
    ],
    properties: {
      title: "Available Properties",
      sub: "Real-time updated inventory",
      viewAll: "View all",
      contact: "Inquire",
      available: "Available",
      reserved: "Reserved",
      sale: "For sale",
      rent: "For rent",
      beds: "beds",
      baths: "baths",
      noProperties: "Loading properties...",
    },
    whyCuenca: {
      title: "Why Cuenca?",
      sub: "The most chosen city by locals and expats",
      items: [
        {
          icon: "🌤️",
          title: "Eternal spring weather",
          desc: "17–22°C year-round. No extreme seasons. Ecuador's most pleasant city.",
        },
        {
          icon: "💰",
          title: "Affordable cost of living",
          desc: "Live well for $1,500–2,000/month. Perfect for retirees and digital nomads.",
        },
        {
          icon: "🏛️",
          title: "UNESCO World Heritage",
          desc: "Colonial architecture, culture, and gastronomy in a well-preserved historic center.",
        },
        {
          icon: "🏥",
          title: "World-class healthcare",
          desc: "Modern hospitals and specialized doctors at affordable prices.",
        },
      ],
    },
    whyUs: {
      title: "Why Cuenca House?",
      items: [
        {
          icon: "⚡",
          title: "Instant response",
          desc: "Our virtual assistant replies immediately — 24/7, in Spanish and English.",
        },
        {
          icon: "🏠",
          title: "Exclusive inventory",
          desc: "VIP projects, resale homes, rentals and land. Everything in one place.",
        },
        {
          icon: "🤝",
          title: "Full transparency",
          desc: "3% sales commission. No hidden fees from your first message.",
        },
      ],
    },
    cta: {
      title: "Ready to find your property?",
      sub: "Message us now — we respond in under 5 minutes",
      button: "Open WhatsApp",
      phone: "+593 98 811 4497",
    },
    footer: {
      tagline: "Your trusted real estate agency in Cuenca, Ecuador.",
      rights: "All rights reserved.",
    },
  },
} as const;

export const WA_LINK = {
  es: "https://wa.me/593988114497?text=Hola%2C%20me%20interes%C3%B3%20una%20propiedad%20de%20Cuenca%20House",
  en: "https://wa.me/593988114497?text=Hello%2C%20I%27m%20interested%20in%20a%20Cuenca%20House%20property",
};
