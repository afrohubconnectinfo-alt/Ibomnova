// SECURE BACKEND - KEY HIDDEN FROM HACKERS
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { message, type } = req.body;
  const API_KEY = process.env.GROQ_API_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'Set GROQ_API_KEY in Vercel ENV' });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: `You are Ibomnova. Type: ${type}` },
        { role: 'user', content: message }
      ]
    })
  });
  const data = await response.json();
  return res.status(200).json({ reply: data.choices[0].message.content });
}
