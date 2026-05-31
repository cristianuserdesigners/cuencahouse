"use client";

import { useActionState } from "react";
import type { Property } from "@/lib/supabase/types";

type Props = {
  action: (prev: { error?: string } | null, formData: FormData) => Promise<{ error?: string }>;
  property?: Property;
  submitLabel: string;
};

const field = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] transition-colors bg-white";
const label = "block text-xs font-medium text-gray-600 mb-1.5";

export default function PropertyForm({ action, property, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {/* Información básica */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Información básica</h2>

        <div>
          <label className={label}>Título *</label>
          <input name="title" required defaultValue={property?.title} placeholder="Casa en Lomas de Turi" className={field} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Tipo *</label>
            <select name="type" required defaultValue={property?.type ?? "apartment"} className={field}>
              <option value="apartment">Departamento</option>
              <option value="house">Casa</option>
              <option value="office">Oficina</option>
              <option value="land">Terreno</option>
              <option value="commercial">Local comercial</option>
            </select>
          </div>
          <div>
            <label className={label}>Operación *</label>
            <select name="operation" required defaultValue={property?.operation ?? "sale"} className={field}>
              <option value="sale">Venta</option>
              <option value="rent">Arriendo</option>
              <option value="both">Venta y arriendo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Línea</label>
            <select name="line" defaultValue={property?.line ?? "segunda"} className={field}>
              <option value="segunda">Segunda mano</option>
              <option value="proyectos">Proyectos</option>
              <option value="rentas">Rentas</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <div>
            <label className={label}>Estado</label>
            <select name="status" defaultValue={property?.status ?? "available"} className={field}>
              <option value="available">Disponible</option>
              <option value="reserved">Reservado</option>
              <option value="sold">Vendido</option>
              <option value="rented">Alquilado</option>
            </select>
          </div>
        </div>
      </section>

      {/* Precio y características */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Precio y características</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Precio (USD) *</label>
            <input name="price" type="number" min="0" step="0.01" required defaultValue={property?.price} placeholder="150000" className={field} />
          </div>
          <div>
            <label className={label}>Área (m²)</label>
            <input name="area_m2" type="number" min="0" step="0.1" defaultValue={property?.area_m2 ?? ""} placeholder="120" className={field} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={label}>Habitaciones</label>
            <input name="bedrooms" type="number" min="0" defaultValue={property?.bedrooms ?? ""} placeholder="3" className={field} />
          </div>
          <div>
            <label className={label}>Baños</label>
            <input name="bathrooms" type="number" min="0" step="0.5" defaultValue={property?.bathrooms ?? ""} placeholder="2" className={field} />
          </div>
          <div>
            <label className={label}>Parqueos</label>
            <input name="parking" type="number" min="0" defaultValue={property?.parking ?? ""} placeholder="1" className={field} />
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Ubicación</h2>

        <div>
          <label className={label}>Dirección</label>
          <input name="address" defaultValue={property?.address ?? ""} placeholder="Av. de las Américas y Pumapungo" className={field} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Sector / Barrio</label>
            <input name="neighborhood" defaultValue={property?.neighborhood ?? ""} placeholder="El Batán" className={field} />
          </div>
          <div>
            <label className={label}>Ciudad</label>
            <input name="city" defaultValue={property?.city ?? "Cuenca"} placeholder="Cuenca" className={field} />
          </div>
        </div>
      </section>

      {/* Descripción y extras */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Descripción y extras</h2>

        <div>
          <label className={label}>Descripción</label>
          <textarea name="description" rows={3} defaultValue={property?.description ?? ""} placeholder="Descripción de la propiedad..." className={`${field} resize-none`} />
        </div>

        <div>
          <label className={label}>URL álbum de fotos</label>
          <input name="photos_album_url" type="url" defaultValue={property?.photos_album_url ?? ""} placeholder="https://photos.google.com/..." className={field} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Código externo</label>
            <input name="external_code" defaultValue={property?.external_code ?? ""} placeholder="CH-001" className={field} />
          </div>
        </div>

        <div>
          <label className={label}>Notas internas</label>
          <textarea name="notes" rows={2} defaultValue={property?.notes ?? ""} placeholder="Notas para el equipo..." className={`${field} resize-none`} />
        </div>
      </section>

      {state?.error && (
        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-lg">{state.error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-[#1a2744] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a2744]/90 transition-colors disabled:opacity-50"
        >
          {pending ? "Guardando..." : submitLabel}
        </button>
        <a href="/properties" className="px-6 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          Cancelar
        </a>
      </div>
    </form>
  );
}
