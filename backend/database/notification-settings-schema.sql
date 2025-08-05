-- 알림 설정 테이블
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_telegram_chat_id ON notification_settings(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_enabled ON notification_settings(enabled);

-- 알림 히스토리 테이블
CREATE TABLE IF NOT EXISTS notification_history (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    notification_type TEXT NOT NULL, -- 'instant', 'daily', 'weekly'
    channel TEXT NOT NULL, -- 'telegram', 'email', 'web_push'
    trend_id BIGINT,
    message TEXT,
    status TEXT DEFAULT 'sent', -- 'sent', 'failed', 'pending'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_history_status ON notification_history(status);

-- RLS 정책
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 알림 설정만 볼 수 있음
CREATE POLICY "Users can view own notification settings" ON notification_settings
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own notification settings" ON notification_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own notification settings" ON notification_settings
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own notification settings" ON notification_settings
    FOR DELETE USING (auth.uid()::text = user_id);

-- 알림 히스토리 정책
CREATE POLICY "Users can view own notification history" ON notification_history
    FOR SELECT USING (auth.uid()::text = user_id);

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_notification_settings_updated_at 
    BEFORE UPDATE ON notification_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 텔레그램 연결 상태 뷰
CREATE OR REPLACE VIEW telegram_connections AS
SELECT 
    user_id,
    telegram_chat_id,
    telegram_username,
    enabled,
    array_length(keywords, 1) as keyword_count,
    array_length(categories, 1) as category_count,
    last_notification_at,
    updated_at
FROM notification_settings
WHERE telegram_chat_id IS NOT NULL;