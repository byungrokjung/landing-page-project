const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const router = express.Router();

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// OpenAI API 호출 함수
const callOpenAI = async (prompt) => {
  const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const postData = JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are an AI trends analyst. Provide professional, data-driven insights in Korean. Be specific, actionable, and business-focused.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1500,
    temperature: 0.7
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.choices && response.choices[0]) {
            resolve(response.choices[0].message.content.trim());
          } else {
            reject(new Error('Invalid OpenAI response'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

// 트렌드 데이터 통계 분석 API
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = 'all' } = req.query;
    
    console.log(`📊 Starting analytics for timeRange: ${timeRange}`);

    // 날짜 필터 설정
    let dateFilter = '';
    if (timeRange === '7days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      dateFilter = `AND created_at >= '${sevenDaysAgo}'`;
    } else if (timeRange === '30days') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      dateFilter = `AND created_at >= '${thirtyDaysAgo}'`;
    }

    // Supabase에서 트렌드 데이터 가져오기
    const { data: trends, error } = await supabase
      .from('ai_trend_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('❌ Supabase query error:', error);
      throw error;
    }

    // 날짜 필터링 (클라이언트 사이드)
    let filteredTrends = trends;
    if (timeRange === '7days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filteredTrends = trends.filter(trend => new Date(trend.created_at) >= sevenDaysAgo);
    } else if (timeRange === '30days') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filteredTrends = trends.filter(trend => new Date(trend.created_at) >= thirtyDaysAgo);
    }

    console.log(`📈 Found ${filteredTrends.length} trends for analysis`);

    // 1. 카테고리별 분포 계산
    const categoryStats = {};
    const confidenceByCategory = {};
    const dailyTrends = {};
    const sourceStats = {};

    filteredTrends.forEach(trend => {
      // AI 관련 카테고리 자동 분류
      const title = (trend.title || '').toLowerCase();
      const content = (trend.content || '').toLowerCase();
      const tags = trend.tags || [];
      
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
      
      const confidence = trend.importance_score || 0.8; // importance_score 사용
      const source = trend.source || 'Unknown';
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

      // 출처별 통계
      sourceStats[source] = (sourceStats[source] || 0) + 1;
    });

    // 2. 평균 신뢰도 계산
    Object.keys(confidenceByCategory).forEach(category => {
      const confidences = confidenceByCategory[category];
      categoryStats[category].avgConfidence = 
        confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    });

    // 3. 전체 통계
    const totalTrends = filteredTrends.length;
    const avgConfidence = filteredTrends.reduce((sum, trend) => 
      sum + (trend.importance_score || 0.8), 0) / totalTrends;
    
    const topCategory = Object.keys(categoryStats).reduce((a, b) => 
      categoryStats[a].count > categoryStats[b].count ? a : b, 'Unknown');

    // 4. 상위 트렌드 (importance_score 기준)
    const topTrends = filteredTrends
      .sort((a, b) => (b.importance_score || 0.8) - (a.importance_score || 0.8))
      .slice(0, 10);

    // 5. 최신 트렌드 (최근 3일)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const recentTrends = filteredTrends.filter(trend => 
      new Date(trend.created_at) >= threeDaysAgo);

    // 6. 분석 결과 구성
    const analyticsResult = {
      period: timeRange === '7days' ? '최근 7일' : timeRange === '30days' ? '최근 30일' : '전체 기간',
      generatedAt: new Date().toLocaleString('ko-KR'),
      
      // 기본 통계
      summary: {
        totalTrends,
        avgConfidence: Math.round(avgConfidence * 100),
        categoriesCount: Object.keys(categoryStats).length,
        topCategory,
        sourcesCount: Object.keys(sourceStats).length,
        recentTrendsCount: recentTrends.length
      },

      // 카테고리별 상세 통계
      categoryStats: Object.keys(categoryStats).map(category => ({
        name: category,
        count: categoryStats[category].count,
        percentage: Math.round((categoryStats[category].count / totalTrends) * 100),
        avgConfidence: Math.round(categoryStats[category].avgConfidence * 100)
      })).sort((a, b) => b.count - a.count),

      // 시간별 트렌드
      dailyTrends: Object.keys(dailyTrends)
        .sort((a, b) => new Date(a) - new Date(b))
        .slice(-14) // 최근 14일
        .map(date => ({
          date,
          count: dailyTrends[date]
        })),

      // 출처별 통계
      sourceStats: Object.keys(sourceStats)
        .map(source => ({
          name: source,
          count: sourceStats[source],
          percentage: Math.round((sourceStats[source] / totalTrends) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),

      // 상위 트렌드
      topTrends: topTrends.slice(0, 5).map(trend => {
        // 카테고리 재분류
        const title = (trend.title || '').toLowerCase();
        const content = (trend.content || '').toLowerCase();
        let category = 'General';
        if (title.includes('ai') || content.includes('ai ')) {
          if (title.includes('gpt') || title.includes('language model')) {
            category = 'Language Models';
          } else if (title.includes('vision') || title.includes('image')) {
            category = 'Computer Vision';
          } else if (title.includes('machine learning') || title.includes('ml ')) {
            category = 'Machine Learning';
          } else if (title.includes('robot')) {
            category = 'Robotics';
          } else {
            category = 'AI Technology';
          }
        }
        
        return {
          id: trend.id,
          title: trend.title,
          category: category,
          confidence: Math.round((trend.importance_score || 0.8) * 100),
          source: trend.source,
          date: trend.created_at
        };
      }),

      // 최신 트렌드
      recentTrends: recentTrends.slice(0, 5).map(trend => {
        // 카테고리 재분류
        const title = (trend.title || '').toLowerCase();
        const content = (trend.content || '').toLowerCase();
        let category = 'General';
        if (title.includes('ai') || content.includes('ai ')) {
          if (title.includes('gpt') || title.includes('language model')) {
            category = 'Language Models';
          } else if (title.includes('vision') || title.includes('image')) {
            category = 'Computer Vision';
          } else if (title.includes('machine learning') || title.includes('ml ')) {
            category = 'Machine Learning';
          } else if (title.includes('robot')) {
            category = 'Robotics';
          } else {
            category = 'AI Technology';
          }
        }
        
        return {
          id: trend.id,
          title: trend.title,
          category: category,
          confidence: Math.round((trend.importance_score || 0.8) * 100),
          source: trend.source,
          date: trend.created_at
        };
      })
    };

    console.log('✅ Analytics generated successfully');
    res.json({
      success: true,
      data: analyticsResult
    });

  } catch (error) {
    console.error('❌ Analytics generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'Analytics generation failed',
      message: error.message
    });
  }
});

// AI 인사이트 생성 API
router.post('/generate-insights', async (req, res) => {
  try {
    const { 
      timeRange = '7days', 
      interests = ['Language Models', 'Machine Learning'],
      reportType = 'detailed'
    } = req.body;

    console.log(`🧠 Generating AI insights for interests: ${interests.join(', ')}`);

    // 1. 관련 트렌드 데이터 가져오기
    const { data: allTrends, error } = await supabase
      .from('ai_trend_news')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    // 2. 시간 범위 및 관심사 필터링
    let filteredTrends = allTrends;
    
    // 시간 필터
    if (timeRange === '7days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filteredTrends = filteredTrends.filter(trend => 
        new Date(trend.created_at) >= sevenDaysAgo);
    } else if (timeRange === '30days') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filteredTrends = filteredTrends.filter(trend => 
        new Date(trend.created_at) >= thirtyDaysAgo);
    }

    // 관심사 필터 (실제 데이터에서 AI 관련 카테고리 자동 분류)
    const relevantTrends = filteredTrends.filter(trend => {
      const title = (trend.title || '').toLowerCase();
      const content = (trend.content || '').toLowerCase();
      
      // AI 관련 키워드로 필터링
      return interests.some(interest => {
        if (interest === 'Language Models') {
          return title.includes('gpt') || title.includes('language model') || 
                 content.includes('language model') || title.includes('chatgpt');
        } else if (interest === 'Machine Learning') {
          return title.includes('machine learning') || title.includes('ml ') || 
                 title.includes('ai') || content.includes('machine learning');
        } else if (interest === 'Computer Vision') {
          return title.includes('vision') || title.includes('image') || 
                 content.includes('computer vision');
        } else if (interest === 'Robotics') {
          return title.includes('robot') || content.includes('robot');
        }
        return false;
      }) || title.includes('ai') || content.includes('artificial intelligence');
    });

    console.log(`📊 Found ${relevantTrends.length} relevant trends`);

    // 3. OpenAI를 사용한 인사이트 생성
    const trendsData = relevantTrends.slice(0, 20).map(trend => ({
      title: trend.title,
      category: trend.category,
      confidence: trend.importance_score || 0.8,
      source: trend.source,
      date: new Date(trend.created_at).toLocaleDateString('ko-KR'),
      content: (trend.content || '').substring(0, 200) // 요약을 위해 내용 일부 포함
    }));

    const prompt = `
다음 AI 트렌드 데이터를 분석하여 비즈니스 인사이트를 생성해주세요:

기간: ${timeRange === '7days' ? '최근 7일' : timeRange === '30days' ? '최근 30일' : '전체 기간'}
관심 분야: ${interests.join(', ')}
트렌드 수: ${relevantTrends.length}개

주요 트렌드 데이터:
${trendsData.map((trend, index) => 
  `${index + 1}. [${trend.category}] ${trend.title}
     중요도: ${Math.round(trend.confidence * 100)}%, 출처: ${trend.source}
     내용: ${trend.content}`
).join('\n\n')}

다음 항목에 대해 분석해주세요:

1. 핵심 트렌드 요약 (3-4개 주요 포인트)
2. 비즈니스 기회 및 위험 요소
3. 향후 전망 및 예측
4. 실행 가능한 추천 액션 (우선순위별 3개)

한국어로 전문적이고 실용적인 분석을 제공해주세요.
`;

    const aiInsights = await callOpenAI(prompt);

    // 4. 통계 데이터 계산
    const categoryStats = {};
    relevantTrends.forEach(trend => {
      const category = trend.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, avgConfidence: 0, trends: [] };
      }
      categoryStats[category].count++;
      categoryStats[category].trends.push(trend);
    });

    // 평균 중요도 계산
    Object.keys(categoryStats).forEach(category => {
      const trends = categoryStats[category].trends;
      categoryStats[category].avgConfidence = 
        trends.reduce((sum, trend) => sum + (trend.importance_score || 0.8), 0) / trends.length;
    });

    // 5. 상위 트렌드 선정
    const topTrends = relevantTrends
      .sort((a, b) => (b.importance_score || 0.8) - (a.importance_score || 0.8))
      .slice(0, 5);

    // 6. 결과 구성
    const insightReport = {
      period: timeRange === '7days' ? '주간' : timeRange === '30days' ? '월간' : '전체',
      generatedAt: new Date().toLocaleString('ko-KR'),
      interests,
      
      summary: {
        totalTrends: allTrends.length,
        relevantTrends: relevantTrends.length,
        avgConfidence: Math.round(
          relevantTrends.reduce((sum, trend) => sum + (trend.importance_score || 0.8), 0) / 
          relevantTrends.length * 100
        ),
        categoriesAnalyzed: Object.keys(categoryStats).length
      },

      aiInsights: aiInsights,

      categoryStats: Object.keys(categoryStats).map(category => ({
        name: category,
        count: categoryStats[category].count,
        avgConfidence: Math.round(categoryStats[category].avgConfidence * 100),
        percentage: Math.round((categoryStats[category].count / relevantTrends.length) * 100)
      })),

      topTrends: topTrends.map(trend => ({
        id: trend.id,
        title: trend.title,
        category: trend.category,
        confidence: Math.round((trend.importance_score || 0.8) * 100),
        source: trend.source,
        date: trend.created_at
      })),

      metadata: {
        analysisDate: new Date().toISOString(),
        dataSource: 'supabase',
        aiModel: 'gpt-3.5-turbo'
      }
    };

    console.log('✅ AI insights generated successfully');
    res.json({
      success: true,
      data: insightReport
    });

  } catch (error) {
    console.error('❌ AI insights generation failed:', error);
    res.status(500).json({
      success: false,
      error: 'AI insights generation failed',
      message: error.message
    });
  }
});

// 사용자 개인화 설정 저장 API
router.post('/save-preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    // 사용자 설정을 Supabase에 저장
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    res.json({
      success: true,
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Preferences save failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save preferences',
      message: error.message
    });
  }
});

// 사용자 개인화 설정 조회 API
router.get('/preferences/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    res.json({
      success: true,
      data: data || {
        interests: ['Language Models', 'Machine Learning'],
        reportType: 'detailed',
        includeTranslation: true
      }
    });

  } catch (error) {
    console.error('❌ Preferences fetch failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preferences',
      message: error.message
    });
  }
});

module.exports = router;