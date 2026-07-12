import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Trash2, Calendar, MessageSquare, Briefcase, Target, ChevronDown, ChevronUp, Copy, ThumbsUp, ThumbsDown, Filter, HelpCircle, Loader2 } from "lucide-react";
import { HistoryEntry } from "../types";

interface HistoryViewProps {
  onRefreshAnalytics: () => void;
}

export default function HistoryView({ onRefreshAnalytics }: HistoryViewProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch data
  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Build filter parameters
      let url = "/api/history";
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append("query", searchQuery.trim());
      }
      if (selectedInterests.length > 0) {
        params.append("interests", selectedInterests.join(","));
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch conversation history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [searchQuery, selectedInterests]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this conversation entry? This action is permanent.")) {
      return;
    }

    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
        if (expandedId === id) {
          setExpandedId(null);
        }
        onRefreshAnalytics();
      }
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  // Toggle feedback
  const handleFeedback = async (entryId: string, starterId: string, type: "helpful" | "not_helpful") => {
    const entry = history.find((e) => e.id === entryId);
    if (!entry) return;

    const starter = entry.starters.find((s) => s.id === starterId);
    if (!starter) return;

    const prevFeedback = starter.feedback;
    const newFeedback = prevFeedback === type ? null : type;

    // Local state update
    setHistory((prev) =>
      prev.map((e) => {
        if (e.id === entryId) {
          return {
            ...e,
            starters: e.starters.map((s) => {
              if (s.id === starterId) {
                return { ...s, feedback: newFeedback };
              }
              return s;
            }),
          };
        }
        return e;
      })
    );

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId,
          starterId,
          feedback: newFeedback,
        }),
      });
      onRefreshAnalytics();
    } catch (err) {
      console.error("Failed to save feedback:", err);
    }
  };

  // Helper copy text
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Extract all distinct interests to provide clickable filters
  // We can query `/api/history` with empty query first to map everything, 
  // but extracting from current view is also a great interactive approach.
  const [allDistinctInterests, setAllDistinctInterests] = useState<string[]>([]);
  useEffect(() => {
    // Fetch all records once without filters to populate the filter drop-down
    const getDistinctInterests = async () => {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data: HistoryEntry[] = await res.json();
          const interestSet = new Set<string>();
          data.forEach((e) => e.interests.forEach((interest) => {
            if (interest.trim()) {
              interestSet.add(interest.trim());
            }
          }));
          setAllDistinctInterests(Array.from(interestSet));
        }
      } catch (err) {
        console.error(err);
      }
    };
    getDistinctInterests();
  }, []);

  const toggleInterestFilter = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
      id="history-view-container"
    >
      {/* Title block */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
            Saved Conversations History
          </h2>
          <p className="text-slate-500 text-xs md:text-sm">
            Browse previous conversation starters, examine matching criteria, and adjust thumb reviews.
          </p>
        </div>

        {/* Clear filters button */}
        {(searchQuery || selectedInterests.length > 0) && (
          <button
            type="button"
            id="clear-filters-btn"
            onClick={() => {
              setSearchQuery("");
              setSelectedInterests([]);
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors shrink-0"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Query Filters Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            id="history-search-input"
            type="text"
            placeholder="Search by keyword, event title, profession, starter text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {/* Multi-select filter tag list */}
        {allDistinctInterests.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-slate-500 flex items-center uppercase tracking-wide">
              <Filter className="w-3.5 h-3.5 mr-1" /> Filter by Interest Tag:
            </span>
            <div className="flex flex-wrap gap-1.5" id="history-filter-pills">
              {allDistinctInterests.map((interest, idx) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleInterestFilter(interest)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main logs display */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="history-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl p-16 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center space-y-4"
          >
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 text-sm">Querying historical records...</p>
          </motion.div>
        ) : history.length > 0 ? (
          <motion.div
            key="history-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
            id="history-list-items"
          >
            {history.map((entry) => {
              const isExpanded = expandedId === entry.id;
              const dateString = new Date(entry.timestamp).toLocaleString();

              // Calculate metrics on the entry
              const ratedCount = entry.starters.filter((s) => s.feedback !== null).length;

              return (
                <div
                  key={entry.id}
                  id={`history-item-card-${entry.id}`}
                  className={`bg-white rounded-2xl border transition-shadow duration-200 ${
                    isExpanded ? "border-slate-300 shadow-md" : "border-slate-200 hover:shadow-xs"
                  }`}
                >
                  {/* Summary Bar */}
                  <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {entry.profession}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{dateString}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-slate-900 text-base">{entry.event_description}</h4>

                      {/* Display goals / tags */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-slate-500">
                        <span className="flex items-center">
                          <Target className="w-3.5 h-3.5 mr-1 text-slate-400" /> Goal: {entry.goal}
                        </span>
                        {entry.interests.length > 0 && (
                          <span className="flex items-center flex-wrap gap-1">
                            <span className="text-slate-400">Tags:</span>
                            {entry.interests.map((tag, i) => (
                              <span key={i} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                                {tag}
                              </span>
                            ))}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick actions panel */}
                    <div className="flex items-center gap-3 shrink-0 self-center md:self-start">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-1 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Hide Starters <ChevronUp className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            View {entry.starters.length} Starters <ChevronDown className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        id={`delete-history-btn-${entry.id}`}
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content Drawer */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-4 rounded-b-2xl">
                      {/* Event extraction markers */}
                      {(entry.themes.length > 0 || entry.keywords.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
                          {entry.themes.length > 0 && (
                            <div>
                              <strong className="text-slate-700 block mb-1">Extracted Themes:</strong>
                              <div className="flex flex-wrap gap-1">
                                {entry.themes.map((t, i) => (
                                  <span key={i} className="bg-indigo-50/50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {entry.keywords.length > 0 && (
                            <div>
                              <strong className="text-slate-700 block mb-1">Keywords Identified:</strong>
                              <div className="flex flex-wrap gap-1">
                                {entry.keywords.map((k, i) => (
                                  <span key={i} className="bg-emerald-50/50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md">
                                    {k}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Conversation starters */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Playbook Recommendations:</h5>
                        {entry.starters.map((s) => {
                          const isHelpful = s.feedback === "helpful";
                          const isNotHelpful = s.feedback === "not_helpful";

                          return (
                            <div key={s.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3 text-xs">
                              {/* Title line & Match percentage */}
                              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2">
                                <span className="font-bold text-slate-800 flex items-center">
                                  <MessageSquare className="w-3.5 h-3.5 mr-1 text-slate-400" /> Starter
                                </span>
                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                                  {s.confidenceScore}% Match Score
                                </span>
                              </div>

                              <blockquote className="text-slate-950 font-bold leading-relaxed text-sm">
                                "{s.text}"
                              </blockquote>

                              <p className="text-slate-600 leading-relaxed">
                                <strong className="text-slate-700">Relevance:</strong> {s.relevance}
                              </p>

                              {/* Interactive actions */}
                              <div className="flex items-center justify-between border-t border-slate-100 pt-3 flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopy(s.text, s.id)}
                                  className="text-indigo-600 hover:text-indigo-500 font-bold inline-flex items-center gap-1 bg-indigo-50/30 px-2 py-1 rounded"
                                >
                                  {copiedId === s.id ? "Copied!" : "Copy pitch"}
                                </button>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleFeedback(entry.id, s.id, "helpful")}
                                    className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${
                                      isHelpful
                                        ? "bg-emerald-500 text-white border-emerald-500"
                                        : "bg-white text-slate-400 border-slate-200 hover:bg-emerald-50 hover:text-emerald-600"
                                    }`}
                                    title="Helpful"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleFeedback(entry.id, s.id, "not_helpful")}
                                    className={`p-1.5 rounded-lg border flex items-center justify-center transition-colors ${
                                      isNotHelpful
                                        ? "bg-red-500 text-white border-red-500"
                                        : "bg-white text-slate-400 border-slate-200 hover:bg-red-50 hover:text-red-600"
                                    }`}
                                    title="Not Helpful"
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="history-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 border border-slate-200 shadow-sm text-center space-y-4"
          >
            <div className="p-4 bg-slate-50 rounded-full text-slate-400 w-fit mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-900">No Historical Records Found</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {(searchQuery || selectedInterests.length > 0)
                  ? "No saved pitches matched your search filters. Try clearing filters or searching for general keywords."
                  : "You haven't generated any networking openers yet. Head over to the Generator tab to make your first play!"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
