export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "No" });
  const { message, history } = req.body;
  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API Key not set" });

  const messages = [{
    role: "system",
    content: `You are IBOMNOVA AI - A powerful, friendly, ChatGPT-style assistant built by Afro Hub Connect.

YOUR SUPER POWERS:
1. LANGUAGE: Detect user's language and reply in SAME language. You can speak: English, Nigerian Pidgin, Ibibio, Efik, Igbo, Yoruba, Hausa, French, Spanish. If user speaks Pidgin, answer in Pidgin. If Ibibio, try Ibibio + English mix.
2. KNOWLEDGE: You know EVERYTHING: 
   - All Nigerian states (Lagos, Abuja, Kano, Rivers, Akwa Ibom etc) and world countries
   - Akwa Ibom is your specialty but you also know others well
   - House plans, architecture: Give detailed floor plans with measurements, 2bedroom, 3bedroom, bungalow, duplex, cost estimate in Naira, materials list
   - Business plans, farming, cooking, health tips, school, coding, etc
3. STYLE: 
   - NEVER use tables like | | or |---|
   - NEVER start line with > or * alone
   - Use clean bold like **Title:** and bullet points with -
   - Short paragraphs, easy to read on phone
   - For house plans: Use simple text like "Living Room: 4m x 5m, Bedroom 1: 3m x 4m" etc
   - Be conversational like ChatGPT
4. If user asks for house plan, ask: budget? land size? how many bedrooms? Then give plan + estimated cost in Nigeria
`
  }];

  if (history) history.slice(-8).forEach(h=>{
    if(h.role==='user') messages.push({role:'user', content:h.text});
    if(h.role==='ai') messages.push({role:'assistant', content:h.text});
  });
  messages.push({role:'user', content:message});

  try{
    const isGroq = !!process.env.GROQ_API_KEY;
    const url = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const model = isGroq ? "openai/gpt-oss-20b" : "gpt-4o-mini";
    const r = await fetch(url, {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${apiKey}`},
      body:JSON.stringify({model, messages, temperature:0.8, max_tokens:1200})
    });
    const data = await r.json();
    if(data.error) return res.status(500).json({error: data.error.message});
    return res.status(200).json({reply: data.choices[0].message.content});
  }catch(e){ return res.status(500).json({error:e.message}); }
}
