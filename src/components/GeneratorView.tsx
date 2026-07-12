import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageSquare, Briefcase, Target, Plus, X, Copy, ThumbsUp, ThumbsDown, Loader2, Sparkle, Tag, Cpu, Building2, HelpCircle } from "lucide-react";
import { ConversationStarter } from "../types";

interface GeneratorViewProps {
  onRefreshAnalytics: () => void;
}

interface EventAnalysis {
  themes: string[];
  keywords: string[];
  technologies: string[];
  industries: string[];
}

export default function GeneratorView({ onRefreshAnalytics }: GeneratorViewProps) {
  // Inputs
  const [eventDescription, setEventDescription] = useState("");
  const [profession, setProfession] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState("");
  const [goal, setGoal] = useState("");

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedId, setGeneratedId] = useState<string | null>(null);
  const [starters, setStarters] = useState<ConversationStarter[]>([]);
  const [analysis, setAnalysis] = useState<EventAnalysis | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeExpanderId, setActiveExpanderId] = useState<string | null>(null);

  // Interest tags management
  const addInterest = () => {
    const trimmed = currentInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
      setCurrentInterest("");
    }
  };

  const removeInterest = (item: string) => {
    setInterests(interests.filter((i) => i !== item));
  };

  const handleInterestKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addInterest();
    }
  };

  // Pre-populate standard example
  const prePopulateExample = () => {
    setEventDescription("AI for Sustainable Cities");
    setProfession("Software Engineer");
    setInterests(["AI", "Climate Change", "Urban Planning"]);
    setGoal("Meet researchers and city planning innovators");
    setError(null);
  };

  // Run generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDescription.trim()) {
      setError("Please describe the event or conference topic.");
      return;
    }
    if (!profession.trim()) {
      setError("Please provide your current profession/role.");
      return;
    }
    if (!goal.trim()) {
      setError("Please provide your core networking goal.");
      return;
    }

    setLoading(true);
    setError(null);
    setStarters([]);
    setAnalysis(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_description: eventDescription,
          profession,
          interests,
          goal,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate starters.");
      }

      const data = await response.json();
      setGeneratedId(data.id);
      setStarters(data.conversation_starters || []);
      setAnalysis({
        themes: data.themes || [],
        keywords: data.keywords || [],
        technologies: data.technologies || [],
        industries: data.industries || [],
      });

      // Expand first starter automatically
      if (data.conversation_starters && data.conversation_starters.length > 0) {
        setActiveExpanderId(data.conversation_starters[0].id);
      }

      onRefreshAnalytics();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setLoading(false);
    }
  };

  // Submit feedback
  const handleFeedback = async (starterId: string, type: "helpful" | "not_helpful") => {
    if (!generatedId) return;

    // Optimistic UI update
    setStarters((prev) =>
      prev.map((s) => {
        if (s.id === starterId) {
          // Toggle feedback if clicked again
          const newFeedback = s.feedback === type ? null : type;
          return { ...s, feedback: newFeedback };
        }
        return s;
      })
    );

    try {
      const targetStarter = starters.find((s) => s.id === starterId);
      const isRemoving = targetStarter?.feedback === type;
      
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId: generatedId,
          starterId,
          feedback: isRemoving ? null : type,
        }),
      });
      onRefreshAnalytics();
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    }
  };

  // Copy to clipboard
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      id="generator-view-container"
    >
      {/* Inputs Form card */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
              Generator Inputs
            </h2>
            <button
              type="button"
              id="try-example-btn"
              onClick={prePopulateExample}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Try an Example
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4" id="starter-form">
            {/* Event description */}
            <div className="space-y-1">
              <label htmlFor="event-description" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Event Description
              </label>
              <textarea
                id="event-description"
                rows={3}
                placeholder="e.g. AI for Sustainable Cities. What is the event about? Paste details or describe."
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
              />
            </div>

            {/* Profession */}
            <div className="space-y-1">
              <label htmlFor="user-profession" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Your Profession / Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="user-profession"
                  type="text"
                  placeholder="e.g. Software Engineer, Tech Founder, Student"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Interest Tags */}
            <div className="space-y-1">
              <label htmlFor="user-interests" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Interests / Specialties
              </label>
              <div className="flex gap-2">
                <input
                  id="user-interests"
                  type="text"
                  placeholder="Add an interest and press Add/Enter"
                  value={currentInterest}
                  onChange={(e) => setCurrentInterest(e.target.value)}
                  onKeyDown={handleInterestKeyDown}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 rounded-lg border border-slate-200 transition-colors flex items-center justify-center shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Tag render */}
              {interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5" id="interests-tag-cloud">
                  {interests.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-md pl-2.5 pr-1.5 py-1 border border-indigo-100"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeInterest(tag)}
                        className="ml-1.5 text-indigo-400 hover:text-indigo-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Networking Goal */}
            <div className="space-y-1">
              <label htmlFor="networking-goal" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                Networking Goal
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="networking-goal"
                  type="text"
                  placeholder="e.g. Find research collaborators, meet hiring managers"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200 text-xs font-semibold" id="generation-form-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-indigo-100 flex items-center justify-center ${
                loading ? "bg-indigo-400 cursor-not-allowed opacity-85" : "hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Conversation Starters
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Output Results card */}
      <div className="lg:col-span-7">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm h-full flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]"
            >
              <div className="p-4 bg-indigo-50 rounded-full animate-pulse">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Conducting Event Semantic Analysis</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  Gemini is digesting the event brief, mining key theme clusters, identifying industry vectors, and building custom starters...
                </p>
              </div>
              {/* Fake progress bar loading animation */}
              <div className="w-full max-w-xs bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="bg-indigo-600 h-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          ) : starters.length > 0 ? (
            <motion.div
              key="results-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Event Analysis Dashboard Segment */}
              {analysis && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4" id="event-analysis-card">
                  <h3 className="text-base font-bold text-slate-900 flex items-center border-b border-slate-100 pb-3">
                    <Sparkle className="w-4 h-4 mr-2 text-indigo-500 animate-pulse" />
                    Semantic Event Analysis (Gemini-3.5-flash)
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Themes */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-500 flex items-center uppercase tracking-wider">
                        <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" /> Major Themes
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.themes.map((t, i) => (
                          <span key={i} className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-lg border border-indigo-100">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-500 flex items-center uppercase tracking-wider">
                        <Tag className="w-3.5 h-3.5 mr-1 text-slate-400" /> Keywords & Topics
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.keywords.map((k, i) => (
                          <span key={i} className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-lg border border-emerald-100">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Technologies */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-500 flex items-center uppercase tracking-wider">
                        <Cpu className="w-3.5 h-3.5 mr-1 text-slate-400" /> Key Technologies
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.technologies.length > 0 ? (
                          analysis.technologies.map((tech, i) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-700 font-medium px-2.5 py-1 rounded-lg border border-blue-100">
                              {tech}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None identified</span>
                        )}
                      </div>
                    </div>

                    {/* Industries */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-500 flex items-center uppercase tracking-wider">
                        <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" /> Key Industries
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analysis.industries.length > 0 ? (
                          analysis.industries.map((ind, i) => (
                            <span key={i} className="text-xs bg-amber-50 text-amber-700 font-medium px-2.5 py-1 rounded-lg border border-amber-100">
                              {ind}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None identified</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Starters list */}
              <div className="space-y-3" id="generated-starters-list">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2 text-indigo-600" />
                    Personalized Conversation Starters
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Click to expand/collapse</span>
                </div>

                {starters.map((starter) => {
                  const isOpen = activeExpanderId === starter.id;
                  const isHelpful = starter.feedback === "helpful";
                  const isNotHelpful = starter.feedback === "not_helpful";

                  return (
                    <div
                      key={starter.id}
                      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isOpen ? "border-slate-300 shadow-md" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {/* Expander Header */}
                      <button
                        type="button"
                        onClick={() => setActiveExpanderId(isOpen ? null : starter.id)}
                        className="w-full text-left p-5 flex items-start justify-between gap-4 outline-none hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-1 flex-1">
                          <p className="font-bold text-slate-900 text-sm leading-relaxed pr-6">{starter.text}</p>
                          <div className="flex items-center gap-3 pt-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              Match Recommendation
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                                <div
                                  className="bg-indigo-600 h-full rounded-full"
                                  style={{ width: `${starter.confidenceScore}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{starter.confidenceScore}%</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-slate-400 self-center text-sm font-semibold">
                          {isOpen ? "Collapse" : "Expand"}
                        </div>
                      </button>

                      {/* Expander Body */}
                      {isOpen && (
                        <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-4 text-xs">
                          {/* Copy Starter */}
                          <div className="flex items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                            <code className="text-slate-800 text-xs font-medium font-sans flex-1 select-all">
                              "{starter.text}"
                            </code>
                            <button
                              type="button"
                              onClick={() => handleCopy(starter.text, starter.id)}
                              className="text-indigo-600 hover:text-indigo-500 font-bold flex items-center gap-1 transition-colors bg-indigo-50/50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg shrink-0 border border-indigo-100"
                            >
                              {copiedId === starter.id ? (
                                "Copied!"
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" /> Copy
                                </>
                              )}
                            </button>
                          </div>

                          {/* Relevance details */}
                          <div className="space-y-1">
                            <h4 className="font-bold text-slate-700 uppercase tracking-wide">Why it works:</h4>
                            <p className="text-slate-600 leading-relaxed text-xs">{starter.relevance}</p>
                          </div>

                          {/* Feedback segment */}
                          <div className="flex items-center justify-between border-t border-slate-200 pt-3.5">
                            <span className="text-slate-500 font-medium">Was this AI recommendation helpful?</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleFeedback(starter.id, "helpful")}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                  isHelpful
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200"
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" /> Helpful
                              </button>
                              <button
                                type="button"
                                onClick={() => handleFeedback(starter.id, "not_helpful")}
                                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                  isNotHelpful
                                    ? "bg-red-500 text-white border-red-500"
                                    : "bg-white text-slate-700 border-slate-200 hover:bg-red-50 hover:border-red-200"
                                }`}
                              >
                                <ThumbsDown className="w-3.5 h-3.5" /> Not Helpful
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm h-full flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]"
            >
              <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="text-base font-bold text-slate-900">No Generated Starters</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Fill in the event brief, input your professional background, goals, and interests, and hit generate. Let Gemini build your conversation playbook!
                </p>
              </div>
              <button
                type="button"
                onClick={prePopulateExample}
                className="text-xs font-bold text-indigo-600 hover:underline"
              >
                Or pre-populate example data
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
