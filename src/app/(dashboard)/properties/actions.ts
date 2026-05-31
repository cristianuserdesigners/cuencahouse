"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";

export async function createProperty(formData: FormData) {
  const supabase = createAdminClient();

  const price = parseFloat(formData.get("price") as string);
  if (isNaN(price) || price <= 0) redirect("/properties/new?error=El+precio+es+requerido");

  const num = (key: string) => {
    const v = formData.get(key) as string;
    return v ? parseFloat(v) : null;
  };

  const { error } = await supabase.from("properties").insert({
    workspace_id: WORKSPACE_ID,
    title: formData.get("title") as string,
    type: formData.get("type") as string,
    operation: formData.get("operation") as string,
    line: formData.get("line") as string,
    status: formData.get("status") as string,
    price,
    area_m2: num("area_m2"),
    bedrooms: num("bedrooms"),
    bathrooms: num("bathrooms"),
    parking: num("parking"),
    address: (formData.get("address") as string) || null,
    neighborhood: (formData.get("neighborhood") as string) || null,
    city: (formData.get("city") as string) || "Cuenca",
    photos_album_url: (formData.get("photos_album_url") as string) || null,
    description: (formData.get("description") as string) || null,
    notes: (formData.get("notes") as string) || null,
    external_code: (formData.get("external_code") as string) || null,
    features: [],
  });

  if (error) redirect(`/properties/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/properties");
  redirect("/properties");
}

export async function updateProperty(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const price = parseFloat(formData.get("price") as string);
  if (isNaN(price) || price <= 0) redirect(`/properties/${id}?error=El+precio+es+requerido`);

  const num = (key: string) => {
    const v = formData.get(key) as string;
    return v ? parseFloat(v) : null;
  };

  const { error } = await supabase
    .from("properties")
    .update({
      title: formData.get("title") as string,
      type: formData.get("type") as string,
      operation: formData.get("operation") as string,
      line: formData.get("line") as string,
      status: formData.get("status") as string,
      price,
      area_m2: num("area_m2"),
      bedrooms: num("bedrooms"),
      bathrooms: num("bathrooms"),
      parking: num("parking"),
      address: (formData.get("address") as string) || null,
      neighborhood: (formData.get("neighborhood") as string) || null,
      city: (formData.get("city") as string) || "Cuenca",
      photos_album_url: (formData.get("photos_album_url") as string) || null,
      description: (formData.get("description") as string) || null,
      notes: (formData.get("notes") as string) || null,
      external_code: (formData.get("external_code") as string) || null,
    })
    .eq("id", id);

  if (error) redirect(`/properties/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/properties");
  revalidatePath(`/properties/${id}`);
  redirect("/properties");
}

export async function deleteProperty(id: string) {
  const supabase = createAdminClient();
  await supabase.from("properties").delete().eq("id", id);
  revalidatePath("/properties");
  redirect("/properties");
}
