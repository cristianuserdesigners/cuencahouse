"use client";

import { useActionState } from "react";
import { changePassword } from "./actions";
import { CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [state, action, pending] = useActionState(changePassword, null);

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Configuración</h1>
      <p className="text-sm text-gray-400 mb-8">Administra tu cuenta</p>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-5">Cambiar contraseña</h2>

        {state?.success ? (
          <div className="flex items-center gap-2.5 text-green-600 bg-green-50 px-4 py-3 rounded-lg text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Contraseña actualizada correctamente
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Contraseña actual
              </label>
              <input
                name="current"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Nueva contraseña
              </label>
              <input
                name="new"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Confirmar nueva contraseña
              </label>
              <input
                name="confirm"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] transition-colors"
              />
            </div>

            {state?.error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#1a2744] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a2744]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
