#!/usr/bin/env node
// Builds the designed CV PDFs (one per language) from translations/*.json via
// pdf/template.mjs, printed with headless Chromium. Output: assets/pdf/.
// Usage: node scripts/build-pdfs.mjs [lang ...]        (default: en de es ar)
//        node scripts/build-pdfs.mjs --compact [lang ...]
// --compact builds the 2-page application variants (one per role profile in
// pdf/profiles.mjs) into applications/cv-variants/ (gitignored, not deployed).

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync, statSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { renderCV } from '../pdf/template.mjs';
import { PROFILES } from '../pdf/profiles.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'assets', 'pdf');
const PREVIEW_DIR = process.env.CV_PREVIEW_DIR || OUT_DIR;

const FILENAMES = {
    en: 'Sakhr_AL-Absi_CV_EN.pdf',
    de: 'Sakhr_AL-Absi_Lebenslauf_DE.pdf',
    es: 'Sakhr_AL-Absi_CV_ES.pdf',
    ar: 'Sakhr_AL-Absi_CV_AR.pdf'
};

function chromePath() {
    const candidates = [
        process.env.CHROME_PATH,
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/chromium'
    ].filter(Boolean);
    const found = candidates.find(p => existsSync(p));
    if (!found) throw new Error('No Chrome/Chromium found. Set CHROME_PATH.');
    return found;
}

const escapeHtml = s => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// cv.footer is "Page {page}/{total} | ..." — swap tokens for Chromium's counters.
function footerTemplate(t, rtl) {
    const raw = escapeHtml(t?.cv?.footer || 'Page {page}/{total}')
        .replace('{page}', '<span class="pageNumber"></span>')
        .replace('{total}', '<span class="totalPages"></span>');
    return `<div dir="${rtl ? 'rtl' : 'ltr'}" style="width:100%;text-align:center;
      font-family:Helvetica,Arial,sans-serif;font-size:7px;color:#8A93A3;
      padding:0 10mm 4mm;">${raw}</div>`;
}

// Chromium writes the page total into the /Pages object's /Count entry.
function pageCount(pdfPath) {
    const raw = readFileSync(pdfPath, 'latin1');
    const m = raw.match(/\/Type\s*\/Pages[^>]*\/Count\s+(\d+)/) || raw.match(/\/Count\s+(\d+)[^>]*\/Type\s*\/Pages/);
    return m ? parseInt(m[1], 10) : null;
}

async function printPdf(browser, t, lang, html, outPath) {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: ['load', 'networkidle0'], timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({
        path: outPath,
        format: 'A4',
        printBackground: true,
        displayHeaderFooter: true,
        headerTemplate: '<span></span>',
        footerTemplate: footerTemplate(t, lang === 'ar'),
        margin: { top: '10mm', bottom: '16mm', left: '10mm', right: '10mm' }
    });
    await page.close();
    const { size } = statSync(outPath);
    if (size < 50_000) throw new Error(`${outPath} is suspiciously small (${size} B) — fonts or photo likely missing`);
    return size;
}

async function main() {
    const args = process.argv.slice(2);
    const compact = args.includes('--compact');
    const langArgs = args.filter(a => a !== '--compact');
    const photo = await readFile(path.join(ROOT, 'assets', 'profilepic.jpg'));
    const photoDataUri = `data:image/jpeg;base64,${photo.toString('base64')}`;

    const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
    try {
        if (compact) {
            const langs = langArgs.length ? langArgs : ['en', 'de'];
            const outDir = path.join(ROOT, 'applications', 'cv-variants');
            await mkdir(outDir, { recursive: true });
            for (const [key, profile] of Object.entries(PROFILES)) {
                for (const lang of langs) {
                    if (!profile.title[lang]) throw new Error(`Profile ${key} has no title for ${lang}`);
                    const t = JSON.parse(await readFile(path.join(ROOT, 'translations', `${lang}.json`), 'utf8'));
                    const html = renderCV(t, lang, { photoDataUri, profile });
                    const outPath = path.join(outDir, `Sakhr_AL-Absi_CV_${key}_${lang.toUpperCase()}.pdf`);
                    const size = await printPdf(browser, t, lang, html, outPath);
                    const pages = pageCount(outPath);
                    const flag = pages > 2 ? '  ⚠ OVER 2 PAGES' : '';
                    console.log(`✓ ${key} ${lang}  ${pages}p  ${(size / 1024).toFixed(0)} KB${flag}`);
                }
            }
        } else {
            const langs = langArgs.length ? langArgs : Object.keys(FILENAMES);
            await mkdir(OUT_DIR, { recursive: true });
            for (const lang of langs) {
                if (!FILENAMES[lang]) throw new Error(`Unknown language: ${lang}`);
                const t = JSON.parse(await readFile(path.join(ROOT, 'translations', `${lang}.json`), 'utf8'));
                const html = renderCV(t, lang, { photoDataUri });
                await writeFile(path.join(PREVIEW_DIR, `preview-${lang}.html`), html);
                const outPath = path.join(OUT_DIR, FILENAMES[lang]);
                const size = await printPdf(browser, t, lang, html, outPath);
                console.log(`✓ ${lang}  ${FILENAMES[lang]}  ${pageCount(outPath)}p  ${(size / 1024).toFixed(0)} KB`);
            }
        }
    } finally {
        await browser.close();
    }
}

main().catch(err => { console.error(err); process.exit(1); });
