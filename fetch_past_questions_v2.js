// File: scratch/fetch_past_questions_v2.js
// -------------------------------------------------------------
// Uses only built‑in Node modules (no external dependencies).
// -------------------------------------------------------------
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const pdfParse = require('pdf-parse');
const cheerio = require('cheerio');

// ------------------------------------------------------------------
// 1. Load subject list (core + missing)
const coreSubjects = [
  { title: 'Mathematics', safeName: 'mathematics' },
  { title: 'English Language', safeName: 'english_language' },
  { title: 'Physics', safeName: 'physics' },
  { title: 'Chemistry', safeName: 'chemistry' },
  { title: 'Biology', safeName: 'biology' },
];
const metaPath = path.join(__dirname, 'missing-meta.json');
const missing = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
const subjects = coreSubjects.concat(missing);
// ------------------------------------------------------------------

const YEAR_START = 2010;
const YEAR_END = 2023;
const WAEC_SITE = 'https://waeconline.org.ng';

// Helper: simple uniform ID generator
function makeId(subject, idx) {
  const pad = String(idx + 1).padStart(3, '0');
  return `${subject.safeName}_${pad}`;
}

// ------------------------------------------------------------------
// Minimal fetch implementation using built‑in http/https
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Request failed with status ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', err => reject(err));
  });
}

// ------------------------------------------------------------------
// 2. For each subject, scrape the WAEC site for PDF links
async function getPdfLinks(subject) {
  const url = `${WAEC_SITE}/past-questions/${subject.safeName}`;
  let html;
  try {
    const buf = await fetchUrl(url);
    html = buf.toString('utf8');
  } catch (e) {
    console.warn(`⚠️  Could not fetch ${url}: ${e.message}`);
    return [];
  }
  const $ = cheerio.load(html);
  const links = [];
  $('a[href$=".pdf"]').each((_, el) => {
    const href = $(el).attr('href');
    const txt = $(el).text();
    const yearMatch = txt.match(/(20[1-9]\d)/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1], 10);
      if (year >= YEAR_START && year <= YEAR_END) {
        const pdfUrl = href.startsWith('http') ? href : new URL(href, WAEC_SITE).href;
        links.push({ pdfUrl, year });
      }
    }
  });
  return links;
}

// ------------------------------------------------------------------
// 3. Download a PDF, extract its text, and try to parse questions
async function processPdf(pdfUrl, year, subject, baseIdx) {
  let buffer;
  try {
    buffer = await fetchUrl(pdfUrl);
  } catch (e) {
    console.warn(`⚠️  Failed download ${pdfUrl}: ${e.message}`);
    return [];
  }
  const data = await pdfParse(buffer);
  const text = data.text;
  const lines = text.split('\n').map(l => l.trim());
  const questions = [];
  let current = null;
  for (let line of lines) {
    const qMatch = line.match(/^(\d{1,3})[.)]\s+(.*)/);
    if (qMatch) {
      if (current) questions.push(current);
      current = {
        id: makeId(subject, baseIdx + questions.length),
        subject: subject.title.toLowerCase(),
        topic: 'General',
        year,
        difficulty: 'medium',
        type: 'mcq',
        question: qMatch[2],
        options: { A: '', B: '', C: '', D: '' },
        answer: '',
        explanation: ''
      };
      continue;
    }
    const optMatch = line.match(/^([ABCD])[).]\s+(.*)/);
    if (optMatch && current) {
      current.options[optMatch[1]] = optMatch[2];
      continue;
    }
    const ansMatch = line.match(/(?:Answer|Ans)[:\s]+([ABCD])/i);
    if (ansMatch && current) {
      current.answer = ansMatch[1];
      continue;
    }
  }
  if (current) questions.push(current);
  return questions;
}

// ------------------------------------------------------------------
// 4. Main orchestration
(async () => {
  const outDir = path.resolve('data', 'past-questions');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const index = {};
  for (const subject of subjects) {
    console.log(`🔍  Processing ${subject.title} …`);
    const pdfLinks = await getPdfLinks(subject);
    if (!pdfLinks.length) {
      console.warn(`⚠️  No PDFs found for ${subject.title} in ${YEAR_START}-${YEAR_END}`);
      continue;
    }
    const allQs = [];
    for (let i = 0; i < pdfLinks.length; i++) {
      const { pdfUrl, year } = pdfLinks[i];
      console.log(`   ↳ Downloading ${pdfUrl}`);
      const qs = await processPdf(pdfUrl, year, subject, i * 1000);
      allQs.push(...qs);
    }
    const outPath = path.join(outDir, `q-${subject.safeName}.json`);
    fs.writeFileSync(outPath, JSON.stringify(allQs, null, 2), 'utf8');
    console.log(`✅  Written ${allQs.length} questions → ${outPath}`);
    index[subject.safeName] = { title: subject.title, file: `past-questions/q-${subject.safeName}.json`, count: allQs.length };
  }
  const indexPath = path.join(outDir, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  console.log('\n📚  Index written →', indexPath);
})().catch(err => {
  console.error('❌ Unexpected error:', err);
});
