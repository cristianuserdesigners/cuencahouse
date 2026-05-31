import type { LeadQualificationData } from "./types";

export function calculateLeadScore(
  collected: Partial<LeadQualificationData>,
  source: string
): number {
  let score = 0;

  // Budget defined
  if (collected.budget_min != null || collected.budget_max != null) score += 20;

  // Urgency
  if (collected.urgency === "immediate") score += 25;
  else if (collected.urgency === "1_3m") score += 15;
  else if (collected.urgency === "3_6m") score += 5;

  // Intent
  if (collected.intent === "buy" || collected.intent === "sell") score += 15;
  else if (collected.intent === "rent") score += 5;

  // Source
  if (source === "referral") score += 25;
  else if (source === "tiktok_dm" || source === "instagram_dm") score += 15;
  else if (source === "whatsapp") score += 10;
  else if (source === "web_form") score += 5;

  // Expat bonus — mayor poder adquisitivo promedio
  if (collected.segment === "expat") score += 10;

  return Math.min(score, 100);
}

export function isQualified(collected: Partial<LeadQualificationData>): boolean {
  return (
    !!collected.intent &&
    !!collected.property_type &&
    !!collected.location_preference &&
    (collected.budget_min != null || collected.budget_max != null) &&
    !!collected.urgency
  );
}

export function buildAiSummary(
  collected: Partial<LeadQualificationData>,
  language: "es" | "en"
): string {
  const intentMap = {
    buy: language === "es" ? "comprar" : "buy",
    sell: language === "es" ? "vender" : "sell",
    rent: language === "es" ? "arrendar" : "rent",
    invest: language === "es" ? "invertir" : "invest",
  };
  const typeMap = {
    apartment: language === "es" ? "departamento" : "apartment",
    house: language === "es" ? "casa" : "house",
    land: language === "es" ? "terreno" : "land",
    office: language === "es" ? "oficina" : "office",
    commercial: language === "es" ? "local comercial" : "commercial space",
  };

  const intent = collected.intent ? intentMap[collected.intent] : "—";
  const type = collected.property_type ? typeMap[collected.property_type] : "—";
  const zone = collected.location_preference ?? "—";
  const budget =
    collected.budget_min && collected.budget_max
      ? `$${collected.budget_min.toLocaleString()}–$${collected.budget_max.toLocaleString()}`
      : collected.budget_max
      ? `hasta $${collected.budget_max.toLocaleString()}`
      : collected.budget_min
      ? `desde $${collected.budget_min.toLocaleString()}`
      : "—";
  const urgencyMap = {
    immediate: language === "es" ? "inmediato" : "immediate",
    "1_3m": language === "es" ? "1-3 meses" : "1-3 months",
    "3_6m": language === "es" ? "3-6 meses" : "3-6 months",
    "6m_plus": language === "es" ? "más de 6 meses" : "6+ months",
  };
  const urgency = collected.urgency ? urgencyMap[collected.urgency] : "—";

  return language === "es"
    ? `Quiere ${intent} un ${type} en ${zone}. Presupuesto: ${budget}. Plazo: ${urgency}.`
    : `Looking to ${intent} a ${type} in ${zone}. Budget: ${budget}. Timeline: ${urgency}.`;
}
