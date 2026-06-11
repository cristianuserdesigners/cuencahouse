/**
 * Cliente Canva Connect API
 * Token OAuth almacenado como CANVA_ACCESS_TOKEN en env vars
 */

const CANVA_API = "https://api.canva.com/rest/v1";

export const CANVA_TEMPLATE_ID = "DAHMSj_m8QU";

// Element IDs del template Brown Modern Real Estate Instagram Story
export const TEMPLATE_ELEMENTS = {
  title:       "PBvKfsCrMnJ6sqXZ-LBPqlyK7jjkbZp07",
  subtitle:    "PBvKfsCrMnJ6sqXZ-LBHCzBcMTtgll58n",
  description: "PBvKfsCrMnJ6sqXZ-LB0jFYG29mywPN3G",
  price:       "PBvKfsCrMnJ6sqXZ-LB4gDJ6Q6ZSSBQdf",
  website:     "PBvKfsCrMnJ6sqXZ-LBSCnqwYvVv3LX2L",
  imgCenter:   "PBvKfsCrMnJ6sqXZ-LB75NtW5NfywM5NR-a",
  imgRight:    "PBvKfsCrMnJ6sqXZ-LBD774jtSRqmSMJM-a",
  imgLeft:     "PBvKfsCrMnJ6sqXZ-LB73DJ84VtLVf7hx-a",
} as const;

export class CanvaClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const res = await fetch(`${CANVA_API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Canva ${method} ${path} → ${res.status}: ${err.slice(0, 200)}`);
    }
    return res.json() as T;
  }

  /** Sube una imagen desde URL y retorna el asset_id */
  async uploadImage(imageUrl: string, name: string): Promise<string | null> {
    try {
      // 1. Iniciar job de upload
      const job = await this.request<{ job_id: string; upload_url: string }>(
        "/asset-uploads", "POST", { name, import_method: "PUT" }
      );

      // 2. Descargar imagen y subir a URL presignada
      const imgRes = await fetch(imageUrl, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } });
      if (!imgRes.ok) return null;
      const buffer = await imgRes.arrayBuffer();

      await fetch(job.upload_url, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: buffer,
      });

      // 3. Polling hasta que el asset esté listo
      for (let i = 0; i < 12; i++) {
        await new Promise(r => setTimeout(r, 1500));
        const status = await this.request<{ job: { status: string; asset_id?: string } }>(
          `/asset-uploads/${job.job_id}`
        );
        if (status.job?.status === "success") return status.job.asset_id ?? null;
        if (status.job?.status === "failed") return null;
      }
      return null;
    } catch (e) {
      console.error("[canva] uploadImage error:", e);
      return null;
    }
  }

  /** Copia el template y retorna el nuevo design_id */
  async copyTemplate(): Promise<{ design_id: string; edit_url: string }> {
    const res = await this.request<{ design: { id: string; urls: { edit_url: string } } }>(
      "/designs", "POST",
      { design_type: { name: "your_story" }, asset_id: CANVA_TEMPLATE_ID }
    );
    return {
      design_id: res.design.id,
      edit_url: res.design.urls.edit_url,
    };
  }

  /** Inicia sesión de edición */
  async startSession(designId: string): Promise<{ session_id: string; pages: unknown[] }> {
    const res = await this.request<{ editing_session: { session_id: string }; pages: unknown[] }>(
      `/designs/${designId}/editing-sessions`, "POST", {}
    );
    return { session_id: res.editing_session.session_id, pages: res.pages ?? [] };
  }

  /** Aplica operaciones de edición */
  async applyOperations(designId: string, sessionId: string, operations: unknown[]): Promise<void> {
    await this.request(
      `/designs/${designId}/editing-sessions/${sessionId}/commands`,
      "POST", { commands: operations }
    );
  }

  /** Publica (commit) el diseño */
  async publishSession(designId: string, sessionId: string): Promise<void> {
    await this.request(
      `/designs/${designId}/editing-sessions/${sessionId}/publish`,
      "POST", {}
    );
  }
}

export function getCanvaClient(): CanvaClient | null {
  const token = process.env.CANVA_ACCESS_TOKEN;
  if (!token) return null;
  return new CanvaClient(token);
}
