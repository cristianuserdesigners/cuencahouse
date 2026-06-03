import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/propiedades"],
        disallow: ["/leads", "/properties", "/pipeline", "/approvals", "/content", "/test-agent", "/settings", "/roadmap", "/api/"],
      },
    ],
    sitemap: "https://cuenca.house/sitemap.xml",
    host: "https://cuenca.house",
  };
}
