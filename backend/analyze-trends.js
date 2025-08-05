const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function analyzeTrendData() {
  console.log('🔍 트렌드 데이터 분석 중...');
  
  try {
    // 1. 전체 데이터 현황
    const { data: allData, error } = await supabase
      .from('ai_trend_news')
      .select('*')
      .limit(50);
      
    if (error) throw error;
    
    console.log(`📊 총 ${allData.length}개 데이터 분석`);
    console.log('🔍 사용 가능한 필드:', Object.keys(allData[0]));
    
    // 2. importance_score 분포 분석
    const scores = allData.map(item => item.importance_score).filter(score => score != null);
    console.log('\n📈 Importance Score 분포:');
    console.log('   평균:', (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(3));
    console.log('   최대:', Math.max(...scores));
    console.log('   최소:', Math.min(...scores));
    
    // 3. 카테고리 분포
    const categories = {};
    allData.forEach(item => {
      const cat = item.category || 'Unknown';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    console.log('\n📂 카테고리 분포:');
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}개`);
    });
    
    // 4. 실제 AI 관련 키워드 분석
    const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'gpt', 'chatgpt', 'robot', 'neural', 'deep learning'];
    const aiMatches = {};
    
    allData.forEach(item => {
      const title = (item.title || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const text = title + ' ' + content;
      
      aiKeywords.forEach(keyword => {
        if (text.includes(keyword)) {
          if (!aiMatches[keyword]) aiMatches[keyword] = [];
          aiMatches[keyword].push(item.title);
        }
      });
    });
    
    console.log('\n🤖 AI 키워드 매칭:');
    Object.entries(aiMatches).forEach(([keyword, matches]) => {
      console.log(`   "${keyword}": ${matches.length}개 매칭`);
      if (matches.length > 0) {
        console.log(`      예시: ${matches[0]}`);
      }
    });
    
    // 5. 날짜별 분포
    const dateDistribution = {};
    allData.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString('ko-KR');
      dateDistribution[date] = (dateDistribution[date] || 0) + 1;
    });
    
    console.log('\n📅 날짜별 분포:');
    Object.entries(dateDistribution).slice(0, 5).forEach(([date, count]) => {
      console.log(`   ${date}: ${count}개`);
    });
    
    // 6. 트렌드 점수 기반 정렬 테스트
    const sortedByScore = allData
      .filter(item => item.importance_score)
      .sort((a, b) => b.importance_score - a.importance_score)
      .slice(0, 5);
      
    console.log('\n⭐ 중요도 점수 기준 상위 5개:');
    sortedByScore.forEach((item, index) => {
      console.log(`   ${index + 1}. [${item.importance_score.toFixed(3)}] ${item.title}`);
    });
    
    // 7. AI 관련 트렌드만 필터링 + 정렬
    const aiTrends = allData.filter(item => {
      const title = (item.title || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      return aiKeywords.some(keyword => 
        title.includes(keyword) || content.includes(keyword)
      );
    }).sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0));
    
    console.log(`\n🎯 AI 관련 트렌드 ${aiTrends.length}개 (중요도순):`);
    aiTrends.slice(0, 5).forEach((item, index) => {
      console.log(`   ${index + 1}. [${(item.importance_score || 0).toFixed(3)}] ${item.title}`);
    });
    
  } catch (error) {
    console.error('❌ 분석 실패:', error);
  }
}

analyzeTrendData();