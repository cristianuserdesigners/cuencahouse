"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  CheckSquare,
  Building2,
  Rocket,
  LogOut,
  Settings,
  Home,
  Sparkles,
  FlaskConical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/login/actions";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/properties", label: "Propiedades", icon: Home },
  { href: "/content", label: "Contenido IA", icon: Sparkles },
  { href: "/test-agent", label: "Probar agente", icon: FlaskConical },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/approvals", label: "Aprobaciones", icon: CheckSquare },
  { href: "/roadmap", label: "Roadmap", icon: Rocket },
  { href: "/settings", label: "Configuración", icon: Settings },
];

type Props = {
  userEmail?: string;
};

export default function Sidebar({ userEmail }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex flex-col h-screen bg-[#1a2744] text-white shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#c9a84c]" />
          <span className="font-semibold tracking-wide text-sm uppercase">
            Cuenca <span className="text-[#c9a84c]">House</span>
          </span>
        </div>
        <p className="text-xs text-white/40 mt-0.5 ml-7">CRM Interno</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[#c9a84c]/15 text-[#c9a84c] font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — usuario + logout */}
      <div className="px-4 py-4 border-t border-white/10 space-y-3">
        {userEmail && (
          <p className="text-xs text-white/40 px-2 truncate">{userEmail}</p>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Cerrar sesión
          </button>
        </form>
        <p className="text-xs text-white/20 px-2">cuenca.house · v0.1</p>
      </div>
    </aside>
  );
}
