export type ContentInput = {
  titulo: string;
  tipo: string;
  operacion: string;
  precio: number;
  area_m2: number | null;
  habitaciones: number | null;
  banos: number | null;
  sector: string | null;
  ciudad: string;
  descripcion: string | null;
  fotos_url: string | null;
  linea: string;
};

export type GeneratedContent = {
  descripcion_listing: string;   // descripción larga para el CRM / web
  hook_tiktok: string;           // gancho corto para video TikTok
  caption_instagram: string;     // caption con emojis y hashtags
  mensaje_whatsapp: string;      // mensaje directo a prospecto
};
