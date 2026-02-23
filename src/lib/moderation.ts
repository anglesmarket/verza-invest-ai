import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface ModerationResult {
  approved: boolean;
  score: number; // 0-100, higher = safer
  reason: string;
  flags: string[];
}

/**
 * Uses Gemini AI to moderate startup content.
 * Returns a score (0–100) and flags for problematic content.
 */
export async function moderateStartupContent(content: {
  name: string;
  tagline: string;
  problem?: string;
  solution?: string;
  valueProposition?: string;
  businessModel?: string;
  industry?: string;
}): Promise<ModerationResult> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const textToModerate = [
      `Startup Name: ${content.name}`,
      `Tagline: ${content.tagline}`,
      content.problem ? `Problem: ${content.problem}` : "",
      content.solution ? `Solution: ${content.solution}` : "",
      content.valueProposition ? `Value Proposition: ${content.valueProposition}` : "",
      content.businessModel ? `Business Model: ${content.businessModel}` : "",
      content.industry ? `Industry: ${content.industry}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const prompt = `You are a content moderation system for a startup investment platform. Analyze the following startup submission for inappropriate, harmful, fraudulent, or misleading content.

Rate the content on a scale of 0-100 where:
- 0-30: Clearly inappropriate, fraudulent, or harmful — should be rejected
- 31-60: Questionable content that needs human review
- 61-80: Mostly fine but may have minor issues
- 81-100: Clean, legitimate startup content

Check for:
1. Hate speech, discrimination, or offensive language
2. Fraudulent or scam-like claims (e.g. "guaranteed 1000x returns")
3. Illegal activities or products
4. Spam or meaningless content
5. Misleading financial claims
6. Adult or explicit content
7. Violence or threats

Content to analyze:
${textToModerate}

Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
{"score": <number>, "approved": <boolean>, "reason": "<brief explanation>", "flags": ["<flag1>", "<flag2>"]}

Where "approved" is true if score >= 61, false otherwise.
If the content is completely clean, use an empty flags array.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    // Parse JSON — handle potential markdown code blocks
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);

    return {
      score: Math.min(100, Math.max(0, parsed.score)),
      approved: parsed.score >= 61,
      reason: parsed.reason || "",
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
    };
  } catch (error) {
    console.error("Gemini moderation error:", error);
    // On failure, allow content through but flag for human review
    return {
      score: 50,
      approved: false,
      reason: "Moderation service unavailable — queued for manual review",
      flags: ["moderation_error"],
    };
  }
}
