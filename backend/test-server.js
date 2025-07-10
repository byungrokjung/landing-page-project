const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Backend 서버가 정상적으로 실행 중입니다!',
    timestamp: new Date().toISOString(),
    env: {
      port: process.env.PORT,
      supabase_url: process.env.SUPABASE_URL ? 'Set' : 'Not set'
    }
  });
});

// Test Supabase connection
app.get('/api/test-supabase', async (req, res) => {
  try {
    const { supabase } = require('./config/supabase');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      res.json({ 
        status: 'error', 
        message: error.message, 
        code: error.code 
      });
    } else {
      res.json({ 
        status: 'success', 
        message: 'Supabase 연결 성공!',
        data: data 
      });
    }
  } catch (err) {
    res.json({ 
      status: 'error', 
      message: err.message,
      type: 'catch_error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`테스트 서버가 포트 ${PORT}에서 실행 중입니다.`);
});