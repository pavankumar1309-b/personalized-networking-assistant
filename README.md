# Personalized Networking Assistant

An AI-powered web application designed to help professionals and event attendees generate hyper-personalized conversation starters, analyze event topics, verify facts, and track performance analytics.

This application is built as a robust, full-stack **TypeScript, Express, and React** application, powered by **Gemini-3.5-flash** and the official `@google/genai` SDK.

---

## 🚀 Features

### 1. Semantic Event Analysis
- Deeply parses event briefs to discover core themes, keywords, key technologies, and industries.
- Computes matching recommendation metrics and confidence levels.

### 2. Hyper-Personalized Openers
- Generates 3–5 smart conversation starters tailored specifically to your profession, interests, and event-networking goals.
- Provides a detailed "Why it works" rationale for each starter.

### 3. Wikipedia Fact Verification
- Real-time fact-checking of technical terms, concepts, and topics.
- Syncs with Wikipedia's REST APIs to retrieve summary excerpts, desktop sources, and last-updated timestamps.

### 4. Interactive Feedback & Analytics Logs
- Stores generated opening playbooks persistently in a local database.
- Features thumbs-up 👍 and thumbs-down 👎 ratings for continuous performance tracking.
- An interactive analytics screen showcases total sessions, helpful percentage rates, and visual donut distributions.

---

## 🛠️ Stack & Architecture

- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, and Motion.
- **Backend**: Node.js, Express, TypeScript (`tsx` router, compiled into self-contained CommonJS via `esbuild`).
- **AI Core**: Google GenAI SDK (`@google/genai`) using **Gemini-3.5-flash** with strict response schema JSON validation.
- **Data Persistence**: High-Performance, SQLite-equivalent JSON file system database with atomic transactions (`data/database.json`).

```
📁 personalized-networking-assistant/
├── 📁 server/
│   ├── 📁 database/
│   │   └── db.ts          # SQLite-equivalent persistent storage layer
│   └── 📁 services/
│       ├── gemini.ts      # Google Gemini 3.5 structured JSON generator
│       └── wikipedia.ts   # Wikipedia search & REST lookup verification
├── 📁 src/
│   ├── 📁 components/     # Streamlit-inspired views
│   │   ├── HomeView.tsx
│   │   ├── GeneratorView.tsx
│   │   ├── FactCheckView.tsx
│   │   ├── HistoryView.tsx
│   │   ├── AnalyticsView.tsx
│   │   └── SettingsView.tsx
│   ├── App.tsx            # Main router dashboard frame
│   ├── index.css          # Custom fonts and styling directives
│   └── types.ts           # Shared TypeScript models
├── server.ts              # Full-stack Express router & Vite dev middleware
├── tests/
│   └── api.test.ts        # Unified integration & unit test suite
├── package.json           # Scripts and package definitions
└── README.md              # Project documentation
```

---

## 📋 API Documentation

### `POST /api/generate` (or `/generate`)
Generates personalized conversation starters based on user profile and event context.
- **Request Body**:
  ```json
  {
    "event_description": "AI for Sustainable Cities",
    "profession": "Software Engineer",
    "interests": ["AI", "Climate Change"],
    "goal": "Meet researchers"
  }
  ```
- **Response**:
  ```json
  {
    "id": "abc123xyz",
    "themes": ["Smart Cities", "Urban Analytics"],
    "keywords": ["AI", "Climate Tech", "Sustainability"],
    "technologies": ["Machine Learning", "IoT Sensors"],
    "industries": ["Environmental Tech", "Government Services"],
    "conversation_starters": [
      {
        "id": "starter_1",
        "text": "Hi! Given your focus on urban systems, how is AI being used to optimize city transit gridlocked carbon outputs?",
        "relevance": "Directly links your Software Engineering focus to Climate Change interests.",
        "confidenceScore": 92,
        "feedback": null
      }
    ],
    "timestamp": "2026-07-11T22:38:13Z"
  }
  ```

### `POST /api/factcheck` (or `/factcheck`)
Searches and verifies a topic using Wikipedia REST API.
- **Request Body**:
  ```json
  {
    "topic": "Blockchain in Healthcare"
  }
  ```
- **Response**:
  ```json
  {
    "found": true,
    "title": "Blockchain in Healthcare",
    "summary": "Blockchain technology is increasingly applied to secure electronic health records...",
    "sourceUrl": "https://en.wikipedia.org/wiki/Blockchain_in_healthcare",
    "lastUpdated": "11/15/2025, 4:22:15 PM"
  }
  ```

### `GET /api/history` (or `/history`)
Retrieves all historical saved networking openers, supporting query filtering.
- **Query Params (Optional)**:
  - `query`: Text string search (e.g. `?query=AI`).
  - `interests`: Commas separated filter (e.g. `?interests=AI,Blockchain`).

### `POST /api/feedback` (or `/feedback`)
Submits helpfulness review on a specific starter.
- **Request Body**:
  ```json
  {
    "entryId": "abc123xyz",
    "starterId": "starter_1",
    "feedback": "helpful" // 'helpful' | 'not_helpful' | null
  }
  ```

### `DELETE /api/history/:id` (or `/history/:id`)
Removes an entry from history.

### `GET /api/analytics` (or `/analytics`)
Exposes database feedback percentages and session counts.

---

## 🛠️ Installation & Running Guide

### 1. Requirements
Ensure you have Node.js (v18+) and npm installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Secrets
Configure your `.env` file in the root workspace (copy from `.env.example`):
```env
GEMINI_API_KEY="YOUR_GOOGLE_AI_STUDIO_API_KEY"
APP_URL="http://localhost:3000"
```

### 4. Running Development Servers
```bash
npm run dev
```
The server will start at `http://localhost:3000`. Hot reloading and asset proxies are fully managed by Express and Vite middleware.

### 5. Running the Test Suite
Execute the integration and database tests:
```bash
npm run test
```

### 6. Production Builds
Build and bundle the Express server and React client:
```bash
npm run build
npm run start
```
The bundled application boots inside standard container hosts instantly from `dist/server.cjs`.
