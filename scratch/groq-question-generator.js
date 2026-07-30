const fs = require('fs');
const path = require('path');

const apiKey = process.env.GROQ_API_KEY;
const seedPath = path.join(__dirname, '..', 'data', 'seed-questions.json');

let seedQuestions = [];
if (fs.existsSync(seedPath)) {
  try {
    seedQuestions = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  } catch (e) {
    seedQuestions = [];
  }
}

const TARGET_SUBJECTS = [
  'further_mathematics', 'agricultural_science', 'data_processing',
  'computer_science', 'marketing', 'animal_husbandry', 'technical_drawing',
  'foods_and_nutrition', 'building_construction', 'auto_mechanical_work',
  'basic_electricity', 'visual_art', 'music', 'home_management'
];

function sanitizeGroqJson(rawContent) {
  let cleaned = rawContent.trim();
  cleaned = cleaned.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
  cleaned = cleaned.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
  return cleaned;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateBatch(subject, count = 10) {
  if (!apiKey) {
    console.error('GROQ_API_KEY not set in environment.');
    return [];
  }

  console.log(`⚡ Generating ${count} WAEC Questions for [${subject}]...`);

  const prompt = `You are a Senior WAEC Chief Examiner for ${subject.toUpperCase()}.
Generate exactly ${count} authentic WAEC Senior School Certificate Examination (SSCE) Multiple Choice CBT Questions.

RULES:
1. Provide 4 options: A, B, C, D.
2. For math/science, use double-escaped LaTeX inline delimiters \\\\(...\\\\) and \\\\frac{a}{b}.
3. Provide a clear 2-sentence explanation.
4. Set random year (2015-2024) and difficulty (easy, medium, hard).

Return ONLY a raw JSON array starting with [ and ending with ]:
[
  {
    "subject": "${subject}",
    "topic": "Topic Name",
    "year": 2022,
    "difficulty": "medium",
    "type": "mcq",
    "question": "Question text here",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "answer": "A",
    "explanation": "Explanation here."
  }
]`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You generate JSON WAEC CBT questions. Output strictly raw JSON array.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await res.json();
    if (data.error) {
      console.error(`⚠️ Groq Rate Limit / Error for ${subject}: ${data.error.message}`);
      return [];
    }

    const rawStr = data.choices[0].message.content;
    const sanitized = sanitizeGroqJson(rawStr);
    const parsed = JSON.parse(sanitized);

    console.log(`✅ Received ${parsed.length} questions for ${subject}!`);
    return parsed;
  } catch (err) {
    console.error(`❌ Parse error for ${subject}: ${err.message}`);
    return [];
  }
}

async function runRateLimitedGenerator() {
  let totalAdded = 0;

  for (const subj of TARGET_SUBJECTS) {
    const existing = seedQuestions.filter(q => (q.subject || '').toLowerCase() === subj).length;
    if (existing >= 30) {
      console.log(`⏩ [${subj}] already has ${existing} questions. Skipping.`);
      continue;
    }

    const newQs = await generateBatch(subj, 15);
    if (newQs.length > 0) {
      newQs.forEach((q, idx) => {
        q.id = `groq_${subj}_${Date.now()}_${idx}`;
        q.subject = subj;
      });

      seedQuestions.push(...newQs);
      totalAdded += newQs.length;

      fs.writeFileSync(seedPath, JSON.stringify(seedQuestions, null, 2));
      console.log(`💾 Total questions now in seed-questions.json: ${seedQuestions.length}`);
    }

    await sleep(3500);
  }

  console.log(`\n🎉 Groq Bulk Question Generation Completed! Total new questions added: ${totalAdded}`);
}

runRateLimitedGenerator();
