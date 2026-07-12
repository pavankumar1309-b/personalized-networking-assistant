export interface FactCheckResult {
  found: boolean;
  title: string;
  summary: string;
  sourceUrl: string;
  lastUpdated: string;
}

export async function verifyTopicWithWikipedia(topic: string): Promise<FactCheckResult> {
  const cleanTopic = topic.trim();
  if (!cleanTopic) {
    return {
      found: false,
      title: "",
      summary: "Please provide a valid topic to search.",
      sourceUrl: "",
      lastUpdated: "",
    };
  }

  try {
    // 1. Search Wikipedia for the best matching page title
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanTopic
    )}&utf8=&format=json&origin=*`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      throw new Error(`Wikipedia search returned status ${searchRes.status}`);
    }

    const searchData: any = await searchRes.json();
    const results = searchData.query?.search;

    if (!results || results.length === 0) {
      return {
        found: false,
        title: cleanTopic,
        summary: `No Wikipedia articles matched the topic "${cleanTopic}". Please try a more general term or check for typos.`,
        sourceUrl: "",
        lastUpdated: "",
      };
    }

    // 2. Fetch summary of the best match from Wikipedia REST API
    const bestMatchTitle = results[0].title;
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestMatchTitle)}`;

    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) {
      throw new Error(`Wikipedia summary returned status ${summaryRes.status}`);
    }

    const summaryData: any = await summaryRes.json();

    return {
      found: true,
      title: summaryData.title || bestMatchTitle,
      summary: summaryData.extract || "No quick summary is available for this article.",
      sourceUrl: summaryData.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(bestMatchTitle)}`,
      lastUpdated: summaryData.timestamp ? new Date(summaryData.timestamp).toLocaleString() : "Recently updated",
    };
  } catch (error) {
    console.error("Wikipedia search error:", error);
    return {
      found: false,
      title: cleanTopic,
      summary: `Failed to fetch verification data for "${cleanTopic}" due to a network or server error. Please try again.`,
      sourceUrl: "",
      lastUpdated: "",
    };
  }
}
export default verifyTopicWithWikipedia;
