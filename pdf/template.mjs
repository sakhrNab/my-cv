// Print-grade CV template: renders one language of translations/*.json into a
// self-contained A4 HTML document for Chromium PDF export (scripts/build-pdfs.mjs).
// Design system: Playfair Display + Inter (Amiri + IBM Plex Sans Arabic for ar),
// navy #1A365D / gold #C9A227 brand, logical CSS properties so ar mirrors itself.
//
// Two modes: full portfolio CV (profile = null), and 2-page application variant
// (profile from pdf/profiles.mjs — selects headline, bullets, products, skills;
// all content still comes from the translations).

import { EARLIER_ROLES_LABEL } from './profiles.mjs';

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu;

const clean = s => String(s ?? '').replace(EMOJI, '').replace(/\s+/g, ' ').trim();

const esc = s => clean(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Translation strings intentionally carry <strong>/<em> markup — keep it, drop emoji.
const rich = s => clean(s);

const ICONS = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m3 6 9 7 9-7"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2Z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.49 2.49 0 1 1 5 8.48a2.49 2.49 0 0 1-.02-4.98ZM3 9.75h4v10.5H3Zm7 0h3.8v1.44h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.6 4.77 5.98v5.03h-4v-4.46c0-1.06-.02-2.43-1.51-2.43-1.51 0-1.74 1.16-1.74 2.35v4.54H10Z"/></svg>'
};

const CONTACTS = [
    { icon: 'mail', text: 'sakhr270@gmail.com', href: 'mailto:sakhr270@gmail.com' },
    { icon: 'phone', text: '+49 1590 6455476', href: 'tel:+4915906455476' },
    { icon: 'globe', text: 'cv.aiwaverider.com', href: 'https://cv.aiwaverider.com' },
    { icon: 'globe', text: 'aiwaverider.com', href: 'https://aiwaverider.com' },
    { icon: 'linkedin', text: 'linkedin.com/in/sakhr-nabil-al-absi', href: 'https://www.linkedin.com/in/sakhr-nabil-al-absi' }
];

export function renderCV(t, lang, { photoDataUri, profile = null }) {
    const rtl = lang === 'ar';
    const dir = rtl ? 'rtl' : 'ltr';
    const g = (path, fallback = '') => {
        const v = path.split('.').reduce((o, k) => (o == null ? o : o[k]), t);
        return v == null ? fallback : v;
    };

    const fontHref = rtl
        ? 'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap'
        : 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap';
    const displayFont = rtl ? "'Amiri','Playfair Display',serif" : "'Playfair Display','Amiri',serif";
    const bodyFont = rtl ? "'IBM Plex Sans Arabic','Inter',sans-serif" : "'Inter',sans-serif";

    const titleStr = clean(profile?.title?.[lang] || g('cv.title'));
    const roleParts = titleStr.split(/\s*[|｜]\s*/).filter(Boolean);
    const roles = roleParts.map(esc).join('<span class="role-sep">◆</span>');

    const badges = ['germanCitizen', 'yearsGermany', 'relocating']
        .map(k => clean(g(`cv.badges.${k}`))).filter(Boolean)
        .map(b => `<span class="badge">${esc(b)}</span>`).join('');

    const contacts = CONTACTS.map(c =>
        `<a class="contact" href="${c.href}"><span class="ci">${ICONS[c.icon]}</span><bdi dir="ltr">${esc(c.text)}</bdi></a>`
    ).join('');

    const section = (title, extra = '') =>
        `<h2 class="sec"><span class="t">${esc(title)}</span></h2>${extra}`;

    const highlightEntries = Object.entries(g('cv.highlights', {}))
        .filter(([k, v]) => k !== 'title' && clean(v))
        .filter(([k]) => !profile || profile.highlights.includes(k));
    const highlights = highlightEntries
        .map(([, v]) => `<div class="hl">${rich(v)}</div>`).join('');

    const summaryKeys = profile ? ['paragraph1', 'paragraph3'] : ['paragraph1', 'paragraph2', 'paragraph3'];
    const summary = summaryKeys
        .map(k => rich(g(`summary.${k}`))).filter(Boolean)
        .map(p => `<p class="sum">${p}</p>`).join('');

    const xpArticle = (e, pointKeys = null) => {
        const pts = pointKeys
            ? pointKeys.map(k => e.points?.[k]).map(rich).filter(Boolean)
            : Object.values(e.points || {}).map(rich).filter(Boolean);
        const points = pts.map(p => `<li>${p}</li>`).join('');
        return `<article class="xp">
          <div class="xp-lede">
            <div class="xp-head">
              <h3 class="xp-role">${esc(e.role)}</h3>
              <span class="date-chip">${esc(e.date)}</span>
            </div>
            <div class="xp-co">${esc(e.company)}</div>
            ${!profile && clean(e.highlight) ? `<div class="xp-hl">${rich(e.highlight)}</div>` : ''}
            ${!profile && clean(e.description) ? `<p class="xp-desc">${rich(e.description)}</p>` : ''}
          </div>
          <ul class="pts">${points}</ul>
        </article>`;
    };

    let experience;
    if (profile) {
        // Application variant: employment story first, founder second,
        // early career compressed to one line per role.
        const earlier = ['scopeland', 'innocean', 'bmg']
            .map(k => g(`experience.${k}`, null)).filter(Boolean)
            .map(e => `<div class="earlier-row">
                <span class="earlier-role">${esc(e.role)}</span>
                <span class="earlier-co">${esc(e.company)}</span>
                <span class="earlier-date">${esc(e.date)}</span>
              </div>`).join('');
        experience = xpArticle(g('experience.accenture'), profile.accentureBullets)
            + xpArticle(g('experience.founder'), profile.founderBullets)
            + `<div class="earlier">
                <div class="earlier-label">${esc(EARLIER_ROLES_LABEL[lang] || EARLIER_ROLES_LABEL.en)}</div>
                ${earlier}
              </div>`;
    } else {
        experience = Object.entries(g('experience', {}))
            .filter(([, v]) => v && typeof v === 'object' && v.role)
            .map(([, e]) => xpArticle(e)).join('');
    }

    const products = Object.entries(g('products', {}))
        .filter(([, v]) => v && typeof v === 'object' && v.name)
        .filter(([k]) => !profile || profile.products.includes(k))
        .map(([, p]) => `<div class="card">
            <div class="card-head">
              <span class="card-name"><bdi>${esc(p.name)}</bdi></span>
              ${clean(p.tag) ? `<span class="tag">${esc(p.tag)}</span>` : ''}
            </div>
            <div class="card-desc">${rich(p.desc)}</div>
            ${profile ? '' : `<div class="card-stack"><bdi>${esc(p.stack)}</bdi></div>`}
          </div>`).join('');

    const education = ['htw', 'tu'].map(k => {
        const e = g(`education.${k}`, null);
        if (!e) return '';
        if (profile) {
            return `<div class="earlier-row">
                <span class="earlier-role">${esc(e.degree)}</span>
                <span class="earlier-co">${esc(e.institution)}</span>
                <span class="earlier-date">${esc(e.date)}</span>
              </div>`;
        }
        const det = [e.thesis, e.grade, e.description1, e.description2]
            .map(rich).filter(Boolean).map(d => `<li>${d}</li>`).join('');
        return `<article class="xp edu">
          <div class="xp-lede">
            <div class="xp-head">
              <h3 class="xp-role">${esc(e.degree)}</h3>
              <span class="date-chip">${esc(e.date)}</span>
            </div>
            <div class="xp-co">${esc(e.institution)}</div>
          </div>
          <ul class="pts">${det}</ul>
        </article>`;
    }).join('');

    const certifications = Object.entries(g('certifications', {}))
        .filter(([, v]) => v && typeof v === 'object' && v.name)
        .filter(([k]) => !profile || ['gcp', 'accenture'].includes(k))
        .map(([, c]) => `<div class="cert">
            <div class="cert-name">${esc(c.name)} <span class="cert-date">· ${esc(c.date)}</span></div>
            ${!profile && clean(c.description) ? `<div class="cert-desc">${rich(c.description)}</div>` : ''}
          </div>`).join('');

    const skills = Object.entries(g('skills.categories', {}))
        .filter(([k]) => !profile || profile.skillCats.includes(k))
        .map(([k, cat]) => {
            const raw = g(`skills.tags.${k}`, []);
            let tags = Array.isArray(raw) ? raw : String(raw).split(',');
            if (profile) tags = tags.slice(0, 9);
            const chips = tags.map(clean).filter(Boolean)
                .map(x => `<span class="chip"><bdi>${esc(x)}</bdi></span>`).join('');
            return chips ? `<div class="skill-row"><div class="skill-cat">${esc(cat)}</div><div class="chips">${chips}</div></div>` : '';
        }).join('');

    const integrations = profile ? '' : Object.entries(g('integrations', {}))
        .filter(([, v]) => v && typeof v === 'object' && v.label)
        .map(([, i]) => {
            const items = (Array.isArray(i.items) ? i.items : [i.items])
                .map(clean).filter(Boolean)
                .map(x => `<bdi>${esc(x)}</bdi>`).join('<span class="dot"> · </span>');
            return `<div class="int-label">${esc(i.label)}</div><div class="int-items">${items}</div>`;
        }).join('');

    const languages = profile
        ? `<div class="lang-line">${['german', 'english', 'arabic', 'spanish']
            .map(k => g(`languages.${k}`, null)).filter(Boolean)
            .map(l => `<strong>${esc(l.name)}</strong> ${esc(l.level)}`)
            .join('<span class="dot"> · </span>')}</div>`
        : ['german', 'english', 'arabic', 'spanish'].map(k => {
            const l = g(`languages.${k}`, null);
            return l ? `<div class="lang"><div class="lang-name">${esc(l.name)}</div><div class="lang-level">${esc(l.level)}</div></div>` : '';
        }).join('');

    const productsNote = !profile && clean(g('products.subtitle'))
        ? `<p class="sec-note">${rich(g('products.subtitle'))}</p>` : '';
    const integrationsSection = profile ? '' : `
${section(g('integrations.title', 'Integrations & AI Infrastructure'),
        clean(g('integrations.subtitle')) ? `<p class="sec-note">${rich(g('integrations.subtitle'))}</p>` : '')}
<div class="int-grid">${integrations}</div>`;

    return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="utf-8">
<title>${esc(g('cv.name'))} — CV</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref}">
<style>
:root{
  --navy:#1A365D; --navy-deep:#122A4C; --navy-ink:#0F2440;
  --gold:#C9A227; --gold-deep:#A8861D; --gold-soft:#EADFC2; --gold-tint:#FBF7EC;
  --ink:#232A35; --muted:#5B6472; --faint:#8A93A3;
  --line:#E3E8F0; --tint:#F6F8FB;
  --display:${displayFont}; --body:${bodyFont};
}
*{margin:0;padding:0;box-sizing:border-box}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:var(--body);font-size:9.2pt;line-height:1.44;color:var(--ink);background:#fff}
a{color:inherit;text-decoration:none}
strong{color:var(--navy);font-weight:600}

/* ---------- hero ---------- */
.hero{position:relative;overflow:hidden;border-radius:5mm;color:#fff;
  background:linear-gradient(135deg,var(--navy-ink) 0%,var(--navy) 58%,#23466F 100%);
  padding:7.5mm 8.5mm 0;break-inside:avoid}
.hero::before{content:'';position:absolute;top:0;inset-inline:0;height:1.3mm;
  background:linear-gradient(90deg,var(--gold-deep),#E9CB6C,var(--gold))}
.hero::after{content:'';position:absolute;inset-inline-end:-16mm;top:-20mm;width:70mm;height:70mm;
  border-radius:50%;background:radial-gradient(circle,rgba(201,162,39,.15),transparent 65%)}
.hero-grid{display:flex;align-items:center;gap:8mm;position:relative;z-index:1}
.hero-main{flex:1;min-width:0}
.name{font-family:var(--display);font-weight:700;font-size:25pt;line-height:1.12;letter-spacing:.01em}
.name::after{content:'';display:block;width:24mm;height:.9mm;margin-top:2.2mm;border-radius:1mm;
  background:linear-gradient(90deg,var(--gold),rgba(201,162,39,0))}
.roles{margin-top:3mm;font-size:7.6pt;font-weight:600;letter-spacing:.13em;text-transform:uppercase;
  color:#C9D4E6;line-height:1.9}
.role-sep{color:var(--gold);font-size:5.5pt;margin:0 2mm;vertical-align:.3mm;letter-spacing:0}
.badges{margin-top:3.2mm;display:flex;flex-wrap:wrap;gap:2mm}
.badge{font-size:7.3pt;font-weight:500;color:#F3E9CF;border:1px solid rgba(201,162,39,.55);
  background:rgba(201,162,39,.13);border-radius:99px;padding:1.1mm 3mm}
.portrait{flex:0 0 auto;position:relative}
.portrait img{width:33mm;height:33mm;object-fit:cover;border-radius:4.5mm;display:block;
  border:.8mm solid var(--gold);box-shadow:0 0 0 1.5mm rgba(255,255,255,.09),0 3mm 8mm rgba(0,0,0,.35)}
.contact-bar{position:relative;z-index:1;margin-top:4.5mm;margin-inline:-8.5mm;padding:2.6mm 8.5mm;
  display:flex;flex-wrap:wrap;gap:2mm 5mm;background:rgba(0,0,0,.22);
  border-top:1px solid rgba(255,255,255,.13)}
.contact{display:inline-flex;align-items:center;gap:1.6mm;font-size:7.4pt;color:#DCE4F2}
.ci{display:inline-flex;width:3mm;height:3mm;color:var(--gold)}
.ci svg{width:100%;height:100%}

/* ---------- sections ---------- */
.sec{display:flex;align-items:center;gap:3mm;margin:5mm 0 2.8mm;break-after:avoid}
.sec::before{content:'';flex:0 0 auto;width:2.5mm;height:2.5mm;background:var(--gold);
  transform:rotate(45deg);border-radius:.6mm}
.sec .t{font-family:var(--display);font-weight:600;font-size:12pt;color:var(--navy);
  letter-spacing:.05em;text-transform:uppercase}
.sec::after{content:'';flex:1;height:.35mm;border-radius:1mm;
  background:linear-gradient(to right,var(--gold),rgba(201,162,39,.1))}
[dir="rtl"] .sec::after{background:linear-gradient(to left,var(--gold),rgba(201,162,39,.1))}
.sec-note{font-size:8pt;color:var(--muted);margin:-1mm 0 2.4mm}

/* ---------- highlights ---------- */
.hl-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.3mm 6mm}
.hl{position:relative;padding-inline-start:4.4mm;font-size:8.8pt}
.hl::before{content:'';position:absolute;inset-inline-start:.5mm;top:.55em;width:1.6mm;height:1.6mm;
  background:var(--gold);transform:rotate(45deg);border-radius:.35mm}

/* ---------- summary ---------- */
.sum{margin-bottom:1.8mm;color:#333B48;font-size:9pt}

/* ---------- experience / education ---------- */
.xp{margin-bottom:4mm}
.xp-lede{break-inside:avoid}
.xp-head{display:flex;justify-content:space-between;align-items:baseline;gap:4mm}
.xp-role{font-weight:700;font-size:10.6pt;color:var(--ink)}
.date-chip{flex:0 0 auto;font-size:6.9pt;font-weight:600;letter-spacing:.07em;text-transform:uppercase;
  color:var(--navy);background:var(--gold-tint);border:1px solid var(--gold-soft);
  border-radius:99px;padding:.9mm 2.8mm}
.xp-co{margin-top:1mm;font-weight:600;font-size:9pt;color:var(--navy);
  padding-inline-start:2.4mm;border-inline-start:.8mm solid var(--gold)}
.xp-hl{margin-top:1.5mm;padding:1.6mm 3mm;font-size:8.4pt;color:#54492B;
  background:var(--gold-tint);border-inline-start:.8mm solid var(--gold);border-radius:1.5mm}
.xp-desc{margin:1.5mm 0 0;font-style:italic;color:var(--muted);font-size:8.7pt}
.pts{list-style:none;margin-top:1.5mm}
.pts li{position:relative;padding-inline-start:4.4mm;margin-bottom:1mm;font-size:8.7pt;color:#333B48}
.pts li::before{content:'';position:absolute;inset-inline-start:.6mm;top:.58em;width:1.5mm;height:1.5mm;
  background:var(--gold);transform:rotate(45deg);border-radius:.3mm}
.edu{margin-bottom:3mm}

/* ---------- earlier roles (compact variant) ---------- */
.earlier{break-inside:avoid;margin-top:1mm}
.earlier-label{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
  color:var(--navy);margin-bottom:1.4mm}
.earlier-row{display:flex;align-items:baseline;gap:3mm;margin-bottom:1.2mm;font-size:8.6pt}
.earlier-role{font-weight:600;color:var(--ink)}
.earlier-co{color:var(--muted);flex:1}
.earlier-date{color:var(--faint);font-size:7.6pt;white-space:nowrap}

/* ---------- products ---------- */
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:2.8mm}
.card{break-inside:avoid;border:1px solid var(--line);border-radius:3mm;padding:2.7mm 3.4mm;
  background:linear-gradient(180deg,#fff,#FAFBFD)}
.card-head{display:flex;justify-content:space-between;align-items:baseline;gap:2.5mm}
.card-name{font-weight:700;font-size:9.2pt;color:var(--navy)}
.tag{flex:0 0 auto;font-size:6.2pt;font-weight:700;text-transform:uppercase;letter-spacing:.07em;
  color:var(--gold-deep);background:var(--gold-tint);border-radius:99px;padding:.8mm 2.4mm}
.card-desc{margin-top:1.3mm;font-size:8pt;color:#3A4250}
.card-stack{margin-top:1.6mm;font-size:7pt;color:var(--faint);overflow-wrap:anywhere}

/* ---------- certifications ---------- */
.cert-grid{display:grid;grid-template-columns:1fr 1fr;gap:2mm 6mm}
.cert{break-inside:avoid}
.cert-name{font-weight:600;font-size:8.8pt;color:var(--ink)}
.cert-date{color:var(--faint);font-weight:500;font-size:7.4pt}
.cert-desc{margin-top:.6mm;font-size:7.8pt;color:var(--muted)}

/* ---------- skills ---------- */
.skill-row{break-inside:avoid;margin-bottom:2.2mm}
.skill-cat{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
  color:var(--navy);margin-bottom:1.2mm}
.chips{display:flex;flex-wrap:wrap;gap:1.2mm}
.chip{font-size:7.4pt;color:#33405A;background:var(--tint);border:1px solid var(--line);
  border-radius:99px;padding:.8mm 2.6mm}

/* ---------- integrations ---------- */
.int-grid{display:grid;grid-template-columns:40mm 1fr;gap:1.7mm 5mm}
.int-label{font-size:8pt;font-weight:700;color:var(--gold-deep);letter-spacing:.03em}
.int-items{font-size:7.8pt;color:#454E5C}
.dot{color:var(--gold)}

/* ---------- languages ---------- */
.lang-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}
.lang{break-inside:avoid;background:var(--tint);border:1px solid var(--line);
  border-radius:2.5mm;padding:2mm 3mm}
.lang-name{font-weight:700;font-size:8.8pt;color:var(--navy)}
.lang-level{margin-top:.5mm;font-size:7.5pt;color:var(--muted)}

/* ---------- compact (application variant) ---------- */
body.compact .sec{margin:3.6mm 0 2.2mm}
body.compact .hero{padding:7mm 8.5mm 0}
body.compact .portrait img{width:29mm;height:29mm}
body.compact .xp{margin-bottom:2.8mm}
body.compact .pts li{margin-bottom:.8mm}
body.compact .contact-bar{margin-top:4mm;padding:2.3mm 8.5mm}
.lang-line{font-size:8.6pt;color:#333B48}

/* Arabic: letter-spacing breaks cursive joining — neutralise it everywhere. */
[dir="rtl"] .roles,[dir="rtl"] .sec .t,[dir="rtl"] .date-chip,[dir="rtl"] .tag,
[dir="rtl"] .skill-cat,[dir="rtl"] .int-label,[dir="rtl"] .earlier-label{letter-spacing:0}
</style>
</head>
<body class="${profile ? 'compact' : ''}">
<header class="hero">
  <div class="hero-grid">
    <div class="hero-main">
      <h1 class="name">${esc(g('cv.name'))}</h1>
      <div class="roles">${roles}</div>
      <div class="badges">${badges}</div>
    </div>
    <div class="portrait"><img src="${photoDataUri}" alt="${esc(g('cv.name'))}"></div>
  </div>
  <div class="contact-bar">${contacts}</div>
</header>

${section(g('cv.highlights.title', 'Key Highlights'))}
<div class="hl-grid">${highlights}</div>

${section(g('summary.title', 'Professional Summary'))}
${summary}

${section(g('experience.title', 'Professional Experience'))}
${experience}

${section(g('products.title', 'Selected Products & Platforms'), productsNote)}
<div class="grid2">${products}</div>

${section(g('education.title', 'Education'))}
${education}

${section(g('certifications.title', 'Certifications'))}
<div class="cert-grid">${certifications}</div>

${section(g('skills.title', 'Technical Expertise'))}
${skills}
${integrationsSection}

${profile
        ? `<div class="skill-row"><div class="skill-cat">${esc(g('languages.title', 'Languages'))}</div>${languages}</div>`
        : `${section(g('languages.title', 'Languages'))}
<div class="lang-grid">${languages}</div>`}
</body>
</html>`;
}
