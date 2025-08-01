const express = require('express');
const { supabase } = require('../config/supabase');
const router = express.Router();

// 트렌드 분석 통계 조회
router.get('/stats', async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // 시간 범위 계산
    const dateFrom = new Date();
    if (timeRange === '24h') dateFrom.setHours(dateFrom.getHours() - 24);
    else if (timeRange === '7d') dateFrom.setDate(dateFrom.getDate() - 7);
    else if (timeRange === '30d') dateFrom.setDate(dateFrom.getDate() - 30);
    
    // 트렌드 데이터 조회
    const { data: trends, error } = await supabase
      .from('ai_trends_data')
      .select('*')
      .gte('collected_at', dateFrom.toISOString())
      .order('confidence', { ascending: false });
    
    if (error) throw error;
    
    // 통계 계산
    const stats = {
      totalTrends: trends.length,
      avgConfidence: trends.reduce((sum, t) => sum + parseFloat(t.confidence), 0) / trends.length,
      categoryDistribution: {},
      sourceDistribution: {},
      topKeywords: {},
      trendsByDate: {}
    };
    
    // 카테고리별 분포
    trends.forEach(trend => {
      stats.categoryDistribution[trend.trend_category] = 
        (stats.categoryDistribution[trend.trend_category] || 0) + 1;
      
      stats.sourceDistribution[trend.source] = 
        (stats.sourceDistribution[trend.source] || 0) + 1;
      
      // 날짜별 트렌드
      const date = new Date(trend.collected_at).toISOString().split('T')[0];
      stats.trendsByDate[date] = (stats.trendsByDate[date] || 0) + 1;
      
      // 키워드 집계
      if (trend.tags) {
        trend.tags.forEach(tag => {
          stats.topKeywords[tag] = (stats.topKeywords[tag] || 0) + 1;
        });
      }
    });
    
    // 상위 10개 키워드만 반환
    stats.topKeywords = Object.entries(stats.topKeywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, val]) => ({ ...obj, [key]: val }), {});
    
    res.json({
      success: true,
      timeRange,
      stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// 트렌드 알림 설정
router.post('/alerts', async (req, res) => {
  try {
    const { userId, categories, keywords, minConfidence } = req.body;
    
    // 알림 설정 저장
    const { data, error } = await supabase
      .from('ai_trends_alerts')
      .upsert({
        user_id: userId,
        categories: categories || [],
        keywords: keywords || [],
        min_confidence: minConfidence || 0.8,
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    
    res.json({
      success: true,
      alert: data[0],
      message: 'Alert settings saved successfully'
    });
    
  } catch (error) {
    console.error('❌ Error saving alert settings:', error);
    res.status(500).json({
      error: 'Failed to save alert settings',
      message: error.message
    });
  }
});

// 트렌드 기반 인사이트 리포트 생성
router.post('/generate-report', async (req, res) => {
  try {
    const { timeRange, categories, format = 'json' } = req.body;
    
    // 시간 범위에 따른 트렌드 조회
    const dateFrom = new Date();
    if (timeRange === 'week') dateFrom.setDate(dateFrom.getDate() - 7);
    else if (timeRange === 'month') dateFrom.setMonth(dateFrom.getMonth() - 1);
    
    const { data: trends, error } = await supabase
      .from('ai_trends_data')
      .select('*')
      .gte('collected_at', dateFrom.toISOString())
      .in('trend_category', categories || [])
      .order('confidence', { ascending: false });
    
    if (error) throw error;
    
    // 인사이트 생성
    const insights = {
      period: {
        from: dateFrom.toISOString(),
        to: new Date().toISOString(),
        duration: timeRange
      },
      summary: {
        totalTrends: trends.length,
        topCategory: getMostFrequent(trends.map(t => t.trend_category)),
        avgConfidence: (trends.reduce((sum, t) => sum + parseFloat(t.confidence), 0) / trends.length).toFixed(2)
      },
      topTrends: trends.slice(0, 5).map(t => ({
        title: t.trend_title,
        category: t.trend_category,
        confidence: t.confidence,
        source: t.source
      })),
      emergingKeywords: getEmergingKeywords(trends),
      recommendations: generateRecommendations(trends)
    };
    
    // 리포트 저장
    const { data: report, error: reportError } = await supabase
      .from('ai_trends_reports')
      .insert({
        report_data: insights,
        time_range: timeRange,
        categories: categories || [],
        format: format,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (reportError) throw reportError;
    
    res.json({
      success: true,
      report: insights,
      reportId: report[0].id,
      message: 'Report generated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error generating report:', error);
    res.status(500).json({
      error: 'Failed to generate report',
      message: error.message
    });
  }
});

// 헬퍼 함수들
function getMostFrequent(arr) {
  const counts = arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

function getEmergingKeywords(trends) {
  const keywords = {};
  trends.forEach(trend => {
    if (trend.tags) {
      trend.tags.forEach(tag => {
        keywords[tag] = (keywords[tag] || 0) + 1;
      });
    }
  });
  
  return Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));
}

function generateRecommendations(trends) {
  const recommendations = [];
  
  // 카테고리별 추천
  const categories = {};
  trends.forEach(t => {
    categories[t.trend_category] = (categories[t.trend_category] || 0) + 1;
  });
  
  const topCategory = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (topCategory) {
    recommendations.push({
      type: 'focus_area',
      title: `${topCategory[0]} 분야 집중 투자`,
      description: `현재 ${topCategory[0]} 분야에서 ${topCategory[1]}개의 주요 트렌드가 발견되었습니다.`
    });
  }
  
  // 높은 신뢰도 트렌드 추천
  const highConfidenceTrends = trends.filter(t => t.confidence > 0.9);
  if (highConfidenceTrends.length > 0) {
    recommendations.push({
      type: 'high_confidence',
      title: '높은 신뢰도 트렌드 주목',
      description: `${highConfidenceTrends.length}개의 트렌드가 90% 이상의 신뢰도를 보입니다.`
    });
  }
  
  return recommendations;
}

module.exports = router;