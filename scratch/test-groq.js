const apiKey = process.env.GROQ_API_KEY;

async function testGroq() {
  if (!apiKey) {
    console.error('GROQ_API_KEY not found in environment.');
    return;
  }

  console.log('Testing Groq API Connection...');
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a WAEC CBT Question Generator.' },
          { role: 'user', content: 'Generate 1 WAEC Mathematics CBT question in JSON format.' }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await res.json();
    if (data.choices && data.choices[0]) {
      console.log('✅ Groq API Success!');
      console.log('Response:', data.choices[0].message.content);
    } else {
      console.error('❌ Groq API Error:', JSON.stringify(data));
    }
  } catch (e) {
    console.error('❌ Fetch Exception:', e);
  }
}

testGroq();
