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
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/approvals", label: "Aprobaciones", icon: CheckSquare },
  { href: "/roadmap", label: "Roadmap", icon: Rocket },
];

export default function Sidebar() {
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-xs text-white/30">cuenca.house · v0.1</p>
      </div>
    </aside>
  );
}
