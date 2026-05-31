# CRM Domain — CuencaHouse

Eres experto en el dominio de este CRM inmobiliario. Aplica estas reglas siempre que trabajes en este proyecto.

---

## Entidades y sus reglas

### Lead
- Un lead puede tener múltiples properties de interés (muchos a muchos via `lead_properties`)
- El `score` (0-100) lo calcula el Lead Qualifier Agent — nunca se edita manualmente
- `status` solo avanza en orden: new → contacted → qualifying → qualified → negotiating → won/lost
- Un lead sin `assigned_agent_id` está en la cola general
- Un lead es `qualified` cuando tiene: intent, budget_min, property_type y urgency completos
- Si un lead lleva más de 7 días en `new` sin actividad → trigger de Follow-up Agent

### Property
- Una propiedad `reserved` no se muestra en listings públicos pero sí en el CRM
- El campo `ai_description` lo genera el Content Agent — `description` es el texto original del agente humano
- `price` siempre en USD (mercado de Cuenca usa dólares)
- Una propiedad puede tener múltiples `photos` — la primera es el cover
- `area_m2` siempre en metros cuadrados

### Deal
- Un Deal conecta exactamente un Lead con exactamente una Property
- Un Lead puede tener múltiples Deals activos (está viendo varias propiedades)
- Solo puede haber un Deal en estado `closing` o `closed_won` por Property
- Al cerrar un Deal como `closed_won`: actualizar `property.status = sold/rented` y `lead.status = won`

### Agent (agente humano)
- Cada Lead y Property tiene un `agent_id` owner
- Los agentes tienen `specialty[]`: residential | commercial | land | luxury
- El Lead Qualifier asigna leads por: especialidad match + menor carga actual (`active_leads_count`)

---

## Reglas de negocio de Cuenca House

### Comisiones (modelo propio)
- Venta directa: 3% (mínimo 2% según constructora y valor)
- Venta en alianza con corredor externo: 1.5% Cuenca House + 1.5% aliado
- Renta: % sobre primer mes + canon mensual (a definir)
- Cuando un Deal tiene `alliance_id`: comisión se divide 50/50

### Líneas de servicio (afecta pipeline y propiedades)
- **Rentas** — corto, mediano y largo plazo
- **Proyectos** — vivienda nueva de constructoras
- **Casas de segunda** — inmuebles existentes (mercado secundario)
- **Proyectos VIP** — con tasas preferenciales del Estado (BIESS, BanEcuador). Requiere calificación del comprador.

### Segmentos de cliente — journeys distintos
| Segmento | Idioma | Diferencias en calificación |
|----------|--------|----------------------------|
| Local | ES | Presupuesto, financiamiento BIESS/banco |
| Expat / extranjero | EN (o ES) | Compra remota, residencia/visa, transferencia internacional |
| Inversor | ES/EN | ROI esperado, plazo, interés en proyectos o rentas |
| B2B (constructora) | ES | Volumen, comisión diferenciada |

### Mercado de Cuenca
- Precios: apartamentos $60k-$250k USD · casas $80k-$500k · terrenos $20k-$200k
- Zonas clave: El Centro, El Ejido, Pumapungo, Challuabamba, Yanuncay, Totoracocha, Ricaurte, Misicata
- Financiamiento local: BIESS (hasta 100k) · BanEcuador · bancos privados
- Documentación: Promesa de compraventa → Minuta → Escritura pública → Registro de la propiedad
- 90%+ compradores inician búsqueda online — pero la competencia local NO se digitalizó (ventaja)

---

## Lead scoring — lógica

| Factor | Puntos |
|--------|--------|
| Budget definido | +20 |
| Urgency: immediate | +25 · 1-3m: +15 · 3-6m: +5 |
| Intent: buy/sell | +15 · rent: +5 |
| Fuente: referral | +25 · tiktok_dm/instagram_dm: +15 · whatsapp: +10 · web_form: +5 |
| Teléfono + email ambos | +10 |
| Visita agendada | +25 |
| Segmento expat | +10 (mayor poder adquisitivo promedio) |

Score < 30 → cold | 30-60 → warm | 60+ → hot

---

## Estados de conversación del Lead Qualifier

El agente detecta idioma en el primer mensaje (ES default, EN si escribe en inglés o detecta expat).

**Flujo base (ES/EN):**
1. `intent` — ¿comprar / vender / arrendar?
2. `property_type` — tipo de propiedad
3. `location_preference` — zona o barrio en Cuenca
4. `budget` — presupuesto aproximado en USD
5. `urgency` — ¿para cuándo?

**Preguntas adicionales para segmento expat (si detecta extranjero):**
- ¿La compra sería de forma remota o viene a Cuenca?
- ¿Tiene residencia ecuatoriana o planea tramitarla?

Una vez los 5 datos base están completos → lead se marca `qualified` y se notifica a Verónica.

---

## Vocabulario del dominio (para prompts y UI)

| Técnico | Mostrar al usuario |
|---------|-------------------|
| lead | prospecto / cliente |
| deal | negociación |
| qualified | calificado |
| pipeline | embudo de ventas |
| property_type: apartment | Departamento |
| property_type: house | Casa |
| property_type: land | Terreno |
| property_type: commercial | Local comercial |
| operation: sale | En venta |
| operation: rent | En arriendo |
