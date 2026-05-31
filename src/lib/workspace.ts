/**
 * Workspace resolver — dado un phone_number_id de Meta, devuelve el workspace.
 * Es el core del multi-tenancy: un webhook, N agentes inmobiliarios.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import type { Workspace } from "@/lib/supabase/types";

let cache: Map<string, Workspace> = new Map();
const CACHE_TTL = 60_000; // 1 min
const cacheTime: Map<string, number> = new Map();

export async function getWorkspaceByPhoneId(
  phoneNumberId: string
): Promise<Workspace | null> {
  const now = Date.now();
  const cached = cache.get(phoneNumberId);
  if (cached && now - (cacheTime.get(phoneNumberId) ?? 0) < CACHE_TTL) {
    return cached;
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .eq("whatsapp_phone_id", phoneNumberId)
    .eq("active", true)
    .single();

  if (data) {
    cache.set(phoneNumberId, data);
    cacheTime.set(phoneNumberId, now);
  }

  return data ?? null;
}

export async function getWorkspaceBySlug(slug: string): Promise<Workspace | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .single();
  return data ?? null;
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", id)
    .single();
  return data ?? null;
}

// Fallback: si hay un solo workspace (instalación single-tenant como Cuenca House)
export async function getDefaultWorkspace(): Promise<Workspace | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  return data ?? null;
}

export function clearWorkspaceCache() {
  cache = new Map();
}
