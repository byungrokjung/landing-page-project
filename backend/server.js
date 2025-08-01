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

// 환경변수 상태 로깅
console.log('🔧 환경변수 상태:');
console.log('- PORT:', process.env.PORT || '5000');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ 설정됨' : '❌ 없음');
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY === 'sk_test_development_key' ? '⚠️ 더미키' : '✅ 설정됨');
console.log('- N8N_WEBHOOK_URL:', process.env.N8N_WEBHOOK_URL ? '✅ 설정됨' : '❌ 없음');
console.log('- N8N_BASE_URL:', process.env.N8N_BASE_URL ? '✅ 설정됨' : '❌ 없음');
console.log('- N8N_API_KEY:', process.env.N8N_API_KEY ? '✅ 설정됨' : '❌ 없음');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/content', require('./routes/content'));
app.use('/api/email', require('./routes/email'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/stripe', require('./routes/stripe'));

// N8N 라우트 로딩 시도
try {
  console.log('🔄 Loading n8n routes...');
  const n8nRoutes = require('./routes/n8n');
  app.use('/api/n8n', n8nRoutes);
  console.log('✅ N8N routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load n8n routes:', error.message);
}

// AI Trends 라우트 로딩
try {
  console.log('🔄 Loading AI trends routes...');
  const aiTrendsRoutes = require('./routes/ai-trends');
  app.use('/api/ai-trends', aiTrendsRoutes);
  console.log('✅ AI Trends routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load AI trends routes:', error.message);
}

// Translate 라우트 로딩
try {
  console.log('🔄 Loading translate routes...');
  const translateRoutes = require('./routes/translate');
  app.use('/api/translate', translateRoutes);
  console.log('✅ Translate routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load translate routes:', error.message);
}

// Health check (배포 플랫폼용)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 기존 API health check 유지
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

// 글로벌 오류 처리 미들웨어
app.use((error, req, res, next) => {
  console.error('서버 오류:', error);
  res.status(500).json({ 
    error: '서버 내부 오류가 발생했습니다.',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 존재하지 않는 라우트 처리
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'API 엔드포인트를 찾을 수 없습니다.' });
  } else {
    // SPA를 위한 fallback은 이미 위에서 처리됨
    res.status(404).send('페이지를 찾을 수 없습니다.');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});