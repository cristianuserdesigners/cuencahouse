"use server";

import { createClient } from "@/lib/supabase/server";

export async function changePassword(
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const current = formData.get("current") as string;
  const newPass = formData.get("new") as string;
  const confirm = formData.get("confirm") as string;

  if (newPass !== confirm) return { error: "Las contraseñas no coinciden" };
  if (newPass.length < 8) return { error: "Mínimo 8 caracteres" };

  const supabase = await createClient();

  // Verificar contraseña actual re-autenticando
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Sesión inválida" };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  });
  if (signInError) return { error: "Contraseña actual incorrecta" };

  const { error } = await supabase.auth.updateUser({ password: newPass });
  if (error) return { error: error.message };

  return { success: true };
}
