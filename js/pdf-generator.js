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
    
    // Helper function to get translation (alias for window.t)
    const getT = (key) => {
        if (window.t) {
            return window.t(key);
        }
        console.error('Translation function not available');
        return key;
    };
    
    // Helper to strip HTML tags and emojis from translations
    const stripHTML = (str) => {
        if (!str) return '';
        // Remove HTML tags first
        let cleaned = str.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        
        // Replace specific emojis with text equivalents before removing all emojis
        cleaned = cleaned.replace(/🇪🇺/g, '[EU]').replace(/🇩🇪/g, '[DE]').replace(/🇦🇪/g, '[AE]').replace(/🇬🇧/g, '[GB]').replace(/🇸🇦/g, '[SA]').replace(/🇪🇸/g, '[ES]');
        
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
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = 210, pageH = 297, margin = 20; // Increased margin for cleaner look
    let y = 0;
    const addPage = () => { doc.addPage(); y = margin + 10; }; // Start slightly lower on new pages
    const checkSpace = n => { if (y + n > pageH - margin) addPage(); };
    // Lighter, thinner separator line
    const drawLine = () => { 
        doc.setDrawColor(200, 200, 200); 
        doc.setLineWidth(0.2); 
        doc.line(margin, y, pageW - margin, y); 
        y += 6; // Increased spacing after line
    };
    
    // Header Background - Dark Blue
    // Calculate header height based on content
    const headerHeight = 60; // Reasonable height to accommodate all content
    doc.setFillColor(26, 54, 93);
    doc.rect(0, 0, pageW, headerHeight, 'F');
    
    // Gold Accent Line
    doc.setFillColor(201, 162, 39);
    doc.rect(0, headerHeight, pageW, 2, 'F'); // Thinner accent line
    
    // Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26); // Slightly smaller for elegance
    doc.setFont("helvetica", "bold");
    doc.text(getT('cv.name').toUpperCase(), margin, 25);
    
    // Title
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    // Wrap title text if it's too long
    const titleText = stripHTML(getT('cv.title'));
    const titleLines = doc.splitTextToSize(titleText, pageW - margin * 2);
    let titleY = 34;
    doc.text(titleLines, margin, titleY);
    
    // Adjust y position based on title lines
    const titleHeight = titleLines.length * 5;
    
    // Badge/Info Box - Use same gold color as accent line
    doc.setFontSize(9);
    doc.setFillColor(201, 162, 39); // Gold color matching the accent line
    // Calculate badge box position with proper spacing
    const badgeBoxY = titleY + titleHeight + 2; // More spacing from title
    const badgeBoxHeight = 8; // Slightly taller for better readability
    const badgeBoxWidth = pageW - margin * 2;
    
    doc.roundedRect(margin, badgeBoxY, badgeBoxWidth, badgeBoxHeight, 1, 1, 'F');
    doc.setTextColor(26, 54, 93); // Dark blue text on gold background for better contrast
    doc.setFont("helvetica", "bold");
    
    // Badge Text - wrap if needed
    const badge1 = stripHTML(getT('cv.badges.germanCitizen'));
    const badge2 = stripHTML(getT('cv.badges.yearsGermany'));
    const badge3 = stripHTML(getT('cv.badges.relocating'));
    const badges = `${badge1} • ${badge2} • ${badge3}`; // Use bullet separator
    const cleanBadges = badges.replace(/[^\x20-\x7E\u00A0-\u024F\u1E00-\u1EFF•]/g, '').trim();
    
    // Wrap badge text if too long
    const badgeLines = doc.splitTextToSize(cleanBadges, badgeBoxWidth - 3);
    
    // Center text vertically in the box
    const badgeLineHeight = 4.5;
    const totalTextHeight = badgeLines.length * badgeLineHeight;
    const badgeTextY = badgeBoxY + (badgeBoxHeight / 2) - (totalTextHeight / 2) + (badgeLineHeight / 2);
    
    // Center text horizontally for each line
    badgeLines.forEach((line, index) => {
        const lineWidth = doc.getTextWidth(line);
        const badgeTextX = margin + (badgeBoxWidth / 2) - (lineWidth / 2); // Center horizontally
        doc.text(line, badgeTextX, badgeTextY + (index * badgeLineHeight));
    });
    
    // Contact Info - with proper spacing and hyperlinks
    doc.setTextColor(200, 200, 200); // Light gray for contact info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const contactY = badgeBoxY + badgeBoxHeight + 5; // Spacing after badge box
    
    // Build contact info with hyperlinks
    const contactInfo = [
        { text: "sakhr270@gmail.com", link: "mailto:sakhr270@gmail.com" },
        { text: "+49 1590 6455476", link: "tel:+4915906455476" },
        { text: "cv.aiwaverider.com", link: "https://cv.aiwaverider.com" },
        { text: "aiwaverider.com", link: "https://aiwaverider.com" },
        { text: "linkedin.com/in/sakhr-nabil-al-absi", link: "https://linkedin.com/in/sakhr-nabil-al-absi" }
    ];
    
    let contactX = margin;
    const lineHeight = 4;
    
    contactInfo.forEach((item, index) => {
        if (index > 0) {
            // Add separator
            doc.setTextColor(150, 150, 150);
            doc.text("  |  ", contactX, contactY);
            contactX += doc.getTextWidth("  |  ");
        }
        // Add link text
        doc.setTextColor(200, 200, 200);
        const textWidth = doc.getTextWidth(item.text);
        doc.text(item.text, contactX, contactY);
        // Add clickable link area
        doc.link(contactX, contactY - lineHeight, textWidth, lineHeight, { url: item.link });
        contactX += textWidth;
    });
    
    // Ensure header height accommodates contact info, but keep it compact
    const finalHeaderHeight = Math.min(Math.max(headerHeight, contactY + 6), 62); // Cap at 62 to keep it reasonable
    if (finalHeaderHeight > headerHeight) {
        // Extend header background if needed
        doc.setFillColor(26, 54, 93);
        doc.rect(0, headerHeight, pageW, finalHeaderHeight - headerHeight, 'F');
        // Update gold line position
        doc.setFillColor(201, 162, 39);
        doc.rect(0, finalHeaderHeight, pageW, 2, 'F');
    }
    
    y = finalHeaderHeight + 10; // Start body content with proper spacing
    
    const addSection = t => {
        checkSpace(25); // More space check to prevent overlap
        y += 4; // Extra spacing before section header
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12); // Clean section headers
        doc.setTextColor(26, 54, 93); // Dark blue for headers
        doc.text(t.toUpperCase(), margin, y);
        y += 4; // More space between text and line
        drawLine();
        y += 2; // Additional spacing after line
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
    };
    
    // Highlights Section
    addSection(getT('cv.highlights.title') || 'KEY HIGHLIGHTS');
    const highlights = [
        stripHTML(getT('cv.highlights.germanCitizen')),
        stripHTML(getT('cv.highlights.founder')),
        stripHTML(getT('cv.highlights.corporate')),
        stripHTML(getT('cv.highlights.apps')),
        stripHTML(getT('cv.highlights.hackathon')),
        stripHTML(getT('cv.highlights.languages')),
        stripHTML(getT('cv.highlights.available'))
    ];
    
    highlights.forEach(h => {
        if (!h) return;
        checkSpace(8);
        // Custom bullet point
        doc.setFillColor(201, 162, 39); // Gold bullet
        doc.circle(margin + 1, y - 1, 0.5, 'F');
        doc.setTextColor(40, 40, 40);
        
        const lines = doc.splitTextToSize(h, pageW - margin * 2 - 8);
        doc.text(lines, margin + 5, y);
        y += lines.length * 5.5 + 3; // Better line height and paragraph spacing
    });
    y += 8; // Extra space after section
    
    // Summary Section
    addSection(getT('summary.title'));
    
    // Get individual paragraphs for better formatting
    const para1 = stripHTML(getT('summary.paragraph1'));
    const para2 = stripHTML(getT('summary.paragraph2'));
    const para3 = stripHTML(getT('summary.paragraph3'));
    
    doc.setTextColor(40, 40, 40); // Dark gray for better readability
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    // First paragraph
    if (para1) {
        const lines1 = doc.splitTextToSize(para1, pageW - margin * 2);
        doc.text(lines1, margin, y);
        y += lines1.length * 3.5 + 4; // Line height with spacing after paragraph
    }
    
    // Second paragraph with extra spacing
    if (para2) {
        y += 3; // Extra space between paragraphs
        const lines2 = doc.splitTextToSize(para2, pageW - margin * 2);
        doc.text(lines2, margin, y);
        y += lines2.length * 3.5 + 4;
    }
    
    // Third paragraph with extra spacing
    if (para3) {
        y += 3; // Extra space between paragraphs
        const lines3 = doc.splitTextToSize(para3, pageW - margin * 2);
        doc.text(lines3, margin, y);
        y += lines3.length * 3.5;
    }
    
    y += 10; // Final spacing after summary section
    

    addSection(getT('experience.title'));
    const experiences = [
        { 
            t: getT('experience.founder.role'), 
            c: getT('experience.founder.company'), 
            d: getT('experience.founder.date'), 
            desc: stripHTML(getT('experience.founder.description')),
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
            desc: stripHTML(getT('experience.accenture.description')),
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
            desc: stripHTML(getT('experience.scopeland.description')),
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
            desc: stripHTML(getT('experience.innocean.description')),
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
            desc: stripHTML(getT('experience.bmg.description')),
            pts: [
                stripHTML(getT('experience.bmg.points.international')),
                stripHTML(getT('experience.bmg.points.enterprise')),
                stripHTML(getT('experience.bmg.points.identity'))
            ] 
        }
    ];
    
    experiences.forEach(e => {
        checkSpace(35); // Ensure header stays with at least some content
        
        // Role Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(e.t, margin, y);
        
        // Date (Right aligned)
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(e.d, pageW - margin, y, { align: "right" });
        y += 5; // Spacing
        
        // Company Name
        doc.setFont("helvetica", "bold"); // Bold for company
        doc.setFontSize(10);
        doc.setTextColor(43, 119, 230); // Blue accent
        doc.text(e.c, margin, y);
        y += 5;
        
        // Description
        if (e.desc) {
            doc.setFont("helvetica", "italic");
            doc.setTextColor(80, 80, 80);
            const descLines = doc.splitTextToSize(e.desc, pageW - margin * 2);
            doc.text(descLines, margin, y);
            y += descLines.length * 5 + 3; // Better spacing
        }

        // Bullet points
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "normal");
        
        e.pts.forEach(p => {
            if (!p) return;
            checkSpace(7);
            // Bullet
            doc.setFillColor(150, 150, 150);
            doc.circle(margin + 1, y - 1, 0.4, 'F');
            
            const lines = doc.splitTextToSize(p, pageW - margin * 2 - 6);
            doc.text(lines, margin + 4, y);
            y += lines.length * 5 + 2; // Better line spacing
        });
        y += 8; // More space between jobs
    });
    
    // Education Section
    // ---- Selected Products & Platforms (europe branch) ----
    addSection(getT('products.title') || 'SELECTED PRODUCTS & PLATFORMS');
    const productSub = stripHTML(getT('products.subtitle'));
    if (productSub && productSub !== 'products.subtitle') {
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        const sl = doc.splitTextToSize(productSub, pageW - margin * 2);
        doc.text(sl, margin, y);
        y += sl.length * 4 + 4;
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
    }
    ['omnalu','emailai','leadoutbound','contentfactory','ralph','zelavi','wavecode','wavecut','translatepro','storefront','clinicai','laborsynopse'].forEach(pk => {
        const nm = stripHTML(getT('products.' + pk + '.name'));
        if (!nm || nm.indexOf('products.') === 0) return;
        const tag = stripHTML(getT('products.' + pk + '.tag'));
        const ds = stripHTML(getT('products.' + pk + '.desc'));
        const st = stripHTML(getT('products.' + pk + '.stack'));
        const dLines = doc.splitTextToSize(ds, pageW - margin * 2 - 4);
        const sLines = doc.splitTextToSize(st, pageW - margin * 2 - 4);
        checkSpace(12 + dLines.length * 4 + sLines.length * 3.6);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(26, 54, 93);
        doc.text(nm, margin, y);
        if (tag && tag.indexOf('products.') !== 0) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            doc.setTextColor(150, 120, 30);
            doc.text(tag, pageW - margin, y, { align: 'right' });
        }
        y += 4.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(45, 45, 45);
        doc.text(dLines, margin + 2, y);
        y += dLines.length * 4 + 1.5;
        doc.setFontSize(7.6);
        doc.setTextColor(115, 115, 115);
        doc.text(sLines, margin + 2, y);
        y += sLines.length * 3.6 + 5;
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
    });
    y += 6;

    addSection(getT('education.title'));
    const educations = [
        { 
            deg: getT('education.htw.degree'), 
            sch: getT('education.htw.institution'), 
            d: getT('education.htw.date'), 
            det: [
                stripHTML(getT('education.htw.thesis')),
                stripHTML(getT('education.htw.grade'))
            ]
        },
        { 
            deg: getT('education.tu.degree'), 
            sch: getT('education.tu.institution'), 
            d: getT('education.tu.date'), 
            det: [
                stripHTML(getT('education.tu.description1')),
                stripHTML(getT('education.tu.description2'))
            ]
        }
    ];
    educations.forEach(e => {
        checkSpace(25);
        // Degree
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(e.deg, margin, y);
        
        // Date
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(e.d, pageW - margin, y, { align: "right" });
        y += 5;
        
        // Institution
        doc.setTextColor(43, 119, 230);
        doc.setFont("helvetica", "bold");
        doc.text(e.sch, margin, y);
        y += 5;
        
        // Details
        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
        
        e.det.forEach(d => {
            if (!d) return;
            const lines = doc.splitTextToSize(d, pageW - margin * 2);
            doc.text(lines, margin, y);
            y += lines.length * 4.5 + 2;
        });
        y += 4; // Spacing between entries
    });
    
    // Certifications Section
    addSection(getT('certifications.title'));
    const certifications = [
        { 
            name: `${stripHTML(getT('certifications.gcp.name'))} (${getT('certifications.gcp.date')})`,
            desc: stripHTML(getT('certifications.gcp.description'))
        },
        { 
            name: `${stripHTML(getT('certifications.accenture.name'))} (${getT('certifications.accenture.date')})`,
            desc: stripHTML(getT('certifications.accenture.description'))
        },
        { 
            name: `${stripHTML(getT('certifications.django.name'))} (${getT('certifications.django.date')})`,
            desc: stripHTML(getT('certifications.django.description'))
        },
        { 
            name: `${stripHTML(getT('certifications.tdd.name'))} (${getT('certifications.tdd.date')})`,
            desc: stripHTML(getT('certifications.tdd.description'))
        },
        { 
            name: `${stripHTML(getT('certifications.fullstack.name'))} (${getT('certifications.fullstack.date')})`,
            desc: stripHTML(getT('certifications.fullstack.description'))
        },
        { 
            name: `${stripHTML(getT('certifications.sql.name'))} (${getT('certifications.sql.date')})`,
            desc: stripHTML(getT('certifications.sql.description'))
        }
    ];
    
    // Layout certifications in 2 columns
    const colWidth = (pageW - margin * 2) / 2 - 5;
    certifications.forEach((c, index) => {
        // Check space for a pair of rows (more space needed for description)
        if (index % 2 === 0) checkSpace(20);
        
        const xPos = index % 2 === 0 ? margin : margin + colWidth + 5;
        let currentY = y; // Track Y position for this certification
        
        // Bullet
        doc.setFillColor(201, 162, 39);
        doc.circle(xPos + 1, currentY - 1, 0.5, 'F');
        
        // Certification name (bold)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        const nameLines = doc.splitTextToSize(c.name, colWidth - 4);
        doc.text(nameLines, xPos + 4, currentY);
        currentY += nameLines.length * 4.5;
        
        // Certification description (normal, smaller, italic)
        if (c.desc) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            const descLines = doc.splitTextToSize(c.desc, colWidth - 4);
            doc.text(descLines, xPos + 4, currentY);
            currentY += descLines.length * 3.5 + 2; // Add spacing after description
        }
        
        // Advance Y only after second column or last item
        if (index % 2 !== 0 || index === certifications.length - 1) {
            // Calculate max height of both certifications in this row
            const rowStart = index % 2 === 0 ? index : index - 1;
            const rowCerts = certifications.slice(rowStart, Math.min(rowStart + 2, certifications.length));
            let maxHeight = 0;
            rowCerts.forEach(cert => {
                let h = 0;
                const nameLines = doc.splitTextToSize(cert.name, colWidth - 4);
                h += nameLines.length * 4.5;
                if (cert.desc) {
                    const descLines = doc.splitTextToSize(cert.desc, colWidth - 4);
                    h += descLines.length * 3.5 + 2;
                }
                maxHeight = Math.max(maxHeight, h);
            });
            y += maxHeight + 3; // Add spacing between rows
        }
    });
    y += 6;
    
    // Skills Section
    addSection(getT('skills.title'));
    const programmingTags = getT('skills.tags.programming');
    const frameworksTags = getT('skills.tags.frameworks');
    const cloudTags = getT('skills.tags.cloud');
    const aiTags = getT('skills.tags.ai');
    const databasesTags = getT('skills.tags.databases');
    
    const skills = [
        { cat: getT('skills.categories.programming'), tags: Array.isArray(programmingTags) ? programmingTags.join(', ') : programmingTags },
        { cat: getT('skills.categories.frameworks'), tags: Array.isArray(frameworksTags) ? frameworksTags.join(', ') : frameworksTags },
        { cat: getT('skills.categories.cloud'), tags: Array.isArray(cloudTags) ? cloudTags.join(', ') : cloudTags },
        { cat: getT('skills.categories.ai'), tags: Array.isArray(aiTags) ? aiTags.join(', ') : aiTags },
        { cat: getT('skills.categories.databases'), tags: Array.isArray(databasesTags) ? databasesTags.join(', ') : databasesTags },
        // Domain & Leadership was omitted here, so the PDF silently dropped every
        // domain and leadership signal (regulated healthcare, GDPR, team leadership)
        // for roles that explicitly include Tech Lead.
        { cat: getT('skills.categories.domain'), tags: (() => { const v = getT('skills.tags.domain'); return Array.isArray(v) ? v.join(', ') : v; })() }
    ];
    
    skills.forEach(s => {
        checkSpace(12); // More space check for wrapped content
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);
        doc.text(s.cat + ":", margin, y);
        y += 5; // Move to next line for tags
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        
        // Calculate available width for tags (full width minus margins)
        const contentWidth = pageW - margin * 2;
        
        // Split tags into lines that fit the width
        const lines = doc.splitTextToSize(s.tags, contentWidth);
        
        // Print all lines starting on a new line (not on same line as category)
        lines.forEach((line, index) => {
            if (index > 0) {
                y += 5.5; // Better line spacing for wrapped text
            }
            doc.text(line, margin, y);
        });
        
        // Add spacing after this category (account for all wrapped lines)
        y += Math.max(6, lines.length * 0.5); // More spacing, especially for multi-line tags
    });
    y += 4;
    
    // Languages Section
    // ---- Integrations & AI Infrastructure ----
    addSection(getT('integrations.title') || 'INTEGRATIONS & AI INFRASTRUCTURE');
    ['google','meta','llm','rag','voice','data','commerce','agentic'].forEach(ik => {
        const lb = stripHTML(getT('integrations.' + ik + '.label'));
        if (!lb || lb.indexOf('integrations.') === 0) return;
        const rawIt = getT('integrations.' + ik + '.items');
        const it = stripHTML(Array.isArray(rawIt) ? rawIt.join('  \u00B7  ') : rawIt);
        const iLines = doc.splitTextToSize(it, pageW - margin * 2 - 6);
        checkSpace(8 + iLines.length * 3.8);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(150, 120, 30);
        doc.text(lb, margin, y);
        y += 4;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(55, 55, 55);
        doc.text(iLines, margin + 3, y);
        y += iLines.length * 3.8 + 4;
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
    });
    y += 8;

    addSection(getT('languages.title'));
    const langs = [
        `${getT('languages.german.name')}: ${getT('languages.german.level')}`,
        `${getT('languages.english.name')}: ${getT('languages.english.level')}`,
        `${getT('languages.arabic.name')}: ${getT('languages.arabic.level')}`,
        `${getT('languages.spanish.name')}: ${getT('languages.spanish.level')}`
    ];
    
    // Horizontal layout for languages
    let langX = margin;
    langs.forEach((l, i) => {
        if (i === 2) { y += 6; langX = margin; } // New line after 2 langs
        doc.setFillColor(26, 54, 93);
        doc.circle(langX + 1, y - 1, 0.6, 'F');
        doc.text(l, langX + 4, y);
        langX += 90;
    });
    
    // Footer
    const total = doc.internal.getNumberOfPages();
    const footerTemplate = getT('cv.footer') || 'Page {page}/{total} | Sakhr AL-Absi | Senior Software Engineer & Gen-AI Architect';
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        // Draw footer line
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
        
        const pageText = footerTemplate.replace('{page}', i).replace('{total}', total);
        doc.text(pageText, pageW / 2, pageH - 8, { align: "center" });
    }
    const filename = currentLang === 'en' ? 'Sakhr_AL_Absi_CV.pdf' : 
                     currentLang === 'de' ? 'Sakhr_AL_Absi_Lebenslauf.pdf' :
                     currentLang === 'es' ? 'Sakhr_AL_Absi_CV.pdf' :
                     currentLang === 'ar' ? 'صخر_العبسي_السيرة_الذاتية.pdf' : 'Sakhr_AL_Absi_CV.pdf';
    doc.save(filename);
}

