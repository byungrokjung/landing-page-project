const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 임시 데이터 저장소
let mockDatabase = {
  jobs: {},
  trends: {}
};

// n8n 웹훅 시뮬레이션
app.post('/webhook/ai-trends', (req, res) => {
  console.log('🎯 Mock n8n 웹훅 호출됨:', req.body);
  
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 작업 등록
  mockDatabase.jobs[jobId] = {
    job_id: jobId,
    status: 'processing',
    progress: 0,
    started_at: new Date().toISOString()
  };
  
  // 비동기 데이터 수집 시뮬레이션
  setTimeout(() => {
    simulateDataCollection(jobId);
  }, 2000);
  
  // 즉시 응답
  res.json({
    success: true,
    job_id: jobId,
    status: 'processing',
    message: 'AI trends collection started',
    timestamp: new Date().toISOString()
  });
});

// 데이터 수집 시뮬레이션
function simulateDataCollection(jobId) {
  const steps = [
    { progress: 20, message: 'OpenAI Blog 수집 중...' },
    { progress: 40, message: 'Anthropic 연구 분석 중...' },
    { progress: 60, message: 'Google AI 동향 조사 중...' },
    { progress: 80, message: 'arXiv 논문 검토 중...' },
    { progress: 100, message: '데이터 분석 완료!' }
  ];
  
  let stepIndex = 0;
  
  const interval = setInterval(() => {
    if (stepIndex < steps.length) {
      const step = steps[stepIndex];
      
      mockDatabase.jobs[jobId] = {
        ...mockDatabase.jobs[jobId],
        status: step.progress === 100 ? 'completed' : 'processing',
        progress: step.progress,
        message: step.message,
        updated_at: new Date().toISOString()
      };
      
      console.log(`📈 Job ${jobId}: ${step.progress}% - ${step.message}`);
      
      // 완료 시 트렌드 데이터 생성
      if (step.progress === 100) {
        mockDatabase.trends[jobId] = generateMockTrends();
        mockDatabase.jobs[jobId].completed_at = new Date().toISOString();
        clearInterval(interval);
      }
      
      stepIndex++;
    }
  }, 3000); // 3초마다 업데이트
}

// 목업 트렌드 데이터 생성
function generateMockTrends() {
  return [
    {
      id: 1,
      title: 'GPT-5 Training Architecture Revealed',
      category: 'Language Models',
      confidence: 0.94,
      source: 'OpenAI Research',
      source_url: 'https://openai.com/research/gpt5-architecture',
      content: 'OpenAI unveiled groundbreaking multimodal training techniques for next-generation language models.',
      tags: ['GPT-5', 'Multimodal', 'Training'],
      date: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Claude 4 Shows Unprecedented Reasoning Capabilities',
      category: 'AI Reasoning',
      confidence: 0.91,
      source: 'Anthropic Blog',
      source_url: 'https://anthropic.com/claude4-reasoning',
      content: 'Latest Claude model demonstrates human-level performance in complex logical reasoning tasks.',
      tags: ['Claude', 'Reasoning', 'Logic'],
      date: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Google Gemini Ultra 2.0 Beats All Benchmarks',
      category: 'Machine Learning',
      confidence: 0.88,
      source: 'Google AI',
      source_url: 'https://ai.google/gemini-ultra-2',
      content: 'New Gemini model achieves state-of-the-art results across multiple AI evaluation metrics.',
      tags: ['Gemini', 'Benchmarks', 'Google'],
      date: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Edge AI Chips Break Power Efficiency Records',
      category: 'Edge Computing',
      confidence: 0.85,
      source: 'IEEE Spectrum',
      source_url: 'https://spectrum.ieee.org/edge-ai-chips',
      content: 'Revolutionary new chip designs enable AI inference with 10x better power efficiency.',
      tags: ['Edge AI', 'Chips', 'Efficiency'],
      date: new Date().toISOString()
    },
    {
      id: 5,
      title: 'Computer Vision Achieves Human-Level Object Recognition',
      category: 'Computer Vision',
      confidence: 0.92,
      source: 'Nature AI',
      source_url: 'https://nature.com/articles/cv-human-level',
      content: 'Latest computer vision models match human performance in complex object recognition tasks.',
      tags: ['Computer Vision', 'Recognition', 'Human-level'],
      date: new Date().toISOString()
    }
  ];
}

// 작업 상태 조회 (프론트엔드 폴링용)
app.get('/api/ai-trends/job/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = mockDatabase.jobs[jobId];
  
  if (!job) {
    return res.status(404).json({
      error: 'Job not found',
      job_id: jobId
    });
  }
  
  console.log(`🔍 Job status 요청: ${jobId} - ${job.status} (${job.progress}%)`);
  
  let responseData = {
    job_id: jobId,
    status: job.status,
    progress: job.progress,
    started_at: job.started_at,
    updated_at: job.updated_at
  };
  
  // 완료된 경우 트렌드 데이터 포함
  if (job.status === 'completed') {
    responseData.data = {
      trends: mockDatabase.trends[jobId] || [],
      collection_time: job.completed_at,
      sources_scanned: 5,
      total_articles: 25
    };
  }
  
  res.json(responseData);
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🎭 Mock n8n 서버가 포트 ${PORT}에서 실행 중`);
  console.log(`📡 웹훅 URL: http://localhost:${PORT}/webhook/ai-trends`);
  console.log(`🔍 상태 조회: http://localhost:${PORT}/api/ai-trends/job/{jobId}`);
});

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n🛑 Mock 서버 종료 중...');
  process.exit(0);
});