// Event listeners and initialization
window.addEventListener('scroll', () => {
    document.querySelector('.nav').classList.toggle('scrolled', window.scrollY > 100);
});

document.getElementById('mobileMenuBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector('.nav-links')?.classList.toggle('active');
});

// Typing Effect
let texts = ["AI Solutions Architect", "Senior Software Engineer", "Full-Stack Java Expert", "Enterprise System Builder"];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

// Update typing texts from translations if available
if (window.typingTexts && Array.isArray(window.typingTexts)) {
    texts = window.typingTexts;
}

function typeEngine() {
    const typingElement = document.getElementById('typing');
    if (!typingElement) return;

    // Update texts if translations loaded
    if (window.typingTexts && Array.isArray(window.typingTexts)) {
        texts = window.typingTexts;
    }

    const currentText = texts[textIndex];
    if (isDeleting) {
        typingElement.innerText = currentText.substring(0, charIndex--) + "|";
    } else {
        typingElement.innerText = currentText.substring(0, charIndex++) + "|";
    }

    let typeSpeed = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === currentText.length + 1) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typeSpeed = 500;
    }
    setTimeout(typeEngine, typeSpeed);
}

// Stats Counter Animation
function animateStats() {
    const stats = document.querySelectorAll('.mega-stat-number');
    const duration = 2000; // 2 seconds for all to finish
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (easeOutExpo)
        const ease = 1 - Math.pow(2, -10 * progress);

        stats.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            const suffix = stat.getAttribute('data-suffix') || '';
            const current = Math.floor(target * ease);
            
            // Format numbers with commas
            stat.innerText = current.toLocaleString() + suffix;
        });

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            // Ensure final values are exact
            stats.forEach(stat => {
                const target = parseFloat(stat.getAttribute('data-target'));
                const suffix = stat.getAttribute('data-suffix') || '';
                stat.innerText = target.toLocaleString() + suffix;
            });
        }
    }

    requestAnimationFrame(update);
}

// Hero Terminal Logic
function initHeroTerminal() {
    const input = document.getElementById('heroTermInput');
    const content = document.getElementById('heroTermContent');
    
    if (input) {
        input.addEventListener('keydown', function(e) {
            // Allow all keys including spaces - only process on Enter
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                const cmd = this.value.trim().toLowerCase();
                this.value = '';
                
                // Add command to history
                const cmdLine = document.createElement('div');
                cmdLine.innerHTML = `<span>sakhr@dubai:~$</span> ${cmd}`;
                content.appendChild(cmdLine);
                
                // Process command
                if (cmd === 'play' || cmd === 'game') {
                    const resp = document.createElement('div');
                    resp.innerHTML = `> Starting game...`;
                    resp.style.color = '#0f0';
                    content.appendChild(resp);
                    setTimeout(() => Game.start(), 800);
                } else if (cmd === 'help') {
                    const resp = document.createElement('div');
                    resp.innerHTML = `> Commands: play, chat, prompt, clear, help<br>> Type 'chat' to talk with AI assistant<br>> Type 'prompt' to learn about prompt engineering expertise`;
                    content.appendChild(resp);
                } else if (cmd === 'prompt' || cmd === 'promptengineering') {
                    const resp = document.createElement('div');
                    resp.innerHTML = `> 🎯 Expert Prompt Engineer<br>> → Crafted prompts for 5,600+ production AI agents<br>> → Optimized prompt strategies for Fortune 500 clients<br>> → Specialized in OpenAI GPT-4, Claude AI, Azure OpenAI`;
                    resp.style.color = '#4ade80';
                    content.appendChild(resp);
                } else if (cmd === 'chat' || cmd === 'ai') {
                    const resp = document.createElement('div');
                    resp.innerHTML = `> Opening AI chat...`;
                    resp.style.color = '#4ade80';
                    content.appendChild(resp);
                    setTimeout(() => {
                        toggleAI();
                        const aiInput = document.getElementById('aiInput');
                        if (aiInput) {
                            aiInput.focus();
                            // Scroll to AI chat
                            document.getElementById('aiChat').scrollIntoView({behavior: 'smooth', block: 'nearest'});
                        }
                    }, 300);
                } else if (cmd === 'clear') {
                    content.innerHTML = '';
                } else if (cmd.startsWith('chat ') || cmd.startsWith('ai ')) {
                    // Direct AI query from terminal
                    const query = cmd.substring(cmd.indexOf(' ') + 1);
                    const resp = document.createElement('div');
                    resp.innerHTML = `> Sending to AI: "${query}"`;
                    resp.style.color = '#4ade80';
                    content.appendChild(resp);
                    setTimeout(() => {
                        toggleAI();
                        const aiInput = document.getElementById('aiInput');
                        if (aiInput) {
                            aiInput.value = query;
                            sendAIMessage();
                        }
                    }, 500);
                } else {
                    const resp = document.createElement('div');
                    resp.innerHTML = `> Command not found. Type 'help' for commands.`;
                    content.appendChild(resp);
                }
                
                // Scroll to bottom
                content.scrollTop = content.scrollHeight;
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    typeEngine();
    setTimeout(animateStats, 500); // Start stats shortly after load
    initHeroTerminal();
});

// Profile Image Handling
const profileImg = new Image();
profileImg.src = './assets/profilepic.jpg';
profileImg.onload = function() {
    const pi = document.getElementById('profileImage');
    if (pi) pi.innerHTML = `<img src="${this.src}" alt="Sakhr">`;
    
    const heroPi = document.getElementById('heroProfileImage');
    if (heroPi) {
        heroPi.innerHTML = `<img src="${this.src}" alt="Sakhr">`;
    }
};

document.getElementById('fileInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            const result = ev.target.result;
            const pi = document.getElementById('profileImage');
            if (pi) pi.innerHTML = `<img src="${result}" alt="Profile">`;
            
            const heroPi = document.getElementById('heroProfileImage');
            if (heroPi) heroPi.innerHTML = `<img src="${result}" alt="Sakhr">`;
        };
        reader.readAsDataURL(file);
    }
});
