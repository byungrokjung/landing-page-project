const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { supabase } = require('./config/supabase');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Stripe webhook needs raw body, so we handle it before express.json()
app.use('/api/stripe/webhook', express.raw({type: 'application/json'}));
app.use(express.json());

// 정적 파일 서빙 (프론트엔드 빌드 파일)
app.use(express.static(path.join(__dirname, '../dist')));

// Supabase 연결은 API 호출 시에만 테스트
console.log('서버 시작 완료 - Supabase 연결은 API 호출 시 확인됩니다.');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/content', require('./routes/content'));
app.use('/api/email', require('./routes/email'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/stripe', require('./routes/stripe'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend 서버가 정상적으로 실행 중입니다!' });
});

// 모든 비API 경로를 React 앱으로 리디렉션 (SPA 지원)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const filePath = path.join(__dirname, '../dist/index.html');
    console.log('Trying to serve:', filePath);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error serving file:', err);
        res.status(500).send('Frontend files not found');
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});