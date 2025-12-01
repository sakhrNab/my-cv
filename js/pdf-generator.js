async function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = 210, pageH = 297, margin = 18;
    let y = 0;
    const addPage = () => { doc.addPage(); y = margin; };
    const checkSpace = n => { if (y + n > pageH - margin) addPage(); };
    const drawLine = () => { doc.setDrawColor(201, 162, 39); doc.setLineWidth(0.5); doc.line(margin, y, pageW - margin, y); y += 4; };
    
    doc.setFillColor(26, 54, 93);
    doc.rect(0, 0, pageW, 52, 'F');
    doc.setFillColor(201, 162, 39);
    doc.rect(0, 52, pageW, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("SAKHR AL-ABSI", margin, 22);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Senior Software Engineer & AI Solutions Architect | Founder, CEO & CTO", margin, 32);
    doc.setFontSize(10);
    doc.setFillColor(201, 162, 39);
    doc.roundedRect(margin, 37, 115, 7, 1, 1, 'F');
    doc.setTextColor(26, 54, 93);
    doc.setFont("helvetica", "bold");
    doc.text("German Citizen | 15+ Years in Germany | Founder of AI Waverider", margin + 2, 42);
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
    
    addSection("KEY HIGHLIGHTS");
    ["German citizen with 15+ years in Germany, educated at TU Berlin and HTW Berlin", "Founder, CEO & CTO of AI Waverider — 5,600+ AI automation workflows", "7+ years corporate experience at Accenture, BMG Rights Management, Innocean Europe", "Built 11 applications from scratch this year while working full-time", "Won global AI hackathon integrating Azure OpenAI", "Trilingual: German (C1), English (C1), Arabic (Native)", "Available Q1 2025 | Open to Full-time, Contract, Hybrid"].forEach(h => {
        checkSpace(6);
        const lines = doc.splitTextToSize("• " + h, pageW - margin * 2 - 5);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4.5;
    });
    y += 4;
    
    addSection("PROFESSIONAL SUMMARY");
    const summary = "German citizen and Senior Software Engineer with 7+ years in enterprise development. Founder, CEO & CTO of AI Waverider with 5,600+ AI agents. Specializing in microservices, cloud technologies, and AI integration. Educated at Germany's top universities (TU Berlin, HTW Berlin). Built 11 applications this year while working full-time at Accenture. Unique value: German precision + Arabic heritage + English fluency.";
    const sl = doc.splitTextToSize(summary, pageW - margin * 2);
    doc.text(sl, margin, y);
    y += sl.length * 4.5 + 6;
    
    addSection("PROFESSIONAL EXPERIENCE");
    [
        { t: "Founder, CEO & CTO", c: "AI Waverider — AI Automation Platform", d: "2024 - Present", pts: ["Founded and built AI platform with 5,600+ AI agents & automation workflows", "Full-stack: React, Vue.js, Node.js, Python, PostgreSQL, GCP, Docker", "Integrated OpenAI GPT-4, Claude AI, LangChain, RAGs, vector databases", "Handled legal compliance (FTC), payments (Paddle), marketing", "Built entirely while maintaining full-time employment at Accenture"] },
        { t: "Senior Software Developer & Consultant", c: "Accenture GmbH, Germany", d: "Aug 2022 - Present", pts: ["Fortune 500: German banks (real-time payments) & automotive OEMs", "Spring Boot 3.x, Java 17/21, microservices, 100K+ daily transactions", "GCP & OpenShift with 99.9% uptime SLA", "Led migration reducing deployment time by 60%", "Won global AI hackathon integrating Azure OpenAI", "Offshore coordination across 3 time zones"] },
        { t: "Application Developer", c: "Scopeland Technology GmbH", d: "May-Jul 2022", pts: ["SQL optimization: 40% performance improvement", "Low Code application development"] },
        { t: "IT Infrastructure Specialist", c: "Innocean Worldwide Europe GmbH", d: "Mar 2020 - Mar 2022", pts: ["IT for 89 employees, 99.8% uptime", "Windows 10 migration, AD, Group Policies"] },
        { t: "Global IT Support Specialist", c: "BMG Rights Management GmbH", d: "Jul 2018 - Jan 2020", pts: ["Support across 6 countries: USA, UK, Spain, Sweden, Netherlands, France", "SCCM, AD, OKTA SSO, JIRA, O365"] }
    ].forEach(e => {
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
    
    addSection("EDUCATION");
    [
        { deg: "B.Sc. Applied Computer Science", sch: "HTW Berlin", d: "2017-2022", det: "Thesis: Microservices for Healthcare. Grade: 2.4" },
        { deg: "Industrial Engineering", sch: "TU Berlin (TU9 member)", d: "2012-2017", det: "Germany's elite technical universities alliance" }
    ].forEach(e => {
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
    
    addSection("CERTIFICATIONS");
    ["Google Associate Cloud Engineer (Dec 2024)", "Accenture Jump Start Program (Aug 2022)", "Advanced Django Development (May 2021)", "Test-Driven Development (May 2021)", "Full Stack Web Development (Feb 2021)", "Advanced SQL Programming (Mar 2018)"].forEach(c => {
        checkSpace(5);
        doc.text("• " + c, margin + 2, y);
        y += 4.5;
    });
    y += 4;
    
    addSection("TECHNICAL SKILLS");
    ["Languages: Java 17/21, Python, JavaScript, TypeScript, Node.js, SQL, Bash", "Frameworks: Spring Boot 3.x, Microservices, Django, Vue.js, React.js, REST/GraphQL", "Cloud: GCP (Certified), Azure, AWS, OpenShift, Docker, Kubernetes, CI/CD, Coolify, Nginx", "AI: OpenAI GPT, Claude AI, Azure OpenAI, n8n Workflows, RAGs, AI Agents, LangChain", "Databases: PostgreSQL, MySQL, MongoDB, Redis, Firebase, Supabase, Vector DBs"].forEach(s => {
        checkSpace(6);
        const lines = doc.splitTextToSize("• " + s, pageW - margin * 2 - 5);
        doc.text(lines, margin + 2, y);
        y += lines.length * 4;
    });
    y += 4;
    
    addSection("LANGUAGES");
    doc.text("• German: Fluent (C1) — 15+ years in Germany", margin + 2, y);
    y += 4.5;
    doc.text("• English: Fluent (C1) — Business proficiency", margin + 2, y);
    y += 4.5;
    doc.text("• Arabic: Native Speaker", margin + 2, y);
    y += 4.5;
    doc.text("• Spanish: Conversational (B1)", margin + 2, y);
    
    const total = doc.internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 130);
        doc.text(`Page ${i}/${total} | Sakhr AL-Absi | German Citizen | Founder/CEO/CTO AI Waverider | Q1 2025`, pageW / 2, pageH - 8, { align: "center" });
    }
    doc.save("Sakhr_AL_Absi_CV.pdf");
}

