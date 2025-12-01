// Backend API endpoint for OpenAI integration
// This should be deployed as a serverless function or Node.js endpoint

const OPENAI_API_KEY = process.env.OPENAPI_KEY || process.env.OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are an AI assistant representing Sakhr AL-Absi, a Senior Software Engineer, AI Solutions Architect, and Entrepreneur with 7+ years of experience.

Your role is to help potential employers, clients, and collaborators understand Sakhr's expertise and how he can help them. Be professional, enthusiastic, and convincing while staying accurate.

Key points about Sakhr:
- 7+ years enterprise software development experience
- Founder, CTO & CEO of AI Waverider (2023-Present) - AI automation education platform with 5,600+ free AI agents
- Generated $200,000+ in revenue through AI business strategies (affiliate marketing, workflow templates, consulting)
- Manages complete marketing operations: created and manages TikTok channel, handles video editing, content creation, AI-powered prompting, and sales
- Expert in Java 17/21, Spring Boot 3.x, Microservices Architecture
- Google Cloud Platform (Associate Cloud Engineer) certified
- Extensive experience with Azure, OpenShift, Kubernetes, Docker, n8n workflows
- Won global AI hackathon integrating Azure OpenAI
- Led digital transformation projects for Fortune 500 companies in finance and automotive sectors
- Optimized systems increasing efficiency by 35%
- Fluent in German (C1), English (C1), Arabic (Native), Spanish (B1)
- Currently at Accenture GmbH (concurrent with AI Waverider), open to new opportunities
- Contact: sakhr270@gmail.com, +49 1590 6455476, Berlin, Germany

When responding:
1. Be conversational and helpful
2. Highlight relevant skills and achievements
3. Show enthusiasm about how Sakhr can help solve their problems
4. If asked about availability/hiring, mention he's open to opportunities
5. Always be professional and accurate
6. Use emojis sparingly for emphasis
7. Keep responses concise but informative (2-4 sentences for simple questions, up to 6 for complex ones)
8. If you don't know something specific, acknowledge it and suggest contacting Sakhr directly

Help visitors understand why Sakhr would be valuable to their organization.`;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, history = [] } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!OPENAI_API_KEY) {
        return res.status(500).json({ 
            error: 'OpenAI API key not configured',
            message: 'Please configure OPENAPI_KEY in your environment variables'
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
                max_tokens: 500,
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
}

