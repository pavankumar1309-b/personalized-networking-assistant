import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Globe, Calendar, ArrowUpRight, HelpCircle, AlertCircle, Loader2, BookOpen } from "lucide-react";
import { FactCheckResult } from "../types";

export default function FactCheckView() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleTopics = [
    "Blockchain in Healthcare",
    "Smart Cities & Urban Planning",
    "AI Safety Alignment",
    "Carbon Capture Technology",
    "Quantum Cryptography",
  ];

  const handleSearch = async (searchTopic: string) => {
    const cleanTopic = searchTopic.trim();
    if (!cleanTopic) return;

    setTopic(cleanTopic);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/factcheck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: cleanTopic }),
      });

      if (!response.ok) {
        throw new Error("Failed to search Wikipedia. Please try again.");
      }

      const data: FactCheckResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto space-y-6"
      id="factcheck-view-container"
    >
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-2">
        <h2 className="text-xl font-bold text-slate-900 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
          Wikipedia Fact Verification
        </h2>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
          Verify technologies, concepts, or technical terms mentioned in conference itineraries. 
          Query Wikipedia synchronously to obtain verified summaries, desktop source links, and article modification timestamps.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(topic);
          }}
          className="flex flex-col md:flex-row gap-3"
          id="factcheck-search-form"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
            <input
              id="factcheck-topic-input"
              type="text"
              placeholder="e.g. Smart Cities, Zero Knowledge Proofs..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`py-2.5 px-6 rounded-lg text-sm font-bold text-white transition-all shadow-lg shadow-indigo-100 flex items-center justify-center shrink-0 ${
              loading
                ? "bg-indigo-400 cursor-not-allowed opacity-85"
                : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              "Verify Topic"
            )}
          </button>
        </form>

        {/* Suggestion tags */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Popular Topics to Verify:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleTopics.map((item, idx) => (
              <button
                key={idx}
                type="button"
                id={`sample-topic-pill-${idx}`}
                onClick={() => handleSearch(item)}
                className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Rendering */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="fact-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4"
          >
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm">Consulting Wikipedia databases...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="fact-error"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-red-50 text-red-800 p-4 rounded-2xl border border-red-200 flex items-start gap-3 text-xs md:text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold mb-1">Search Error</h4>
              <p>{error}</p>
            </div>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="fact-result"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6"
            id="factcheck-result-card"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                  Verified Fact Entry
                </span>
                <h3 className="text-xl font-bold text-slate-900">{result.title}</h3>
              </div>
              <Globe className="w-5 h-5 text-slate-400 self-center" />
            </div>

            {/* Main content body */}
            <div className="space-y-4">
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                {result.summary}
              </p>

              {/* Meta tags details (source, modified date) */}
              {result.found && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Last updated: <strong className="text-slate-700">{result.lastUpdated}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span>
                      Source:{" "}
                      <a
                        id="factcheck-source-link"
                        href={result.sourceUrl}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        className="text-indigo-600 hover:underline font-semibold inline-flex items-center"
                      >
                        Wikipedia.org <ArrowUpRight className="w-3 h-3 ml-0.5" />
                      </a>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
