-- 사용자 개인화 설정 테이블 생성
CREATE TABLE IF NOT EXISTS user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    preferences JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at ON user_preferences(updated_at);

-- RLS (Row Level Security) 활성화
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- 사용자가 자신의 설정만 볼 수 있도록 정책 생성
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid()::text = user_id);

-- 사용자가 자신의 설정만 수정할 수 있도록 정책 생성
CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid()::text = user_id);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 기본 설정 예시 데이터 삽입 (선택사항)
-- INSERT INTO user_preferences (user_id, preferences) VALUES 
-- ('demo-user', '{
--     "interests": ["Language Models", "Machine Learning"],
--     "reportType": "detailed",
--     "includeTranslation": true,
--     "notificationSettings": {
--         "email": true,
--         "push": false
--     }
-- }');

-- 테이블 코멘트 추가
COMMENT ON TABLE user_preferences IS 'AI 트렌드 분석 사용자 개인화 설정 저장';
COMMENT ON COLUMN user_preferences.user_id IS '사용자 식별자 (Google OAuth ID 또는 JWT 토큰 기반)';
COMMENT ON COLUMN user_preferences.preferences IS '사용자 개인 설정 JSON 데이터';
COMMENT ON COLUMN user_preferences.created_at IS '설정 생성 시간';
COMMENT ON COLUMN user_preferences.updated_at IS '설정 마지막 수정 시간';