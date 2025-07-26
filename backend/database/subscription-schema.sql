-- Subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    plan_name TEXT NOT NULL CHECK (plan_name IN ('free', 'pro', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    canceled_at TIMESTAMP WITH TIME ZONE
);

-- Payment failures table for tracking failed payments
CREATE TABLE IF NOT EXISTS payment_failures (
    id SERIAL PRIMARY KEY,
    stripe_invoice_id TEXT NOT NULL,
    stripe_customer_id TEXT NOT NULL,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT NOT NULL DEFAULT 'krw',
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription features table to define what each plan includes
CREATE TABLE IF NOT EXISTS subscription_features (
    id SERIAL PRIMARY KEY,
    plan_name TEXT NOT NULL CHECK (plan_name IN ('free', 'pro', 'enterprise')),
    feature_name TEXT NOT NULL,
    feature_value TEXT, -- For features with specific values (e.g., "5" for case studies limit)
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscription usage tracking
CREATE TABLE IF NOT EXISTS subscription_usage (
    id SERIAL PRIMARY KEY,
    user_id TEXT REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    usage_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_name, usage_date)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_failures_customer_id ON payment_failures(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_feature ON subscription_usage(user_id, feature_name);

-- Row Level Security (RLS)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions table
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policies for subscription_usage table
CREATE POLICY "Users can view their own usage" ON subscription_usage
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own usage" ON subscription_usage
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own usage" ON subscription_usage
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Public read access for subscription_features
CREATE POLICY "Anyone can view subscription features" ON subscription_features
    FOR SELECT USING (true);

-- Admin access for payment_failures (service role only)
CREATE POLICY "Service role can manage payment failures" ON payment_failures
    USING (auth.role() = 'service_role');

-- Insert default subscription features
INSERT INTO subscription_features (plan_name, feature_name, feature_value, is_enabled) VALUES
-- Free plan features
('free', 'case_studies_limit', '5', true),
('free', 'ai_chatbot_limit', '10', true),
('free', 'community_access', 'true', true),
('free', 'email_support', 'true', true),

-- Pro plan features  
('pro', 'case_studies_limit', 'unlimited', true),
('pro', 'ai_chatbot_limit', 'unlimited', true),
('pro', 'premium_videos', 'true', true),
('pro', 'priority_support', 'true', true),
('pro', 'monthly_reports', 'true', true),
('pro', 'mentoring_sessions', '1', true),

-- Enterprise plan features
('enterprise', 'case_studies_limit', 'unlimited', true),
('enterprise', 'ai_chatbot_limit', 'unlimited', true),
('enterprise', 'premium_videos', 'true', true),
('enterprise', 'priority_support', 'true', true),
('enterprise', 'monthly_reports', 'true', true),
('enterprise', 'mentoring_sessions', 'unlimited', true),
('enterprise', 'team_accounts', '10', true),
('enterprise', 'custom_case_studies', 'true', true),
('enterprise', 'dedicated_manager', 'true', true),
('enterprise', 'weekly_consulting', 'true', true),
('enterprise', 'api_access', 'true', true)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating updated_at
CREATE TRIGGER trigger_update_subscription_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- Function to get user's current subscription plan
CREATE OR REPLACE FUNCTION get_user_subscription_plan(user_id_param TEXT)
RETURNS TEXT AS $$
DECLARE
    user_plan TEXT := 'free';
BEGIN
    SELECT plan_name INTO user_plan
    FROM subscriptions
    WHERE user_id = user_id_param
    AND status = 'active'
    AND (current_period_end IS NULL OR current_period_end > NOW())
    ORDER BY created_at DESC
    LIMIT 1;
    
    RETURN COALESCE(user_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access feature
CREATE OR REPLACE FUNCTION can_user_access_feature(user_id_param TEXT, feature_name_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan TEXT;
    feature_enabled BOOLEAN := false;
BEGIN
    -- Get user's current plan
    user_plan := get_user_subscription_plan(user_id_param);
    
    -- Check if feature is enabled for user's plan
    SELECT is_enabled INTO feature_enabled
    FROM subscription_features
    WHERE plan_name = user_plan
    AND feature_name = feature_name_param;
    
    RETURN COALESCE(feature_enabled, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track feature usage
CREATE OR REPLACE FUNCTION track_feature_usage(user_id_param TEXT, feature_name_param TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO subscription_usage (user_id, feature_name, usage_count, usage_date)
    VALUES (user_id_param, feature_name_param, 1, CURRENT_DATE)
    ON CONFLICT (user_id, feature_name, usage_date)
    DO UPDATE SET usage_count = subscription_usage.usage_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;