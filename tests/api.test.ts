import { Database } from "../server/database/db";
import { verifyTopicWithWikipedia } from "../server/services/wikipedia";
import { generateNetworkingStarters } from "../server/services/gemini";

// Simple custom testing assertions runner
async function runSuite() {
  console.log("==================================================");
  console.log("STARTING TEST SUITE: Personalized Networking Assistant");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // TEST SUITE 1: Local SQLite-equivalent database
  try {
    console.log("\n--- Testing Database Layer ---");
    // Clear / Setup
    const history1 = Database.getHistory();
    const initialCount = history1.length;

    // Add Entry
    const newEntry = Database.addEntry({
      event_description: "Cloud Computing Summit 2026",
      interests: ["Serverless", "Security"],
      profession: "Systems Engineer",
      goal: "Connect with Devops Leaders",
      themes: ["Cloud", "Security"],
      keywords: ["Serverless", "Kubernetes"],
      starters: [
        {
          id: "starter_1",
          text: "What serverless architecture is your team deploying?",
          relevance: "Matches your Cloud goal",
          confidenceScore: 90,
          feedback: null,
        },
      ],
    });

    assert(newEntry.id !== undefined, "Database generates unique ID on insert");
    assert(newEntry.event_description === "Cloud Computing Summit 2026", "Database preserves inserted data integrity");

    const history2 = Database.getHistory();
    assert(history2.length === initialCount + 1, "Database entry count incremented successfully");

    // Search
    const searchResult1 = Database.searchHistory("Systems Engineer");
    assert(searchResult1.length > 0, "Database search locates records by profession text");

    const searchResult2 = Database.searchHistory("", ["Serverless"]);
    assert(searchResult2.length > 0, "Database search filters records successfully by interest keywords");

    // Feedback Update
    const updated = Database.updateStarterFeedback(newEntry.id, "starter_1", "helpful");
    assert(updated === true, "Database updates starter feedback flag successfully");

    const analytics = Database.getAnalytics();
    assert(analytics.helpfulCount >= 1, "Analytics correctly records positive feedback votes");

    // Delete
    const deleted = Database.deleteEntry(newEntry.id);
    assert(deleted === true, "Database deletes history records successfully");
    const history3 = Database.getHistory();
    assert(history3.length === initialCount, "Database entry count decremented successfully post-delete");
  } catch (error) {
    console.error("Database test error:", error);
    failed++;
  }

  // TEST SUITE 2: Wikipedia Fact Check
  try {
    console.log("\n--- Testing Wikipedia Fact Verification ---");
    const result1 = await verifyTopicWithWikipedia("Blockchain");
    assert(result1.found === true, "Wikipedia service successfully locates broad topics like 'Blockchain'");
    assert(result1.summary.length > 0, "Wikipedia summary output is populated with text");
    assert(result1.sourceUrl.includes("wikipedia.org"), "Wikipedia returns valid desktop page references");

    const result2 = await verifyTopicWithWikipedia("");
    assert(result2.found === false, "Wikipedia gracefully handles empty or matching misses");
  } catch (error) {
    console.error("Wikipedia test error:", error);
    failed++;
  }

  // TEST SUITE 3: Gemini Router Interface
  try {
    console.log("\n--- Testing Gemini AI Service Interface ---");
    // Verify generator signature and fallback
    const result = await generateNetworkingStarters({
      event_description: "AI in Clinical Trials",
      interests: ["Biotech", "Informatics"],
      profession: "Research Associate",
      goal: "Meet clinical coordinators",
    });

    assert(Array.isArray(result.themes), "Gemini router outputs list of themes");
    assert(Array.isArray(result.keywords), "Gemini router outputs list of keyword topics");
    assert(result.conversation_starters.length >= 1, "Gemini router creates relevant personalized starters");
    assert(result.conversation_starters[0].text !== undefined, "Starter records contain actual text pitches");
  } catch (error) {
    console.error("Gemini service test error:", error);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`TEST SUITE COMPLETED: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runSuite();
