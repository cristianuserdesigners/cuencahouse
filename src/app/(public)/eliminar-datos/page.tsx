import Link from "next/link";
import { Building2, Mail, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eliminar mis datos | Cuenca House",
  description: "Solicita la eliminación de tus datos personales de Cuenca House.",
};

export default function DeleteDataPage() {
  return (
    <div className="min-h-screen bg-[#F7F6F2]">
      <header className="bg-white border-b border-gray-100 px-5 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#c9a84c]" />
          <span className="font-bold text-sm uppercase tracking-wide text-[#1a2744]">
            Cuenca <span className="text-[#c9a84c]">House</span>
          </span>
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-bold text-[#1a2744] mb-2">Eliminar mis datos</h1>
        <p className="text-gray-400 text-sm mb-8">Solicitud de eliminación de datos personales</p>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            De acuerdo con nuestra <Link href="/privacidad" className="text-[#1a2744] underline">Política de Privacidad</Link>, tienes derecho a solicitar la eliminación de todos tus datos personales almacenados por Cuenca House, incluyendo conversaciones de WhatsApp, información de contacto y historial de interacciones.
          </p>

          <h2 className="text-base font-semibold text-[#1a2744] mb-4">Para solicitar la eliminación de tus datos:</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-[#1a2744] rounded-xl flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#1a2744] text-sm mb-1">Por correo electrónico</p>
                <p className="text-gray-500 text-xs mb-2">Envía un correo con el asunto "Eliminar mis datos" e incluye tu nombre y número de teléfono.</p>
                <a href="mailto:ventas@cuenca.house?subject=Eliminar%20mis%20datos&body=Solicito%20la%20eliminación%20de%20todos%20mis%20datos%20personales%20de%20Cuenca%20House.%0A%0ANombre:%20%0ATeléfono:%20"
                  className="text-[#1a2744] text-xs font-medium underline">
                  ventas@cuenca.house
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#1a2744] text-sm mb-1">Por WhatsApp</p>
                <p className="text-gray-500 text-xs mb-2">Escríbenos directamente solicitando la eliminación de tus datos.</p>
                <a href="https://wa.me/593988114497?text=Solicito%20la%20eliminación%20de%20todos%20mis%20datos%20personales%20de%20Cuenca%20House."
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#25D366] text-xs font-medium underline">
                  +593 98 811 4497
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a2744]/5 rounded-2xl border border-[#1a2744]/10 p-5">
          <h3 className="font-semibold text-[#1a2744] text-sm mb-2">¿Qué datos se eliminarán?</h3>
          <ul className="text-gray-500 text-xs space-y-1 list-disc pl-4">
            <li>Nombre, teléfono y correo electrónico</li>
            <li>Historial de conversaciones de WhatsApp</li>
            <li>Preferencias de búsqueda de propiedades</li>
            <li>Datos de calificación generados por IA</li>
          </ul>
          <p className="text-gray-400 text-xs mt-3">Procesamos tu solicitud en un plazo máximo de <strong>30 días hábiles</strong>.</p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex gap-4 text-xs text-gray-400">
          <Link href="/privacidad" className="hover:text-[#1a2744]">Política de privacidad</Link>
          <Link href="/terminos" className="hover:text-[#1a2744]">Términos de servicio</Link>
          <Link href="/" className="hover:text-[#1a2744]">Inicio</Link>
        </div>
      </div>
    </div>
  );
}
