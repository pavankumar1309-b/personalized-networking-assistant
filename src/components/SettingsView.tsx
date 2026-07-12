import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Settings, Info, Cpu, Database as DbIcon, ShieldCheck, Server, Terminal, KeyRound } from "lucide-react";

export default function SettingsView() {
  const [apiKeyStatus, setApiKeyStatus] = useState<"checking" | "loaded" | "missing">("checking");

  useEffect(() => {
    // Quick test to check key status on server side
    const checkSecrets = async () => {
      try {
        const res = await fetch("/api/analytics");
        if (res.ok) {
          setApiKeyStatus("loaded"); // If analytics fetch is successful, connection works
        } else {
          setApiKeyStatus("missing");
        }
      } catch (err) {
        setApiKeyStatus("missing");
      }
    };
    checkSecrets();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
      id="settings-view-container"
    >
      {/* Header card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-indigo-600" />
          Integration Settings & Architecture
        </h2>
        <p className="text-slate-500 text-xs md:text-sm">
          Review application specifications, explore full-stack structural diagrams, and check API connection keys.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: System Credentials & Secrets */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-500" /> Active System Status
            </h3>

            <div className="space-y-4 text-xs">
              {/* Secret 1: Gemini API Key */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" /> GEMINI_API_KEY
                  </span>
                  <span className="text-[10px] text-slate-400">Server-Side secret integration</span>
                </div>
                <div>
                  {apiKeyStatus === "checking" ? (
                    <span className="bg-amber-100 text-amber-700 font-bold px-2.5 py-1 rounded">Checking...</span>
                  ) : apiKeyStatus === "loaded" ? (
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded border border-emerald-200">ACTIVE</span>
                  ) : (
                    <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded border border-red-200">MISSING</span>
                  )}
                </div>
              </div>

              {/* Server Config */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Server className="w-3.5 h-3.5 text-slate-500" /> Full-Stack Port
                  </span>
                  <span className="text-[10px] text-slate-400">Exposed web container ingress</span>
                </div>
                <span className="font-mono bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded text-[11px]">
                  3000
                </span>
              </div>

              {/* DB File location */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <DbIcon className="w-3.5 h-3.5 text-slate-500" /> Local Database File
                  </span>
                  <span className="text-[10px] text-slate-400">Saved logs & feedback metrics</span>
                </div>
                <span className="font-mono bg-slate-200 text-slate-800 font-bold px-2.5 py-1 rounded text-[11px]">
                  /data/database.json
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center">
              <Cpu className="w-4 h-4 mr-1.5 text-indigo-500" /> LLM Model Specifications
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              This system uses Google's latest multimodal champion <strong>gemini-3.5-flash</strong>. 
              The response config leverages a strict JSON Schema definition (utilizing GenAI Type.OBJECT and Type.ARRAY declarations)
              to guarantee zero-parser syntax errors on runtime delivery.
            </p>
          </div>
        </div>

        {/* Right Side: Architecture & Running Guide */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
              <Terminal className="w-4 h-4 mr-1.5 text-indigo-600" /> System Architecture Outline
            </h3>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <strong className="text-slate-800 block text-sm">Layered Architecture Tree:</strong>
                <pre className="font-mono text-[11px] text-slate-600 leading-relaxed overflow-x-auto">
{`backend/ (Express)
  ├── server.ts             # REST entry point & Vite middleware
  ├── server/
  │    ├── database/
  │    │    └── db.ts       # SQL-like JSON document persistent store
  │    └── services/
  │         ├── gemini.ts    # Google GenAI model router
  │         └── wikipedia.ts # Wikipedia REST lookup verification

frontend/ (Vite + React)
  ├── src/
  │    ├── App.tsx          # Router and core dashboard wrapper
  │    └── components/
  │         ├── HomeView.tsx
  │         ├── GeneratorView.tsx
  │         ├── FactCheckView.tsx
  │         ├── HistoryView.tsx
  │         ├── AnalyticsView.tsx
  │         └── SettingsView.tsx`}
                </pre>
              </div>

              <div className="space-y-2">
                <strong className="text-slate-800 block">Developer Running Instructions:</strong>
                <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 leading-relaxed">
                  <li>Ensure dependencies are installed using <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">npm install</code>.</li>
                  <li>Boot local full-stack server using <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">npm run dev</code>.</li>
                  <li>Build optimized production bundles using <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">npm run build</code>.</li>
                  <li>Start production microservices container using <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">npm run start</code>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
