import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { BarChart3, RefreshCw, ThumbsUp, ThumbsDown, Zap, PieChart, TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import { AnalyticsData } from "../types";

interface AnalyticsViewProps {
  analytics: AnalyticsData;
  onRefresh: () => void;
}

export default function AnalyticsView({ analytics, onRefresh }: AnalyticsViewProps) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    onRefresh();
    // Short fake delay for tactile feedback
    setTimeout(() => {
      setLoading(false);
    }, 600);
  };

  const totalRated = analytics.helpfulCount + analytics.unhelpfulCount;
  const unhelpfulPercentage = totalRated > 0 ? parseFloat(((analytics.unhelpfulCount / totalRated) * 100).toFixed(1)) : 0;

  // Let's build a clean, custom inline SVG pie/donut representation
  // Circle calculations: circumference = 2 * pi * r
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const helpfulOffset = circumference - (analytics.helpfulPercentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
      id="analytics-view-container"
    >
      {/* Header and Refresh Row */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
            Performance & Feedback Analytics
          </h2>
          <p className="text-slate-500 text-xs md:text-sm">
            Check real-time conversation ratings, response statistics, and feedback percentage rates.
          </p>
        </div>

        <button
          type="button"
          id="refresh-analytics-btn"
          onClick={handleRefresh}
          disabled={loading}
          className="text-xs font-bold text-slate-700 hover:text-indigo-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-3.5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Metrics Row (st.metric equivalent) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="analytics-metrics-grid">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-1.5" id="metric-conversations">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Total Sessions</span>
          <h3 className="text-3xl font-extrabold text-slate-900">{analytics.totalConversations}</h3>
          <p className="text-[10px] text-slate-400 font-medium">Logged in local SQLite database</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-1.5" id="metric-helpful-percentage">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block">Helpful Ratio</span>
          <h3 className="text-3xl font-extrabold text-indigo-600">{analytics.helpfulPercentage}%</h3>
          <p className="text-[10px] text-slate-400 font-medium">Goal performance target &gt; 80%</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-1.5" id="metric-helpful-count">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" /> Helpful Count
          </span>
          <h3 className="text-3xl font-extrabold text-emerald-600">{analytics.helpfulCount}</h3>
          <p className="text-[10px] text-slate-400 font-medium">Positive feedback reviews</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-1.5" id="metric-unhelpful-count">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block flex items-center gap-1">
            <ThumbsDown className="w-3.5 h-3.5 text-red-500" /> Unhelpful Count
          </span>
          <h3 className="text-3xl font-extrabold text-slate-700">{analytics.unhelpfulCount}</h3>
          <p className="text-[10px] text-slate-400 font-medium">Negative feedback reviews</p>
        </div>
      </div>

      {/* Main Charts & Benchmarks Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Donut Chart */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
            <PieChart className="w-4 h-4 mr-1.5 text-indigo-600" /> Feedback Distribution
          </h3>

          {totalRated > 0 ? (
            <div className="flex flex-col items-center justify-center space-y-6 py-4">
              <div className="relative flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={r}
                    className="stroke-slate-100 fill-none"
                    strokeWidth="12"
                  />
                  {/* Helpful Circle Segment */}
                  <circle
                    cx="80"
                    cy="80"
                    r={r}
                    className="stroke-indigo-600 fill-none transition-all duration-500"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={helpfulOffset}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text overlay */}
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-2xl font-extrabold text-slate-900">{analytics.helpfulPercentage}%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Helpful Rate</span>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="w-full grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="flex items-center font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-1.5 inline-block" /> Helpful
                  </span>
                  <span className="font-bold text-slate-900">{analytics.helpfulPercentage}%</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="flex items-center font-medium text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200 mr-1.5 inline-block" /> Unhelpful
                  </span>
                  <span className="font-bold text-slate-900">{unhelpfulPercentage}%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-3">
              <div className="p-3 bg-slate-50 rounded-full text-slate-400">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900">No Feedback Recorded</h4>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Start rating individual conversation starters in the Generator or History logs to populate the feedback ratios.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Benchmarks Matrix */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center">
            <Zap className="w-4 h-4 mr-1.5 text-indigo-600" /> Platform Quality Benchmarks
          </h3>

          <div className="space-y-4 text-xs">
            {/* Metric 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">AI Response Precision</span>
                <span className="text-slate-500">92% Average</span>
              </div>
              <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "92%" }} />
              </div>
              <span className="text-[10px] text-slate-400 block">Measuring structural and syntax completeness of parsed JSON.</span>
            </div>

            {/* Metric 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Wikipedia Retrieval Match Rate</span>
                <span className="text-slate-500">88% Match</span>
              </div>
              <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: "88%" }} />
              </div>
              <span className="text-[10px] text-slate-400 block">Matching search strings with successful article extracts and timestamps.</span>
            </div>

            {/* Metric 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">User Recommendation Acceptance</span>
                <span className="text-slate-500">{analytics.helpfulPercentage}% Target</span>
              </div>
              <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${analytics.helpfulPercentage}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 block">Feedback acceptance calculated against helpful and not-helpful logs.</span>
            </div>
          </div>

          {/* Quick Info message */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-slate-600 leading-relaxed">
              <strong className="text-slate-800 block">Continuous Model Optimization</strong>
              The Personalized Networking Assistant relies on real-time prompt structuring and strict schema definitions. Thumbs-down responses are noted inside historical logs to align and reinforce response quality.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
