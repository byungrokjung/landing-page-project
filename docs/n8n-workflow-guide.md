# n8n 워크플로우 수정 가이드

## 🎯 현재 상황
- ✅ 프론트엔드: 폴링 시스템 구현 완료
- ✅ 백엔드: API 엔드포인트 준비 완료
- 🔄 n8n: 워크플로우 수정 필요

## 📝 n8n 워크플로우 구조

### 1단계: Webhook 노드 (즉시 응답)
```javascript
// Webhook 노드에서 즉시 응답 반환
const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 즉시 응답 (프론트엔드가 받을 데이터)
return [{
  json: {
    success: true,
    job_id: jobId,
    status: "processing",
    message: "AI trends collection started",
    timestamp: new Date().toISOString()
  }
}];
```

### 2단계: 작업 등록 (Supabase 노드)
```sql
-- 작업을 데이터베이스에 등록
INSERT INTO ai_trends_jobs (job_id, status, user_id, started_at, progress)
VALUES ('{{$node.Webhook.json.job_id}}', 'processing', null, NOW(), 0);
```

### 3단계: 실제 데이터 수집 (HTTP Request 노드들)
```javascript
// 여러 AI 뉴스 사이트에서 데이터 수집
// 1. OpenAI Blog
// 2. Anthropic Blog  
// 3. Google AI Blog
// 4. arXiv AI papers
// 5. TechCrunch AI section

// 진행률 업데이트 (각 단계마다)
// POST http://localhost:5000/api/ai-trends/update-job
{
  "job_id": "{{$node.Webhook.json.job_id}}",
  "status": "processing",
  "progress": 20  // 각 사이트마다 20%씩 증가
}
```

### 4단계: 데이터 분석 (Code 노드)
```javascript
// 수집된 데이터를 분석하고 정리
const rawData = $input.all();
const trends = [];

rawData.forEach(item => {
  // AI 관련 키워드 필터링
  const aiKeywords = ['GPT', 'LLM', 'AI', 'Machine Learning', 'Deep Learning', 'Computer Vision'];
  
  if (aiKeywords.some(keyword => item.json.title.includes(keyword))) {
    trends.push({
      title: item.json.title,
      category: categorizeTitle(item.json.title),
      confidence: calculateConfidence(item.json.content),
      source: item.json.source,
      source_url: item.json.url,
      content: item.json.summary,
      tags: extractTags(item.json.content)
    });
  }
});

// 진행률 업데이트
await fetch('http://localhost:5000/api/ai-trends/update-job', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    job_id: $node.Webhook.json.job_id,
    status: 'processing',
    progress: 80
  })
});

return trends.map(trend => ({ json: trend }));
```

### 5단계: 완료 처리 (HTTP Request 노드)
```javascript
// 작업 완료 알림
{
  "job_id": "{{$node.Webhook.json.job_id}}",
  "status": "completed",
  "progress": 100,
  "trends_data": [
    // 수집된 트렌드 데이터 배열
  ]
}

// POST http://localhost:5000/api/ai-trends/update-job
```

## 🔧 실제 구현 단계

### Step 1: 새 워크플로우 생성
1. n8n에서 새 워크플로우 생성
2. 기존 Webhook 노드를 복사

### Step 2: Webhook 노드 수정
- HTTP Method: POST
- Response Mode: "Immediately"
- Response Code: 200
- Response Body에 위의 JavaScript 코드 입력

### Step 3: 병렬 처리 구조 만들기
```
Webhook → Split (2갈래)
  ├── 즉시 응답 (프론트엔드로)
  └── 백그라운드 처리
       ├── 작업 등록 (Supabase)
       ├── 데이터 수집 (HTTP Request 노드들)
       ├── 데이터 분석 (Code 노드)
       └── 완료 처리 (HTTP Request)
```

### Step 4: 테스트
1. 워크플로우 활성화
2. 프론트엔드에서 버튼 클릭
3. 진행률이 실시간으로 업데이트되는지 확인
4. 완료 시 데이터가 표시되는지 확인

## 💡 주의사항
- job_id는 유니크해야 함
- 각 단계마다 진행률 업데이트 필수
- 에러 발생 시 status를 'failed'로 설정
- 백엔드 API URL은 환경에 맞게 수정

## 🎯 예상 결과
1. 즉시 응답: job_id 받음
2. 5초마다 폴링: 진행률 확인
3. 완료 시: 트렌드 데이터 표시
4. 실시간 UX: 진행률 바와 상태 표시