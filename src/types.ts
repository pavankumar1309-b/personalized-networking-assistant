export interface ConversationStarter {
  id: string;
  text: string;
  relevance: string;
  confidenceScore: number;
  feedback: "helpful" | "not_helpful" | null;
}

export interface HistoryEntry {
  id: string;
  event_description: string;
  interests: string[];
  profession: string;
  goal: string;
  themes: string[];
  keywords: string[];
  starters: ConversationStarter[];
  timestamp: string;
}

export interface AnalyticsData {
  totalConversations: number;
  helpfulCount: number;
  unhelpfulCount: number;
  helpfulPercentage: number;
}

export interface FactCheckResult {
  found: boolean;
  title: string;
  summary: string;
  sourceUrl: string;
  lastUpdated: string;
}
