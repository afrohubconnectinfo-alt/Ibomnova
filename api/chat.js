export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { message, history } = req.body;
  if (!message) return res.status(400).json({ error: "No message" });
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API Key not set" });

  const messages = [{
    role: "system",
    content: "You are Ibomnova AI. NEVER use tables like | Era | or |---|---|. NEVER use > or * at start. Use simple bold like **Title:** and normal lines. Clean like ChatGPT. Short paragraphs."
  }];

  if (history && Array.isArray(history)) {
    history.slice(-6).forEach(h => {
      if (h.role === 'user') messages.push({ role: 'user', content: h.text });
      if (h.role === 'ai') messages.push({ role: 'assistant', content: h.text });
    });
  }
  messages.push({ role: "user", content: message });

  try {
    const isGroq = !!process.env.GROQ_API_KEY;
    const url = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const model = isGroq ? "llama-3.3-70b-versatile" : "gpt-4o-mini";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 800 })
    });
    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    return res.status(200).json({ reply: data.choices?.[0]?.message?.content || "No reply" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
