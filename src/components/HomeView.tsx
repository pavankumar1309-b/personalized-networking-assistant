import React from "react";
import { motion } from "motion/react";
import { Sparkles, CheckCircle, Search, History, BarChart3, Settings as SettingsIcon, MessageSquareCode } from "lucide-react";

interface HomeViewProps {
  onNavigate: (tab: string) => void;
  analytics: {
    totalConversations: number;
    helpfulPercentage: number;
    helpfulCount: number;
  };
}

export default function HomeView({ onNavigate, analytics }: HomeViewProps) {
  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
      title: "AI-Powered Event Analysis",
      desc: "Instantly dissect event prompts to map keywords, extract core semantic themes, and discover target industries or technologies.",
      tab: "generate",
    },
    {
      icon: <MessageSquareCode className="w-6 h-6 text-emerald-500" />,
      title: "Personalized Starters",
      desc: "Generate smart, custom-tailored conversation starters linking your exact career background and interests with event topics.",
      tab: "generate",
    },
    {
      icon: <Search className="w-6 h-6 text-blue-500" />,
      title: "Fact-Check Topic Verification",
      desc: "Real-time fact verification integrated directly with the Wikipedia API to retrieve summaries, timestamps, and page links.",
      tab: "factcheck",
    },
    {
      icon: <History className="w-6 h-6 text-amber-500" />,
      title: "Active History Logs",
      desc: "Keep a localized record of every generated pitch. Easily browse, query, filter by interest, or clear historic logs.",
      tab: "history",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-purple-500" />,
      title: "Analytics Dashboard",
      desc: "Track networking performance, check total interactions, and analyze user feedback scores and percentages.",
      tab: "analytics",
    },
    {
      icon: <SettingsIcon className="w-6 h-6 text-slate-500" />,
      title: "Integration Configuration",
      desc: "Verify active secrets, review the backend services architecture, and read system operating guidelines.",
      tab: "settings",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-8"
      id="home-view-container"
    >
      {/* Hero Welcome banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-8 md:p-12 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-3xl space-y-4">
          <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-indigo-500/30">
            Next-Gen Networking Co-Pilot
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Personalized Networking Assistant
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-2xl">
            Empower your professional and social interactions. Using advanced Generative AI and real-time knowledge bases,
            create bespoke conversation starters, analyze events, and turn every room you enter into a network of opportunities.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <button
              id="get-started-button"
              onClick={() => onNavigate("generate")}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Generate Starters Now
            </button>
            <button
              id="fact-check-learn-button"
              onClick={() => onNavigate("factcheck")}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition-all duration-200"
            >
              Verify a Topic
            </button>
          </div>
        </div>
      </div>

      {/* Streamlit-style Metric columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="home-metrics-grid">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between" id="metric-card-total-conversations">
          <div>
            <span className="text-slate-500 text-sm font-semibold">Total Saved Sessions</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">{analytics.totalConversations}</h2>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs text-emerald-600 font-medium">
            <CheckCircle className="w-4 h-4 mr-1" /> Persistent SQLite Store
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between" id="metric-card-helpful-rate">
          <div>
            <span className="text-slate-500 text-sm font-semibold">Helpful Feedback Rate</span>
            <h2 className="text-4xl font-extrabold text-indigo-600 mt-2">{analytics.helpfulPercentage}%</h2>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-500">
            Based on thumb ratings of active users
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between" id="metric-card-ai-engine">
          <div>
            <span className="text-slate-500 text-sm font-semibold">AI Inference Engine</span>
            <h2 className="text-2xl font-bold text-slate-800 mt-3 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-500 animate-pulse" />
              Gemini 3.5 Flash
            </h2>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-xs text-indigo-600 font-medium">
            Active server-side API routing
          </div>
        </div>
      </div>

      {/* Feature cards Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center">
          <MessageSquareCode className="w-5 h-5 mr-2 text-indigo-600" />
          Interactive Capabilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="home-features-grid">
          {features.map((feat, idx) => (
            <div
              key={idx}
              id={`feature-card-${idx}`}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow hover:border-slate-300 flex flex-col justify-between cursor-pointer group"
              onClick={() => onNavigate(feat.tab)}
            >
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg w-fit group-hover:bg-indigo-50 transition-colors">
                  {feat.icon}
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {feat.title}
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">{feat.desc}</p>
              </div>
              <div className="mt-5 text-xs text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center">
                Launch tool &rarr;
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works segment */}
      <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200" id="home-how-it-works">
        <h3 className="text-lg font-bold text-slate-900 mb-6">How It Works (Under the Hood)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2 relative">
            <div className="absolute top-4 left-6 right-0 h-0.5 bg-slate-200 hidden md:block" />
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center relative z-10 text-sm">
              1
            </div>
            <h4 className="font-semibold text-slate-900 pt-1 text-sm">Semantic Extraction</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When you enter an event, Gemini models act as NLP layers to extract tech, industries, keywords, and themes instantly.
            </p>
          </div>

          <div className="space-y-2 relative">
            <div className="absolute top-4 left-6 right-0 h-0.5 bg-slate-200 hidden md:block" />
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center relative z-10 text-sm">
              2
            </div>
            <h4 className="font-semibold text-slate-900 pt-1 text-sm">Hyper-Personalization</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              The AI blends your career background, interest matrix, and goals with event themes to produce bespoke, high-confidence starters.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h4 className="font-semibold text-slate-900 pt-1 text-sm">Knowledge Grounding</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use Wikipedia searches to fact-check concepts or terms in the discussion, ensuring you have completely verified, accurate facts.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
