import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const MAX_DIFF_CHARS = 8_000;

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

const trimDiff = (diff: string): string => {
  if (diff.length <= MAX_DIFF_CHARS) {
    return diff.slice(0, MAX_DIFF_CHARS);
  }
  return diff;
};

const buildPrompt = (diff: string): string => {
  return `
  Generate a dope professional Git commit message.

  Rules:
  - One line only
  - Imperative mood (e.g. "feat", "fix", "refactor")
  - Max 72 characters
  - No emojis pleaes!!!!!!!
  - No punctuation at the end please!!!!

  Changes:
  ${diff}
  `.trim();
};

export const generateCommitMessage = async (
  rawDiff: string,
): Promise<string> => {
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview";
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_URL || !API_KEY) {
    throw new Error("Gemini API credentials missing");
  }

  const diff = trimDiff(rawDiff);
  const prompt = buildPrompt(diff);

  try {
    const response = await axios.post<GeminiResponse>(
      `${API_URL}?key=${API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 64,
          temperature: 0.2,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
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
