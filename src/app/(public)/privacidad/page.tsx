import Link from "next/link";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Cuenca House",
  description: "Política de privacidad de Cuenca House, inmobiliaria en Cuenca, Ecuador.",
};

export default function PrivacyPage() {
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

      <div className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-bold text-[#1a2744] mb-2">Política de Privacidad</h1>
        <p className="text-gray-400 text-sm mb-8">Última actualización: Junio 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">1. Información que recopilamos</h2>
            <p>Cuenca House recopila información cuando usted interactúa con nosotros a través de WhatsApp, nuestro sitio web o cualquier otro canal de comunicación. Esta información puede incluir:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Nombre y apellido</li>
              <li>Número de teléfono (WhatsApp)</li>
              <li>Correo electrónico</li>
              <li>Preferencias de propiedad (tipo, zona, presupuesto)</li>
              <li>Mensajes e historial de conversaciones</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">2. Uso de la información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Brindarle atención personalizada en su búsqueda de propiedades</li>
              <li>Contactarle con opciones que se ajusten a sus necesidades</li>
              <li>Mejorar nuestros servicios y agente de inteligencia artificial</li>
              <li>Cumplir con obligaciones legales y regulatorias en Ecuador</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">3. Procesamiento mediante IA</h2>
            <p>Cuenca House utiliza tecnología de inteligencia artificial para procesar conversaciones de WhatsApp. Las conversaciones son analizadas automáticamente para identificar necesidades de propiedades y calcular un score de calificación. Este procesamiento nos permite responder más rápido y de manera más precisa a sus consultas.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">4. Compartir información</h2>
            <p>No vendemos, alquilamos ni compartimos su información personal con terceros con fines comerciales. Podemos compartir información con:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Proveedores de tecnología que nos ayudan a operar (Supabase, Anthropic, Meta)</li>
              <li>Autoridades cuando sea requerido por ley</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">5. WhatsApp y Meta</h2>
            <p>Nuestras comunicaciones vía WhatsApp están sujetas a las políticas de privacidad de Meta Platforms, Inc. Al comunicarse con nosotros por WhatsApp, usted acepta los términos de uso de dicha plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">6. Retención de datos</h2>
            <p>Conservamos su información por el tiempo necesario para brindarle nuestros servicios y cumplir con obligaciones legales. Si desea eliminar sus datos, puede solicitarlo en cualquier momento a través de nuestro formulario de eliminación de datos.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">7. Sus derechos</h2>
            <p>Usted tiene derecho a:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Acceder a sus datos personales</li>
              <li>Rectificar información incorrecta</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Oponerse al procesamiento de sus datos</li>
            </ul>
            <p className="mt-2">Para ejercer estos derechos, contáctenos a <a href="mailto:ventas@cuenca.house" className="text-[#1a2744] underline">ventas@cuenca.house</a></p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">8. Seguridad</h2>
            <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información, incluyendo cifrado SSL, acceso restringido y copias de seguridad regulares.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">9. Contacto</h2>
            <p>Para cualquier consulta sobre esta política de privacidad:</p>
            <ul className="list-none mt-2 space-y-1">
              <li><strong>Email:</strong> ventas@cuenca.house</li>
              <li><strong>WhatsApp:</strong> +593 98 811 4497</li>
              <li><strong>Web:</strong> cuenca.house</li>
              <li><strong>País:</strong> Ecuador</li>
            </ul>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex gap-4 text-xs text-gray-400">
          <Link href="/terminos" className="hover:text-[#1a2744]">Términos de servicio</Link>
          <Link href="/eliminar-datos" className="hover:text-[#1a2744]">Eliminar mis datos</Link>
          <Link href="/" className="hover:text-[#1a2744]">Inicio</Link>
        </div>
      </div>
    </div>
  );
}
