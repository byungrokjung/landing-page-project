-- AI 트렌드 작업 상태 추적 테이블
CREATE TABLE ai_trends_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    user_id UUID REFERENCES auth.users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI 트렌드 데이터 저장 테이블
CREATE TABLE ai_trends_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id VARCHAR(100) REFERENCES ai_trends_jobs(job_id) ON DELETE CASCADE,
    trend_title VARCHAR(500) NOT NULL,
    trend_category VARCHAR(100),
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    source VARCHAR(200),
    source_url TEXT,
    content TEXT,
    tags TEXT[],
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_ai_trends_jobs_job_id ON ai_trends_jobs(job_id);
CREATE INDEX idx_ai_trends_jobs_status ON ai_trends_jobs(status);
CREATE INDEX idx_ai_trends_data_job_id ON ai_trends_data(job_id);
CREATE INDEX idx_ai_trends_data_category ON ai_trends_data(trend_category);

-- RLS (Row Level Security) 활성화
ALTER TABLE ai_trends_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_trends_data ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
CREATE POLICY "Users can view their own jobs" ON ai_trends_jobs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs" ON ai_trends_jobs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" ON ai_trends_jobs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view data from their jobs" ON ai_trends_data
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM ai_trends_jobs 
            WHERE ai_trends_jobs.job_id = ai_trends_data.job_id 
            AND ai_trends_jobs.user_id = auth.uid()
        )
    );

-- 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_trends_jobs_updated_at 
    BEFORE UPDATE ON ai_trends_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();