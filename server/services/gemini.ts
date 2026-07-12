import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Standard initialization with User-Agent set to 'aistudio-build'
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export interface GeneratorInput {
  event_description: string;
  interests: string[];
  profession: string;
  goal: string;
}

export interface GeneratorOutput {
  themes: string[];
  keywords: string[];
  technologies: string[];
  industries: string[];
  conversation_starters: {
    id: string;
    text: string;
    relevance: string;
    confidenceScore: number;
    feedback: "helpful" | "not_helpful" | null;
  }[];
}

export async function generateNetworkingStarters(input: GeneratorInput): Promise<GeneratorOutput> {
  const systemInstruction = `
    You are an elite, highly professional networking advisor and AI matchmaker. 
    Your goal is to help users succeed at events by generating highly relevant, hyper-personalized, non-cliché conversation starters, and conducting a deep semantic event analysis.
    
    Given the event description, the user's interests, their profession, and their networking goal:
    1. Extract 3-5 major themes from the event.
    2. Extract 4-8 keywords from the event.
    3. Identify key technologies mentioned or highly related to the event.
    4. Identify key industries involved in the event.
    5. Generate exactly 3-5 distinct, high-quality, personalized conversation starters.
       - Each starter must draw a direct bridge between the user's profession, their interest keywords, their goal, and the themes of the event.
       - The starters must feel natural, smart, and inviting (e.g. avoiding overly robotic or template-sounding structures like "Hello, I see you are in AI, did you know...").
       - Each starter must include a customized 'relevance' paragraph explaining specifically why it makes sense to use this line, referencing the user's profile and goal.
       - Assign a 'confidenceScore' (integer between 0 and 100) representing how strongly you recommend using this line.
  `;

  const userPrompt = `
    Event Description: "${input.event_description}"
    User Profession: "${input.profession}"
    User Interests: ${JSON.stringify(input.interests)}
    Networking Goal: "${input.goal}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            themes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Major themes extracted from the event description",
            },
            keywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Key terms and tags extracted from the event description",
            },
            technologies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Any technologies identified in the description or highly relevant to it",
            },
            industries: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Any industries identified in the description or highly relevant to it",
            },
            conversation_starters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "The actual conversation starter question or line" },
                  relevance: {
                    type: Type.STRING,
                    description:
                      "Detailed explanation of why this starter matches the event, the user's interests, profession, and goals",
                  },
                  confidenceScore: {
                    type: Type.INTEGER,
                    description: "Confidence score out of 100 representing how well this starter fits",
                  },
                },
                required: ["text", "relevance", "confidenceScore"],
              },
            },
          },
          required: ["themes", "keywords", "technologies", "industries", "conversation_starters"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response returned from Gemini API");
    }

    const parsed = JSON.parse(text);

    // Map starters to include ids and default feedback
    const conversation_starters = (parsed.conversation_starters || []).map((s: any, idx: number) => ({
      id: `starter_${idx}_${Date.now()}`,
      text: s.text,
      relevance: s.relevance,
      confidenceScore: s.confidenceScore || 85,
      feedback: null,
    }));

    return {
      themes: parsed.themes || [],
      keywords: parsed.keywords || [],
      technologies: parsed.technologies || [],
      industries: parsed.industries || [],
      conversation_starters,
    };
  } catch (error) {
    console.error("Gemini Starter Generation Error:", error);
    // Fallback if API fails or rate limit hit
    return {
      themes: ["Professional Networking", "Innovation & Collaboration"],
      keywords: ["Networking", "Socializing", "Collaboration"],
      technologies: ["Digital Tools"],
      industries: ["Information Technology"],
      conversation_starters: [
        {
          id: `starter_fallback_1_${Date.now()}`,
          text: `Hi! I noticed the presentation today touched on key trends. As a ${input.profession}, I've been thinking about how this applies to my interest in ${input.interests[0] || "innovation"}. What's your perspective on this?`,
          relevance: "Directly connects your professional role and primary interest to the event topic in an open-ended conversational way.",
          confidenceScore: 80,
          feedback: null,
        },
        {
          id: `starter_fallback_2_${Date.now()}`,
          text: `It's great to be here. My main goal today is to ${input.goal.toLowerCase()}, and I find that exploring how ${input.interests.join(" and ") || "new ideas"} intersect with today's event is a great starting point. Are there any particular panels or speakers you're looking forward to?`,
          relevance: "Transparently sharing your networking goal makes it easy for others to introduce you to relevant contacts.",
          confidenceScore: 75,
          feedback: null,
        },
      ],
    };
  }
}
