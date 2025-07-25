# CLAUDE.md

This file provides guidance to Claude Code when working with the landing-page-project repository.

## 프로젝트 개요

**히든 리치스** - 한국 비즈니스 케이스 스터디 플랫폼과 AI 비디오 생성 도구를 결합한 풀스택 웹 애플리케이션

## 기술 스택

### 프론트엔드
- **React 19** + **Vite** (빌드 도구)
- **React Router DOM** (클라이언트 사이드 라우팅)
- **인라인 스타일링** + **CSS 모듈** (컴포넌트 기반 디자인)
- **React Hooks** (상태 관리)

### 백엔드
- **Node.js** + **Express.js**
- **Supabase** (PostgreSQL + 인증)
- **RESTful API** + **CORS** 지원
- **JWT 토큰** 기반 인증

### 외부 통합
- **OpenAI API** (AI 챗봇)
- **Google OAuth** (사용자 인증)
- **Stripe** (결제 처리 - 부분 구현)
- **YouTube API** (비디오 분석)

## 개발 명령어

### 프론트엔드
```bash
npm run dev          # 개발 서버 (Vite)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 미리보기
```

### 백엔드
```bash
cd backend
npm run dev          # 개발 서버 (nodemon)
npm start           # 프로덕션 서버
node test-api.js    # API 테스트
```

## 주요 컴포넌트

### 1. App.jsx (메인 랜딩 페이지)
- 한국 비즈니스 케이스 스터디 플랫폼
- Google OAuth 로그인/회원가입
- 인기 케이스 스터디 표시
- AI 챗봇 통합
- 서버 상태 모니터링

### 2. AIVideoGenerator.jsx (AI 비디오 생성)
- 동영상 배경과 시네마틱 효과
- 텍스트-비디오 프롬프트 인터페이스  
- 샘플 프롬프트 제공
- 글래스모피즘 UI 디자인

### 3. CreativeStudio.jsx (크리에이티브 스튜디오)
- AI 생성 비디오 갤러리
- 실제 MP4 파일 모달 플레이어
- 카테고리별 비디오 정리
- 호버 효과 및 애니메이션

### 4. TopVideos.jsx (인기 비디오)
- 비디오 성능 분석
- YouTube 통합 및 직접 링크
- 참여도 지표 (조회수, 좋아요, 참여율)
- 키워드 태그 시스템
- 반응형 카드 레이아웃

### 5. AIChatbot.jsx (AI 챗봇)
- OpenAI GPT-3.5-turbo 통합
- 플로팅 채팅 인터페이스
- 실시간 메시징 및 타이핑 표시기
- 비즈니스 자문 컨텍스트

### 6. FlowBenchmark.jsx (플로우 벤치마크)
- 비디오 생성 도구 쇼케이스
- Pro/Ultra 요금제
- 자동 회전 비디오 갤러리

### 7. Dashboard.jsx (사용자 대시보드/마이페이지) ✨ 신규 추가
- 사용자 프로필 관리 (이름, 전화번호, 소개글 편집)
- 활동 내역 조회 (최근 50개 활동 시간순 표시)
- 구독 정보 및 혜택 확인 (무료/프리미엄 플랜)
- 사용자 설정 (알림, 테마, 언어)
- 글래스모피즘 디자인과 4개 탭 구조
- JWT 기반 인증으로 보안 처리

## API 라우트 구조

### 인증 (`/backend/routes/auth.js`)
- `POST /api/auth/register` - 사용자 등록
- `POST /api/auth/login` - 로그인
- `GET /api/auth/profile` - 프로필 조회
- `PUT /api/auth/profile` - 프로필 업데이트

### 콘텐츠 (`/backend/routes/content.js`)
- `GET /api/content/case-studies` - 케이스 스터디 목록 (페이징, 필터링)
- `GET /api/content/popular` - 인기 콘텐츠
- `GET /api/content/top-videos` - 상위 성과 비디오
- `POST /api/content/view` - 조회수 추적

### 대시보드 (`/backend/routes/dashboard.js`) ✨ 신규 추가
- `GET /api/dashboard/activities` - 사용자 활동 기록 조회 (최근 50개)
- `GET /api/dashboard/stats` - 대시보드 통계 정보
- `PUT /api/dashboard/settings` - 사용자 설정 업데이트
- `POST /api/dashboard/activity` - 활동 기록 생성
- `GET /api/dashboard/subscription` - 구독 정보 조회

### 기타 라우트
- `/api/users` - 사용자 관리
- `/api/subscriptions` - 구독 관리
- `/api/email` - 이메일 서비스

## 데이터베이스 스키마

### 주요 테이블
1. **profiles** - Supabase Auth와 연결된 사용자 정보
2. **case_studies** - 수익 추적이 포함된 비즈니스 케이스 콘텐츠
3. **newsletter_subscribers** - 이메일 구독 관리
4. **user_activities** - 활동 로깅 및 분석
5. **top_performing_videos** - 비디오 성능 지표

### 보안 기능
- **RLS (Row Level Security)** 활성화
- **정책 기반 접근 제어**
- **자동 프로필 생성 트리거**
- **타임스탬프 관리 함수**

## 환경 변수

### 프론트엔드 (.env)
```bash
VITE_API_URL=http://localhost:5000
VITE_OPENAI_API_KEY=your_openai_key
```

### 백엔드 (.env)
```bash
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
NODE_TLS_REJECT_UNAUTHORIZED=0
```

## 배포 아키텍처
- **프론트엔드**: Vercel (정적 호스팅)
- **백엔드**: Railway (Node.js 호스팅)
- **데이터베이스**: Supabase (관리형 PostgreSQL)

## 구현 상태

### ✅ 완료된 기능
- Google OAuth 인증
- OpenAI 통합 AI 챗봇
- 실제 MP4 파일이 있는 비디오 갤러리
- 비즈니스 케이스 스터디 플랫폼
- YouTube 분석 통합
- 반응형 모던 UI
- Supabase 데이터베이스 통합
- 구독 기반 콘텐츠 접근
- **사용자 대시보드/마이페이지** ✨ 신규 완료
  - 프로필 조회/편집 기능
  - 활동 내역 관리
  - 구독 정보 확인
  - 사용자 설정 (알림, 테마, 언어)
  - 계정 관리 기능

### 🟡 부분 구현
- Stripe 결제 처리 (설정 완료, 비활성)
- 이메일 서비스 (nodemailer 설정)
- 비디오 생성 (UI만, AI 통합 없음)

## 주요 파일 위치

```
/
├── src/
│   ├── App.jsx                 # 메인 랜딩 페이지
│   ├── AIVideoGenerator.jsx    # AI 비디오 생성 페이지
│   ├── CreativeStudio.jsx      # 크리에이티브 스튜디오
│   ├── TopVideos.jsx          # 인기 비디오 페이지
│   ├── AIChatbot.jsx          # AI 챗봇 컴포넌트
│   ├── Dashboard.jsx          # 사용자 대시보드/마이페이지 ✨ 신규
│   ├── main.jsx               # 라우터 설정 (대시보드 라우트 추가됨)
│   └── flow/FlowBenchmark.jsx # 플로우 벤치마크
├── backend/
│   ├── server.js              # 메인 서버 (대시보드 라우트 추가됨)
│   ├── routes/
│   │   ├── auth.js            # 인증 라우트
│   │   ├── content.js         # 콘텐츠 라우트
│   │   ├── dashboard.js       # 대시보드 라우트 ✨ 신규
│   │   ├── users.js           # 사용자 관리 라우트
│   │   └── ...                # 기타 라우트들
│   ├── config/supabase.js     # Supabase 설정
│   └── database/schema.sql    # DB 스키마
└── public/videos/             # 비디오 파일들
```

## 개발 노트
- 컴포넌트는 인라인 스타일링 사용 (현대적인 React 패턴)
- Supabase RLS로 보안 구현
- API 우선 설계 (프론트엔드/백엔드 분리)
- 모듈식 라우트 구조
- JWT 기반 인증 시스템

## 사용자 대시보드 기능 상세 ✨ 신규 추가

### 접근 방법
- URL: `/dashboard`
- 로그인된 사용자만 접근 가능 (JWT 토큰 검증)
- 메인 페이지에서 "마이페이지" 버튼으로 이동

### 주요 기능
1. **프로필 관리**
   - 사용자 정보 조회 및 편집
   - 이름, 전화번호, 소개글 수정 가능
   - 이메일은 읽기 전용 (Google OAuth 연동)

2. **활동 내역**
   - 최근 50개 활동 시간순 표시
   - 활동 제목, 설명, 날짜 정보 제공

3. **구독 정보**
   - 현재 플랜 표시 (무료/프리미엄)
   - 구독 만료일 및 혜택 안내
   - 플랜별 기능 차이점 명시

4. **설정 관리**
   - 알림 설정 (이메일/푸시)
   - 테마 선택 (라이트/다크/시스템)
   - 언어 설정 (한국어/English)
   - 계정 삭제 옵션

### UI/UX 특징
- 글래스모피즘 디자인 적용
- 4개 탭으로 구성된 직관적 네비게이션
- 반응형 디자인으로 모바일 친화적
- 그라데이션 배경과 현대적 버튼 스타일