// Tipos manuales — regenerar con: npx supabase gen types typescript --local > src/lib/supabase/types.ts
export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string;
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
      properties: {
        Row: {
          id: string;
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
          agent_id: string | null;
          created_at: string;
        };
        Insert: {
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
          agent_id?: string | null;
        };
        Update: {
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
          agent_id?: string | null;
        };
        Relationships: [];
      };
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
      alliances: {
        Row: {
          id: string;
          broker_name: string;
          broker_phone: string | null;
          broker_email: string | null;
          commission_split: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
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
      deals: {
        Row: {
          id: string;
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
          lead_id: string;
          property_id: string;
          agent_id: string;
          alliance_id?: string | null;
          stage?: string;
          offer_price?: number | null;
          notes?: string | null;
        };
        Update: {
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
      conversations: {
        Row: {
          id: string;
          lead_id: string | null;
          channel: string;
          phone: string | null;
          state: Record<string, unknown>;
          messages: unknown[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          lead_id?: string | null;
          channel: string;
          phone?: string | null;
          state?: Record<string, unknown>;
          messages?: unknown[];
        };
        Update: {
          lead_id?: string | null;
          channel?: string;
          phone?: string | null;
          state?: Record<string, unknown>;
          messages?: unknown[];
          updated_at?: string;
        };
        Relationships: [];
      };
      activities: {
        Row: {
          id: string;
          lead_id: string;
          type: string;
          content: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          lead_id: string;
          type: string;
          content?: string | null;
          created_by?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      agent_logs: {
        Row: {
          id: string;
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
      agent_evals: {
        Row: {
          id: string;
          agent: string;
          log_id: string | null;
          label: string;
          note: string | null;
          expected_output: Record<string, unknown> | null;
          tagged_by: string | null;
          created_at: string;
        };
        Insert: {
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
      agent_approvals: {
        Row: {
          id: string;
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
