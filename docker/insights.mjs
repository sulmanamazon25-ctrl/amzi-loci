import {
  buildInsightUserPrompt,
  INSIGHT_EXTRACTION_SYSTEM,
  PROVIDER_MODELS,
} from "./prompts.mjs";

function parseInsightsJson(raw) {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Model response did not contain JSON");

  const parsed = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(parsed.insights)) {
    throw new Error("Model JSON missing insights array");
  }

  return parsed.insights.map((insight, index) => ({
    id: insight.id || `insight-${index + 1}`,
    feature: insight.feature,
    sentiment: insight.sentiment,
    conversionDriver: Boolean(insight.conversionDriver),
    sourceQuote: insight.sourceQuote,
    confidence: Math.min(1, Math.max(0, Number(insight.confidence) || 0)),
  }));
}

async function callAnthropic(reviews, apiKey) {
  const model = PROVIDER_MODELS.anthropic;
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: INSIGHT_EXTRACTION_SYSTEM,
      messages: [{ role: "user", content: buildInsightUserPrompt(reviews) }],
    }),
  });
  if (!response.ok) throw new Error(`Anthropic API error (${response.status})`);
  const data = await response.json();
  const text = data.content?.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Anthropic returned empty content");
  return text;
}

async function callOpenAi(reviews, apiKey) {
  const model = PROVIDER_MODELS.openai;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: INSIGHT_EXTRACTION_SYSTEM },
        { role: "user", content: buildInsightUserPrompt(reviews) },
      ],
    }),
  });
  if (!response.ok) throw new Error(`OpenAI API error (${response.status})`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned empty content");
  return text;
}

async function callGoogle(reviews, apiKey) {
  const model = PROVIDER_MODELS.google;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${INSIGHT_EXTRACTION_SYSTEM}\n\n${buildInsightUserPrompt(reviews)}` },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  if (!response.ok) throw new Error(`Google AI API error (${response.status})`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Google AI returned empty content");
  return text;
}

export async function extractInsights(reviews, provider, apiKey) {
  const cleaned = reviews.map((r) => r.trim()).filter(Boolean);
  if (cleaned.length === 0) throw new Error("At least one review is required");
  if (cleaned.length > 200) throw new Error("Maximum 200 reviews per request");

  let raw;
  if (provider === "anthropic") raw = await callAnthropic(cleaned, apiKey);
  else if (provider === "openai") raw = await callOpenAi(cleaned, apiKey);
  else if (provider === "google") raw = await callGoogle(cleaned, apiKey);
  else throw new Error(`Unsupported provider: ${provider}`);

  return {
    insights: parseInsightsJson(raw),
    model: PROVIDER_MODELS[provider],
    reviewCount: cleaned.length,
  };
}
