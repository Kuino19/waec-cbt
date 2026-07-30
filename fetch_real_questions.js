const fs = require('fs');
const path = require('path');

// Your ALOC Station API Key
const API_KEY = 'aloc_eGG8mIN8fPp7TFsiRHs3gPv7PHvgnCdLjkQrRcBL';

// Full subject list as returned by ALOC's own error hints
const SUBJECTS = [
    'accounting',
    'biology',
    'chemistry',
    'christian-religious-studies',
    'civic-education',
    'commerce',
    'economics',
    'english-language',
    'geography',
    'government',
    'history',
    'insurance',
    'literature-in-english',
    'mathematics',
    'physics'
];

// Widened year range — testing 2005–2025 to stop relying on guesswork
const YEARS = [];
for (let y = 2005; y <= 2025; y++) YEARS.push(y);

const EXAM_TYPE = 'waec';
const OUTPUT_DIR = path.join(__dirname, 'data', 'past-questions');
const SAFETY_PAGE_LIMIT = 200; // per subject+year combo, safety ceiling

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Stable fingerprint so duplicates get caught across repeat runs / overlapping years
function fingerprint(q) {
    const text = (q.question || '').trim().toLowerCase();
    const a = (q.options?.A || '').trim().toLowerCase();
    const b = (q.options?.B || '').trim().toLowerCase();
    return `${text}|${a}|${b}`;
}

function loadExisting(subject) {
    const filePath = path.join(OUTPUT_DIR, `${subject}.json`);
    if (!fs.existsSync(filePath)) {
        return { questions: [], ids: new Set(), fingerprints: new Set() };
    }
    try {
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const ids = new Set(existing.map(q => q.id));
        const fingerprints = new Set(existing.map(fingerprint));
        return { questions: existing, ids, fingerprints };
    } catch (err) {
        console.error(`⚠️  Could not parse existing ${subject}.json, starting fresh: ${err.message}`);
        return { questions: [], ids: new Set(), fingerprints: new Set() };
    }
}

async function fetchPage(subject, year, cursor) {
    let url = `https://dev.aloc.com.ng/api/v1/questions?examType=${EXAM_TYPE}&subject=${subject}&year=${year}&limit=50`;
    if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;

    return fetch(url, {
        method: 'GET',
        headers: {
            'X-API-Key': API_KEY,
            'Accept': 'application/json'
        }
    });
}

async function fetchQuestionsForSubjectYear(subject, year, existing) {
    let newQuestions = [];
    let skippedDuplicates = 0;
    let cursor = null;
    let page = 0;
    let found = false;

    do {
        page++;
        let response;
        try {
            response = await fetchPage(subject, year, cursor);
        } catch (err) {
            console.error(`    ⚠️  ${year}: network error — ${err.message}`);
            break;
        }

        if (response.status === 404) {
            break; // no data for this subject+year, move on quietly
        }

        if (response.status === 429) {
            console.log(`    ⏳ Rate limited, waiting 5s...`);
            await new Promise(r => setTimeout(r, 5000));
            page--;
            continue;
        }

        if (!response.ok) {
            const body = await response.text().catch(() => '');
            console.error(`    ❌ ${year}: HTTP ${response.status} — ${body.slice(0, 150)}`);
            break;
        }

        const result = await response.json();
        const rawQuestions = Array.isArray(result) ? result : (result.data || []);

        if (rawQuestions.length > 0) found = true;

        for (const q of rawQuestions) {
            const formatted = {
                id: q.id || `waec_${subject}_${year}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                subject: subject,
                exam_type: (q.examType || EXAM_TYPE).toUpperCase(),
                year: q.year || year,
                question: q.text || q.question || '',
                options: {
                    A: q.options?.a || q.options?.A || '',
                    B: q.options?.b || q.options?.B || '',
                    C: q.options?.c || q.options?.C || '',
                    D: q.options?.d || q.options?.D || ''
                },
                answer: (q.correctAnswer || q.answer || 'A').toUpperCase(),
                explanation: q.explanation || 'Detailed step-by-step solution provided in review mode.'
            };

            const fp = fingerprint(formatted);
            if (existing.ids.has(formatted.id) || existing.fingerprints.has(fp)) {
                skippedDuplicates++;
                continue;
            }

            existing.ids.add(formatted.id);
            existing.fingerprints.add(fp);
            newQuestions.push(formatted);
        }

        const pagination = result.pagination || {};
        cursor = pagination.hasMore ? pagination.nextCursor : null;

        if (cursor) await new Promise(r => setTimeout(r, 400));

    } while (cursor && page < SAFETY_PAGE_LIMIT);

    return { newQuestions, skippedDuplicates, found };
}

async function fetchQuestionsForSubject(subject) {
    console.log(`\n🔍 Fetching WAEC questions for: ${subject.toUpperCase()}...`);

    const existing = loadExisting(subject);
    let totalNew = 0;
    let totalSkipped = 0;
    let yearsWithData = [];

    for (const year of YEARS) {
        const { newQuestions, skippedDuplicates, found } = await fetchQuestionsForSubjectYear(subject, year, existing);

        if (found) {
            yearsWithData.push(year);
            console.log(`  ✓ ${year}: +${newQuestions.length} new`);
        }

        existing.questions = existing.questions.concat(newQuestions);
        totalNew += newQuestions.length;
        totalSkipped += skippedDuplicates;

        await new Promise(r => setTimeout(r, 500)); // pause between years
    }

    if (existing.questions.length === 0) {
        console.log(`  ⚪ No WAEC questions found for ${subject} across any tested year (${YEARS[0]}–${YEARS[YEARS.length - 1]}).`);
        return { added: 0, total: 0, years: [] };
    }

    const filePath = path.join(OUTPUT_DIR, `${subject}.json`);
    fs.writeFileSync(filePath, JSON.stringify(existing.questions, null, 2));
    console.log(`✅ ${subject}: +${totalNew} new (${totalSkipped} duplicates skipped), ${existing.questions.length} total saved. Years with data: ${yearsWithData.join(', ') || 'none'}`);

    return { added: totalNew, total: existing.questions.length, years: yearsWithData };
}

async function run() {
    const summary = {};

    for (const subject of SUBJECTS) {
        const result = await fetchQuestionsForSubject(subject);
        summary[subject] = result;
        await new Promise(r => setTimeout(r, 1000)); // pause between subjects
    }

    const indexPath = path.join(OUTPUT_DIR, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(summary, null, 2));
    console.log(`\n🎉 Process Complete! Summary saved to: ${indexPath}`);
    console.log('\n📊 Coverage summary:');
    for (const [subject, result] of Object.entries(summary)) {
        console.log(`  ${subject}: ${result.total} questions${result.years?.length ? ` (years: ${result.years.join(', ')})` : ' (no WAEC data found)'}`);
    }
}

run();