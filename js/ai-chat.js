// AI Chat functions
function toggleAI() {
    document.getElementById('aiChat').classList.toggle('open');
}

function handleSuggestion(type) {
    const body = document.getElementById('chatBody');
    document.getElementById('chatSuggestions').style.display = 'none';
    
    // Helper to get translation
    const getT = (key) => {
        if (window.t) {
            return window.t(key);
        }
        return key;
    };
    
    const responses = {
        background: {
            user: getT('aiChat.responses.background.user'),
            bot: getT('aiChat.responses.background.bot')
        },
        founder: {
            user: getT('aiChat.responses.founder.user'),
            bot: getT('aiChat.responses.founder.bot')
        },
        dubai: {
            user: getT('aiChat.responses.dubai.user'),
            bot: getT('aiChat.responses.dubai.bot')
        },
        interview: {
            user: getT('aiChat.responses.interview.user'),
            bot: getT('aiChat.responses.interview.bot')
        }
    };
    const r = responses[type];
    body.innerHTML += `<div class="msg-bubble msg-user">${r.user}</div>`;
    setTimeout(() => {
        let html = `<div class="msg-bubble msg-bot">${r.bot}</div>`;
        if (type === 'interview') {
            html = `<div class="msg-bubble msg-bot">${r.bot}<div class="contact-buttons"><a href="mailto:sakhr270@gmail.com" class="contact-btn email-btn"><i class="fas fa-envelope"></i> Email</a><a href="https://wa.me/4915906455476" target="_blank" class="contact-btn whatsapp-btn"><i class="fab fa-whatsapp"></i> WhatsApp</a><a href="https://www.linkedin.com/in/sakhr-nabil-al-absi" target="_blank" class="contact-btn linkedin-btn"><i class="fab fa-linkedin"></i> LinkedIn</a></div></div>`;
        }
        body.innerHTML += html;
        body.scrollTop = body.scrollHeight;
    }, 500);
}

function showJobMatch() {
    const body = document.getElementById('chatBody');
    document.getElementById('chatSuggestions').style.display = 'none';
    
    // Helper to get translation
    const getT = (key) => {
        if (window.t) {
            return window.t(key);
        }
        return key;
    };
    
    const userMsg = getT('aiChat.suggestions.jobMatch');
    const title = getT('aiChat.jobMatch.title');
    const description = getT('aiChat.jobMatch.description');
    const placeholder = getT('aiChat.jobMatch.placeholder');
    const analyzeBtn = getT('aiChat.jobMatch.analyze');
    
    body.innerHTML += `<div class="msg-bubble msg-user">${userMsg}</div><div class="msg-bubble msg-bot"><strong>${title}</strong><br>${description}<div class="job-match-container"><textarea id="jobDescInput" class="job-match-textarea" placeholder="${placeholder}"></textarea><button onclick="analyzeJobMatch()" class="job-match-btn"><i class="fas fa-magic"></i> ${analyzeBtn}</button><div id="matchResult"></div></div></div>`;
    body.scrollTop = body.scrollHeight;
}

function analyzeJobMatch() {
    const jobDesc = document.getElementById('jobDescInput').value.toLowerCase();
    const resultDiv = document.getElementById('matchResult');
    
    // Helper to get translation
    const getT = (key) => {
        if (window.t) {
            return window.t(key);
        }
        return key;
    };
    
    if (!jobDesc.trim()) {
        resultDiv.innerHTML = `<p style="color:red;">${getT('aiChat.jobMatch.error')}</p>`;
        return;
    }
    const skills = {
        // Weighted by demonstrable evidence, not by identity. The previous table
        // scored 'arabic' at 100 - higher than any engineering skill - and 'n8n'
        // above 'ai', while omitting Rust, TypeScript, Next.js, Kubernetes, RAG,
        // vector search and everything else the portfolio actually demonstrates.
        // Languages still count, but as skills rather than as the top signal.
        'typescript': 95, 'java': 95, 'spring': 95, 'python': 90, 'rust': 90,
        'javascript': 85, 'c++': 80, 'go': 60, 'sql': 90, 'bash': 75,
        'next.js': 95, 'nextjs': 95, 'react': 90, 'nestjs': 90, 'node': 90,
        'vue': 85, 'django': 80, 'flutter': 80, 'tauri': 85, 'prisma': 85,
        'microservices': 95, 'architecture': 90, 'distributed': 85, 'api': 85,
        'rag': 100, 'llm': 95, 'genai': 95, 'gen-ai': 95, 'vector': 95,
        'qdrant': 95, 'embedding': 90, 'agentic': 95, 'agent': 90, 'mcp': 90,
        'openai': 90, 'anthropic': 90, 'claude': 90, 'ollama': 85, 'langchain': 80,
        'ai': 90, 'machine learning': 75, 'nlp': 75, 'prompt': 80,
        'gcp': 95, 'google cloud': 95, 'kubernetes': 90, 'docker': 90,
        'openshift': 90, 'azure': 85, 'aws': 80, 'terraform': 70, 'ci/cd': 90,
        'devops': 85, 'cloud': 90, 'observability': 75,
        'postgres': 95, 'postgresql': 95, 'redis': 90, 'mongodb': 80,
        'supabase': 85, 'elasticsearch': 70, 'multi-tenant': 95, 'saas': 90,
        'gdpr': 95, 'dsgvo': 95, 'compliance': 85, 'security': 85,
        'fintech': 90, 'banking': 90, 'finance': 85, 'automotive': 85,
        'healthcare': 85, 'regulated': 90, 'marketplace': 85, 'e-commerce': 80,
        'agile': 85, 'scrum': 80, 'leadership': 90, 'tech lead': 95, 'mentoring': 85,
        'stakeholder': 80, 'offshore': 80,
        'german': 85, 'deutsch': 85, 'english': 85, 'arabic': 75,
        'founder': 85, 'cto': 90, 'startup': 80, 'entrepreneur': 80,
        'testing': 85, 'automation': 80, 'n8n': 70
    };
    let matched = [], total = 0, count = 0;
    for (const [skill, score] of Object.entries(skills)) {
        if (jobDesc.includes(skill)) {
            matched.push({ skill, score });
            total += score;
            count++;
        }
    }
    const avg = count > 0 ? Math.round(total / count) : 50;
    const level = avg >= 85 ? 'Excellent' : avg >= 70 ? 'Strong' : avg >= 50 ? 'Good' : 'Moderate';
    const color = avg >= 85 ? '#0f0' : avg >= 70 ? '#0af' : avg >= 50 ? '#ffd700' : '#f90';
    const matchedSkillsText = getT('aiChat.jobMatch.matchedSkills').replace('{count}', matched.length);
    const highlyRecommended = avg >= 70 ? `<p style="color:#0f0;margin-top:8px;">${getT('aiChat.jobMatch.highlyRecommended')}</p>` : '';
    resultDiv.innerHTML = `<div class="match-result"><div class="match-score" style="color:${color}">${avg}%</div><p><strong>${level} Match!</strong></p><p><strong>${matchedSkillsText}:</strong> ${matched.slice(0, 10).map(s => s.skill).join(', ')}</p>${highlyRecommended}</div>`;
}

async function sendAIMessage() {
    const input = document.getElementById('aiInput'),
        txt = input.value.trim();
    if (!txt) return;
    const body = document.getElementById('chatBody');
    document.getElementById('chatSuggestions').style.display = 'none';
    body.innerHTML += `<div class="msg-bubble msg-user">${txt}</div>`;
    input.value = '';
    input.disabled = true;
    body.innerHTML += `<div class="msg-bubble msg-bot typing-indicator" id="typing"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
    body.scrollTop = body.scrollHeight;
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: txt })
        });
        const data = await res.json();
        document.getElementById('typing')?.remove();
        if (data.response) {
            body.innerHTML += `<div class="msg-bubble msg-bot">${data.response}</div>`;
        } else {
            // The server answered but produced no completion - almost always a
            // missing/invalid OPENAI_API_KEY. Previously this silently served a
            // canned keyword answer, so a mis-configured server looked like a
            // dumb bot instead of an unconfigured one.
            body.innerHTML += offlineAnswer(txt, data.error);
        }
    } catch (err) {
        document.getElementById('typing')?.remove();
        body.innerHTML += offlineAnswer(txt, err && err.message);
    }
    input.disabled = false;
    input.focus();
    body.scrollTop = body.scrollHeight;
}


// Renders the keyword-matched answer, but labelled so it is obvious the live
// assistant is not running. Without the label a missing API key is
// indistinguishable from a broken bot.
function offlineAnswer(txt, reason) {
    const note = /api key/i.test(reason || '')
        ? 'Live assistant offline (no API key configured) - showing a preset answer.'
        : 'Live assistant unavailable - showing a preset answer.';
    return `<div class="ai-chat-offline">${note}</div>` +
           `<div class="msg-bubble msg-bot">${getLocalResponse(txt)}</div>`;
}

function getLocalResponse(t) {
    // Helper to get translation
    const getT = (key) => {
        if (window.t) {
            return window.t(key);
        }
        return key;
    };
    
    t = t.toLowerCase();

    // Word-boundary matching, most specific first.
    // Previously this used substring includes() in the wrong order: "available"
    // contains "ai", so "is he available?" - the question a recruiter is most
    // likely to type - always returned the Gen-AI blurb and never the
    // availability answer. "eu" likewise matched revenue, queue, measure, Europe.
    const has = (...words) => words.some(w => new RegExp(`\\b${w}`, 'i').test(t));

    if (has('available', 'availability', 'start', 'notice', 'verf[uü]gbar')) {
        return getT('aiChat.localResponses.available');
    }
    if (has('contact', 'email', 'reach', 'hire', 'kontakt')) {
        return getT('aiChat.localResponses.contact');
    }
    if (has('where', 'relocat', 'remote', 'berlin', 'europe', 'eu\\b', 'visa', 'sponsor')) {
        return getT('aiChat.localResponses.dubai');
    }
    if (has('founder', 'waverider', 'company', 'startup', 'ceo', 'cto')) {
        return getT('aiChat.localResponses.founder');
    }
    if (has('german', 'deutsch', 'language', 'sprach', 'citizen')) {
        return getT('aiChat.localResponses.german');
    }
    if (has('ai\\b', 'genai', 'gen-ai', 'openai', 'rag', 'llm', 'vector', 'agent', 'ml\\b')) {
        return getT('aiChat.localResponses.ai');
    }
    return getT('aiChat.localResponses.default');
}

