const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'data', 'seed-questions.json');
const questions = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

console.log('Total initial questions:', questions.length);

const isPlaceholder = (q) => {
  const qText = q.question || '';
  const optA = (q.options && q.options.A) || '';
  
  if (qText.toLowerCase().includes('based on the waec syllabus')) return true;
  if (optA.toLowerCase() === 'option a' || optA.toLowerCase() === 'option 1') return true;
  if (qText.toLowerCase().startsWith('placeholder')) return true;
  return false;
};

const authentic = questions.filter(q => !isPlaceholder(q));
const placeholders = questions.filter(q => isPlaceholder(q));

console.log('Authentic real past questions:', authentic.length);
console.log('Placeholder questions to remove:', placeholders.length);

// Save cleaned authentic questions
fs.writeFileSync(filePath, JSON.stringify(authentic, null, 2));
console.log('Cleaned seed-questions.json successfully!');
