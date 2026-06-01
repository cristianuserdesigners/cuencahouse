"use client";

import { useState, useRef, useEffect } from "react";
import { Send, RotateCcw, User, Bot, TrendingUp, ThumbsUp, ThumbsDown } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  evalSent?: "good" | "bad";
};

type AgentResponse = {
  conversationId: string;
  reply: string;
  action: string;
  score: number;
  collected: Record<string, unknown>;
  turn: number;
};

export default function AgentChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ score: number; action: string; collected: Record<string, unknown> } | null>(null);
  const [evalCount, setEvalCount] = useState({ good: 0, bad: 0 });
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text, timestamp: new Date().toISOString() }]);
    setLoading(true);

    try {
      const res = await fetch("/api/agents/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: conversationId ?? undefined, channel: "web" }),
      });
      const data: AgentResponse = await res.json();
      setConversationId(data.conversationId);
      setMeta({ score: data.score, action: data.action, collected: data.collected });
      setMessages((m) => [...m, { role: "assistant", content: data.reply, timestamp: new Date().toISOString() }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Error al conectar con el agente.", timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  async function sendEval(msgIndex: number, label: "good" | "bad") {
    if (!conversationId) return;
    setMessages((m) => m.map((msg, i) => i === msgIndex ? { ...msg, evalSent: label } : msg));
    setEvalCount((c) => ({ ...c, [label]: c[label] + 1 }));
    await fetch("/api/agents/eval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, label }),
    });
  }

  function reset() {
    setMessages([]);
    setConversationId(null);
    setMeta(null);
    setInput("");
    inputRef.current?.focus();
  }

  const scoreColor = meta
    ? meta.score >= 70 ? "text-green-600 bg-green-50 border-green-200"
    : meta.score >= 40 ? "text-[#c9a84c] bg-yellow-50 border-yellow-200"
    : "text-gray-500 bg-gray-50 border-gray-200" : "";

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Chat */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 bg-gray-50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Bot className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400 font-medium">El agente está listo</p>
              <p className="text-xs text-gray-300 mt-1 max-w-xs">
                Prueba: "Hola, quiero comprar un departamento en El Batán" o "Hello, I'm looking to rent"
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5
                ${msg.role === "user" ? "bg-[#1a2744]" : "bg-[#c9a84c]"}`}>
                {msg.role === "user" ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className="flex flex-col gap-1 max-w-[75%]">
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap
                  ${msg.role === "user"
                    ? "bg-[#1a2744] text-white rounded-tr-sm"
                    : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-sm"}`}>
                  {msg.content}
                </div>
                {/* Thumbs solo en respuestas del agente */}
                {msg.role === "assistant" && (
                  <div className="flex gap-1 ml-1">
                    {msg.evalSent ? (
                      <span className={`text-xs ${msg.evalSent === "good" ? "text-green-500" : "text-red-400"}`}>
                        {msg.evalSent === "good" ? "👍 Marcado como bueno" : "👎 Marcado para mejorar"}
                      </span>
                    ) : (
                      <>
                        <button onClick={() => sendEval(i, "good")}
                          className="p-1 rounded-md text-gray-300 hover:text-green-500 hover:bg-green-50 transition-colors"
                          title="Buena respuesta">
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => sendEval(i, "bad")}
                          className="p-1 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                          title="Mejorar esta respuesta">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#c9a84c] flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <button onClick={reset} title="Nueva conversación"
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
            <input ref={inputRef} value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Escribe un mensaje... (Enter para enviar)"
              autoFocus
              className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a2744]/20 focus:border-[#1a2744] focus:bg-white transition-all" />
            <button onClick={send} disabled={!input.trim() || loading}
              className="p-2.5 bg-[#1a2744] text-white rounded-xl hover:bg-[#1a2744]/90 transition-colors disabled:opacity-40">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Panel lateral */}
      <div className="w-64 border-l border-gray-200 bg-white p-5 space-y-5 shrink-0 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Estado del lead</p>

        {!meta ? (
          <p className="text-xs text-gray-400">Empieza la conversación para ver el análisis en tiempo real.</p>
        ) : (
          <>
            <div className={`rounded-xl border p-4 text-center ${scoreColor}`}>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wide">Score</span>
              </div>
              <p className="text-3xl font-bold">{meta.score}</p>
              <p className="text-xs mt-0.5 opacity-70">
                {meta.score >= 70 ? "🔥 Hot" : meta.score >= 40 ? "🟡 Warm" : "❄️ Cold"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Acción</p>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                ${meta.action === "qualified" ? "bg-green-100 text-green-700"
                : meta.action === "escalate" ? "bg-orange-100 text-orange-700"
                : "bg-blue-100 text-blue-700"}`}>
                {meta.action === "qualified" ? "✅ Calificado"
                : meta.action === "escalate" ? "⚡ Escalar"
                : meta.action === "show_properties" ? "🏠 Mostrando props"
                : "💬 Conversando"}
              </span>
            </div>

            {Object.keys(meta.collected).length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Datos capturados</p>
                <div className="space-y-1.5">
                  {Object.entries(meta.collected).map(([k, v]) => v ? (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-gray-400 capitalize">{k.replace(/_/g, " ")}</span>
                      <span className="text-gray-700 font-medium text-right max-w-[110px] truncate">{String(v)}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
          </>
        )}

        {/* Evals de esta sesión */}
        {(evalCount.good > 0 || evalCount.bad > 0) && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Evals de esta sesión</p>
            <div className="flex gap-3 text-xs">
              <span className="text-green-600">👍 {evalCount.good} buenas</span>
              <span className="text-red-400">👎 {evalCount.bad} a mejorar</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Guardadas en Supabase para analizar</p>
          </div>
        )}
      </div>
    </div>
  );
}
