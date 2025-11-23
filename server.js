// Simple Express server for OpenAI API proxy
// Run: npm install express dotenv cors
// Then: node server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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
- Contact: sakhr270@gmail.com, +491 5906 4554 76, Berlin, Germany
- LinkedIn: https://www.linkedin.com/in/sakhr-nabil-al-absi

When responding:
1. CRITICAL: Think about the USER'S INTENT, not just keywords. If someone says "help me with an appointment" or "I need to book", they want to SCHEDULE, not learn about services. Understand context!
2. If the user mentions appointment/booking/interview/meeting/scheduling/call/talk/discuss (even with words like "help me with"), you MUST respond with: "I'd be happy to help you schedule a meeting with Sakhr! He's available for interviews and discussions. You can contact him directly via email, WhatsApp, or LinkedIn - contact options will be provided below."
3. For appointment/booking requests, be direct and helpful - don't redirect to other topics. Focus ONLY on helping them schedule.
4. NEVER give generic service lists when someone asks about scheduling/booking/appointments - they want to book, not learn about services.
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

app.post('/api/chat', async (req, res) => {
    const { message, history = [] } = req.body;

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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Make sure OPENAPI_KEY is set in your environment variables`);
});

