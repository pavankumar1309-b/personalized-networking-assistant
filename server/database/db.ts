import fs from "fs";
import path from "path";

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

const DB_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DB_DIR, "database.json");

function ensureDirectoryExistence() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

function readData(): HistoryEntry[] {
  ensureDirectoryExistence();
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf-8");
    return [];
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.error("Database read error, returning empty list:", error);
    return [];
  }
}

function writeData(data: HistoryEntry[]) {
  ensureDirectoryExistence();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Database write error:", error);
  }
}

export const Database = {
  getHistory(): HistoryEntry[] {
    return readData();
  },

  getEntryById(id: string): HistoryEntry | undefined {
    return readData().find((e) => e.id === id);
  },

  addEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): HistoryEntry {
    const data = readData();
    const newEntry: HistoryEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
    };
    data.unshift(newEntry); // newest first
    writeData(data);
    return newEntry;
  },

  deleteEntry(id: string): boolean {
    const data = readData();
    const initialLength = data.length;
    const filtered = data.filter((e) => e.id !== id);
    if (filtered.length !== initialLength) {
      writeData(filtered);
      return true;
    }
    return false;
  },

  updateStarterFeedback(entryId: string, starterId: string, feedback: "helpful" | "not_helpful" | null): boolean {
    const data = readData();
    const entry = data.find((e) => e.id === entryId);
    if (entry) {
      const starter = entry.starters.find((s) => s.id === starterId);
      if (starter) {
        starter.feedback = feedback;
        writeData(data);
        return true;
      }
    }
    return false;
  },

  getAnalytics() {
    const data = readData();
    let totalConversations = data.length;
    let helpfulCount = 0;
    let unhelpfulCount = 0;

    data.forEach((entry) => {
      entry.starters.forEach((s) => {
        if (s.feedback === "helpful") {
          helpfulCount++;
        } else if (s.feedback === "not_helpful") {
          unhelpfulCount++;
        }
      });
    });

    const totalRated = helpfulCount + unhelpfulCount;
    const helpfulPercentage = totalRated > 0 ? parseFloat(((helpfulCount / totalRated) * 100).toFixed(1)) : 0;

    return {
      totalConversations,
      helpfulCount,
      unhelpfulCount,
      helpfulPercentage,
    };
  },

  searchHistory(query: string, filterInterests: string[] = []): HistoryEntry[] {
    let data = readData();
    const q = query.toLowerCase().trim();

    if (q) {
      data = data.filter(
        (e) =>
          e.event_description.toLowerCase().includes(q) ||
          e.profession.toLowerCase().includes(q) ||
          e.goal.toLowerCase().includes(q) ||
          e.keywords.some((k) => k.toLowerCase().includes(q)) ||
          e.themes.some((t) => t.toLowerCase().includes(q)) ||
          e.starters.some((s) => s.text.toLowerCase().includes(q))
      );
    }

    if (filterInterests.length > 0) {
      data = data.filter((e) =>
        filterInterests.every((interest) =>
          e.interests.some((userInterest) => userInterest.toLowerCase() === interest.toLowerCase())
        )
      );
    }

    return data;
  },
};
