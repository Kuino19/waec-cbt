const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'seed-questions.json');
const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const counts = {};
questions.forEach(q => {
  const s = (q.subject || 'unknown').toLowerCase();
  counts[s] = (counts[s] || 0) + 1;
});

console.log('Subject counts in cleaned database:');
console.log(counts);
