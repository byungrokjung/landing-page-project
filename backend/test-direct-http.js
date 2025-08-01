const https = require('https');
require('dotenv').config();

async function testDirectHTTP() {
  const url = `${process.env.SUPABASE_URL}/rest/v1/ai_trend_news?limit=3&order=created_at.desc`;
  
  const options = {
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  };
  
  console.log('🔗 URL:', url);
  console.log('🔑 Headers:', options.headers);
  
  https.get(url, options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Response received:');
      console.log(JSON.stringify(JSON.parse(data), null, 2));
    });
  }).on('error', (err) => {
    console.error('❌ HTTPS request failed:', err);
  });
}

testDirectHTTP();