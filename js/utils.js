// Terminal copy was hardcoded English and pre-retarget (it still said
// "5,600+ AI agents", "2024-Present" and the hackathon line, in every language).
// tt() reads the i18n value and falls back to the literal only if the key is absent.
function tt(key, fallback) {
    if (typeof window.t === 'function') {
        const v = window.t(key);
        if (typeof v === 'string' && v !== key) return v;
    }
    return fallback;
}

// Theme toggle
function toggleTheme() {
    const c = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', c === 'light' ? 'dark' : 'light');
}

// Skills filter
function filterSkills(v) {
    v = v.toLowerCase();
    document.querySelectorAll('.skill-tag').forEach(t => {
        const m = t.innerText.toLowerCase().includes(v);
        t.classList.toggle('dim', v.length > 0 && !m);
        t.classList.toggle('highlight', v.length > 0 && m);
    });
}

// Terminal functions
function toggleTerminal() {
    const win = document.getElementById('terminalWindow');
    const isOpen = win.classList.toggle('open');
    // Focus the prompt on open. Previously this only toggled a class, so the
    // terminal appeared with focus still on <body> and typing went nowhere
    // unless you happened to click the thin input line exactly.
    if (isOpen) {
        const input = document.getElementById('terminalInput');
        if (input) setTimeout(() => input.focus(), 50);
    }
}

function handleTerminalInput(e) {
    // Allow all keys including spaces - only process on Enter
    if (e.key !== 'Enter') {
        // Don't prevent default - allow normal typing including spaces
        return;
    }
    e.preventDefault(); // Only prevent default on Enter
    const input = document.getElementById('terminalInput'),
        body = document.getElementById('terminalBody'),
        cmd = input.value.trim().toLowerCase();
    input.value = '';
    const inputLine = body.querySelector('.terminal-input-line');
    const newCmd = document.createElement('div');
    newCmd.className = 'terminal-line';
    newCmd.innerHTML = `<span class="terminal-prompt">sakhr@berlin:~$</span> <span class="terminal-command">${cmd}</span>`;
    body.insertBefore(newCmd, inputLine);
    let output = '';
    switch (cmd) {
        case 'help':
            output = tt('terminalCommands.help', 'Commands: help, play, chat, skills, ai, contact, experience, education, products, founder, download, clear<br>Type "chat [message]" to talk with AI');
            break;
        case 'skills':
            output = tt('terminalCommands.skillsOutput', 'TypeScript • Java 17/21 • Python • Rust • C++17 • Swift • Next.js • NestJS • Spring Boot • Tauri • Flutter • Remotion • RAG • vector search • agentic pipelines • Qdrant • Ollama • GCP (certified) • Docker • Kubernetes');
            break;
        case 'prompt':
        case 'promptengineering':
        case 'genai':
        case 'gen-ai':
            output = tt('terminalCommands.aiOutput', '🤖 <span class="terminal-highlight">Gen-AI Engineering</span><br>→ RAG with vector search (Qdrant) and hybrid retrieval<br>→ Paragraph-aware chunking, embeddings chosen from a measured benchmark<br>→ Multi-provider LLM routing across 7 providers<br>→ Agentic pipelines with approval gates and proof-receipt verification<br>→ On-device inference: Ollama, GPU Whisper<br>→ Per-request cost accounting<br>→ GCP Certified Cloud Engineer');
            break;
        case 'contact':
            output = '📧 sakhr270@gmail.com | 📱 +49 1590 6455476 | 🌐 aiwaverider.com';
            break;
        case 'experience':
            output = tt('terminalCommands.experienceOutput', '→ Founder, CEO & CTO: AI Waverider (2025-Present)<br>→ Senior Software Engineer: Accenture (2022-Present)<br>→ Scopeland, Innocean, BMG Rights Management');
            break;
        case 'education':
            output = tt('terminalCommands.educationOutput', '🎓 HTW Berlin: B.Sc. Applied Computer Science<br>🎓 TU Berlin: Industrial Engineering');
            break;
        case 'aiwaverider':
        case 'founder':
            output = tt('terminalCommands.founderOutput', '🚀 <span class="terminal-highlight">Founder, CEO & CTO</span> | 23 production systems | RAG · vector search · agentic pipelines');
            break;
        case 'download':
            output = 'Generating CV... ✓';
            setTimeout(() => generatePDF(), 500);
            break;
        case 'play':
        case 'game':
            output = 'Starting game...';
            setTimeout(() => Game.start(), 500);
            break;
        case 'chat':
        case 'ai':
            output = 'Opening AI chat...';
            setTimeout(() => {
                toggleAI();
                const aiInput = document.getElementById('aiInput');
                if (aiInput) {
                    aiInput.focus();
                    document.getElementById('aiChat').scrollIntoView({behavior: 'smooth', block: 'nearest'});
                }
            }, 300);
            break;
        case 'clear':
            body.innerHTML = `<div class="terminal-input-line"><span class="terminal-prompt">sakhr@berlin:~$</span>&nbsp;<input type="text" class="terminal-input" id="terminalInput" placeholder="Type 'help'..." onkeydown="handleTerminalInput(event)"><span class="terminal-cursor">▋</span></div>`;
            return;
        default:
            // Check if it's a chat command with message
            if (cmd.startsWith('chat ') || cmd.startsWith('ai ')) {
                const query = cmd.substring(cmd.indexOf(' ') + 1);
                output = `Opening AI chat with: "${query}"...`;
                setTimeout(() => {
                    toggleAI();
                    const aiInput = document.getElementById('aiInput');
                    if (aiInput) {
                        aiInput.value = query;
                        sendAIMessage();
                    }
                }, 500);
            } else {
                output = `Command not found: ${cmd}. Type 'help' for available commands.`;
            }
    }
    const outputDiv = document.createElement('div');
    outputDiv.className = 'terminal-line terminal-output';
    outputDiv.innerHTML = output;
    body.insertBefore(outputDiv, inputLine);
    body.scrollTop = body.scrollHeight;
}

// Phone copy function
function copyPhone(e) {
    e.preventDefault();
    navigator.clipboard.writeText('+49 1590 6455476').then(() => {
        const btn = e.target.closest('.copy-btn');
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => btn.innerHTML = '<i class="fas fa-copy"></i>', 2000);
    });
}

