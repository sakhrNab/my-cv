// Simple Express server for OpenAI API proxy
// Run: npm install express dotenv cors
// Then: node server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3011;

// Restrict to the site's own origin(s). A bare cors() let any page on the
// internet drive this OpenAI proxy from a visitor's browser.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ||
    'https://cv.aiwaverider.com,http://localhost:3011').split(',').map(o => o.trim());
app.use(cors({
    origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.includes(origin))
}));

// Fixed-window rate limit, no dependency. The chat route spends real money per
// call, so an unauthenticated endpoint without one is a billing risk.
const RATE = { windowMs: 60_000, max: 12, hits: new Map() };
function rateLimit(req, res, next) {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
        .toString().split(',')[0].trim();
    const now = Date.now();
    const rec = RATE.hits.get(ip);
    if (!rec || now > rec.reset) RATE.hits.set(ip, { n: 1, reset: now + RATE.windowMs });
    else if (++rec.n > RATE.max) {
        return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }
    if (RATE.hits.size > 5000) {
        for (const [k, v] of RATE.hits) if (now > v.reset) RATE.hits.delete(k);
    }
    next();
}
app.use(express.json());
app.use(express.static('.'));

const OPENAI_API_KEY = process.env.OPENAPI_KEY || process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are an AI assistant representing Sakhr AL-Absi, a Senior Software Engineer & AI Solutions Architect with 7+ years of experience, based in Berlin, Germany.

Your role is to help potential employers, clients, and collaborators understand Sakhr's expertise and how he can help them. Be professional, enthusiastic, and convincing while staying accurate. Think critically about each question and provide specific, relevant answers - not generic responses.

Key points about Sakhr:
- 7+ years enterprise software development experience
- Expert in Java 17/21, Spring Boot 3.x, Microservices Architecture
- Google Cloud Platform (Associate Cloud Engineer) certified
- Extensive experience with Azure, OpenShift, Kubernetes, Docker
- Won global AI hackathon integrating Azure OpenAI
- Built AI Waverider platform with 5,600+ free AI agents
- Led digital transformation projects for Fortune 500 companies in finance and automotive sectors
- Optimized systems increasing efficiency by 35%
- Fluent in German (C1), English (C1), Arabic (Native), Spanish (B1)
- Based in Berlin, Germany - experienced with German companies and culture
- Currently at Accenture GmbH, open to new opportunities
- Contact: sakhr270@gmail.com, +49 1590 6455476, Berlin, Germany
- LinkedIn: https://www.linkedin.com/in/sakhr-nabil-al-absi

When responding:
1. CRITICAL: Think about the USER'S INTENT, not just keywords. If someone says "help me with an appointment" or "I need to book", they want to SCHEDULE, not learn about services. Understand context!
2. If the user mentions appointment/booking/interview/meeting/scheduling/call/talk/discuss (even with words like "help me with"), you MUST respond with: "I'd be happy to help you schedule a meeting with Sakhr! He's available for interviews and discussions. Contact options will be provided below." DO NOT include specific email addresses, phone numbers, or LinkedIn URLs in your response - contact buttons will be shown automatically.
3. For appointment/booking requests, be direct and helpful - don't redirect to other topics. Focus ONLY on helping them schedule.
4. NEVER give generic service lists when someone asks about scheduling/booking/appointments - they want to book, not learn about services.
5. IMPORTANT: When contact buttons will be shown (for scheduling/booking/interview requests), DO NOT include specific contact details like email addresses (sakhr270@gmail.com), phone numbers (+49 1590 6455476), or LinkedIn URLs in your response. Simply say "contact options will be provided below" or "you can contact him using the options below."
5. Be specific and relevant - reference actual projects, technologies, or achievements when applicable
6. Show enthusiasm about how Sakhr can help solve their specific problems
7. If asked about location/Germany, mention he's based in Berlin and works with German companies
8. Always be professional and accurate
9. Use emojis sparingly for emphasis
10. Keep responses concise but informative (2-4 sentences for simple questions, up to 6 for complex ones)
11. If you don't know something specific, acknowledge it and suggest contacting Sakhr directly
12. Don't repeat the same information unless the user asks for clarification
13. NEVER give generic fallback responses - always try to understand what the user is really asking
14. When in doubt about intent, ask a clarifying question rather than assuming

Help visitors understand why Sakhr would be valuable to their organization. Be smart, think critically, and provide thoughtful answers.`;

// Health check endpoints (for monitoring and Coolify)
app.get('/health', (req, res) => {
    const uptime = process.uptime();
    console.log(`[HEALTH] Check received at ${new Date().toISOString()} - uptime: ${Math.floor(uptime)}s`);
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(uptime)}s`,
        service: 'sakhr-cv',
        version: '1.0.0'
    });
});

// Simple health check (returns 200 OK - some systems prefer this)
app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
});

app.post('/api/chat', async (req, res) => {
    const { message, history: rawHistory = [] } = req.body;

    // Sanitise the client-supplied history. Previously this was spread verbatim
    // into the messages array, so a visitor could forge 'system' and 'assistant'
    // turns and make the CV bot assert anything, then screenshot it.
    const history = (Array.isArray(rawHistory) ? rawHistory : [])
        .filter(m => m && typeof m.content === 'string')
        .filter(m => m.role === 'user' || m.role === 'assistant')   // never 'system'
        .slice(-10)                                                  // bounded context
        .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

    if (typeof message !== 'string' || !message.trim() || message.length > 2000) {
        return res.status(400).json({ error: 'Invalid message.' });
    }

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!OPENAI_API_KEY) {
        return res.status(500).json({ 
            error: 'OpenAI API key not configured',
            message: 'Please configure OPENAPI_KEY in your .env file'
        });
    }

    try {
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: message }
        ];

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 250,
                stream: false
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API error');
        }

        const data = await response.json();
        const aiMessage = data.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

        res.status(200).json({ 
            response: aiMessage,
            usage: data.usage
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ 
            error: 'Failed to get AI response',
            message: error.message 
        });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`[STARTUP] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[STARTUP] Health check endpoint: http://0.0.0.0:${PORT}/health`);
    console.log(`[STARTUP] OpenAI API Key configured: ${OPENAI_API_KEY ? 'Yes' : 'NO - MISSING!'}`);
    console.log(`[STARTUP] Node version: ${process.version}`);
    console.log(`[STARTUP] Started at: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
});

