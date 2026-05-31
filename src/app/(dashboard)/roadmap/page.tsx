import { CheckCircle2, Circle, Clock, Rocket, CalendarDays } from "lucide-react";

const LAUNCH_DATE = new Date("2024-06-24");
const TODAY = new Date("2026-05-30");
const DAYS_LEFT = Math.ceil((new Date("2026-06-24").getTime() - new Date("2026-05-30").getTime()) / 86400000);

type TaskStatus = "done" | "in_progress" | "pending";

type Task = {
  title: string;
  status: TaskStatus;
  note?: string;
};

type Week = {
  week: number;
  label: string;
  dates: string;
  theme: string;
  status: TaskStatus;
  tasks: Task[];
};

const ROADMAP: Week[] = [
  {
    week: 1,
    label: "Semana 1",
    dates: "25 – 31 Mayo",
    theme: "Fundación + Lead Qualifier",
    status: "done",
    tasks: [
      { title: "Next.js 16 + Supabase schema (10 tablas)", status: "done" },
      { title: "Lead Qualifier Agent — bilingüe ES/EN, scoring 0-100", status: "done" },
      { title: "WhatsApp webhook (Meta Cloud API)", status: "done" },
      { title: "Vercel deploy → cuencahouse.vercel.app", status: "done" },
      { title: "Dashboard CRM — Leads, Pipeline, Approvals", status: "done" },
      { title: "Observabilidad — agent_logs, agent_evals, HITL", status: "done" },
    ],
  },
  {
    week: 2,
    label: "Semana 2",
    dates: "1 – 7 Junio",
    theme: "Auth + Inventario + Content Agent",
    status: "in_progress",
    tasks: [
      { title: "Auth con Supabase — login para Verónica y Cris", status: "pending" },
      { title: "Propiedades CRUD — inventario completo", status: "pending" },
      { title: "Content Agent — descripciones, hooks TikTok, captions IG", status: "pending" },
      { title: "WhatsApp Business real — conectar número de Cuenca House", status: "pending" },
      { title: "Dashboard leads — filtros por estado, fuente, score", status: "pending" },
    ],
  },
  {
    week: 3,
    label: "Semana 3",
    dates: "8 – 14 Junio",
    theme: "Property Matcher + Web pública",
    status: "pending",
    tasks: [
      { title: "Property Matcher — cruza perfil calificado con inventario", status: "pending" },
      { title: "Página pública cuenca.house — landing + cotizador", status: "pending" },
      { title: "Listado de propiedades público (ES + EN)", status: "pending" },
      { title: "Dominio cuenca.house → Vercel", status: "pending" },
      { title: "Eval set — Verónica etiqueta buenas/malas respuestas IA", status: "pending" },
    ],
  },
  {
    week: 4,
    label: "Semana 4",
    dates: "15 – 21 Junio",
    theme: "Tour Scheduler + QA + Launch prep",
    status: "pending",
    tasks: [
      { title: "Tour Scheduler — agendamiento y reagendamiento automático", status: "pending" },
      { title: "Notificaciones a Verónica — WhatsApp/email al calificar lead", status: "pending" },
      { title: "Testing end-to-end — flujo completo WhatsApp → lead → CRM", status: "pending" },
      { title: "QA dashboard — modo dark, responsive, edge cases", status: "pending" },
      { title: "Capacitación a Verónica — uso del CRM", status: "pending" },
    ],
  },
  {
    week: 5,
    label: "Lanzamiento",
    dates: "24 Junio",
    theme: "Soft launch 🚀",
    status: "pending",
    tasks: [
      { title: "TikTok/IG activos — primeros posts con Verónica", status: "pending" },
      { title: "WhatsApp Business público en bio y perfil", status: "pending" },
      { title: "Monitorear primeros leads reales en el CRM", status: "pending" },
      { title: "Ajustes post-lanzamiento según feedback de Verónica", status: "pending" },
    ],
  },
];

function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === "done") return <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />;
  if (status === "in_progress") return <Clock className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />;
  return <Circle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />;
}

const WEEK_STYLES: Record<TaskStatus, { border: string; header: string; badge: string; badgeText: string }> = {
  done: {
    border: "border-green-200",
    header: "bg-green-50",
    badge: "bg-green-100 text-green-700",
    badgeText: "Completado",
  },
  in_progress: {
    border: "border-[#c9a84c]/40",
    header: "bg-[#c9a84c]/8",
    badge: "bg-[#c9a84c]/15 text-[#c9a84c]",
    badgeText: "En curso",
  },
  pending: {
    border: "border-gray-200",
    header: "bg-gray-50",
    badge: "bg-gray-100 text-gray-500",
    badgeText: "Pendiente",
  },
};

export default function RoadmapPage() {
  const totalTasks = ROADMAP.flatMap((w) => w.tasks).length;
  const doneTasks = ROADMAP.flatMap((w) => w.tasks).filter((t) => t.status === "done").length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Roadmap de lanzamiento</h1>
          <p className="text-sm text-gray-500 mt-1">Cuenca House · 25 Mayo → 24 Junio 2026</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1.5 justify-end text-[#1a2744]">
            <Rocket className="w-4 h-4" />
            <span className="text-2xl font-bold">{DAYS_LEFT}</span>
          </div>
          <p className="text-xs text-gray-400">días para el lanzamiento</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso general</span>
          <span className="text-sm font-bold text-[#1a2744]">{doneTasks}/{totalTasks} tareas</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1a2744] to-[#c9a84c] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5">{progress}% completado</p>
      </div>

      {/* Weeks */}
      <div className="space-y-4">
        {ROADMAP.map((week) => {
          const styles = WEEK_STYLES[week.status];
          const weekDone = week.tasks.filter((t) => t.status === "done").length;
          const isLaunch = week.week === 5;

          return (
            <div
              key={week.week}
              className={`rounded-xl border ${styles.border} overflow-hidden`}
            >
              {/* Week header */}
              <div className={`px-5 py-3.5 ${styles.header} flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  {isLaunch ? (
                    <Rocket className="w-4 h-4 text-[#1a2744]" />
                  ) : (
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                  )}
                  <div>
                    <span className="font-semibold text-gray-900 text-sm">
                      {week.label} — {week.theme}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">{week.dates}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isLaunch && (
                    <span className="text-xs text-gray-400">
                      {weekDone}/{week.tasks.length}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                    {styles.badgeText}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="px-5 py-3 bg-white divide-y divide-gray-50">
                {week.tasks.map((task, i) => (
                  <div key={i} className="flex items-start gap-2.5 py-2.5">
                    <StatusIcon status={task.status} />
                    <span className={`text-sm ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-700"}`}>
                      {task.title}
                    </span>
                    {task.note && (
                      <span className="text-xs text-gray-400 italic ml-auto shrink-0">{task.note}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
