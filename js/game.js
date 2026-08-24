const Game = {
    canvas: null,
    ctx: null,
    running: false,
    raf: null,
    lastTime: 0,
    score: 0,
    health: 100,
    level: 1,
    hits: 0,
    requiredHits: 10,
    ship: { x: 0, y: 0, w: 40, h: 32 },
    bullets: [],
    words: [],
    powerups: [],
    particles: [],
    keys: {},
    lastWordSpawn: 0,
    lastShot: 0,
    wordRate: 1800,
    fireRate: 150,
    weaponLevel: 0,
    weapons: [
        { name: 'Basic', bullets: 1, spread: 0, fireRate: 150 },
        { name: 'Dual Shot', bullets: 2, spread: 15, fireRate: 140 },
        { name: 'Triple', bullets: 3, spread: 20, fireRate: 130 },
        { name: 'Spread', bullets: 5, spread: 30, fireRate: 120 },
        { name: 'Rapid Fire', bullets: 3, spread: 15, fireRate: 80 }
    ],
    questions: [
        { q: "Why hire Sakhr?", correct: ["Java", "Spring Boot", "Cloud", "AI", "Docker", "Microservices", "German", "Founder", "CEO"], wrong: ["Outdated", "Legacy", "Slow"] },
        { q: "What makes Sakhr ideal for AI?", correct: ["OpenAI", "Claude", "RAGs", "n8n", "Automation", "AI Agents", "LangChain", "5600+"], wrong: ["No AI", "Basic", "Limited"] },
        { q: "Why choose Sakhr for cloud?", correct: ["GCP", "Azure", "Kubernetes", "DevOps", "Docker", "CI/CD", "Coolify"], wrong: ["On-premise", "Old", "Manual"] },
        { q: "What shows leadership?", correct: ["Team Lead", "Agile", "Offshore", "CEO", "CTO", "Founder", "Mentoring"], wrong: ["Solo", "Junior", "Isolated"] },
        { q: "Why does he fit an EU-wide team?", correct: ["EU Citizen", "German C2", "English fluent", "Arabic", "Remote", "CET"], wrong: ["Visa Needed", "Monolingual"] }
    ],
    currentQ: 0,
    start() {
        document.getElementById('gameOverlay').classList.add('active');
        this.init();
    },
    close() {
        document.getElementById('gameOverlay').classList.remove('active');
        this.running = false;
        if (this.raf) cancelAnimationFrame(this.raf);
        this.hideScreens();
    },
    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        this.reset(true);
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('keydown', e => this.keyDown(e));
        window.addEventListener('keyup', e => this.keys[e.key] = false);
        this.canvas.addEventListener('mousemove', e => {
            const r = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - r.left;
        });
        this.canvas.addEventListener('click', () => this.shoot());
        this.setupMobile();
        this.run();
    },
    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        // Ensure minimum canvas size for playability
        const minWidth = 280;
        const minHeight = 200;
        if (this.canvas.width < minWidth) this.canvas.width = minWidth;
        if (this.canvas.height < minHeight) this.canvas.height = minHeight;
        // Position ship with proper spacing from bottom (account for mobile controls)
        // Buttons are at bottom: 20px, height: 56px (or 50px/48px on smaller), so need ~100-110px clearance
        const bottomOffset = window.innerWidth <= 768 ? 110 : 60;
        this.ship.x = Math.max(0, Math.min(this.canvas.width - this.ship.w, this.canvas.width / 2 - this.ship.w / 2));
        this.ship.y = Math.max(0, this.canvas.height - bottomOffset);
    },
    setupMobile() {
        const l = document.getElementById('mobileLeft'),
            r = document.getElementById('mobileRight'),
            s = document.getElementById('mobileShoot');
        if (l) {
            l.ontouchstart = e => { e.preventDefault(); this.keys['ArrowLeft'] = true; };
            l.ontouchend = () => this.keys['ArrowLeft'] = false;
        }
        if (r) {
            r.ontouchstart = e => { e.preventDefault(); this.keys['ArrowRight'] = true; };
            r.ontouchend = () => this.keys['ArrowRight'] = false;
        }
        if (s) {
            s.ontouchstart = e => { e.preventDefault(); this.keys[' '] = true; };
            s.ontouchend = () => this.keys[' '] = false;
        }
    },
    keyDown(e) {
        if (e.key === 'Escape') {
            this.close();
            return;
        }
        this.keys[e.key] = true;
        if (e.key === ' ') {
            e.preventDefault();
            this.shoot();
        }
    },
    reset(full = true) {
        if (full) {
            this.score = 0;
            this.level = 1;
            this.currentQ = 0;
            this.weaponLevel = 0;
        }
        this.health = 100;
        this.hits = 0;
        this.bullets = [];
        this.words = [];
        this.powerups = [];
        this.particles = [];
        // Position ship with proper constraints (same as resize)
        // Buttons are at bottom: 20px, height: 56px (or 50px/48px on smaller), so need ~100-110px clearance
        const bottomOffset = window.innerWidth <= 768 ? 110 : 60;
        this.ship.x = Math.max(0, Math.min(this.canvas.width - this.ship.w, this.canvas.width / 2 - this.ship.w / 2));
        this.ship.y = Math.max(0, this.canvas.height - bottomOffset);
        this.requiredHits = 10 + (this.level - 1) * 3;
        this.wordRate = Math.max(800, 1800 - (this.level - 1) * 200);
        this.fireRate = this.weapons[Math.min(this.weaponLevel, this.weapons.length - 1)].fireRate;
        this.lastWordSpawn = performance.now();
        this.updateUI();
        this.updateQuestion();
        this.running = true;
    },
    run() {
        if (!this.running) return;
        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 16.67, 2);
        this.lastTime = now;
        this.update(dt, now);
        this.render();
        this.raf = requestAnimationFrame(() => this.run());
    },
    update(dt, now) {
        const spd = 10 * dt;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) this.ship.x = Math.max(0, this.ship.x - spd);
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) this.ship.x = Math.min(this.canvas.width - this.ship.w, this.ship.x + spd);
        if (this.keys[' '] && now - this.lastShot > this.fireRate) this.shoot();
        if (now - this.lastWordSpawn > this.wordRate) {
            this.spawnWord();
            this.lastWordSpawn = now;
        }
        if (Math.random() < 0.003 * dt) this.spawnPowerup();
        this.bullets = this.bullets.filter(b => {
            b.y -= 12 * dt;
            b.x += (b.vx || 0) * dt;
            return b.y > -20;
        });
        this.words = this.words.filter(w => {
            w.y += w.speed * dt;
            if (w.y > this.canvas.height) {
                if (w.correct) this.health -= 8;
                return false;
            }
            return true;
        });
        this.powerups = this.powerups.filter(p => {
            p.y += 2.5 * dt;
            p.rot += 0.06 * dt;
            return p.y < this.canvas.height + 30;
        });
        this.particles = this.particles.filter(p => {
            p.life -= dt * 0.05;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            return p.life > 0;
        });
        for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
            const b = this.bullets[bi];
            for (let wi = this.words.length - 1; wi >= 0; wi--) {
                const w = this.words[wi];
                if (this.collide(b.x - 4, b.y, 8, 14, w.x - 5, w.y - 15, w.width + 10, 22)) {
                    this.bullets.splice(bi, 1);
                    this.words.splice(wi, 1);
                    this.spawnParticles(w.x + w.width / 2, w.y, w.correct ? '#0f0' : '#f00');
                    if (w.correct) {
                        this.score += 15;
                        this.hits++;
                        if (this.hits >= this.requiredHits) this.levelComplete();
                    } else this.health -= 8;
                    this.updateUI();
                    break;
                }
            }
        }
        for (let pi = this.powerups.length - 1; pi >= 0; pi--) {
            const p = this.powerups[pi];
            if (this.collide(this.ship.x, this.ship.y, this.ship.w, this.ship.h, p.x - 15, p.y - 15, 30, 30)) {
                this.powerups.splice(pi, 1);
                this.spawnParticles(p.x, p.y, p.type === 'health' ? '#0f0' : '#ffd700');
                if (p.type === 'health') this.health = Math.min(100, this.health + 20);
                else this.score += 50;
                this.updateUI();
            }
        }
        if (this.health <= 0) this.gameOver();
    },
    render() {
        const c = this.ctx, w = this.canvas.width, h = this.canvas.height;
        const grad = c.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#000428');
        grad.addColorStop(1, '#004e92');
        c.fillStyle = grad;
        c.fillRect(0, 0, w, h);
        c.fillStyle = '#fff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 47 + performance.now() * 0.01) % w;
            const y = (i * 73 + performance.now() * 0.015) % h;
            c.globalAlpha = 0.2 + Math.random() * 0.5;
            c.fillRect(x, y, 1.5, 1.5);
        }
        c.globalAlpha = 1;
        this.particles.forEach(p => {
            c.globalAlpha = p.life;
            c.fillStyle = p.color;
            c.beginPath();
            c.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            c.fill();
        });
        c.globalAlpha = 1;
        c.shadowColor = '#0ff';
        c.shadowBlur = 8;
        c.fillStyle = '#0ff';
        this.bullets.forEach(b => c.fillRect(b.x - 2, b.y, 4, 14));
        c.shadowBlur = 0;
        c.font = 'bold 15px Segoe UI';
        this.words.forEach(w => {
            const rectX = w.x - 6;
            const rectWidth = w.width + 12;
            const rectCenterX = rectX + rectWidth / 2;
            c.fillStyle = w.correct ? 'rgba(0,255,0,0.15)' : 'rgba(255,0,0,0.15)';
            c.fillRect(rectX, w.y - 16, rectWidth, 22);
            c.fillStyle = w.correct ? '#0f0' : '#f00';
            c.shadowColor = w.correct ? '#0f0' : '#f00';
            c.shadowBlur = 10;
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(w.text, rectCenterX, w.y - 5);
            c.textAlign = 'left';
            c.textBaseline = 'alphabetic';
        });
        c.shadowBlur = 0;
        this.powerups.forEach(p => {
            c.save();
            c.translate(p.x, p.y);
            c.rotate(p.rot);
            c.fillStyle = p.type === 'health' ? '#0f0' : '#ffd700';
            c.shadowColor = c.fillStyle;
            c.shadowBlur = 15;
            c.beginPath();
            c.arc(0, 0, 14, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#fff';
            c.font = 'bold 14px Arial';
            c.textAlign = 'center';
            c.textBaseline = 'middle';
            c.fillText(p.type === 'health' ? '❤' : '⭐', 0, 0);
            c.restore();
        });
        c.shadowBlur = 0;
        const sx = this.ship.x, sy = this.ship.y, sw = this.ship.w, sh = this.ship.h;
        const shipColor = this.weaponLevel >= 3 ? '#ff0' : this.weaponLevel >= 1 ? '#0ff' : '#0af';
        c.fillStyle = shipColor;
        c.shadowColor = shipColor;
        c.shadowBlur = 15;
        c.beginPath();
        c.moveTo(sx + sw / 2, sy);
        c.lineTo(sx, sy + sh);
        c.lineTo(sx + sw / 2, sy + sh - 10);
        c.lineTo(sx + sw, sy + sh);
        c.closePath();
        c.fill();
        c.fillStyle = '#ff00ff';
        c.shadowColor = '#ff00ff';
        c.fillRect(sx + 6, sy + sh - 4, 8, 12);
        c.fillRect(sx + sw - 14, sy + sh - 4, 8, 12);
        c.shadowBlur = 0;
    },
    shoot() {
        const now = performance.now();
        if (now - this.lastShot < this.fireRate) return;
        this.lastShot = now;
        const weapon = this.weapons[Math.min(this.weaponLevel, this.weapons.length - 1)];
        const centerX = this.ship.x + this.ship.w / 2;
        const spreadAngle = weapon.spread * (Math.PI / 180);
        for (let i = 0; i < weapon.bullets; i++) {
            let angle = 0;
            if (weapon.bullets > 1) angle = -spreadAngle / 2 + (spreadAngle / (weapon.bullets - 1)) * i;
            this.bullets.push({ x: centerX + Math.sin(angle) * 10, y: this.ship.y, vx: Math.sin(angle) * 3 });
        }
    },
    spawnWord() {
        const q = this.questions[this.currentQ];
        const isC = Math.random() > 0.35;
        const list = isC ? q.correct : q.wrong;
        const txt = list[Math.floor(Math.random() * list.length)];
        this.ctx.font = 'bold 15px Segoe UI';
        const textWidth = this.ctx.measureText(txt).width + 12;
        // Ensure words spawn within visible bounds, accounting for text width
        const minX = Math.max(10, textWidth / 2);
        const maxX = Math.min(this.canvas.width - textWidth / 2 - 10, this.canvas.width - 10);
        const spawnX = Math.max(minX, Math.min(maxX, Math.random() * (maxX - minX) + minX));
        this.words.push({
            text: txt,
            x: spawnX,
            y: -25,
            width: textWidth,
            speed: 2.2 + Math.random() * 1.2 + (this.level - 1) * 0.4,
            correct: isC
        });
    },
    spawnPowerup() {
        // Ensure powerups spawn within visible bounds
        const minX = 30;
        const maxX = Math.max(minX, this.canvas.width - 30);
        this.powerups.push({
            x: Math.max(minX, Math.min(maxX, Math.random() * (maxX - minX) + minX)),
            y: -25,
            type: Math.random() > 0.4 ? 'health' : 'bonus',
            rot: 0
        });
    },
    spawnParticles(x, y, color) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: 3 + Math.random() * 4,
                life: 1,
                color
            });
        }
    },
    collide(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
    },
    updateUI() {
        document.getElementById('gameScore').textContent = this.score;
        document.getElementById('gameLevel').textContent = this.level;
        document.getElementById('totalLevels').textContent = this.questions.length;
        document.getElementById('gameHits').textContent = this.hits;
        document.getElementById('requiredHits').textContent = this.requiredHits;
        document.getElementById('weaponLevel').textContent = this.weapons[Math.min(this.weaponLevel, this.weapons.length - 1)].name;
        const hb = document.getElementById('healthBar'),
            ht = document.getElementById('healthText');
        hb.style.width = Math.max(0, this.health) + '%';
        ht.textContent = Math.max(0, Math.round(this.health)) + '%';
        hb.style.background = this.health > 60 ? 'linear-gradient(90deg,#0f0,#0fa)' : this.health > 30 ? 'linear-gradient(90deg,#ff0,#fa0)' : 'linear-gradient(90deg,#f00,#a00)';
    },
    updateQuestion() {
        const q = this.questions[this.currentQ];
        document.getElementById('gameQuestion').textContent = q ? q.q : 'Complete!';
    },
    levelComplete() {
        this.running = false;
        this.score += 150 * this.level;
        this.weaponLevel = Math.min(this.weaponLevel + 1, this.weapons.length - 1);
        document.getElementById('completedLevel').textContent = this.level;
        document.getElementById('levelScore').textContent = this.score;
        document.getElementById('rewardText').textContent = `Weapon: ${this.weapons[Math.min(this.weaponLevel, this.weapons.length - 1)].name}!`;
        this.showScreen('levelCompleteScreen');
    },
    nextLevel() {
        this.hideScreens();
        this.level++;
        this.currentQ++;
        if (this.level > this.questions.length) {
            this.victory();
            return;
        }
        this.reset(false);
        this.run();
    },
    gameOver() {
        this.running = false;
        document.getElementById('finalScore').textContent = this.score;
        this.showScreen('gameOverScreen');
    },
    victory() {
        this.running = false;
        document.getElementById('victoryScore').textContent = this.score;
        this.showScreen('victoryScreen');
    },
    restart() {
        this.hideScreens();
        this.reset(true);
        this.run();
    },
    showScreen(id) {
        document.getElementById(id).classList.add('active');
    },
    hideScreens() {
        document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    }
};


