const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function getData() {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  
  const { data, error } = await supabase
    .from('ai_trend_news')
    .select('*')
    .limit(3);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample data:');
    console.log(JSON.stringify(data, null, 2));
  }
}

getData();
