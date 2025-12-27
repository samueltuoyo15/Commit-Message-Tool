import axios from "axios";
import "dotenv/config";

interface GeminiPart {
  text?: string;
}

interface GeminiContent {
  parts?: GeminiPart[];
}

interface GeminiCandidate {
  content?: GeminiContent;
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
}

const buildPrompt = (diff: string): string =>
  `
You are an expert developer writing Git commit messages.

Summarize the changes below into one clear, descriptive line:
- Include the type (feat, fix, refactor, chore)
- Include the module or file affected
- Use imperative mood
- No emojis or punctuation at the end

Changes:
${diff}
`.trim();

export const generateCommitMessage = async (
  rawDiff: string,
): Promise<string> => {
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) throw new Error("Gemini API key missing");

  const prompt = buildPrompt(rawDiff);

  try {
    const response = await axios.post<GeminiResponse>(
      API_URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 150, temperature: 0.4 },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": API_KEY,
        },
      },
    );

    const message =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return message && message.length > 0 ? message : "chore: update changes";
  } catch (error) {
    console.error("LLM request failed:", error);
    return "chore: update changes";
  }
};
