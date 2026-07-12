import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home,
  Sparkles,
  BookOpen,
  History,
  BarChart3,
  Settings,
  Menu,
  X,
  User,
  Activity,
  Globe
} from "lucide-react";

// Views
import HomeView from "./components/HomeView";
import GeneratorView from "./components/GeneratorView";
import FactCheckView from "./components/FactCheckView";
import HistoryView from "./components/HistoryView";
import AnalyticsView from "./components/AnalyticsView";
import SettingsView from "./components/SettingsView";

import { AnalyticsData } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalConversations: 0,
    helpfulCount: 0,
    unhelpfulCount: 0,
    helpfulPercentage: 0
  });

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const menuItems = [
    { id: "home", label: "Home", icon: <Home className="w-5 h-5" /> },
    { id: "generate", label: "Generate Starters", icon: <Sparkles className="w-5 h-5" /> },
    { id: "factcheck", label: "Fact Check", icon: <BookOpen className="w-5 h-5" /> },
    { id: "history", label: "History Logs", icon: <History className="w-5 h-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "settings", label: "Settings & System", icon: <Settings className="w-5 h-5" /> }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  // Render the current active panel view
  const renderActiveView = () => {
    switch (activeTab) {
      case "home":
        return <HomeView onNavigate={handleTabChange} analytics={analytics} />;
      case "generate":
        return <GeneratorView onRefreshAnalytics={fetchAnalytics} />;
      case "factcheck":
        return <FactCheckView />;
      case "history":
        return <HistoryView onRefreshAnalytics={fetchAnalytics} />;
      case "analytics":
        return <AnalyticsView analytics={analytics} onRefresh={fetchAnalytics} />;
      case "settings":
        return <SettingsView />;
      default:
        return <HomeView onNavigate={handleTabChange} analytics={analytics} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800" id="main-app-container">
      {/* Desktop Left Sidebar (Professional Polish Style) */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0F172A] text-slate-300 shrink-0 select-none">
        {/* Sidebar Logo Header */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-white font-bold text-lg leading-tight tracking-tight">
            NetAssist AI
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-menu-item-${item.id}`}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors outline-none ${
                  isActive
                    ? "text-white bg-indigo-600/20 border-l-2 border-indigo-500 rounded-r-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar System Status & Profile Info Footer */}
        <div className="p-6 space-y-4">
          {/* Active Status Block */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">System Status</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-200 font-medium">Gemini 3.5 Active</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/30 p-3 rounded-xl border border-slate-800/40">
            <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-wider">Active Workspace</p>
              <p className="text-[11px] text-slate-300 truncate font-semibold">1309pavankumar@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header Nav Bar */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-[#0F172A] text-white p-4 flex items-center justify-between z-30 shadow-md">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm tracking-tight">NetAssist AI</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 hover:bg-slate-800 rounded-lg outline-none text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#0F172A] border-b border-slate-800 overflow-hidden z-20"
              id="mobile-navigation-dropdown"
            >
              <div className="p-4 space-y-1">
                {menuItems.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors outline-none ${
                        isActive
                          ? "text-white bg-indigo-600/20 border-l-2 border-indigo-500 rounded-r-md"
                          : "text-slate-300 hover:bg-slate-800"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Header Bar for Desktop Screen */}
        <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="text-slate-400">Pages</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold uppercase tracking-wider text-xs">
              {menuItems.find((m) => m.id === activeTab)?.label || "Dashboard Overview"}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Globe className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                readOnly
                value="Networking Assistant Live"
                className="bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-9 pr-4 text-[11px] font-medium text-slate-500 w-52 outline-none"
              />
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-6">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">Pavan Kumar</p>
                <p className="text-[10px] text-slate-400 font-medium">Networking Professional</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs shadow-sm">
                PK
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-8" id="main-content-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto h-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
