const apiKey = process.env.GEMINI_API_KEY;

async function testGeminiModels() {
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in environment.');
    return;
  }

  const models = ['gemini-flash-latest', 'gemini-1.5-flash-latest', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-pro'];

  for (const m of models) {
    console.log(`Testing model: ${m}...`);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Explain WAEC Quadratic Equations in 1 line.' }] }]
        })
      });
      const data = await res.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        console.log(`✅ Success with ${m}!`);
        console.log('Result:', data.candidates[0].content.parts[0].text);
        return m;
      } else {
        console.log(`❌ Model ${m} error:`, data.error?.message || JSON.stringify(data));
      }
    } catch (e) {
      console.log(`❌ Model ${m} fetch error:`, e.message);
    }
  }
}

testGeminiModels();
