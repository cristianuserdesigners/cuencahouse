"use client";

import { useActionState } from "react";
import { Building2 } from "lucide-react";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <div className="min-h-screen bg-[#1a2744] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <Building2 className="w-6 h-6 text-[#c9a84c]" />
          <span className="text-white font-semibold text-xl tracking-wide uppercase">
            Cuenca <span className="text-[#c9a84c]">House</span>
          </span>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Bienvenida</h1>
          <p className="text-sm text-gray-400 mb-6">Ingresa a tu cuenta CRM</p>

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Contraseña
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
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
              className="w-full bg-[#1a2744] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a2744]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {pending ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          cuenca.house · CRM Interno
        </p>
      </div>
    </div>
  );
}
