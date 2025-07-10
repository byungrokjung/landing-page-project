const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://demo.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'demo_key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'demo_service_key';

// 클라이언트용 (Row Level Security 적용)
const supabase = createClient(supabaseUrl, supabaseKey);

// 서비스용 (모든 권한)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

module.exports = { supabase, supabaseAdmin };