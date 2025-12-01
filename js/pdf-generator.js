async function generatePDF() {
    // Get current language from translation system
    let currentLang = window.currentLanguage || localStorage.getItem('preferredLanguage') || 'en';
    
    // Ensure translations are loaded
    if (!window.translations || !window.translations[currentLang]) {
        if (window.loadTranslation) {
            await window.loadTranslation(currentLang);
            currentLang = window.currentLanguage || currentLang;
        }
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = 210, pageH = 297, margin = 18;
    let y = 0;
    const addPage = () => { doc.addPage(); y = margin; };
    const checkSpace = n => { if (y + n > pageH - margin) addPage(); };
    const drawLine = () => { doc.setDrawColor(201, 162, 39); doc.setLineWidth(0.5); doc.line(margin, y, pageW - margin, y); y += 4; };
    
    // Helper function to get translation
    const getT = (key) => {
        if (window.t) {
            const translation = window.t(key);
            return translation || key;
        }
        // Fallback if translation system not available
        return key;
    };
    
    // Helper to strip HTML tags and emojis from translations
    const stripHTML = (str) => {
        if (!str) return '';
        // Remove HTML tags first
        let cleaned = str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        
        // Replace specific emojis with text equivalents before removing all emojis
        cleaned = cleaned.replace(/🇩🇪/g, '[DE]').replace(/🇦🇪/g, '[AE]').replace(/🇬🇧/g, '[GB]').replace(/🇸🇦/g, '[SA]').replace(/🇪🇸/g, '[ES]');
        
        // Remove all emojis (comprehensive Unicode emoji ranges)
        // This covers: Emoticons, Miscellaneous Symbols, Dingbats, Transport, Flags, etc.
        cleaned = cleaned.replace(/[\u{1F300}-\u{1F9FF}]/gu, ''); // Miscellaneous Symbols and Pictographs
        cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
        cleaned = cleaned.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport and Map
        cleaned = cleaned.replace(/[\u{1F1E0}-\u{1F1FF}]/gu, ''); // Flags (country flags)
        cleaned = cleaned.replace(/[\u{2600}-\u{26FF}]/gu, ''); // Miscellaneous Symbols
        cleaned = cleaned.replace(/[\u{2700}-\u{27BF}]/gu, ''); // Dingbats
        cleaned = cleaned.replace(/[\u{FE00}-\u{FE0F}]/gu, ''); // Variation Selectors
        cleaned = cleaned.replace(/[\u{200D}]/gu, ''); // Zero Width Joiner
        cleaned = cleaned.replace(/[\u{200C}]/gu, ''); // Zero Width Non-Joiner
        
        // Clean up extra spaces and trim
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        return cleaned;
    };
    
    doc.setFillColor(26, 54, 93);
    doc.rect(0, 0, pageW, 52, 'F');
    doc.setFillColor(201, 162, 39);
    doc.rect(0, 52, pageW, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(getT('cv.name').toUpperCase(), margin, 22);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(stripHTML(getT('cv.title')), margin, 32);
    doc.setFontSize(10);
    doc.setFillColor(201, 162, 39);
    doc.roundedRect(margin, 37, 115, 7, 1, 1, 'F');
    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    // Get badge texts and ensure emojis are removed
    const badge1 = stripHTML(getT('cv.badges.germanCitizen'));
    const badge2 = stripHTML(getT('cv.badges.yearsGermany'));
    const badge3 = stripHTML(getT('cv.badges.relocating'));
    const badges = `${badge1} | ${badge2} | ${badge3}`;
    // Ensure the text fits and doesn't contain any special characters
    const cleanBadges = badges.replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF]/g, '').trim();
    doc.text(cleanBadges, margin + 2, 42);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("sakhr270@gmail.com | +49 1590 6455476 | aiwaverider.com | linkedin.com/in/sakhr-nabil-al-absi", margin, 50);
    y = 62;
    
    const addSection = t => {
        checkSpace(15);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(26, 54, 93);
        doc.text(t, margin, y);
        y += 2;
        drawLine();
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
    };
    
    addSection(getT('cv.highlights.title') || 'KEY HIGHLIGHTS');
    const highlights = [
        stripHTML(getT('cv.highlights.germanCitizen') || 'German citizen with 15+ years in Germany, educated at TU Berlin and HTW Berlin'),
        stripHTML(getT('cv.highlights.founder') || 'Founder, CEO & CTO of AI Waverider — 5,600+ AI automation workflows'),
        stripHTML(getT('cv.highlights.corporate') || '7+ years corporate experience at Accenture, BMG Rights Management, Innocean Europe'),
        stripHTML(getT('cv.highlights.apps') || 'Built 11 applications from scratch this year while working full-time'),
        stripHTML(getT('cv.highlights.hackathon') || 'Won global AI hackathon integrating Azure OpenAI'),
        stripHTML(getT('cv.highlights.languages') || 'Trilingual: German (C1), English (C1), Arabic (Native)'),
        stripHTML(getT('cv.highlights.available') || 'Available Q1 2026 | Open to Full-time, Contract, Hybrid')
    ];
    highlights.forEach(h => {
        checkSpace(6);
        const lines = doc.splitTextToSize("• " + h, pageW - margin * 2 - 5);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4.5;
    });
    y += 4;
    
    addSection(getT('summary.title'));
    const summary = stripHTML(getT('summary.paragraph1') + ' ' + getT('summary.paragraph2') + ' ' + getT('summary.paragraph3'));
    const sl = doc.splitTextToSize(summary, pageW - margin * 2);
    doc.text(sl, margin, y);
    y += sl.length * 4.5 + 6;
    
    addSection(getT('experience.title'));
    const experiences = [
        { 
            t: getT('experience.founder.role'), 
            c: getT('experience.founder.company'), 
            d: getT('experience.founder.date'), 
            pts: [
                stripHTML(getT('experience.founder.points.vision')),
                stripHTML(getT('experience.founder.points.development')),
                stripHTML(getT('experience.founder.points.ai')),
                stripHTML(getT('experience.founder.points.operations')),
                stripHTML(getT('experience.founder.points.growth'))
            ] 
        },
        { 
            t: getT('experience.accenture.role'), 
            c: getT('experience.accenture.company'), 
            d: getT('experience.accenture.date'), 
            pts: [
                stripHTML(getT('experience.accenture.points.architecture')),
                stripHTML(getT('experience.accenture.points.platform')),
                stripHTML(getT('experience.accenture.points.modernization')),
                stripHTML(getT('experience.accenture.points.automotive')),
                stripHTML(getT('experience.accenture.points.ai')),
                stripHTML(getT('experience.accenture.points.coordination'))
            ] 
        },
        { 
            t: getT('experience.scopeland.role'), 
            c: getT('experience.scopeland.company'), 
            d: getT('experience.scopeland.date'), 
            pts: [
                stripHTML(getT('experience.scopeland.points.sql')),
                stripHTML(getT('experience.scopeland.points.lowCode')),
                stripHTML(getT('experience.scopeland.points.database'))
            ] 
        },
        { 
            t: getT('experience.innocean.role'), 
            c: getT('experience.innocean.company'), 
            d: getT('experience.innocean.date'), 
            pts: [
                stripHTML(getT('experience.innocean.points.infrastructure')),
                stripHTML(getT('experience.innocean.points.windows')),
                stripHTML(getT('experience.innocean.points.ad')),
                stripHTML(getT('experience.innocean.points.network'))
            ] 
        },
        { 
            t: getT('experience.bmg.role'), 
            c: getT('experience.bmg.company'), 
            d: getT('experience.bmg.date'), 
            pts: [
                stripHTML(getT('experience.bmg.points.international')),
                stripHTML(getT('experience.bmg.points.enterprise')),
                stripHTML(getT('experience.bmg.points.identity'))
            ] 
        }
    ];
    experiences.forEach(e => {
        checkSpace(25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(e.t, margin, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(43, 119, 230);
        doc.text(e.c, margin, y);
        doc.setTextColor(100, 100, 100);
        doc.text(e.d, pageW - margin, y, { align: "right" });
        doc.setTextColor(0, 0, 0);
        y += 5;
        e.pts.forEach(p => {
            checkSpace(5);
            const lines = doc.splitTextToSize("• " + p, pageW - margin * 2 - 8);
            doc.text(lines, margin + 3, y);
            y += lines.length * 4;
        });
        y += 3;
    });
    
    addSection(getT('education.title'));
    const educations = [
        { 
            deg: getT('education.htw.degree'), 
            sch: getT('education.htw.institution'), 
            d: getT('education.htw.date'), 
            det: stripHTML(getT('education.htw.grade'))
        },
        { 
            deg: getT('education.tu.degree'), 
            sch: getT('education.tu.institution'), 
            d: getT('education.tu.date'), 
            det: stripHTML(getT('education.tu.description1'))
        }
    ];
    educations.forEach(e => {
        checkSpace(16);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(e.deg, margin, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(43, 119, 230);
        doc.text(e.sch, margin, y);
        doc.setTextColor(100, 100, 100);
        doc.text(e.d, pageW - margin, y, { align: "right" });
        doc.setTextColor(0, 0, 0);
        y += 5;
        doc.text(e.det, margin, y);
        y += 6;
    });
    
    addSection(getT('certifications.title'));
    const certifications = [
        `${stripHTML(getT('certifications.gcp.name'))} (${getT('certifications.gcp.date')})`,
        `${stripHTML(getT('certifications.accenture.name'))} (${getT('certifications.accenture.date')})`,
        `${stripHTML(getT('certifications.django.name'))} (${getT('certifications.django.date')})`,
        `${stripHTML(getT('certifications.tdd.name'))} (${getT('certifications.tdd.date')})`,
        `${stripHTML(getT('certifications.fullstack.name'))} (${getT('certifications.fullstack.date')})`,
        `${stripHTML(getT('certifications.sql.name'))} (${getT('certifications.sql.date')})`
    ];
    certifications.forEach(c => {
        checkSpace(5);
        doc.text("• " + c, margin + 2, y);
        y += 4.5;
    });
    y += 4;
    
    addSection(getT('skills.title'));
    const programmingTags = getT('skills.tags.programming');
    const frameworksTags = getT('skills.tags.frameworks');
    const cloudTags = getT('skills.tags.cloud');
    const aiTags = getT('skills.tags.ai');
    const databasesTags = getT('skills.tags.databases');
    
    const skills = [
        `${getT('skills.categories.programming')}: ${Array.isArray(programmingTags) ? programmingTags.join(', ') : programmingTags}`,
        `${getT('skills.categories.frameworks')}: ${Array.isArray(frameworksTags) ? frameworksTags.join(', ') : frameworksTags}`,
        `${getT('skills.categories.cloud')}: ${Array.isArray(cloudTags) ? cloudTags.join(', ') : cloudTags}`,
        `${getT('skills.categories.ai')}: ${Array.isArray(aiTags) ? aiTags.join(', ') : aiTags}`,
        `${getT('skills.categories.databases')}: ${Array.isArray(databasesTags) ? databasesTags.join(', ') : databasesTags}`
    ];
    skills.forEach(s => {
        checkSpace(6);
        const lines = doc.splitTextToSize("• " + s, pageW - margin * 2 - 5);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4;
    });
    y += 4;
    
    addSection(getT('languages.title'));
    doc.text(`• ${getT('languages.german.name')}: ${getT('languages.german.level')}`, margin + 2, y);
    y += 4.5;
    doc.text(`• ${getT('languages.english.name')}: ${getT('languages.english.level')}`, margin + 2, y);
    y += 4.5;
    doc.text(`• ${getT('languages.arabic.name')}: ${getT('languages.arabic.level')}`, margin + 2, y);
    y += 4.5;
    doc.text(`• ${getT('languages.spanish.name')}: ${getT('languages.spanish.level')}`, margin + 2, y);
    
    const total = doc.internal.getNumberOfPages();
    const footerTemplate = getT('cv.footer') || 'Page {page}/{total} | Sakhr AL-Absi | German Citizen | Founder/CEO/CTO AI Waverider | Q1 2026';
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        const pageText = footerTemplate.replace('{page}', i).replace('{total}', total);
        doc.text(pageText, pageW / 2, pageH - 8, { align: "center" });
    }
    const filename = currentLang === 'en' ? 'Sakhr_AL_Absi_CV.pdf' : 
                     currentLang === 'de' ? 'Sakhr_AL_Absi_Lebenslauf.pdf' :
                     currentLang === 'es' ? 'Sakhr_AL_Absi_CV.pdf' :
                     currentLang === 'ar' ? 'صخر_العبسي_السيرة_الذاتية.pdf' : 'Sakhr_AL_Absi_CV.pdf';
    doc.save(filename);
}

