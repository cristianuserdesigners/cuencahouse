// Tipos manuales — sincronizados con migrations 001 + 002
export type Database = {
  public: {
    Tables: {

      // ── WORKSPACES ─────────────────────────────────────────
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          agent_name: string;
          logo_url: string | null;
          primary_color: string;
          accent_color: string;
          google_sheets_id: string | null;
          sheets_tab_vip: string;
          sheets_tab_standard: string;
          sheets_tabs: { name: string; line: string }[] | null;
          last_sheets_sync: string | null;
          whatsapp_phone_id: string | null;
          whatsapp_token: string | null;
          notification_number: string | null;
          meta_verify_token: string | null;
          working_hours_start: string;
          working_hours_end: string;
          timezone: string;
          commission_sale_pct: number;
          commission_rent_pct: number;
          plan: string;
          plan_expires_at: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          agent_name?: string;
          logo_url?: string | null;
          primary_color?: string;
          accent_color?: string;
          google_sheets_id?: string | null;
          sheets_tab_vip?: string;
          sheets_tab_standard?: string;
          sheets_tabs?: { name: string; line: string }[] | null;
          whatsapp_phone_id?: string | null;
          whatsapp_token?: string | null;
          meta_verify_token?: string | null;
          working_hours_start?: string;
          working_hours_end?: string;
          timezone?: string;
          commission_sale_pct?: number;
          commission_rent_pct?: number;
          plan?: string;
          plan_expires_at?: string | null;
          active?: boolean;
        };
        Update: {
          name?: string;
          agent_name?: string;
          logo_url?: string | null;
          primary_color?: string;
          accent_color?: string;
          google_sheets_id?: string | null;
          sheets_tab_vip?: string;
          sheets_tab_standard?: string;
          sheets_tabs?: { name: string; line: string }[] | null;
          last_sheets_sync?: string | null;
          whatsapp_phone_id?: string | null;
          whatsapp_token?: string | null;
          meta_verify_token?: string | null;
          working_hours_start?: string;
          working_hours_end?: string;
          timezone?: string;
          commission_sale_pct?: number;
          commission_rent_pct?: number;
          plan?: string;
          plan_expires_at?: string | null;
          active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── WORKSPACE_MEMBERS ──────────────────────────────────
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          email: string;
          phone: string | null;
          role: string;
          specialty: string[];
          active: boolean;
          created_at: string;
        };
        Insert: {
          workspace_id: string;
          name: string;
          email: string;
          phone?: string | null;
          role?: string;
          specialty?: string[];
          active?: boolean;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          role?: string;
          specialty?: string[];
          active?: boolean;
        };
        Relationships: [];
      };

      // ── LEADS ──────────────────────────────────────────────
      leads: {
        Row: {
          id: string;
          workspace_id: string | null;
          name: string | null;
          phone: string | null;
          email: string | null;
          source: string;
          status: string;
          segment: string | null;
          language: string;
          intent: string | null;
          property_type: string | null;
          location_preference: string | null;
          budget_min: number | null;
          budget_max: number | null;
          urgency: string | null;
          score: number;
          ai_summary: string | null;
          ai_qualification: Record<string, unknown> | null;
          assigned_agent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          workspace_id?: string | null;
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          source?: string;
          status?: string;
          segment?: string | null;
          language?: string;
          intent?: string | null;
          property_type?: string | null;
          location_preference?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          urgency?: string | null;
          score?: number;
          ai_summary?: string | null;
          ai_qualification?: Record<string, unknown> | null;
          assigned_agent_id?: string | null;
        };
        Update: {
          workspace_id?: string | null;
          name?: string | null;
          phone?: string | null;
          email?: string | null;
          source?: string;
          status?: string;
          segment?: string | null;
          language?: string;
          intent?: string | null;
          property_type?: string | null;
          location_preference?: string | null;
          budget_min?: number | null;
          budget_max?: number | null;
          urgency?: string | null;
          score?: number;
          ai_summary?: string | null;
          ai_qualification?: Record<string, unknown> | null;
          assigned_agent_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── PROPERTIES ─────────────────────────────────────────
      properties: {
        Row: {
          id: string;
          workspace_id: string | null;
          title: string;
          description: string | null;
          ai_description: string | null;
          type: string;
          operation: string;
          line: string;
          status: string;
          price: number;
          area_m2: number | null;
          bedrooms: number | null;
          bathrooms: number | null;
          parking: number | null;
          address: string | null;
          neighborhood: string | null;
          city: string;
          features: string[];
          photos_album_url: string | null;
          cover_photo_url: string | null;
          canva_story_url: string | null;
          external_code: string | null;
          sheets_row_id: string | null;
          notes: string | null;
          agent_id: string | null;
          synced_at: string | null;
          created_at: string;
        };
        Insert: {
          workspace_id?: string | null;
          title: string;
          description?: string | null;
          ai_description?: string | null;
          type: string;
          operation: string;
          line?: string;
          status?: string;
          price: number;
          area_m2?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          parking?: number | null;
          address?: string | null;
          neighborhood?: string | null;
          city?: string;
          features?: string[];
          photos_album_url?: string | null;
          cover_photo_url?: string | null;
          external_code?: string | null;
          sheets_row_id?: string | null;
          notes?: string | null;
          agent_id?: string | null;
          synced_at?: string | null;
        };
        Update: {
          workspace_id?: string | null;
          title?: string;
          description?: string | null;
          ai_description?: string | null;
          type?: string;
          operation?: string;
          line?: string;
          status?: string;
          price?: number;
          area_m2?: number | null;
          bedrooms?: number | null;
          bathrooms?: number | null;
          parking?: number | null;
          address?: string | null;
          neighborhood?: string | null;
          city?: string;
          features?: string[];
          photos_album_url?: string | null;
          cover_photo_url?: string | null;
          external_code?: string | null;
          notes?: string | null;
          agent_id?: string | null;
          synced_at?: string | null;
        };
        Relationships: [];
      };

      // ── VISITS ─────────────────────────────────────────────
      visits: {
        Row: {
          id: string;
          workspace_id: string;
          lead_id: string;
          property_id: string | null;
          property_external_code: string | null;
          scheduled_at: string;
          duration_minutes: number;
          status: string;
          google_calendar_event_id: string | null;
          reminder_sent: boolean;
          notes: string | null;
          assigned_member_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          workspace_id: string;
          lead_id: string;
          property_id?: string | null;
          property_external_code?: string | null;
          scheduled_at: string;
          duration_minutes?: number;
          status?: string;
          google_calendar_event_id?: string | null;
          reminder_sent?: boolean;
          notes?: string | null;
          assigned_member_id?: string | null;
        };
        Update: {
          status?: string;
          google_calendar_event_id?: string | null;
          reminder_sent?: boolean;
          notes?: string | null;
          assigned_member_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── ALLIANCES ──────────────────────────────────────────
      alliances: {
        Row: {
          id: string;
          workspace_id: string | null;
          broker_name: string;
          broker_phone: string | null;
          broker_email: string | null;
          commission_split: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          workspace_id?: string | null;
          broker_name: string;
          broker_phone?: string | null;
          broker_email?: string | null;
          commission_split?: number;
          active?: boolean;
        };
        Update: {
          broker_name?: string;
          broker_phone?: string | null;
          broker_email?: string | null;
          commission_split?: number;
          active?: boolean;
        };
        Relationships: [];
      };

      // ── DEALS ──────────────────────────────────────────────
      deals: {
        Row: {
          id: string;
          workspace_id: string | null;
          lead_id: string;
          property_id: string;
          agent_id: string;
          alliance_id: string | null;
          stage: string;
          offer_price: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          workspace_id?: string | null;
          lead_id: string;
          property_id: string;
          agent_id: string;
          alliance_id?: string | null;
          stage?: string;
          offer_price?: number | null;
          notes?: string | null;
        };
        Update: {
          workspace_id?: string | null;
          lead_id?: string;
          property_id?: string;
          agent_id?: string;
          alliance_id?: string | null;
          stage?: string;
          offer_price?: number | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── CONVERSATIONS ──────────────────────────────────────
      conversations: {
        Row: {
          id: string;
          workspace_id: string | null;
          lead_id: string | null;
          channel: string;
          phone: string | null;
          state: Record<string, unknown>;
          messages: unknown[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          workspace_id?: string | null;
          lead_id?: string | null;
          channel: string;
          phone?: string | null;
          state?: Record<string, unknown>;
          messages?: unknown[];
        };
        Update: {
          workspace_id?: string | null;
          lead_id?: string | null;
          channel?: string;
          phone?: string | null;
          state?: Record<string, unknown>;
          messages?: unknown[];
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── ACTIVITIES ─────────────────────────────────────────
      activities: {
        Row: {
          id: string;
          workspace_id: string | null;
          lead_id: string;
          type: string;
          content: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          workspace_id?: string | null;
          lead_id: string;
          type: string;
          content?: string | null;
          created_by?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      // ── AGENT_LOGS ─────────────────────────────────────────
      agent_logs: {
        Row: {
          id: string;
          workspace_id: string | null;
          agent: string;
          conversation_id: string | null;
          lead_id: string | null;
          input: Record<string, unknown>;
          output: Record<string, unknown>;
          model: string;
          prompt_tokens: number | null;
          completion_tokens: number | null;
          latency_ms: number | null;
          error: string | null;
          created_at: string;
        };
        Insert: {
          workspace_id?: string | null;
          agent: string;
          conversation_id?: string | null;
          lead_id?: string | null;
          input: Record<string, unknown>;
          output: Record<string, unknown>;
          model: string;
          prompt_tokens?: number | null;
          completion_tokens?: number | null;
          latency_ms?: number | null;
          error?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      // ── AGENT_EVALS ────────────────────────────────────────
      agent_evals: {
        Row: {
          id: string;
          workspace_id: string | null;
          agent: string;
          log_id: string | null;
          label: string;
          note: string | null;
          expected_output: Record<string, unknown> | null;
          tagged_by: string | null;
          created_at: string;
        };
        Insert: {
          workspace_id?: string | null;
          agent: string;
          log_id?: string | null;
          label: string;
          note?: string | null;
          expected_output?: Record<string, unknown> | null;
          tagged_by?: string | null;
        };
        Update: {
          label?: string;
          note?: string | null;
          expected_output?: Record<string, unknown> | null;
          tagged_by?: string | null;
        };
        Relationships: [];
      };

      // ── AGENT_APPROVALS ────────────────────────────────────
      agent_approvals: {
        Row: {
          id: string;
          workspace_id: string | null;
          agent: string;
          lead_id: string | null;
          deal_id: string | null;
          action: string;
          payload: Record<string, unknown>;
          reason: string | null;
          status: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          workspace_id?: string | null;
          agent: string;
          lead_id?: string | null;
          deal_id?: string | null;
          action: string;
          payload: Record<string, unknown>;
          reason?: string | null;
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          expires_at?: string | null;
        };
        Update: {
          status?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Relationships: [];
      };

      // ── AGENTS (legacy — reemplazado por workspace_members) ─
      agents: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          specialty: string[];
          active_leads_count: number;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          phone?: string | null;
          specialty?: string[];
          active_leads_count?: number;
        };
        Update: {
          name?: string;
          email?: string;
          phone?: string | null;
          specialty?: string[];
          active_leads_count?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

// ── Tipos de conveniencia ──────────────────────────────────────

export type Workspace = Database["public"]["Tables"]["workspaces"]["Row"];
export type WorkspaceMember = Database["public"]["Tables"]["workspace_members"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Deal = Database["public"]["Tables"]["deals"]["Row"];
export type Visit = Database["public"]["Tables"]["visits"]["Row"];
export type AgentLog = Database["public"]["Tables"]["agent_logs"]["Row"];
export type AgentApproval = Database["public"]["Tables"]["agent_approvals"]["Row"];
