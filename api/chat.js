export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = req.body || {};
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const history = Array.isArray(body.history) ? body.history : [];
  if (!message) return res.status(400).json({ error: "A message is required." });
  if (message.length > 12000) return res.status(400).json({ error: "Message is too long." });
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "AI service is not configured. Please contact the site administrator." });
  const messages = [{
    role: "system",
    content: `You are IBOMNOVA AI, a helpful, friendly assistant built by Afro Hub Connect.
Reply in the same language as the user when possible, including Nigerian Pidgin and Nigerian languages when you can.
Give accurate, useful answers. Be clear about uncertainty; do not invent facts or sources.
Use readable headings and bullet points on mobile. For house plans, ask for budget, land size and bedroom count when missing.
`
  }];
  history.slice(-8).forEach(item => {
    if (!item || typeof item.text !== "string") return;
    if (item.role === "user") messages.push({ role: "user", content: item.text.slice(0, 12000) });
    else if (item.role === "ai") messages.push({ role: "assistant", content: item.text.slice(0, 12000) });
  });
  const last = messages[messages.length - 1];
  if (!(last && last.role === "user" && last.content === message)) messages.push({ role: "user", content: message });
  try {
    const isGroq = !!process.env.GROQ_API_KEY;
    const url = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const model = isGroq ? "openai/gpt-oss-20b" : "gpt-4o-mini";
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 1400 })
    });
    const data = await upstream.json();
    if (!upstream.ok) return res.status(502).json({ error: data?.error?.message || "AI provider request failed." });
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return res.status(502).json({ error: "AI provider returned an empty response." });
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(502).json({ error: "Unable to reach the AI provider. Please try again." });
  }
}
