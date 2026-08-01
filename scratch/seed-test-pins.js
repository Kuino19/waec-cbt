const fs = require('fs');
const path = require('path');

const testPins = [
  {
    pin: 'WAEC2026',
    name: 'Master Test Student',
    role: 'student',
    subjects: ['mathematics', 'english', 'physics', 'chemistry', 'biology', 'economics', 'further_mathematics', 'civic_education', 'computer_science'],
    description: 'Master Test Student Account pre-populated with 9 Core Science & Tech WAEC subjects'
  },
  {
    pin: 'TEST88',
    name: 'Science Track Student',
    role: 'student',
    subjects: ['mathematics', 'english', 'physics', 'chemistry', 'biology', 'further_mathematics', 'agricultural_science', 'civic_education', 'data_processing'],
    description: 'Science Track Student with full STEM subject load'
  },
  {
    pin: 'ARTS99',
    name: 'Arts Track Student',
    role: 'student',
    subjects: ['english', 'mathematics', 'literature_in_english', 'government', 'christian_religious_studies', 'history', 'yoruba', 'civic_education', 'economics'],
    description: 'Arts & Humanities Track Student'
  },
  {
    pin: 'COMM77',
    name: 'Commercial Track Student',
    role: 'student',
    subjects: ['english', 'mathematics', 'financial_accounting', 'commerce', 'economics', 'office_practice', 'marketing', 'civic_education', 'data_processing'],
    description: 'Commercial & Business Track Student'
  },
  {
    pin: 'DEMO12',
    name: 'General Demo Student',
    role: 'student',
    subjects: ['mathematics', 'english', 'physics', 'chemistry', 'biology', 'economics', 'geography', 'civic_education', 'agricultural_science'],
    description: 'General WAEC Mock Candidate'
  }
];

// Save to data/test-pins.json
const jsonPath = path.join(__dirname, '..', 'data', 'test-pins.json');
fs.writeFileSync(jsonPath, JSON.stringify(testPins, null, 2));

console.log('✅ Generated 5 Pre-Configured Test Student Access PINs!');
console.log('JSON saved to data/test-pins.json');
