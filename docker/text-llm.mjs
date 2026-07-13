export const PROVIDER_MODELS = {
  anthropic: "claude-sonnet-4-20250514",
  openai: "gpt-4o-mini",
  google: "gemini-2.0-flash",
};

export async function callTextModel(provider, system, user, apiKey) {
  if (provider === "anthropic") {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: PROVIDER_MODELS.anthropic,
        max_tokens: 4096,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!response.ok) throw new Error(`Anthropic API error (${response.status})`);
    const data = await response.json();
    const text = data.content?.find((b) => b.type === "text")?.text;
    if (!text) throw new Error("Anthropic returned empty content");
    return { text, model: PROVIDER_MODELS.anthropic };
  }

  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: PROVIDER_MODELS.openai,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (!response.ok) throw new Error(`OpenAI API error (${response.status})`);
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("OpenAI returned empty content");
    return { text, model: PROVIDER_MODELS.openai };
  }

  if (provider === "google") {
    const model = PROVIDER_MODELS.google;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${system}\n\n${user}` }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    });
    if (!response.ok) throw new Error(`Google AI API error (${response.status})`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Google AI returned empty content");
    return { text, model };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

export function parseJsonObject(raw) {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Model response did not contain JSON");
  return JSON.parse(jsonMatch[0]);
}
