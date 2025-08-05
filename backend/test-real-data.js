const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testRealDataAnalytics() {
  console.log('🧪 Testing real Supabase data analytics...');
  
  try {
    // 1. Supabase에서 실제 데이터 가져오기
    const { data: allTrends, error } = await supabase
      .from('ai_trend_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('❌ Supabase error:', error);
      return;
    }

    console.log(`📊 Found ${allTrends.length} trends`);

    // 2. 카테고리별 분석
    const categoryStats = {};
    const confidenceByCategory = {};
    const dailyTrends = {};

    allTrends.forEach(trend => {
      // AI 관련 카테고리 자동 분류
      const title = (trend.title || '').toLowerCase();
      const content = (trend.content || '').toLowerCase();
      
      let category = 'General';
      if (title.includes('ai') || title.includes('artificial intelligence') || content.includes('ai ')) {
        if (title.includes('gpt') || title.includes('language model') || content.includes('language model')) {
          category = 'Language Models';
        } else if (title.includes('vision') || title.includes('image') || content.includes('computer vision')) {
          category = 'Computer Vision';
        } else if (title.includes('machine learning') || title.includes('ml ') || content.includes('machine learning')) {
          category = 'Machine Learning';
        } else if (title.includes('robot') || content.includes('robot')) {
          category = 'Robotics';
        } else {
          category = 'AI Technology';
        }
      } else if (title.includes('tech') || title.includes('startup') || title.includes('app')) {
        category = 'Technology';
      }
      
      const confidence = trend.importance_score || 0.8;
      const date = new Date(trend.created_at).toLocaleDateString('ko-KR');

      // 카테고리별 통계
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, trends: [] };
        confidenceByCategory[category] = [];
      }
      categoryStats[category].count++;
      categoryStats[category].trends.push(trend);
      confidenceByCategory[category].push(confidence);

      // 일별 트렌드
      dailyTrends[date] = (dailyTrends[date] || 0) + 1;
    });

    // 3. 통계 결과 출력
    console.log('\n📈 Category Analysis:');
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      const avgConfidence = confidenceByCategory[category].reduce((a, b) => a + b, 0) / confidenceByCategory[category].length;
      console.log(`   ${category}: ${stats.count} items (avg confidence: ${(avgConfidence * 100).toFixed(1)}%)`);
    });

    console.log('\n📅 Daily Distribution:');
    Object.keys(dailyTrends).slice(0, 5).forEach(date => {
      console.log(`   ${date}: ${dailyTrends[date]} items`);
    });

    // 4. AI 관련 트렌드만 필터링
    const aiTrends = allTrends.filter(trend => {
      const title = (trend.title || '').toLowerCase();
      const content = (trend.content || '').toLowerCase();
      return title.includes('ai') || title.includes('artificial intelligence') || 
             title.includes('machine learning') || title.includes('gpt') ||
             content.includes('ai ') || content.includes('artificial intelligence');
    });

    console.log(`\n🤖 AI-related trends: ${aiTrends.length}/${allTrends.length}`);
    aiTrends.slice(0, 3).forEach((trend, index) => {
      console.log(`   ${index + 1}. ${trend.title}`);
    });

    // 5. 성공적인 응답 포맷 테스트
    const testResponse = {
      success: true,
      data: {
        period: '전체 기간',
        generatedAt: new Date().toLocaleString('ko-KR'),
        summary: {
          totalTrends: allTrends.length,
          avgConfidence: Math.round(allTrends.reduce((sum, trend) => sum + (trend.importance_score || 0.8), 0) / allTrends.length * 100),
          categoriesCount: Object.keys(categoryStats).length,
          topCategory: Object.keys(categoryStats).reduce((a, b) => 
            categoryStats[a].count > categoryStats[b].count ? a : b, 'General')
        },
        categoryStats: Object.keys(categoryStats).map(category => ({
          name: category,
          count: categoryStats[category].count,
          percentage: Math.round((categoryStats[category].count / allTrends.length) * 100),
          avgConfidence: Math.round(confidenceByCategory[category].reduce((a, b) => a + b, 0) / confidenceByCategory[category].length * 100)
        })).sort((a, b) => b.count - a.count)
      }
    };

    console.log('\n✅ Success! Sample response:');
    console.log(JSON.stringify(testResponse, null, 2));

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRealDataAnalytics();