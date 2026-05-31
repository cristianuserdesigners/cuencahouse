import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Cliente con service role key — bypasa RLS completamente.
// SOLO usar en rutas de servidor (API routes, webhooks).
// NUNCA exponer al browser ni incluir en Client Components.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
