const { supabase } = require('./config/supabase');

async function testSupabaseTrends() {
  try {
    console.log('🔍 Testing Supabase ai_trend_news table...');
    
    // 테이블의 데이터 구조 확인
    const { data: sample, error: sampleError } = await supabase
      .from('ai_trend_news')
      .select('*')
      .limit(2);
    
    if (sampleError) {
      console.error('❌ Error fetching sample data:', sampleError);
      return;
    }
    
    console.log('📊 Sample data structure:');
    console.log(JSON.stringify(sample, null, 2));
    
    // 전체 데이터 개수 확인
    const { count, error: countError } = await supabase
      .from('ai_trend_news')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Error counting data:', countError);
    } else {
      console.log(`📈 Total records in ai_trend_news: ${count}`);
    }
    
    // 카테고리별 분포 확인
    const { data: categories, error: categoryError } = await supabase
      .from('ai_trend_news')
      .select('category')
      .not('category', 'is', null);
    
    if (categoryError) {
      console.error('❌ Error fetching categories:', categoryError);
    } else {
      const categoryCount = categories.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      console.log('📊 Categories distribution:');
      console.log(categoryCount);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// 직접 실행
testSupabaseTrends();