import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("id, synced_at, created_at")
    .eq("workspace_id", WORKSPACE_ID)
    .in("status", ["available", "reserved"]);

  const propertyUrls = (properties ?? []).map((p) => ({
    url: `https://cuenca.house/propiedades/${p.id}`,
    lastModified: new Date(p.synced_at ?? p.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: "https://cuenca.house",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "https://cuenca.house/propiedades",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...propertyUrls,
  ];
}
