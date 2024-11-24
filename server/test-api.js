require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  const apiUrl = `${process.env.OPENAI_API_URL}/chat/completions`;
  console.log('Testing API connection to:', apiUrl);
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'hf:mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant.'
          },
          {
            role: 'user',
            content: 'Hello, are you working?'
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response body:', text);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}\n${text}`);
    }
    
    const data = JSON.parse(text);
    console.log('Parsed response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();
