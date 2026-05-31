export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type LeadQualificationData = {
  intent: "buy" | "sell" | "rent" | "invest";
  property_type: "apartment" | "house" | "land" | "office" | "commercial";
  location_preference: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: "immediate" | "1_3m" | "3_6m" | "6m_plus";
  segment: "local" | "expat" | "investor" | "b2b";
  language: "es" | "en";
  client_name?: string | null;
  // Expat-only
  is_remote_purchase?: boolean | null;
  has_residency?: boolean | null;
};

export type ConversationStep = "greeting" | "qualifying" | "qualified" | "handoff";

export type ConversationState = {
  step: ConversationStep;
  collected: Partial<LeadQualificationData>;
  turn_count: number;
  language: "es" | "en";
};

export type QualifierInput = {
  conversationId: string;
  workspaceId?: string;
  leadId?: string;
  phone?: string;
  channel: "whatsapp" | "web";
  source?: string;
  messages: ConversationMessage[];
  state: ConversationState;
};

export type QualifierAction =
  | "ask_next"
  | "qualified"
  | "show_properties"
  | "schedule_visit"
  | "escalate"
  | "needs_clarification";

// Raw JSON response from Claude
export type RawQualifierResponse = {
  message: string;
  action: QualifierAction;
  extracted_data: Partial<LeadQualificationData>;
};

export type QualifierOutput = {
  action: QualifierAction;
  message: string;
  extracted_data: Partial<LeadQualificationData>;
  updated_state: ConversationState;
  score: number;
};

// What gets written to the leads table when action === "qualified"
export type QualifiedLeadPayload = {
  intent: string;
  property_type: string;
  location_preference: string;
  budget_min: number | null;
  budget_max: number | null;
  urgency: string;
  segment: string;
  language: string;
  score: number;
  ai_summary: string;
  ai_qualification: Partial<LeadQualificationData>;
};
