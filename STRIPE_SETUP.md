# Stripe 결제 시스템 설정 가이드

## 1. Stripe 계정 설정

1. [Stripe 대시보드](https://dashboard.stripe.com/)에 로그인
2. 개발자 → API 키에서 다음 키들을 확인:
   - **공개 가능한 키 (Publishable key)**: `pk_test_...`
   - **비밀 키 (Secret key)**: `sk_test_...`

## 2. 환경 변수 설정

### 백엔드 (.env)
```bash
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
CLIENT_URL=http://localhost:5173
```

### 프론트엔드 (.env)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key
VITE_API_URL=http://localhost:5000
```

## 3. Stripe 제품 및 가격 생성

### Stripe 대시보드에서:
1. **제품** → **제품 추가**
2. 다음 제품들을 생성:

#### 프로 플랜
- 제품명: "히든 리치스 프로 플랜"
- 가격: 29,000원/월
- 가격 ID 복사 → `SubscriptionPlans.jsx`의 `stripeId`에 입력

#### 엔터프라이즈 플랜
- 제품명: "히든 리치스 엔터프라이즈"
- 가격: 99,000원/월
- 가격 ID 복사 → `SubscriptionPlans.jsx`의 `stripeId`에 입력

## 4. 웹훅 설정

1. **개발자** → **웹훅** → **엔드포인트 추가**
2. URL: `http://localhost:5000/api/stripe/webhook`
3. 수신할 이벤트 선택:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. 웹훅 서명 비밀 복사 → `STRIPE_WEBHOOK_SECRET`에 입력

## 5. 데이터베이스 스키마 적용

```bash
# Supabase SQL 편집기에서 실행
\i backend/database/subscription-schema.sql
```

## 6. 패키지 설치

### 프론트엔드
```bash
npm install @stripe/stripe-js
```

### 백엔드
```bash
cd backend
npm install stripe
```

## 7. 테스트 카드 정보

Stripe 테스트 모드에서 사용할 수 있는 카드 정보:

- **성공**: 4242 4242 4242 4242
- **실패**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155
- 만료일: 미래의 임의 날짜
- CVC: 임의의 3자리 숫자

## 8. 주요 파일 위치

- **백엔드 라우트**: `backend/routes/stripe.js`
- **프론트엔드 구독 페이지**: `src/SubscriptionPlans.jsx`
- **성공 페이지**: `src/PaymentSuccess.jsx`
- **취소 페이지**: `src/PaymentCancel.jsx`
- **데이터베이스 스키마**: `backend/database/subscription-schema.sql`

## 9. 개발 모드 실행

```bash
# 백엔드 시작
cd backend
npm run dev

# 프론트엔드 시작 (새 터미널)
npm run dev
```

## 10. 접근 URL

- 메인 페이지: http://localhost:5173/
- 구독 페이지: http://localhost:5173/subscription
- 결제 성공: http://localhost:5173/payment/success
- 결제 취소: http://localhost:5173/payment/cancel

## 주의사항

⚠️ **실제 배포 시 주의사항:**
1. 테스트 키를 실제 키로 변경
2. 웹훅 URL을 실제 도메인으로 업데이트
3. CLIENT_URL을 실제 프론트엔드 URL로 변경
4. HTTPS 사용 필수 (실제 결제를 위해)

## 문제 해결

### 일반적인 오류들:
1. **"Stripe 로드 실패"**: 공개 가능한 키 확인
2. **"결제 세션 생성 실패"**: 비밀 키 및 가격 ID 확인
3. **웹훅 오류**: 웹훅 비밀 키 및 엔드포인트 URL 확인
4. **CORS 오류**: 백엔드 CORS 설정 확인