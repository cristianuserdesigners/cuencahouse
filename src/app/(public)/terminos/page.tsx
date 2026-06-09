import Link from "next/link";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio | Cuenca House",
  description: "Términos y condiciones de Cuenca House, inmobiliaria en Cuenca, Ecuador.",
};

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-[#1a2744] mb-2">Términos de Servicio</h1>
        <p className="text-gray-400 text-sm mb-8">Última actualización: Junio 2026</p>

        <div className="space-y-6 text-gray-600 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">1. Aceptación de términos</h2>
            <p>Al utilizar los servicios de Cuenca House, incluyendo nuestro sitio web, agente de WhatsApp y CRM, usted acepta estos Términos de Servicio. Si no está de acuerdo, por favor no utilice nuestros servicios.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">2. Descripción del servicio</h2>
            <p>Cuenca House es una inmobiliaria que opera en Cuenca, Ecuador, que ofrece:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Intermediación en compra, venta y arriendo de propiedades</li>
              <li>Asesoría inmobiliaria personalizada</li>
              <li>Atención vía WhatsApp con asistente de IA</li>
              <li>Listado de propiedades en cuenca.house</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">3. Comisiones</h2>
            <p>Cuenca House cobra una comisión del <strong>3%</strong> sobre el precio de venta al cerrar una transacción. Para arriendos, la comisión equivale a un mes de canon. En alianzas con otros corredores, la comisión se divide 50/50 sin costo adicional para el cliente.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">4. Asistente de IA</h2>
            <p>Nuestro asistente virtual de WhatsApp utiliza inteligencia artificial para responder consultas y calificar leads. Las respuestas del asistente son orientativas y no constituyen asesoría legal ni financiera. Para decisiones importantes, siempre recomendamos hablar con un asesor humano de Cuenca House.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">5. Información de propiedades</h2>
            <p>Cuenca House hace su mejor esfuerzo para mantener la información de propiedades actualizada y precisa. Sin embargo, los precios, disponibilidad y características pueden cambiar sin previo aviso. Cualquier oferta está sujeta a confirmación.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">6. Limitación de responsabilidad</h2>
            <p>Cuenca House actúa como intermediario. No somos responsables por daños directos o indirectos derivados del uso de nuestros servicios, incluyendo transacciones entre compradores y vendedores.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">7. Ley aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República del Ecuador. Cualquier disputa será resuelta en los tribunales competentes de la ciudad de Cuenca.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#1a2744] mb-3">8. Contacto</h2>
            <p>Para consultas sobre estos términos: <a href="mailto:ventas@cuenca.house" className="text-[#1a2744] underline">ventas@cuenca.house</a></p>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-200 flex gap-4 text-xs text-gray-400">
          <Link href="/privacidad" className="hover:text-[#1a2744]">Política de privacidad</Link>
          <Link href="/eliminar-datos" className="hover:text-[#1a2744]">Eliminar mis datos</Link>
          <Link href="/" className="hover:text-[#1a2744]">Inicio</Link>
        </div>
      </div>
    </div>
  );
}
