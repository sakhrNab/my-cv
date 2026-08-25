// Role profiles for the 2-page application CV (--compact build).
// Each profile selects the headline, which Accenture/founder bullets lead,
// which products headline the portfolio, and which skill categories show.
// Content itself always comes from translations/*.json — profiles only select.

export const EARLIER_ROLES_LABEL = {
    en: 'Earlier Roles',
    de: 'Frühere Stationen',
    es: 'Puestos anteriores',
    ar: 'أدوار سابقة'
};

export const PROFILES = {
    'senior-software-engineer': {
        title: {
            en: 'Senior Software Engineer | Java · Spring Boot · Cloud-Native Microservices | GCP Certified',
            de: 'Senior Software Engineer | Java · Spring Boot · Cloud-native Microservices | GCP-zertifiziert'
        },
        highlights: ['germanCitizen', 'corporate', 'founder', 'apps'],
        accentureBullets: ['architecture', 'platform', 'modernization', 'leadership'],
        founderBullets: ['development', 'ai'],
        products: ['emailai', 'zelavi', 'wavecut', 'omnalu'],
        skillCats: ['programming', 'frameworks', 'cloud', 'databases']
    },
    'gen-ai-engineer': {
        title: {
            en: 'Gen-AI Engineer | RAG · Agentic Systems · MCP | Production LLM Platforms',
            de: 'Gen-AI Engineer | RAG · Agentische Systeme · MCP | Produktive LLM-Plattformen'
        },
        highlights: ['germanCitizen', 'corporate', 'hackathon', 'apps'],
        accentureBullets: ['ai', 'architecture', 'platform'],
        founderBullets: ['ai', 'vision'],
        products: ['ralph', 'clinicai', 'laborsynopse', 'emailai'],
        skillCats: ['ai', 'programming', 'frameworks', 'databases']
    },
    'solutions-architect': {
        title: {
            en: 'Solutions Architect | Cloud-Native & Gen-AI Systems | GCP Certified',
            de: 'Solutions Architect | Cloud-native & Gen-AI-Systeme | GCP-zertifiziert'
        },
        highlights: ['germanCitizen', 'corporate', 'founder', 'apps'],
        accentureBullets: ['architecture', 'modernization', 'automotive'],
        founderBullets: ['vision', 'ai'],
        products: ['zelavi', 'emailai', 'leadoutbound', 'ralph'],
        skillCats: ['cloud', 'frameworks', 'ai', 'domain']
    },
    'tech-lead': {
        title: {
            en: 'Tech Lead & Senior Software Engineer | Enterprise Delivery · Gen-AI · Distributed Teams',
            de: 'Tech Lead & Senior Software Engineer | Enterprise-Delivery · Gen-AI · Verteilte Teams'
        },
        highlights: ['germanCitizen', 'corporate', 'founder', 'apps'],
        accentureBullets: ['coordination', 'leadership', 'architecture'],
        founderBullets: ['operations', 'development'],
        products: ['emailai', 'ralph', 'zelavi', 'wavecut'],
        skillCats: ['domain', 'programming', 'cloud', 'ai']
    }
};
