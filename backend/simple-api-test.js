const express = require('express');
const https = require('https');
require('dotenv').config();

const app = express();

app.get('/test-trends', async (req, res) => {
  try {
    console.log('🔍 Testing direct API call...');
    
    const url = `${process.env.SUPABASE_URL}/rest/v1/ai_trend_news?limit=3&order=created_at.desc`;
    
    const options = {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    https.get(url, options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log('✅ Success! Got data:', jsonData.length, 'items');
          
          // 포맷팅
          const formattedTrends = jsonData.map(trend => ({
            id: trend.id,
            title: trend.title,
            category: trend.category,
            source: trend.source,
            date: trend.created_at,
            tags: trend.tags || []
          }));
          
          res.json({
            success: true,
            data: {
              trends: formattedTrends,
              total: formattedTrends.length
            }
          });
        } catch (err) {
          console.error('❌ Parse error:', err);
          res.status(500).json({ error: 'Parse failed', details: data });
        }
      });
    }).on('error', (err) => {
      console.error('❌ Request error:', err);
      res.status(500).json({ error: 'Request failed', message: err.message });
    });
    
  } catch (error) {
    console.error('❌ General error:', error);
    res.status(500).json({ error: 'Failed', message: error.message });
  }
});

app.listen(3002, () => {
  console.log('🚀 Simple test server running on port 3002');
  console.log('🔗 Test URL: http://localhost:3002/test-trends');
});