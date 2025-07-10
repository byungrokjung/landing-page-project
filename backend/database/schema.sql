-- Supabase에서 실행할 SQL 스키마

-- 사용자 프로필 테이블 (auth.users와 연결)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'monthly', 'yearly')),
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_end_date TIMESTAMPTZ,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 케이스 스터디 테이블
CREATE TABLE case_studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  founder TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('소프트웨어', '이커머스', '서비스', '콘텐츠', '기타')),
  revenue_amount BIGINT NOT NULL,
  revenue_currency TEXT DEFAULT 'KRW',
  revenue_period TEXT DEFAULT '월' CHECK (revenue_period IN ('월', '년', '일회성')),
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  image_url TEXT,
  is_new BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 뉴스레터 구독자 테이블
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- 사용자 활동 로그 테이블
CREATE TABLE user_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  activity_type TEXT NOT NULL,
  resource_id UUID,
  resource_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_case_studies_category ON case_studies(category);
CREATE INDEX idx_case_studies_published_at ON case_studies(published_at DESC);
CREATE INDEX idx_case_studies_is_premium ON case_studies(is_premium);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);

-- Row Level Security (RLS) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정

-- 프로필: 본인 데이터만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 케이스 스터디: 무료 콘텐츠는 모든 사용자, 프리미엄은 구독자만
CREATE POLICY "Everyone can view free case studies" ON case_studies
  FOR SELECT USING (
    is_premium = FALSE OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND subscription IN ('monthly', 'yearly')
      AND subscription_status = 'active'
    )
  );

-- 뉴스레터: 관리자만 접근
CREATE POLICY "Only admins can manage newsletter" ON newsletter_subscribers
  FOR ALL USING (FALSE);

-- 사용자 활동: 본인 데이터만 조회 가능
CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT USING (auth.uid() = user_id);

-- 함수: 프로필 자동 생성 (사용자 가입 시)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: 새 사용자 가입 시 프로필 자동 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거: updated_at 자동 업데이트
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_case_studies_updated_at
  BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();