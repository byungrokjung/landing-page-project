const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkSupabaseData() {
  console.log('🔍 Checking Supabase ai_trend_news data...');
  console.log('📍 SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('🔑 SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
  
  try {
    // 1. 전체 데이터 개수 확인
    const { data, error, count } = await supabase
      .from('ai_trend_news')
      .select('*', { count: 'exact' })
      .limit(10);
      
    if (error) {
      console.error('❌ Supabase query error:', error);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log('📊 Total records in ai_trend_news:', count);
    
    if (data && data.length > 0) {
      console.log('\n📋 Sample data:');
      console.log('🔍 Available columns:', Object.keys(data[0]));
      
      data.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title || item.korean_title || 'No title'}`);
        console.log(`   Category: ${item.category || 'No category'}`);
        console.log(`   Source: ${item.source || 'No source'}`);
        console.log(`   Date: ${item.created_at || 'No date'}`);
        console.log(`   All fields:`, Object.keys(item));
        console.log('');
      });
    } else {
      console.log('📭 No data found in ai_trend_news table');
    }
    
    // 2. 카테고리별 분포 확인
    const { data: categories } = await supabase
      .from('ai_trend_news')
      .select('category')
      .not('category', 'is', null);
      
    if (categories) {
      const categoryCount = {};
      categories.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
      });
      
      console.log('📈 Category distribution:');
      Object.entries(categoryCount).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} items`);
      });
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

checkSupabaseData();