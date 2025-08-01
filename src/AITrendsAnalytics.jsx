import React, { useState, useEffect } from 'react';

const AITrendsAnalytics = ({ trendsData }) => {
  const [analytics, setAnalytics] = useState({
    categoryDistribution: {},
    topTrends: [],
    trendVelocity: [],
    keywordCloud: []
  });

  useEffect(() => {
    if (trendsData?.trends) {
      analyzeData(trendsData.trends);
    }
  }, [trendsData]);

  const analyzeData = (trends) => {
    // 카테고리별 분포 계산
    const categoryDist = trends.reduce((acc, trend) => {
      acc[trend.category] = (acc[trend.category] || 0) + 1;
      return acc;
    }, {});

    // 신뢰도 기반 TOP 10
    const topTrends = [...trends]
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    // 키워드 추출 (태그 기반)
    const keywords = trends.reduce((acc, trend) => {
      if (trend.tags) {
        trend.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {});

    setAnalytics({
      categoryDistribution: categoryDist,
      topTrends,
      keywordCloud: Object.entries(keywords).map(([word, count]) => ({
        text: word,
        value: count
      }))
    });
  };

  return (
    <div style={{
      padding: '40px',
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* 트렌드 요약 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white'
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            {trendsData?.trends?.length || 0}
          </h3>
          <p style={{ opacity: 0.9 }}>총 트렌드 수집</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white'
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            {Object.keys(analytics.categoryDistribution).length}
          </h3>
          <p style={{ opacity: 0.9 }}>카테고리</p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
          padding: '24px',
          borderRadius: '16px',
          color: 'white'
        }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            {analytics.topTrends[0]?.confidence 
              ? `${Math.round(analytics.topTrends[0].confidence * 100)}%` 
              : '0%'}
          </h3>
          <p style={{ opacity: 0.9 }}>최고 신뢰도</p>
        </div>
      </div>

      {/* TOP 트렌드 리스트 */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          🔥 TOP 10 AI 트렌드
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {analytics.topTrends.map((trend, index) => (
            <div key={trend.id} style={{
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '16px 20px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.transform = 'translateX(8px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              <div style={{
                background: index < 3 
                  ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                  : 'rgba(255, 255, 255, 0.2)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: index < 3 ? '#1f2937' : 'white'
              }}>
                {index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {trend.title}
                </h4>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  fontSize: '0.9rem',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  <span>{trend.category}</span>
                  <span>•</span>
                  <span>{Math.round(trend.confidence * 100)}% 신뢰도</span>
                  <span>•</span>
                  <span>{trend.source}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 카테고리 분포 */}
      <div>
        <h3 style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          📊 카테고리별 분포
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
            <div key={category} style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              padding: '12px 20px',
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ color: 'white', fontWeight: '600' }}>{category}</span>
              <span style={{
                background: 'rgba(59, 130, 246, 0.4)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontWeight: '700'
              }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AITrendsAnalytics;