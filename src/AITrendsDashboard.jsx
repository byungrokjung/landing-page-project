import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AITrendsDashboard = () => {
  const [trendsData, setTrendsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('7days'); // '7days', '30days', 'all'

  // 실제 백엔드 API에서 분석 데이터 가져오기
  const fetchTrendsData = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      console.log(`🔄 Fetching analytics for timeRange: ${timeRange}`);
      
      // 새로운 분석 API 사용
      const response = await fetch(`${apiUrl}/api/ai-trends-analysis/analytics?timeRange=${timeRange}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Analytics data loaded:', result);
        
        if (result.success) {
          setAnalytics(result.data);
          setTrendsData(result.data.topTrends || []);
        } else {
          throw new Error(result.message || 'Analytics API failed');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Analytics fetch failed:', error);
      console.log('🔄 Falling back to demo data...');
      
      // 데모 데이터 폴백
      const demoTrends = generateDemoData();
      setTrendsData(demoTrends);
      generateAnalytics(demoTrends);
    } finally {
      setLoading(false);
    }
  };

  // 데모 데이터 생성
  const generateDemoData = () => [
    {
      id: 1,
      title: 'GPT-4 Turbo Performance Improvements',
      category: 'Language Models',
      confidence: 0.95,
      source: 'OpenAI Blog',
      date: new Date(Date.now() - 86400000 * 1).toISOString() // 1일 전
    },
    {
      id: 2,
      title: 'Computer Vision Breakthroughs in 2024',
      category: 'Computer Vision',
      confidence: 0.88,
      source: 'arXiv',
      date: new Date(Date.now() - 86400000 * 2).toISOString() // 2일 전
    },
    {
      id: 3,
      title: 'Edge AI Deployment Strategies',
      category: 'Edge Computing',
      confidence: 0.82,
      source: 'TechCrunch',
      date: new Date(Date.now() - 86400000 * 3).toISOString() // 3일 전
    },
    {
      id: 4,
      title: 'Multimodal AI Systems Revolution',
      category: 'Machine Learning',
      confidence: 0.91,
      source: 'Nature AI',
      date: new Date(Date.now() - 86400000 * 4).toISOString() // 4일 전
    },
    {
      id: 5,
      title: 'Robotics Process Automation Advances',
      category: 'Robotics',
      confidence: 0.76,
      source: 'IEEE',
      date: new Date(Date.now() - 86400000 * 5).toISOString() // 5일 전
    },
    {
      id: 6,
      title: 'Neural Network Optimization Techniques',
      category: 'Machine Learning',
      confidence: 0.89,
      source: 'arXiv',
      date: new Date(Date.now() - 86400000 * 6).toISOString() // 6일 전
    }
  ];

  // 분석 데이터 생성
  const generateAnalytics = (trends) => {
    if (!trends || trends.length === 0) return;

    // 카테고리별 분포
    const categoryCount = {};
    const confidenceByCategory = {};
    const dailyTrends = {};

    trends.forEach(trend => {
      // 카테고리별 개수
      categoryCount[trend.category] = (categoryCount[trend.category] || 0) + 1;
      
      // 카테고리별 평균 신뢰도
      if (!confidenceByCategory[trend.category]) {
        confidenceByCategory[trend.category] = [];
      }
      confidenceByCategory[trend.category].push(trend.confidence || 0.8);
      
      // 일별 트렌드
      const date = new Date(trend.date).toLocaleDateString('ko-KR');
      dailyTrends[date] = (dailyTrends[date] || 0) + 1;
    });

    // 평균 신뢰도 계산
    const avgConfidenceByCategory = {};
    Object.keys(confidenceByCategory).forEach(category => {
      const confidences = confidenceByCategory[category];
      avgConfidenceByCategory[category] = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    });

    // 전체 통계
    const totalTrends = trends.length;
    const avgConfidence = trends.reduce((sum, trend) => sum + (trend.confidence || 0.8), 0) / totalTrends;
    const categoriesCount = Object.keys(categoryCount).length;
    const topCategory = Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b);

    setAnalytics({
      categoryCount,
      avgConfidenceByCategory,
      dailyTrends,
      totalTrends,
      avgConfidence,
      categoriesCount,
      topCategory
    });
  };

  useEffect(() => {
    fetchTrendsData();
  }, [timeRange]);

  if (loading) {
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
          <p>대시보드 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  // 차트 옵션
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#fff'
        }
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: '#333'
        }
      },
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: '#333'
        }
      }
    }
  };

  // 카테고리별 분포 차트 데이터 (실제 API 데이터 사용)
  const categoryChartData = analytics && analytics.categoryStats ? {
    labels: analytics.categoryStats.map(cat => cat.name),
    datasets: [{
      label: '트렌드 수',
      data: analytics.categoryStats.map(cat => cat.count),
      backgroundColor: [
        '#00ff88',
        '#0088ff',
        '#ff6b35',
        '#ff3366',
        '#9333ea',
        '#06b6d4',
        '#f59e0b',
        '#ef4444'
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  } : null;

  // 신뢰도 차트 데이터 (실제 API 데이터 사용)
  const confidenceChartData = analytics && analytics.categoryStats ? {
    labels: analytics.categoryStats.map(cat => cat.name),
    datasets: [{
      label: '평균 신뢰도 (%)',
      data: analytics.categoryStats.map(cat => cat.avgConfidence),
      backgroundColor: '#00ff88',
      borderColor: '#00cc70',
      borderWidth: 2
    }]
  } : null;

  // 시간별 트렌드 차트 데이터 (실제 API 데이터 사용)
  const timelineChartData = analytics && analytics.dailyTrends ? {
    labels: analytics.dailyTrends.map(day => day.date),
    datasets: [{
      label: '일별 트렌드 수',
      data: analytics.dailyTrends.map(day => day.count),
      borderColor: '#00ff88',
      backgroundColor: 'rgba(0, 255, 136, 0.1)',
      fill: true,
      tension: 0.4
    }]
  } : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      padding: '20px'
    }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '32px', marginBottom: '10px' }}>
          🚀 AI 트렌드 분석 대시보드
        </h1>
        <p style={{ color: '#888', fontSize: '16px', marginBottom: '20px' }}>
          데이터 기반 AI 트렌드 인사이트와 분석
        </p>
        <a href="/" style={{ color: '#00ff88', textDecoration: 'none', fontSize: '14px' }}>
          ← 홈으로 돌아가기
        </a>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* 시간 범위 선택 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
          {['7days', '30days', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: timeRange === range ? '2px solid #00ff88' : '1px solid #333',
                background: timeRange === range ? '#00ff88' : 'transparent',
                color: timeRange === range ? '#000' : '#fff',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              {range === '7days' ? '최근 7일' : range === '30days' ? '최근 30일' : '전체 기간'}
            </button>
          ))}
        </div>

        {/* 주요 지표 카드 */}
        {analytics && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
          }}>
            {/* 총 트렌드 수 */}
            <div style={{
              background: '#1a1a1a',
              border: '2px solid #00ff88',
              borderRadius: '15px',
              padding: '25px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#00ff88', fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>
                {analytics.summary.totalTrends}
              </div>
              <div style={{ color: '#fff', fontSize: '16px' }}>총 트렌드</div>
            </div>

            {/* 평균 신뢰도 */}
            <div style={{
              background: '#1a1a1a',
              border: '2px solid #0088ff',
              borderRadius: '15px',
              padding: '25px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#0088ff', fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>
                {analytics.summary.avgConfidence}%
              </div>
              <div style={{ color: '#fff', fontSize: '16px' }}>평균 신뢰도</div>
            </div>

            {/* 카테고리 수 */}
            <div style={{
              background: '#1a1a1a',
              border: '2px solid #ff6b35',
              borderRadius: '15px',
              padding: '25px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#ff6b35', fontSize: '40px', fontWeight: 'bold', marginBottom: '10px' }}>
                {analytics.summary.categoriesCount}
              </div>
              <div style={{ color: '#fff', fontSize: '16px' }}>카테고리</div>
            </div>

            {/* 최고 카테고리 */}
            <div style={{
              background: '#1a1a1a',
              border: '2px solid #9333ea',
              borderRadius: '15px',
              padding: '25px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#9333ea', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                {analytics.summary.topCategory}
              </div>
              <div style={{ color: '#fff', fontSize: '16px' }}>인기 카테고리</div>
            </div>
          </div>
        )}

        {/* 차트 섹션 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '30px',
          marginBottom: '40px'
        }}>
          
          {/* 카테고리별 분포 (파이 차트) */}
          {categoryChartData && (
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '15px',
              padding: '25px'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
                📊 카테고리별 트렌드 분포
              </h3>
              <Pie 
                data={categoryChartData} 
                options={{
                  ...chartOptions,
                  scales: undefined
                }}
              />
            </div>
          )}

          {/* 카테고리별 신뢰도 (바 차트) */}
          {confidenceChartData && (
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '15px',
              padding: '25px'
            }}>
              <h3 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
                🎯 카테고리별 평균 신뢰도
              </h3>
              <Bar data={confidenceChartData} options={chartOptions} />
            </div>
          )}
        </div>

        {/* 시간별 트렌드 (라인 차트) */}
        {timelineChartData && (
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '40px'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
              📈 시간별 트렌드 변화
            </h3>
            <Line data={timelineChartData} options={chartOptions} />
          </div>
        )}

        {/* 인사이트 섹션 */}
        {analytics && (
          <div style={{
            background: '#1a1a1a',
            border: '2px solid #00ff88',
            borderRadius: '15px',
            padding: '30px'
          }}>
            <h3 style={{ color: '#00ff88', marginBottom: '20px', fontSize: '24px' }}>
              🧠 AI 인사이트 분석
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              <div style={{
                background: '#0a0a0a',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #333'
              }}>
                <h4 style={{ color: '#fff', marginBottom: '10px' }}>📈 트렌드 동향</h4>
                <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>
                  {analytics.topCategory} 분야가 가장 활발하며, 
                  전체 {analytics.totalTrends}개 트렌드 중 {analytics.categoryCount[analytics.topCategory]}개({((analytics.categoryCount[analytics.topCategory] / analytics.totalTrends) * 100).toFixed(1)}%)를 차지합니다.
                </p>
              </div>
              
              <div style={{
                background: '#0a0a0a',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #333'
              }}>
                <h4 style={{ color: '#fff', marginBottom: '10px' }}>🎯 신뢰도 분석</h4>
                <p style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>
                  평균 신뢰도 {(analytics.avgConfidence * 100).toFixed(1)}%로 높은 품질의 트렌드 정보를 제공하고 있습니다.
                  신뢰도가 90% 이상인 트렌드가 전체의 {((trendsData.filter(t => (t.confidence || 0.8) >= 0.9).length / analytics.totalTrends) * 100).toFixed(1)}%입니다.
                </p>
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

export default AITrendsDashboard;