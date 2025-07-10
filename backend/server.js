const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { supabase } = require('./config/supabase');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase 연결은 API 호출 시에만 테스트
console.log('서버 시작 완료 - Supabase 연결은 API 호출 시 확인됩니다.');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/content', require('./routes/content'));
app.use('/api/email', require('./routes/email'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend 서버가 정상적으로 실행 중입니다!' });
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});