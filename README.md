# Landing Page Project

비즈니스 성공 사례와 상위 성과 비디오를 보여주는 웹 애플리케이션

## 기술 스택

### 프론트엔드
- React 18
- Vite
- JavaScript (ES6+)
- CSS

### 백엔드
- Node.js
- Express.js
- Supabase (PostgreSQL)
- Axios

## 기능

- 📊 비즈니스 케이스 스터디 표시
- 📹 조회수 순 비디오 랭킹 테이블
- 🔗 YouTube 링크 연결
- 📱 반응형 디자인

## 로컬 개발 환경

### 프론트엔드 실행
```bash
npm run dev
```

### 백엔드 실행
```bash
cd backend
npm start
```

## 배포

- **프론트엔드**: Vercel
- **백엔드**: Railway
- **데이터베이스**: Supabase

## 환경 변수

### 프론트엔드 (.env)
```
VITE_API_URL=your_backend_url
```

### 백엔드 (.env)
```
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
NODE_TLS_REJECT_UNAUTHORIZED=0
```