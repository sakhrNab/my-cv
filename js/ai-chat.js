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
        'java': 95, 'spring': 95, 'microservices': 90, 'python': 85, 'javascript': 85,
        'react': 80, 'vue': 85, 'node': 80, 'docker': 90, 'gcp': 90, 'azure': 85,
        'cloud': 90, 'devops': 85, 'agile': 90, 'ai': 85, 'openai': 85, 'sql': 90,
        'german': 95, 'arabic': 100, 'english': 95, 'leadership': 85, 'finance': 85, 'banking': 85,
        'automotive': 85, 'n8n': 90, 'automation': 85, 'founder': 90, 'ceo': 90, 'cto': 90,
        'startup': 85, 'entrepreneur': 90
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
        body.innerHTML += `<div class="msg-bubble msg-bot">${data.response || getLocalResponse(txt)}</div>`;
    } catch {
        document.getElementById('typing')?.remove();
        body.innerHTML += `<div class="msg-bubble msg-bot">${getLocalResponse(txt)}</div>`;
    }
    input.disabled = false;
    input.focus();
    body.scrollTop = body.scrollHeight;
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
    if (t.includes('founder') || t.includes('ceo') || t.includes('cto') || t.includes('waverider')) {
        return getT('aiChat.localResponses.founder');
    }
    if (t.includes('german') || t.includes('citizen')) {
        return getT('aiChat.localResponses.german');
    }
    if (t.includes('dubai') || t.includes('uae') || t.includes('europe') || t.includes('eu') || t.includes('berlin') || t.includes('remote') || t.includes('relocat')) {
        return getT('aiChat.localResponses.dubai');
    }
    if (t.includes('ai') || t.includes('openai')) {
        return getT('aiChat.localResponses.ai');
    }
    if (t.includes('available') || t.includes('start')) {
        return getT('aiChat.localResponses.available');
    }
    if (t.includes('contact') || t.includes('interview')) {
        return getT('aiChat.localResponses.contact');
    }
    return getT('aiChat.localResponses.default');
}

