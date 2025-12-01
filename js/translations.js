// Translation system
let currentLanguage = 'en';
let translations = {};

// Load translation file
async function loadTranslation(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) throw new Error(`Translation file not found: ${lang}.json`);
        translations[lang] = await response.json();
        currentLanguage = lang;
        // Update global references
        window.currentLanguage = currentLanguage;
        window.translations = translations;
        applyTranslations();
        return true;
    } catch (error) {
        console.error('Error loading translation:', error);
        // Fallback to English if translation fails
        if (lang !== 'en') {
            return loadTranslation('en');
        }
        return false;
    }
}

// Get translation by key path (e.g., "hero.headline" or "nav.home" or "skills.tags.programming.0")
function t(key, params = {}) {
    const keys = key.split('.');
    // Use current language translations, fallback to English
    const currentTranslations = translations[currentLanguage] || translations['en'] || {};
    let value = currentTranslations;
    
    for (const k of keys) {
        if (value && typeof value === 'object') {
            // Check if key is a number (array index)
            if (!isNaN(k) && Array.isArray(value)) {
                value = value[parseInt(k)];
            } else if (k in value) {
                value = value[k];
            } else {
                // Fallback to English
                const enTranslations = translations['en'] || {};
                value = enTranslations;
                for (const fk of keys) {
                    if (value && typeof value === 'object') {
                        if (!isNaN(fk) && Array.isArray(value)) {
                            value = value[parseInt(fk)];
                        } else if (fk in value) {
                            value = value[fk];
                        } else {
                            console.warn(`Translation key not found: ${key}`);
                            return key;
                        }
                    } else {
                        console.warn(`Translation key not found: ${key}`);
                        return key;
                    }
                }
                break;
            }
        } else {
            console.warn(`Translation key not found: ${key}`);
            return key;
        }
    }
    
    // Replace parameters in string (e.g., {level} -> actual value)
    if (typeof value === 'string' && Object.keys(params).length > 0) {
        return value.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
    }
    
    return value || key;
}

// Apply translations to all elements with data-i18n attribute
function applyTranslations() {
    // Update meta tags
    const titleEl = document.querySelector('title[data-i18n]');
    if (titleEl) {
        document.title = t('meta.title');
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t('meta.description');
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        // Skip if translation is an array (handled separately)
        if (Array.isArray(translation)) return;
        
        // Handle different element types
        if (element.tagName === 'INPUT' && element.type === 'text') {
            // Check if there's a separate placeholder attribute
            if (element.hasAttribute('data-i18n-placeholder')) {
                const placeholderKey = element.getAttribute('data-i18n-placeholder');
                element.placeholder = t(placeholderKey);
            } else {
                element.placeholder = translation;
            }
            // Only set textContent if it's not a placeholder-only input
            if (!element.hasAttribute('data-i18n-placeholder') || element.value) {
                element.textContent = translation;
            }
        } else if (element.tagName === 'INPUT' && element.type === 'button') {
            element.value = translation;
        } else if (element.hasAttribute('data-i18n-html')) {
            element.innerHTML = translation;
        } else {
            element.textContent = translation;
        }
    });
    
    // Update placeholder attributes separately
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // Handle skill tags with array indices (e.g., skills.tags.programming.0)
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (key && key.match(/\.\d+$/)) {
            // This is an array index reference (e.g., skills.tags.programming.0)
            const baseKey = key.substring(0, key.lastIndexOf('.'));
            const index = parseInt(key.substring(key.lastIndexOf('.') + 1));
            const array = t(baseKey);
            if (Array.isArray(array) && array[index]) {
                element.textContent = array[index];
            }
        }
    });
    
    // Update elements with data-i18n-html for HTML content
    document.querySelectorAll('[data-i18n-html]').forEach(element => {
        const key = element.getAttribute('data-i18n-html');
        element.innerHTML = t(key);
    });
    
    // Update typing texts
    const typingTexts = t('typing.texts');
    if (Array.isArray(typingTexts)) {
        // This will be handled by main.js
        window.typingTexts = typingTexts;
    }
    
    // Update skill tags dynamically
    updateSkillTags();
    
    // Update terminal initial content
    updateTerminalContent();
    
    // Update AI chat content
    updateAIChatContent();
}

// Update skill tags from translations
function updateSkillTags() {
    const skillCategories = [
        { selector: '.skill-category:nth-of-type(1) .skill-tag', key: 'skills.tags.programming' },
        { selector: '.skill-category:nth-of-type(2) .skill-tag', key: 'skills.tags.frameworks' },
        { selector: '.skill-category:nth-of-type(3) .skill-tag', key: 'skills.tags.cloud' },
        { selector: '.skill-category:nth-of-type(4) .skill-tag', key: 'skills.tags.ai' },
        { selector: '.skill-category:nth-of-type(5) .skill-tag', key: 'skills.tags.databases' },
        { selector: '.skill-category:nth-of-type(6) .skill-tag', key: 'skills.tags.domain' }
    ];
    
    skillCategories.forEach(({ selector, key }) => {
        const tags = t(key);
        if (Array.isArray(tags)) {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
                if (tags[index]) {
                    el.textContent = tags[index];
                }
            });
        }
    });
}

// Update terminal initial content
function updateTerminalContent() {
    const terminalBody = document.getElementById('terminalBody');
    if (!terminalBody) return;
    
    // Update existing terminal lines
    const whoamiOutput = terminalBody.querySelector('.terminal-output');
    if (whoamiOutput && whoamiOutput.textContent.includes('German Citizen')) {
        whoamiOutput.innerHTML = t('terminal.whoamiOutput');
    }
    
    // Update other terminal outputs
    const terminalLines = terminalBody.querySelectorAll('.terminal-line.terminal-output');
    terminalLines.forEach((line, index) => {
        const text = line.textContent || line.innerText;
        if (text.includes('15+ years')) {
            line.innerHTML = t('terminal.experience1');
        } else if (text.includes('7+ years')) {
            line.innerHTML = t('terminal.experience2');
        } else if (text.includes('Fortune 500')) {
            line.innerHTML = t('terminal.experience3');
        } else if (text.includes('ai_waverider_founder')) {
            line.innerHTML = t('terminal.achievements');
        } else if (text.includes('Founder, CEO & CTO')) {
            line.innerHTML = t('terminal.aiwaveriderOutput');
        } else if (text.includes('German (C1)')) {
            line.innerHTML = t('terminal.languagesOutput');
        } else if (text.includes('Available Q1')) {
            line.innerHTML = t('terminal.statusOutput');
        }
    });
}

// Update AI chat content
function updateAIChatContent() {
    const chatBody = document.getElementById('chatBody');
    if (chatBody) {
        const welcomeMsg = chatBody.querySelector('.welcome-msg');
        if (welcomeMsg) {
            welcomeMsg.innerHTML = t('aiChat.welcome');
        }
    }
    
    // Update suggestion buttons
    const suggestions = document.querySelectorAll('[data-suggestion]');
    suggestions.forEach(btn => {
        const type = btn.getAttribute('data-suggestion');
        const text = t(`aiChat.suggestions.${type}`);
        if (btn.querySelector('i')) {
            btn.innerHTML = btn.querySelector('i').outerHTML + ' ' + text;
        } else {
            btn.textContent = text;
        }
    });
}

// Change language
async function changeLanguage(lang) {
    await loadTranslation(lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    // Set RTL for Arabic
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
    }
    // Store preference
    localStorage.setItem('preferredLanguage', lang);
    // Update language switcher display
    updateLangSwitcherDisplay(lang);
    // Close dropdown if open
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) dropdown.classList.remove('show');
}

// Update language switcher display
function updateLangSwitcherDisplay(lang) {
    const display = document.getElementById('currentLangDisplay');
    if (display) {
        const langMap = { 'en': 'EN', 'de': 'DE', 'es': 'ES', 'ar': 'AR' };
        display.textContent = langMap[lang] || lang.toUpperCase();
    }
    // Update active state in dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
    });
    // Update active state in language boxes
    document.querySelectorAll('.clickable-lang').forEach(box => {
        box.classList.toggle('active', box.getAttribute('data-lang') === lang);
    });
}

// Toggle language dropdown
function toggleLangDropdown() {
    const dropdown = document.getElementById('langDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const switcher = document.querySelector('.lang-switcher-container');
    const dropdown = document.getElementById('langDropdown');
    if (switcher && dropdown && !switcher.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Initialize translation system
document.addEventListener('DOMContentLoaded', async () => {
    // Load saved language preference or default to English
    const savedLang = localStorage.getItem('preferredLanguage') || 'en';
    await loadTranslation(savedLang);
    document.documentElement.lang = currentLanguage;
    // Set RTL for Arabic
    if (currentLanguage === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
    }
    // Update language switcher display
    updateLangSwitcherDisplay(currentLanguage);
});

// Export for use in other scripts
window.t = t;
window.changeLanguage = changeLanguage;
window.loadTranslation = loadTranslation;
window.toggleLangDropdown = toggleLangDropdown;
window.currentLanguage = currentLanguage;
window.translations = translations;

