import AgentChat from "./agent-chat";

export default function TestAgentPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-8 py-5 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <div>
            <h1 className="text-base font-semibold text-gray-900">Prueba del agente</h1>
            <p className="text-xs text-gray-400">Simula una conversación de WhatsApp — los leads se crean en el CRM</p>
          </div>
        </div>
      </div>
      <AgentChat />
    </div>
  );
}
