// AI Chat functions
function toggleAI() {
    document.getElementById('aiChat').classList.toggle('open');
}

function handleSuggestion(type) {
    const body = document.getElementById('chatBody');
    document.getElementById('chatSuggestions').style.display = 'none';
    const responses = {
        background: {
            user: "Tell me about Sakhr's background",
            bot: "<strong>German Citizen & Founder</strong><br><br>🇩🇪 <strong>15+ years</strong> living in Germany<br>🎓 <strong>TU Berlin & HTW Berlin</strong> graduate<br>💼 <strong>7+ years</strong> at Accenture, BMG, Innocean<br>🚀 <strong>Founder, CEO & CTO</strong> of AI Waverider<br>🌍 Collaborated with 25+ countries<br><br><strong>Unique Value:</strong> German precision + Arabic heritage + English fluency"
        },
        founder: {
            user: "Tell me about AI Waverider",
            bot: "<strong>AI Waverider. Founded & Built by Sakhr</strong><br><br>🚀 <strong>5,600+ AI agents</strong> & automation workflows<br>👨‍💼 <strong>Founder, CEO & CTO</strong><br>💻 Built <strong>entirely from scratch</strong> while working full-time<br>🔧 Full-stack: React, Node.js, Python, GCP, Docker<br>📈 Growing organic user base globally<br><br>Visit: <a href='https://aiwaverider.com' target='_blank' style='color:var(--gold);'>aiwaverider.com</a>"
        },
        dubai: {
            user: "Why is Sakhr moving to Dubai?",
            bot: "<strong>Why Dubai?</strong><br><br>🚀 <strong>Fastest-growing tech hub</strong> in the world<br>🌍 Perfect bridge between <strong>European & Middle Eastern</strong> markets<br>💡 Seeking <strong>innovative companies</strong> to build with<br>🏆 Bringing <strong>Fortune 500</strong> enterprise experience<br>🗣️ Trilingual: German, Arabic & English<br><br>Ready to contribute to UAE's digital transformation!"
        },
        interview: {
            user: "How can I contact Sakhr?",
            bot: "<strong>Let's Connect!</strong><br><br>📅 Available <strong>Q1 2025</strong><br>✅ Open to: Full-time, Contract, Hybrid"
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
    body.innerHTML += `<div class="msg-bubble msg-user">Job Match</div><div class="msg-bubble msg-bot"><strong>🎯 AI Job Match</strong><br>Paste a job description to see how well Sakhr matches:<div class="job-match-container"><textarea id="jobDescInput" class="job-match-textarea" placeholder="Paste job requirements here..."></textarea><button onclick="analyzeJobMatch()" class="job-match-btn"><i class="fas fa-magic"></i> Analyze Match</button><div id="matchResult"></div></div></div>`;
    body.scrollTop = body.scrollHeight;
}

function analyzeJobMatch() {
    const jobDesc = document.getElementById('jobDescInput').value.toLowerCase();
    const resultDiv = document.getElementById('matchResult');
    if (!jobDesc.trim()) {
        resultDiv.innerHTML = '<p style="color:red;">Please paste a job description first.</p>';
        return;
    }
    const skills = {
        'java': 95, 'spring': 95, 'microservices': 90, 'python': 85, 'javascript': 85, 'typescript': 80,
        'react': 80, 'vue': 85, 'node': 80, 'docker': 90, 'kubernetes': 85, 'gcp': 90, 'azure': 85,
        'aws': 75, 'cloud': 90, 'devops': 85, 'agile': 90, 'ai': 85, 'openai': 85, 'sql': 90,
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
    resultDiv.innerHTML = `<div class="match-result"><div class="match-score" style="color:${color}">${avg}%</div><p><strong>${level} Match!</strong></p><p><strong>Matched Skills (${matched.length}):</strong> ${matched.slice(0, 10).map(s => s.skill).join(', ')}</p>${avg >= 70 ? '<p style="color:#0f0;margin-top:8px;">✓ Highly recommended candidate!</p>' : ''}</div>`;
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
    t = t.toLowerCase();
    if (t.includes('founder') || t.includes('ceo') || t.includes('cto') || t.includes('waverider')) {
        return "<strong>Founder, CEO & CTO of AI Waverider</strong><br><br>Built 5,600+ AI agents & automation workflows while working full-time at Accenture. Full-stack platform: React, Node.js, Python, GCP.";
    }
    if (t.includes('german') || t.includes('citizen')) {
        return "<strong>German citizen</strong> with 15+ years in Germany. Educated at TU Berlin & HTW Berlin. 7+ years corporate experience.";
    }
    if (t.includes('dubai') || t.includes('uae')) {
        return "Relocating to Dubai to join UAE's tech ecosystem. German precision + Arabic heritage + English fluency = unique bridge.";
    }
    if (t.includes('ai') || t.includes('openai')) {
        return "Won global AI hackathon. Built AI Waverider with 5,600+ agents. Expert in OpenAI, Claude, n8n, RAGs, LangChain.";
    }
    if (t.includes('available') || t.includes('start')) {
        return "<strong>Available Q1 2025</strong>. Open to full-time, contract, hybrid in Dubai.";
    }
    if (t.includes('contact') || t.includes('interview')) {
        return "📧 sakhr270@gmail.com<br>📱 +49 1590 6455476 (WhatsApp)<br>🔗 linkedin.com/in/sakhr-nabil-al-absi";
    }
    return "I can tell you about Sakhr's German background, his AI Waverider startup (he's Founder/CEO/CTO), technical skills, Dubai plans, or help with job matching!";
}

