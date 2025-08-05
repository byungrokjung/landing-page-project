const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function testTrendScoring() {
  console.log('🧪 새로운 트렌드 점수 시스템 테스트...');
  
  try {
    const { data: trends, error } = await supabase
      .from('ai_trend_news')
      .select('*')
      .limit(20);
      
    if (error) throw error;
    
    // 트렌드 점수 계산
    const scoredTrends = trends.map(trend => {
      const title = (trend.title || '').toLowerCase();
      const content = (trend.content || '').toLowerCase();
      let trendScore = 0.5; // 기본 점수
      let scoreBreakdown = ['Base: 0.5'];
      
      // AI 관련 보너스
      if (title.includes('ai') || content.includes('ai ')) {
        trendScore += 0.3;
        scoreBreakdown.push('AI관련: +0.3');
      }
      
      // 세부 카테고리 보너스
      if (title.includes('gpt') || title.includes('chatgpt')) {
        trendScore += 0.2;
        scoreBreakdown.push('GPT: +0.2');
      } else if (title.includes('machine learning')) {
        trendScore += 0.2;
        scoreBreakdown.push('ML: +0.2');
      }
      
      // 트렌드 키워드 보너스
      const trendKeywords = {
        'breakthrough': 0.3, 'revolutionary': 0.25, 'game-changing': 0.2,
        'launches': 0.15, 'announces': 0.1, 'releases': 0.1,
        'raises': 0.2, 'funding': 0.15, 'investment': 0.1,
        'billion': 0.25, 'million': 0.15,
        'new': 0.05, 'first': 0.1
      };
      
      Object.entries(trendKeywords).forEach(([keyword, bonus]) => {
        if (title.includes(keyword) || content.includes(keyword)) {
          trendScore += bonus;
          scoreBreakdown.push(`${keyword}: +${bonus}`);
        }
      });
      
      // 날짜 보너스
      const daysSinceCreated = (Date.now() - new Date(trend.created_at)) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated <= 1) {
        trendScore += 0.2;
        scoreBreakdown.push('최신(1일): +0.2');
      } else if (daysSinceCreated <= 3) {
        trendScore += 0.1;
        scoreBreakdown.push('최신(3일): +0.1');
      }
      
      // 컨텐츠 길이 보너스
      const contentLength = (trend.content || '').length;
      if (contentLength > 500) {
        trendScore += 0.1;
        scoreBreakdown.push('긴내용: +0.1');
      } else if (contentLength > 200) {
        trendScore += 0.05;
        scoreBreakdown.push('보통내용: +0.05');
      }
      
      const finalScore = Math.min(Math.max(trendScore, 0.1), 1.0);
      
      return {
        ...trend,
        calculatedScore: finalScore,
        scoreBreakdown: scoreBreakdown
      };
    }).sort((a, b) => b.calculatedScore - a.calculatedScore);
    
    console.log('\n🏆 상위 10개 트렌드 (점수순):');
    scoredTrends.slice(0, 10).forEach((trend, index) => {
      console.log(`${index + 1}. [${(trend.calculatedScore * 100).toFixed(1)}점] ${trend.title}`);
      console.log(`   점수 상세: ${trend.scoreBreakdown.join(', ')}`);
      console.log('');
    });
    
    // AI 관련 트렌드만 필터링
    const aiTrends = scoredTrends.filter(trend => {
      const title = (trend.title || '').toLowerCase();
      const content = (trend.content || '').toLowerCase();
      return title.includes('ai') || title.includes('artificial intelligence') || 
             title.includes('machine learning') || title.includes('gpt') ||
             content.includes('ai ') || title.includes('chatgpt');
    });
    
    console.log(`🤖 AI 관련 상위 트렌드 ${aiTrends.length}개:`);
    aiTrends.slice(0, 5).forEach((trend, index) => {
      console.log(`${index + 1}. [${(trend.calculatedScore * 100).toFixed(1)}점] ${trend.title}`);
    });
    
    console.log('\n✅ 트렌드 점수 시스템 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  }
}

testTrendScoring();