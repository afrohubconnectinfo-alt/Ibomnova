// Verify Firebase ID tokens with Firebase Authentication before using paid AI providers.
const FIREBASE_WEB_API_KEY = process.env.FIREBASE_WEB_API_KEY || "AIzaSyCIjfg0XnJNlDnutG-8z0hzOH2Pun3Odog";
const requestCounts = new Map();

async function verifyFirebaseToken(idToken) {
  if (!idToken || typeof idToken !== "string" || idToken.length > 5000) return null;
  const response = await fetch("https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" + FIREBASE_WEB_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });
  if (!response.ok) return null;
  const data = await response.json();
  const user = Array.isArray(data.users) ? data.users[0] : null;
  return user && user.localId ? user.localId : null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization || "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: "Please sign in to use IbomNova AI." });

  let uid;
  try {
    uid = await verifyFirebaseToken(match[1]);
  } catch (error) {
    return res.status(503).json({ error: "Unable to verify your sign-in right now. Please try again." });
  }
  if (!uid) return res.status(401).json({ error: "Your session has expired. Please sign in again." });

  // Best-effort per-server-instance limit. A shared store is needed for a global quota.
  const now = Date.now();
  const bucket = requestCounts.get(uid);
  if (!bucket || now - bucket.startedAt >= 60_000) {
    requestCounts.set(uid, { startedAt: now, count: 1 });
  } else if (bucket.count >= 20) {
    return res.status(429).json({ error: "You've reached the short-term AI request limit. Please wait a minute." });
  } else {
    bucket.count += 1;
  }

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
    if (!item || typeof item.text !== "string" || item.text.length > 12000) return;
    if (item.role === "user") messages.push({ role: "user", content: item.text });
    else if (item.role === "ai") messages.push({ role: "assistant", content: item.text });
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
