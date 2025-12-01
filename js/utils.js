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
    document.getElementById('terminalWindow').classList.toggle('open');
}

function handleTerminalInput(e) {
    if (e.key !== 'Enter') return;
    const input = document.getElementById('terminalInput'),
        body = document.getElementById('terminalBody'),
        cmd = input.value.trim().toLowerCase();
    input.value = '';
    const inputLine = body.querySelector('.terminal-input-line');
    const newCmd = document.createElement('div');
    newCmd.className = 'terminal-line';
    newCmd.innerHTML = `<span class="terminal-prompt">sakhr@dubai:~$</span> <span class="terminal-command">${cmd}</span>`;
    body.insertBefore(newCmd, inputLine);
    let output = '';
    switch (cmd) {
        case 'help':
            output = 'Commands: help, play, chat, skills, contact, experience, education, aiwaverider, founder, download, clear<br>Type "chat [message]" to talk with AI';
            break;
        case 'skills':
            output = 'Java • Spring Boot • Python • GCP • Docker • K8s • OpenAI • n8n • React • Vue.js';
            break;
        case 'contact':
            output = '📧 sakhr270@gmail.com | 📱 +49 1590 6455476 | 🌐 aiwaverider.com';
            break;
        case 'experience':
            output = '→ Founder/CEO/CTO: AI Waverider (2024-Present)\n→ Senior Dev: Accenture (2022-Present)\n→ BMG, Innocean, Scopeland';
            break;
        case 'education':
            output = '🎓 HTW Berlin: B.Sc. Computer Science\n🎓 TU Berlin: Industrial Engineering';
            break;
        case 'aiwaverider':
        case 'founder':
            output = '🚀 <span class="terminal-highlight">Founder, CEO & CTO</span> | 5,600+ AI Agents | aiwaverider.com';
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
            body.innerHTML = `<div class="terminal-input-line"><span class="terminal-prompt">sakhr@dubai:~$</span>&nbsp;<input type="text" class="terminal-input" id="terminalInput" placeholder="Type 'help'..." onkeypress="handleTerminalInput(event)"><span class="terminal-cursor">▋</span></div>`;
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

