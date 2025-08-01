const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function test() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  
  const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
  console.log('profiles result:', error || 'success');
  
  const { data: data2, error: error2 } = await supabase.from('ai_trend_news').select('count', { count: 'exact', head: true });
  console.log('ai_trend_news result:', error2 || 'success');
}

test();
