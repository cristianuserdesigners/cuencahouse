"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

const WORKSPACE_ID = "9a67ad1f-2b8d-455a-bcd1-e49eb7e57951";

export default function SyncButton() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [result, setResult] = useState<string>("");

  async function handleSync() {
    setStatus("loading");
    setResult("");
    try {
      const res = await fetch(`/api/workspaces/${WORKSPACE_ID}/sync-sheets`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok) {
        setStatus("ok");
        setResult(`${data.upserted} propiedades sincronizadas`);
        // Recargar la página para ver los cambios
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setStatus("error");
        setResult(data.error ?? "Error desconocido");
      }
    } catch {
      setStatus("error");
      setResult("No se pudo conectar al servidor");
    }
  }

  return (
    <div className="flex items-center gap-2">
      {result && (
        <span className={`text-xs ${status === "ok" ? "text-green-600" : "text-red-500"}`}>
          {result}
        </span>
      )}
      <button
        onClick={handleSync}
        disabled={status === "loading"}
        className="flex items-center gap-2 px-3 py-2.5 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${status === "loading" ? "animate-spin" : ""}`} />
        {status === "loading" ? "Sincronizando..." : "Sync Sheets"}
      </button>
    </div>
  );
}
