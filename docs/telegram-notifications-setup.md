# 텔레그램 실시간 알림 시스템 설정 가이드

AI 트렌드 플랫폼의 텔레그램 실시간 알림 시스템 설정 및 사용법을 안내합니다.

## 📋 목차

1. [시스템 개요](#시스템-개요)
2. [텔레그램 봇 생성](#텔레그램-봇-생성)
3. [서버 설정](#서버-설정)
4. [데이터베이스 설정](#데이터베이스-설정)
5. [사용자 가이드](#사용자-가이드)
6. [API 문서](#api-문서)
7. [문제 해결](#문제-해결)

## 🚀 시스템 개요

### 주요 기능
- **실시간 트렌드 알림**: 새로운 AI 트렌드 발견 시 즉시 알림
- **맞춤형 키워드 알림**: 사용자 관심 키워드 기반 필터링
- **트렌드 점수 기반 알림**: 중요도에 따른 선별적 알림
- **주간/월간 리포트**: 정기적인 트렌드 요약 리포트
- **다양한 알림 채널**: 텔레그램, 이메일, 웹 푸시 (텔레그램 우선 지원)

### 시스템 구조
```
Frontend (React) ← → Backend (Node.js/Express) ← → Supabase
                              ↓
                    Telegram Bot API
                              ↓
                        Notification Monitor
                              ↓
                          사용자 텔레그램
```

## 🤖 텔레그램 봇 생성

### 1단계: BotFather를 통한 봇 생성

1. 텔레그램에서 [@BotFather](https://t.me/botfather) 검색
2. `/start` 명령어 전송
3. `/newbot` 명령어로 새 봇 생성
4. 봇 이름 설정 (예: AI Trends Notification Bot)
5. 봇 사용자명 설정 (예: @AITrendsNotificationBot)
6. **Bot Token 저장** (예: `123456789:ABCdefGHijklMNOpqrsTUVwxyz`)

### 2단계: 봇 설정

```bash
# BotFather에서 추가 명령어
/setdescription - 봇 설명 설정
/setabouttext - 봇 정보 설정
/setuserpic - 봇 프로필 이미지 설정
/setcommands - 봇 명령어 메뉴 설정
```

권장 명령어 설정:
```
start - 봇 시작하기
trends - 최신 AI 트렌드 보기
settings - 알림 설정 변경
help - 도움말 보기
```

## ⚙️ 서버 설정

### 1단계: 환경 변수 설정

`.env` 파일에 텔레그램 설정 추가:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Optional: Webhook URL for production
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook

# Notification Settings
NOTIFICATION_CHECK_INTERVAL=300000  # 5분마다 체크
NOTIFICATION_MONITOR_AUTO_START=true
```

### 2단계: 의존성 설치

```bash
cd backend
npm install
```

### 3단계: 서버 시작

```bash
# 개발 환경
npm run dev

# 프로덕션 환경
npm start
```

## 🗄️ 데이터베이스 설정

### 1단계: Supabase에서 테이블 생성

```sql
-- notification_settings 테이블 생성
CREATE TABLE IF NOT EXISTS notification_settings (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    telegram_chat_id TEXT,
    telegram_username TEXT,
    enabled BOOLEAN DEFAULT false,
    keywords TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    min_trend_score DECIMAL(3,2) DEFAULT 0.7,
    notification_types JSONB DEFAULT '{"instant": true, "daily": false, "weekly": true}',
    last_notification_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- notification_history 테이블 생성
CREATE TABLE IF NOT EXISTS notification_history (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    notification_type TEXT NOT NULL,
    channel TEXT NOT NULL,
    trend_id BIGINT,
    message TEXT,
    status TEXT DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);
```

### 2단계: RLS 정책 설정

```sql
-- RLS 활성화
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Users can manage own notification settings" ON notification_settings
    FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own notification history" ON notification_history
    FOR SELECT USING (auth.uid()::text = user_id);
```

## 👥 사용자 가이드

### 1단계: 텔레그램 봇 시작

1. 텔레그램에서 봇 검색: `@YourBotUsername`
2. `/start` 명령어 전송
3. 환영 메시지 확인 및 기본 설정 완료

### 2단계: 웹사이트에서 설정 관리

1. 웹사이트 접속: `https://your-domain.com/telegram-notifications`
2. 텔레그램 연동 상태 확인
3. 알림 설정 커스터마이징:
   - **알림 유형**: 즉시/일간/주간 선택
   - **키워드 설정**: 관심 키워드 추가/제거
   - **카테고리 필터**: AI 분야별 선택
   - **트렌드 점수**: 알림 임계값 설정

### 3단계: 텔레그램 명령어 사용

```bash
/start     # 봇 시작 및 기본 설정
/trends    # 최신 AI 트렌드 조회
/settings  # 설정 변경 (웹사이트 링크)
/help      # 도움말 및 명령어 안내
```

## 📚 API 문서

### 텔레그램 관련 API

#### 1. 봇 설정 검증
```
POST /api/telegram/setup
Content-Type: application/json

{
  "userId": "user123",
  "botToken": "123456789:ABCdef..."
}
```

#### 2. 알림 설정 저장
```
POST /api/telegram/settings
Content-Type: application/json

{
  "userId": "user123",
  "telegramChatId": "123456789",
  "telegramUsername": "username",
  "enabled": true,
  "keywords": ["gpt", "ai", "machine learning"],
  "categories": ["Language Models", "AI Technology"],
  "minTrendScore": 0.7,
  "notificationTypes": {
    "instant": true,
    "daily": false,
    "weekly": true
  }
}
```

#### 3. 테스트 알림 전송
```
POST /api/telegram/send-test
Content-Type: application/json

{
  "userId": "user123",
  "message": "테스트 메시지입니다."
}
```

#### 4. 알림 설정 조회
```
GET /api/telegram/settings/{userId}
```

### 모니터링 API

#### 1. 모니터 시작
```
POST /api/monitor/start
```

#### 2. 모니터 상태 확인
```
GET /api/monitor/status
```

#### 3. 수동 트렌드 체크
```
POST /api/monitor/check-trends
```

#### 4. 주간 리포트 전송
```
POST /api/monitor/send-weekly-reports
```

## 🔧 문제 해결

### 일반적인 문제

#### 1. 봇이 응답하지 않는 경우
- Bot Token이 올바른지 확인
- 서버가 정상 동작하는지 확인
- 방화벽/포트 설정 확인

#### 2. 알림이 오지 않는 경우
- 알림 설정이 활성화되어 있는지 확인
- 트렌드 점수 임계값이 너무 높지 않은지 확인
- 키워드/카테고리 필터가 너무 제한적이지 않은지 확인

#### 3. 데이터베이스 연결 오류
- Supabase URL과 Service Key 확인
- RLS 정책이 올바르게 설정되어 있는지 확인
- 테이블이 정상 생성되어 있는지 확인

### 로그 확인

```bash
# 서버 로그 확인
tail -f backend/logs/app.log

# 특정 모듈 로그 필터링
grep "Telegram" backend/logs/app.log
grep "Notification" backend/logs/app.log
```

### 디버깅 명령어

```bash
# 텔레그램 봇 상태 확인
curl -X GET "https://api.telegram.org/bot{BOT_TOKEN}/getMe"

# 웹훅 상태 확인
curl -X GET "https://api.telegram.org/bot{BOT_TOKEN}/getWebhookInfo"

# 모니터 상태 확인
curl -X GET "http://localhost:5000/api/monitor/status"
```

## 🔒 보안 고려사항

1. **Bot Token 보안**: 환경 변수로 관리, 절대 공개 저장소에 노출 금지
2. **웹훅 보안**: HTTPS 사용, 토큰 검증 구현
3. **사용자 데이터**: RLS 정책으로 데이터 접근 제한
4. **API 접근**: 인증 토큰 기반 접근 제어
5. **로그 관리**: 민감한 정보 로깅 방지

## 📈 모니터링 및 운영

### 핵심 지표
- 활성 사용자 수
- 알림 전송 성공률
- 봇 응답 시간
- 데이터베이스 성능

### 정기 작업
- 로그 파일 로테이션
- 데이터베이스 백업
- 알림 통계 분석
- 사용자 피드백 수집

## 🚀 향후 개선 계획

1. **다중 언어 지원**: 영어, 일본어, 중국어 등
2. **AI 개인화**: 사용자 패턴 학습 기반 맞춤 알림
3. **리치 미디어**: 이미지, 차트, 링크 미리보기
4. **소셜 기능**: 트렌드 공유, 토론 기능
5. **분석 대시보드**: 사용자별 알림 통계 및 인사이트

---

📞 **지원 문의**: support@your-domain.com  
📖 **문서 업데이트**: 2024년 11월 기준