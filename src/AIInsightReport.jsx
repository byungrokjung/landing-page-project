import React, { useState, useEffect } from 'react';

const AIInsightReport = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('weekly'); // 'weekly', 'monthly'
  const [userPreferences, setUserPreferences] = useState({
    interests: ['Language Models', 'Machine Learning'],
    reportFormat: 'detailed', // 'detailed', 'summary'
    includeTranslation: true
  });
  const [generatingReport, setGeneratingReport] = useState(false);

  // 실제 백엔드 API로 리포트 생성
  const generateReport = async () => {
    setGeneratingReport(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      console.log(`🔄 Generating AI insight report...`);
      console.log(`📋 Settings:`, { reportType, interests: userPreferences.interests });
      
      // 새로운 AI 인사이트 API 사용
      const response = await fetch(`${apiUrl}/api/ai-trends-analysis/generate-insights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeRange: reportType === 'weekly' ? '7days' : '30days',
          interests: userPreferences.interests,
          reportType: userPreferences.reportFormat
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ AI insights generated:', result);
        
        if (result.success) {
          // 백엔드에서 받은 데이터를 기존 구조에 맞게 변환
          const transformedReport = {
            period: result.data.period,
            generatedAt: result.data.generatedAt,
            summary: result.data.summary,
            categoryStats: result.data.categoryStats,
            topTrends: result.data.topTrends,
            insights: parseAIInsights(result.data.aiInsights), // AI 텍스트를 구조화된 데이터로 변환
            recommendations: generateRecommendationsFromAI(result.data.aiInsights, result.data.categoryStats),
            detailedAnalysis: {
              sourceAnalysis: {
                sources: [...new Set(result.data.topTrends.map(t => t.source))],
                mostFrequentSource: {}
              },
              timelineAnalysis: {
                dailyCount: {}
              }
            },
            aiInsightsRaw: result.data.aiInsights // 원본 AI 인사이트 보관
          };
          
          setReportData(transformedReport);
        } else {
          throw new Error(result.message || 'AI insights generation failed');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }

    } catch (error) {
      console.error('❌ AI insights generation failed:', error);
      console.log('🔄 Falling back to demo data...');
      
      // 데모 리포트 폴백
      const demoTrends = generateDemoTrends();
      const report = await generateInsightReport(demoTrends, demoTrends);
      setReportData(report);
    } finally {
      setGeneratingReport(false);
      setLoading(false);
    }
  };

  // AI 인사이트 텍스트를 구조화된 데이터로 변환
  const parseAIInsights = (aiText) => {
    // AI 텍스트를 파싱해서 인사이트 객체로 변환
    const insights = [];
    
    // 간단한 파싱 로직 (실제로는 더 정교하게 구현 가능)
    if (aiText.includes('활발') || aiText.includes('증가')) {
      insights.push({
        type: 'trend',
        title: '성장 트렌드 발견',
        content: 'AI 분야에서 활발한 성장 동향이 감지되었습니다.',
        impact: 'high'
      });
    }
    
    if (aiText.includes('신뢰도') || aiText.includes('품질')) {
      insights.push({
        type: 'quality',
        title: '높은 품질 트렌드',
        content: '수집된 트렌드들이 높은 신뢰도를 보이고 있습니다.',
        impact: 'medium'
      });
    }
    
    if (aiText.includes('새로운') || aiText.includes('혁신')) {
      insights.push({
        type: 'emerging',
        title: '혁신적 기술 동향',
        content: '새로운 혁신 기술들이 등장하고 있습니다.',
        impact: 'high'
      });
    }
    
    return insights;
  };

  // AI 인사이트에서 추천 액션 생성
  const generateRecommendationsFromAI = (aiText, categoryStats) => {
    const recommendations = [];
    
    if (categoryStats && categoryStats.length > 0) {
      const topCategory = categoryStats[0];
      recommendations.push({
        priority: 'high',
        action: `${topCategory.name} 분야 집중 모니터링`,
        description: `${topCategory.name} 분야가 ${topCategory.percentage}%로 가장 활발하므로 우선적으로 모니터링하세요.`
      });
    }
    
    recommendations.push({
      priority: 'medium',
      action: 'AI 기반 인사이트 활용',
      description: 'OpenAI가 분석한 트렌드 인사이트를 비즈니스 전략에 활용하세요.'
    });
    
    recommendations.push({
      priority: 'low',
      action: '정기적 분석 리포트 검토',
      description: '주간/월간 리포트를 정기적으로 확인하여 트렌드 변화를 추적하세요.'
    });
    
    return recommendations;
  };

  // 데모 트렌드 데이터
  const generateDemoTrends = () => [
    {
      id: 1,
      title: 'GPT-4 Turbo Performance Improvements',
      category: 'Language Models',
      confidence: 0.95,
      source: 'OpenAI Blog',
      date: new Date(Date.now() - 86400000 * 1).toISOString(),
      content: 'OpenAI has announced significant performance improvements in GPT-4 Turbo, including faster response times and better accuracy.'
    },
    {
      id: 2,
      title: 'Multimodal AI Systems Revolution',
      category: 'Machine Learning',
      confidence: 0.91,
      source: 'Nature AI',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      content: 'New multimodal AI systems are showing unprecedented capabilities in understanding and generating content across different modalities.'
    },
    {
      id: 3,
      title: 'Computer Vision Breakthroughs in Medical Imaging',
      category: 'Computer Vision',
      confidence: 0.88,
      source: 'Medical AI Journal',
      date: new Date(Date.now() - 86400000 * 3).toISOString(),
      content: 'Latest computer vision models are achieving remarkable accuracy in medical image analysis and diagnosis.'
    },
    {
      id: 4,
      title: 'Edge AI Deployment Strategies for IoT',
      category: 'Edge Computing',
      confidence: 0.82,
      source: 'TechCrunch',
      date: new Date(Date.now() - 86400000 * 4).toISOString(),
      content: 'New deployment strategies are making edge AI more accessible and efficient for IoT applications.'
    },
    {
      id: 5,
      title: 'Transformer Architecture Optimizations',
      category: 'Machine Learning',
      confidence: 0.89,
      source: 'arXiv',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      content: 'Researchers have developed new optimization techniques that significantly improve transformer model efficiency.'
    }
  ];

  // AI 인사이트 리포트 생성
  const generateInsightReport = async (filteredTrends, allTrends) => {
    // 기본 통계
    const totalTrends = allTrends.length;
    const relevantTrends = filteredTrends.length;
    const avgConfidence = filteredTrends.reduce((sum, trend) => sum + (trend.confidence || 0.8), 0) / relevantTrends;
    
    // 카테고리별 분석
    const categoryStats = {};
    filteredTrends.forEach(trend => {
      if (!categoryStats[trend.category]) {
        categoryStats[trend.category] = {
          count: 0,
          avgConfidence: 0,
          trends: []
        };
      }
      categoryStats[trend.category].count++;
      categoryStats[trend.category].trends.push(trend);
    });

    // 평균 신뢰도 계산
    Object.keys(categoryStats).forEach(category => {
      const trends = categoryStats[category].trends;
      categoryStats[category].avgConfidence = trends.reduce((sum, trend) => 
        sum + (trend.confidence || 0.8), 0) / trends.length;
    });

    // 상위 트렌드 선정 (신뢰도 기준)
    const topTrends = filteredTrends
      .sort((a, b) => (b.confidence || 0.8) - (a.confidence || 0.8))
      .slice(0, 5);

    // 주요 인사이트 생성
    const insights = generateInsights(filteredTrends, categoryStats, topTrends);

    // 추천 액션 생성
    const recommendations = generateRecommendations(categoryStats, topTrends);

    return {
      period: reportType === 'weekly' ? '주간' : '월간',
      generatedAt: new Date().toLocaleString('ko-KR'),
      summary: {
        totalTrends,
        relevantTrends,
        avgConfidence: (avgConfidence * 100).toFixed(1),
        categoriesAnalyzed: Object.keys(categoryStats).length
      },
      categoryStats,
      topTrends,
      insights,
      recommendations,
      detailedAnalysis: generateDetailedAnalysis(filteredTrends)
    };
  };

  // 인사이트 생성
  const generateInsights = (trends, categoryStats, topTrends) => {
    const insights = [];

    // 가장 활발한 카테고리
    const mostActiveCategory = Object.keys(categoryStats).reduce((a, b) => 
      categoryStats[a].count > categoryStats[b].count ? a : b);
    
    insights.push({
      type: 'trend',
      title: '가장 활발한 분야',
      content: `${mostActiveCategory} 분야에서 ${categoryStats[mostActiveCategory].count}개의 주요 트렌드가 발견되었습니다.`,
      impact: 'high'
    });

    // 신뢰도 분석
    const highConfidenceTrends = trends.filter(t => (t.confidence || 0.8) >= 0.9);
    if (highConfidenceTrends.length > 0) {
      insights.push({
        type: 'quality',
        title: '높은 신뢰도 트렌드',
        content: `전체 트렌드 중 ${((highConfidenceTrends.length / trends.length) * 100).toFixed(1)}%가 90% 이상의 높은 신뢰도를 보이고 있습니다.`,
        impact: 'medium'
      });
    }

    // 새로운 트렌드 발견
    const recentTrends = trends.filter(t => {
      const trendDate = new Date(t.date);
      const threeDaysAgo = new Date(Date.now() - 3 * 86400000);
      return trendDate > threeDaysAgo;
    });

    if (recentTrends.length > 0) {
      insights.push({
        type: 'emerging',
        title: '신규 트렌드 발견',
        content: `최근 3일간 ${recentTrends.length}개의 새로운 트렌드가 등장했습니다.`,
        impact: 'high'
      });
    }

    return insights;
  };

  // 추천 액션 생성
  const generateRecommendations = (categoryStats, topTrends) => {
    const recommendations = [];

    // 가장 신뢰도 높은 카테고리 추천
    const bestCategory = Object.keys(categoryStats).reduce((a, b) => 
      categoryStats[a].avgConfidence > categoryStats[b].avgConfidence ? a : b);

    recommendations.push({
      priority: 'high',
      action: '주목할 분야',
      description: `${bestCategory} 분야의 트렌드들이 평균 ${(categoryStats[bestCategory].avgConfidence * 100).toFixed(1)}%의 높은 신뢰도를 보이고 있어 추가 모니터링을 권장합니다.`
    });

    // 상위 트렌드 모니터링 추천
    if (topTrends.length > 0) {
      recommendations.push({
        priority: 'medium',
        action: '핵심 트렌드 추적',
        description: `"${topTrends[0].title}" 등 ${topTrends.length}개의 핵심 트렌드에 대한 지속적인 추적이 필요합니다.`
      });
    }

    // 관심 분야 확장 제안
    const currentCategories = Object.keys(categoryStats);
    const allCategories = ['Language Models', 'Computer Vision', 'Edge Computing', 'Machine Learning', 'Robotics'];
    const missingCategories = allCategories.filter(cat => !currentCategories.includes(cat));

    if (missingCategories.length > 0) {
      recommendations.push({
        priority: 'low',
        action: '관심 분야 확장',
        description: `${missingCategories.slice(0, 2).join(', ')} 등의 분야도 관심 목록에 추가해보세요.`
      });
    }

    return recommendations;
  };

  // 상세 분석 생성
  const generateDetailedAnalysis = (trends) => {
    return {
      sourceAnalysis: {
        sources: [...new Set(trends.map(t => t.source))],
        mostFrequentSource: trends.reduce((acc, trend) => {
          acc[trend.source] = (acc[trend.source] || 0) + 1;
          return acc;
        }, {})
      },
      timelineAnalysis: {
        dailyCount: trends.reduce((acc, trend) => {
          const date = new Date(trend.date).toLocaleDateString('ko-KR');
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {})
      }
    };
  };

  // PDF 다운로드 (시뮬레이션)
  const downloadPDF = () => {
    const reportContent = generatePDFContent();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Insight_Report_${reportType}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // PDF 내용 생성
  const generatePDFContent = () => {
    if (!reportData) return '';

    return `
AI 인사이트 ${reportData.period} 리포트
생성일시: ${reportData.generatedAt}

===== 요약 =====
- 전체 트렌드: ${reportData.summary.totalTrends}개
- 관련 트렌드: ${reportData.summary.relevantTrends}개
- 평균 신뢰도: ${reportData.summary.avgConfidence}%
- 분석 카테고리: ${reportData.summary.categoriesAnalyzed}개

===== 주요 인사이트 =====
${reportData.insights.map(insight => `
• ${insight.title}
  ${insight.content}
`).join('')}

===== 상위 트렌드 =====
${reportData.topTrends.map((trend, index) => `
${index + 1}. ${trend.title}
   카테고리: ${trend.category}
   신뢰도: ${((trend.confidence || 0.8) * 100).toFixed(1)}%
   출처: ${trend.source}
`).join('')}

===== 추천 액션 =====
${reportData.recommendations.map(rec => `
• [${rec.priority.toUpperCase()}] ${rec.action}
  ${rec.description}
`).join('')}

이 리포트는 AI 트렌드 분석 시스템에 의해 자동 생성되었습니다.
    `;
  };

  useEffect(() => {
    generateReport();
  }, [reportType]);

  if (loading || generatingReport) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #333',
            borderTop: '3px solid #00ff88',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>{loading ? '리포트 데이터 로딩 중...' : 'AI 인사이트 분석 중...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      padding: '20px'
    }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '32px', marginBottom: '10px' }}>
          📊 AI 인사이트 리포트
        </h1>
        <p style={{ color: '#888', fontSize: '16px', marginBottom: '20px' }}>
          개인화된 AI 트렌드 분석 및 추천
        </p>
        <a href="/" style={{ color: '#00ff88', textDecoration: 'none', fontSize: '14px' }}>
          ← 홈으로 돌아가기
        </a>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 리포트 설정 */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '15px',
          padding: '25px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#fff', marginBottom: '20px' }}>⚙️ 리포트 설정</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* 리포트 타입 */}
            <div>
              <label style={{ color: '#ccc', fontSize: '14px', marginBottom: '10px', display: 'block' }}>
                리포트 주기
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['weekly', 'monthly'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setReportType(type)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: reportType === type ? '2px solid #00ff88' : '1px solid #333',
                      background: reportType === type ? '#00ff88' : 'transparent',
                      color: reportType === type ? '#000' : '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {type === 'weekly' ? '주간' : '월간'}
                  </button>
                ))}
              </div>
            </div>

            {/* 관심 분야 */}
            <div>
              <label style={{ color: '#ccc', fontSize: '14px', marginBottom: '10px', display: 'block' }}>
                관심 분야
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Language Models', 'Machine Learning', 'Computer Vision', 'Edge Computing', 'Robotics'].map((interest) => (
                  <button
                    key={interest}
                    onClick={() => {
                      const newInterests = userPreferences.interests.includes(interest)
                        ? userPreferences.interests.filter(i => i !== interest)
                        : [...userPreferences.interests, interest];
                      setUserPreferences({...userPreferences, interests: newInterests});
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '15px',
                      border: userPreferences.interests.includes(interest) ? '1px solid #00ff88' : '1px solid #333',
                      background: userPreferences.interests.includes(interest) ? '#00ff88' : 'transparent',
                      color: userPreferences.interests.includes(interest) ? '#000' : '#fff',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              onClick={generateReport}
              disabled={generatingReport}
              style={{
                padding: '10px 20px',
                borderRadius: '25px',
                border: '2px solid #00ff88',
                background: generatingReport ? '#333' : '#00ff88',
                color: generatingReport ? '#fff' : '#000',
                cursor: generatingReport ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {generatingReport ? '리포트 생성 중...' : '새 리포트 생성'}
            </button>
          </div>
        </div>

        {/* 리포트 내용 */}
        {reportData && (
          <div>
            {/* 리포트 헤더 */}
            <div style={{
              background: '#1a1a1a',
              border: '2px solid #00ff88',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              <h2 style={{ color: '#00ff88', fontSize: '28px', marginBottom: '10px' }}>
                {reportData.period} AI 인사이트 리포트
              </h2>
              <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '20px' }}>
                생성일시: {reportData.generatedAt}
              </p>
              
              {/* 요약 통계 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <div style={{ color: '#fff' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff88' }}>
                    {reportData.summary.relevantTrends}
                  </div>
                  <div style={{ fontSize: '12px' }}>관련 트렌드</div>
                </div>
                <div style={{ color: '#fff' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0088ff' }}>
                    {reportData.summary.avgConfidence}%
                  </div>
                  <div style={{ fontSize: '12px' }}>평균 신뢰도</div>
                </div>
                <div style={{ color: '#fff' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b35' }}>
                    {reportData.summary.categoriesAnalyzed}
                  </div>
                  <div style={{ fontSize: '12px' }}>분석 카테고리</div>
                </div>
              </div>

              {/* 다운로드 버튼 */}
              <button
                onClick={downloadPDF}
                style={{
                  marginTop: '20px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #0088ff',
                  background: 'transparent',
                  color: '#0088ff',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                📄 리포트 다운로드
              </button>
            </div>

            {/* AI 생성 인사이트 (원본) */}
            {reportData.aiInsightsRaw && (
              <div style={{
                background: '#1a1a1a',
                border: '2px solid #00ff88',
                borderRadius: '15px',
                padding: '25px',
                marginBottom: '30px'
              }}>
                <h3 style={{ color: '#00ff88', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                  🤖 OpenAI 생성 분석 인사이트
                  <span style={{
                    background: '#00ff88',
                    color: '#000',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    marginLeft: '10px'
                  }}>
                    GPT-3.5-turbo
                  </span>
                </h3>
                <div style={{
                  background: '#0a0a0a',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #333',
                  color: '#fff',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  whiteSpace: 'pre-line'
                }}>
                  {reportData.aiInsightsRaw}
                </div>
              </div>
            )}

            {/* 주요 인사이트 */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '20px' }}>🧠 주요 인사이트</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {reportData.insights.map((insight, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#0a0a0a',
                      padding: '20px',
                      borderRadius: '10px',
                      border: `2px solid ${insight.impact === 'high' ? '#ff3366' : insight.impact === 'medium' ? '#ff6b35' : '#0088ff'}`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: insight.impact === 'high' ? '#ff3366' : insight.impact === 'medium' ? '#ff6b35' : '#0088ff',
                        marginRight: '10px'
                      }}></span>
                      <h4 style={{ color: '#fff', fontSize: '16px', margin: 0 }}>
                        {insight.title}
                      </h4>
                    </div>
                    <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                      {insight.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 상위 트렌드 */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '15px',
              padding: '25px',
              marginBottom: '30px'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '20px' }}>🏆 상위 트렌드</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {reportData.topTrends.map((trend, index) => (
                  <div
                    key={trend.id}
                    style={{
                      background: '#0a0a0a',
                      padding: '20px',
                      borderRadius: '10px',
                      border: '1px solid #333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '20px'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: index < 3 ? '#00ff88' : '#666',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: index < 3 ? '#000' : '#fff',
                      fontWeight: 'bold',
                      fontSize: '18px'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '8px' }}>
                        {trend.title}
                      </h4>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#888' }}>
                        <span>{trend.category}</span>
                        <span>신뢰도: {((trend.confidence || 0.8) * 100).toFixed(1)}%</span>
                        <span>{trend.source}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 추천 액션 */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '15px',
              padding: '25px'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '20px' }}>💡 추천 액션</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {reportData.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    style={{
                      background: '#0a0a0a',
                      padding: '20px',
                      borderRadius: '10px',
                      border: `1px solid ${rec.priority === 'high' ? '#ff3366' : rec.priority === 'medium' ? '#ff6b35' : '#0088ff'}`
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <span style={{
                        background: rec.priority === 'high' ? '#ff3366' : rec.priority === 'medium' ? '#ff6b35' : '#0088ff',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        marginRight: '10px'
                      }}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <h4 style={{ color: '#fff', fontSize: '16px', margin: 0 }}>
                        {rec.action}
                      </h4>
                    </div>
                    <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AIInsightReport;