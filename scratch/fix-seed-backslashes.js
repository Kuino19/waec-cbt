const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'data', 'seed-questions.json');
let questions = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

function cleanStr(str) {
  if (typeof str !== 'string') return str;
  let s = str;
  s = s.replace(/\\\\+/g, '\\');
  s = s.replace(/\\([a-zA-Z0-9\^_\-+*/=().{}]+)\\([^\w]|$)/g, '$1$2');
  return s;
}

let fixedCount = 0;
questions.forEach(q => {
  if (q.question) q.question = cleanStr(q.question);
  if (q.explanation) q.explanation = cleanStr(q.explanation);
  if (q.options) {
    Object.keys(q.options).forEach(k => {
      q.options[k] = cleanStr(q.options[k]);
    });
  }
});

fs.writeFileSync(seedPath, JSON.stringify(questions, null, 2));
console.log('✅ Cleaned all backslashes in seed-questions.json!');
