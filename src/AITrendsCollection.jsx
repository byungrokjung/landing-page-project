import React, { useState, useEffect } from 'react';

const AITrendsCollection = () => {
  const [loading, setLoading] = useState(false);
  const [trendsData, setTrendsData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [dataSource, setDataSource] = useState('stored'); // 'realtime' or 'stored'
  const [timeRange, setTimeRange] = useState('all'); // 'all', '7days', '30days'
  const [selectedTrend, setSelectedTrend] = useState(null); // 상세보기용
  const [translatedTrends, setTranslatedTrends] = useState({}); // 번역된 트렌드 캐시
  const [translating, setTranslating] = useState(false); // 번역 중 상태
  const [showTranslated, setShowTranslated] = useState(false); // 번역된 목록 표시 여부
  const [batchTranslating, setBatchTranslating] = useState(false); // 일괄 번역 중 상태

  // N8N 웹훅 URL
  const webhookUrl = "https://ac2826c38022.ngrok-free.app/webhook-test/33393ebe-6cdf-48b5-951b-87483e423ef2";

  // 폴링 정리
  const clearPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // 컴포넌트 언마운트 시 폴링 정리
  useEffect(() => {
    return () => {
      clearPolling();
    };
  }, [pollingInterval]);

  // 작업 상태 폴링 
  const pollJobStatus = async (jobId) => {
    const apiUrl = 'https://ac2826c38022.ngrok-free.app'; // N8N 서버 사용
    
    const interval = setInterval(async () => {
      try {
        console.log(`🔍 Polling job status: ${jobId}`);
        
        const response = await fetch(`${apiUrl}/api/ai-trends/job/${jobId}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          setProgress(data.progress || 0);
          
          if (data.status === 'completed') {
            console.log('✅ Job completed:', data);
            setTrendsData(data.data);
            setLoading(false);
            setJobId(null);
            setProgress(100);
            clearInterval(interval);
            setPollingInterval(null);
          } else if (data.status === 'failed') {
            console.error('❌ Job failed:', data.error);
            setError(data.error || 'Job failed');
            setLoading(false);
            setJobId(null);
            clearInterval(interval);
            setPollingInterval(null);
            
            // 실패 시 데모 데이터 표시
            setTrendsData({
              message: 'Demo mode: Job failed, showing sample data',
              demo: true,
              trends: getDemoTrends()
            });
          }
          // processing 상태면 계속 폴링
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
        setError(`Polling failed: ${error.message}`);
        setLoading(false);
        setJobId(null);
        clearInterval(interval);
        setPollingInterval(null);
        
        // 에러 시 데모 데이터 표시
        setTrendsData({
          message: 'Demo mode: Polling failed, showing sample data',
          demo: true,
          trends: getDemoTrends()
        });
      }
    }, 5000); // 5초마다 폴링
    
    setPollingInterval(interval);
  };

  // 데모 트렌드 데이터
  const getDemoTrends = () => [
    {
      id: 1,
      title: 'GPT-4 Turbo Performance Improvements',
      category: 'Language Models',
      confidence: 0.95,
      source: 'OpenAI Blog',
      date: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Computer Vision Breakthroughs in 2024',
      category: 'Computer Vision',
      confidence: 0.88,
      source: 'arXiv',
      date: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Edge AI Deployment Strategies',
      category: 'Edge Computing',
      confidence: 0.82,
      source: 'TechCrunch',
      date: new Date().toISOString()
    },
    {
      id: 4,
      title: 'Multimodal AI Systems Revolution',
      category: 'Machine Learning',
      confidence: 0.91,
      source: 'Nature AI',
      date: new Date().toISOString()
    }
  ];

  const collectAITrends = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    setProgress(0);
    clearPolling();
    
    try {
      console.log('🔄 Starting AI trends collection...');
      
      // 직접 n8n 웹훅 호출
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',  // ngrok 브라우저 경고 스킵
        },
        body: JSON.stringify({
          action: 'collect_ai_trends',
          timestamp: new Date().toISOString(),
          user_id: 'web_user',
          source: 'ai-trends-page'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📨 Webhook response:', data);
        
        if (data.job_id) {
          // 비동기 처리 - job_id를 받았으므로 폴링 시작
          console.log('🚀 Starting polling for job:', data.job_id);
          setJobId(data.job_id);
          pollJobStatus(data.job_id);
        } else if (data.message === "Workflow was started") {
          // N8N 워크플로우가 시작됨 - 임시 job_id 생성해서 폴링 시작
          const tempJobId = `job_${Date.now()}`;
          console.log('🚀 N8N workflow started, creating temp job ID:', tempJobId);
          setJobId(tempJobId);
          
          // 임시로 진행률 시뮬레이션
          setTimeout(() => {
            setTrendsData({
              message: 'N8N workflow completed successfully',
              demo: false,
              trends: getDemoTrends() // 실제로는 N8N에서 받아온 데이터
            });
            setLoading(false);
            setJobId(null);
            setProgress(100);
          }, 3000);
        } else {
          // 기존 동기 처리 - 바로 결과를 받음
          console.log('✅ Immediate result received');
          setTrendsData(data);
          setLoading(false);
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ AI trends collection failed:', error);
      setError(error.message);
      setLoading(false);
      
      // 데모 데이터로 폴백
      setTrendsData({
        message: 'Demo mode: Collection failed, showing sample data',
        demo: true,
        trends: getDemoTrends()
      });
    }
  };

  // Supabase에서 저장된 데이터 가져오기 (전체 데이터)
  const fetchStoredTrends = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📚 Fetching all stored trends from Supabase...');
      
      // 임시로 5001 포트 사용 (테스트 서버)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      // 전체 데이터 가져오기 (페이징 제거)
      let endpoint = `/api/ai-trends/trends/all?limit=1000`;
      if (timeRange === '7days') {
        endpoint = `/api/ai-trends/trends/recent?days=7`;
      } else if (timeRange === '30days') {
        endpoint = `/api/ai-trends/trends/recent?days=30`;
      }
      
      const response = await fetch(`${apiUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ All stored trends retrieved:', data);
        
        // 응답 형식에 따라 다르게 처리
        if (timeRange !== 'all' && data.data.trendsByCategory) {
          // recent 엔드포인트의 경우 카테고리별로 그룹화된 데이터를 평탄화
          const allTrends = [];
          Object.values(data.data.trendsByCategory).forEach(categoryTrends => {
            allTrends.push(...categoryTrends);
          });
          
          setTrendsData({
            message: `최근 ${timeRange === '7days' ? '7일' : '30일'}간 수집된 트렌드 (총 ${allTrends.length}개)`,
            demo: false,
            trends: allTrends,
            totalCount: data.data.totalTrends || allTrends.length,
            source: 'supabase',
            period: data.data.period
          });
        } else {
          // all 엔드포인트의 경우 (전체 데이터)
          setTrendsData({
            message: `Supabase에 저장된 전체 트렌드 데이터 (총 ${data.data.trends.length}개)`,
            demo: false,
            trends: data.data.trends,
            totalCount: data.data.trends.length,
            source: 'supabase'
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to fetch stored trends:', error);
      
      // 더 명확한 에러 메시지
      let errorMessage = error.message;
      if (error.message.includes('fetch')) {
        errorMessage = '백엔드 서버가 실행되지 않았습니다. backend 폴더에서 "npm run dev"를 실행해주세요.';
      }
      
      setError(errorMessage);
      
      // 폴백: 데모 데이터
      setTrendsData({
        message: '백엔드 연결 실패 - 샘플 데이터 표시',
        demo: true,
        trends: getDemoTrends()
      });
    } finally {
      setLoading(false);
    }
  };

  // 번역 함수 (OpenAI API 사용)
  const translateText = async (text, targetLang = 'ko') => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('🌐 번역 API 호출:', apiUrl + '/api/translate');
      console.log('📝 번역할 텍스트:', text.substring(0, 100) + '...');
      
      const response = await fetch(`${apiUrl}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          targetLang: targetLang
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 번역 성공:', data.translatedText.substring(0, 100) + '...');
        return data.translatedText;
      } else {
        const errorData = await response.text();
        console.error('❌ 번역 API 에러:', response.status, errorData);
        throw new Error(`번역 실패: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('❌ 번역 오류:', error);
      alert(`번역 실패: ${error.message}`);
      return text; // 번역 실패 시 원문 반환
    }
  };

  // 트렌드 번역 함수
  const translateTrend = async (trend, skipLoading = false) => {
    console.log('🔄 번역 시작:', trend.id, trend.title);
    
    if (translatedTrends[trend.id]) {
      console.log('📋 캐시에서 번역 결과 반환');
      return translatedTrends[trend.id];
    }

    if (!skipLoading) setTranslating(true);
    try {
      console.log('🌐 제목 번역 중...');
      const translatedTitle = await translateText(trend.title);
      
      let translatedContent = '';
      if (trend.content && trend.content.trim() !== trend.title.trim()) {
        console.log('📄 내용 번역 중...');
        translatedContent = await translateText(trend.content);
      }
      
      const translatedTrend = {
        ...trend,
        title: translatedTitle,
        content: translatedContent,
        originalTitle: trend.title,
        originalContent: trend.content
      };

      console.log('✅ 번역 완료, 캐시에 저장');
      // 캐시에 저장
      setTranslatedTrends(prev => ({
        ...prev,
        [trend.id]: translatedTrend
      }));

      return translatedTrend;
    } catch (error) {
      console.error('❌ 트렌드 번역 실패:', error);
      if (!skipLoading) {
        alert(`번역 실패: ${error.message}`);
      }
      return trend;
    } finally {
      if (!skipLoading) setTranslating(false);
    }
  };

  // 전체 트렌드 일괄 번역 함수
  const translateAllTrends = async () => {
    if (!trendsData?.trends || trendsData.trends.length === 0) {
      alert('번역할 트렌드가 없습니다.');
      return;
    }

    setBatchTranslating(true);
    console.log(`🌍 전체 트렌드 번역 시작: ${trendsData.trends.length}개`);
    
    try {
      // 아직 번역되지 않은 트렌드들만 필터링
      const untranslatedTrends = trendsData.trends.filter(trend => !translatedTrends[trend.id]);
      
      if (untranslatedTrends.length === 0) {
        console.log('📋 모든 트렌드가 이미 번역되어 있음');
        setShowTranslated(true);
        return;
      }

      console.log(`📝 번역 대상: ${untranslatedTrends.length}개`);
      
      // 순차적으로 번역 (너무 많은 동시 요청 방지)
      for (let i = 0; i < untranslatedTrends.length; i++) {
        const trend = untranslatedTrends[i];
        console.log(`🔄 번역 진행: ${i + 1}/${untranslatedTrends.length} - ${trend.title.substring(0, 50)}...`);
        
        try {
          await translateTrend(trend, true); // skipLoading = true
          // 각 번역 사이에 잠시 대기 (API 레이트 리밋 방지)
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`❌ ${trend.id} 번역 실패:`, error);
          // 개별 실패는 무시하고 계속 진행
        }
      }

      console.log('✅ 전체 번역 완료');
      setShowTranslated(true);
      
    } catch (error) {
      console.error('❌ 일괄 번역 실패:', error);
      alert(`일괄 번역 실패: ${error.message}`);
    } finally {
      setBatchTranslating(false);
    }
  };

  // 페이지 로드 시 자동 실행 - 바로 실제 데이터 로드
  useEffect(() => {
    // 바로 저장된 데이터를 보여줌
    fetchStoredTrends();
  }, []);
  
  // timeRange 변경 시 자동으로 데이터 다시 가져오기
  useEffect(() => {
    if (dataSource === 'stored') {
      fetchStoredTrends();
    }
  }, [timeRange]);

  // 데이터 로드 후 자동으로 번역 시작 (선택사항)
  useEffect(() => {
    if (trendsData?.trends && trendsData.trends.length > 0 && !batchTranslating) {
      // 페이지 로드 시 자동 번역을 원하면 아래 주석을 해제하세요
      // translateAllTrends();
    }
  }, [trendsData]);

  const categories = ['all', 'Language Models', 'Computer Vision', 'Edge Computing', 'Machine Learning', 'Robotics'];
  
  // 필터링된 트렌드 목록 (번역 상태 고려)
  const filteredTrends = trendsData?.trends ? 
    selectedCategory === 'all' 
      ? trendsData.trends 
      : trendsData.trends.filter(trend => trend.category === selectedCategory)
    : [];

  // 표시할 트렌드 목록 (번역된 버전 사용 여부 결정)
  const displayTrends = filteredTrends.map(trend => {
    if (showTranslated && translatedTrends[trend.id]) {
      return translatedTrends[trend.id];
    }
    return trend;
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      padding: '20px'
    }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '28px', marginBottom: '10px' }}>AI 트렌드 컬렉션</h1>
        <a href="/" style={{ color: '#00ff88', textDecoration: 'none', fontSize: '14px' }}>← 홈으로 돌아가기</a>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 데이터 소스 선택 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              setDataSource('stored');
              fetchStoredTrends();
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: dataSource === 'stored' ? '2px solid #00ff88' : '1px solid #333',
              background: dataSource === 'stored' ? '#00ff88' : 'transparent',
              color: dataSource === 'stored' ? '#000' : '#fff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            저장된 데이터
          </button>
          <button
            onClick={() => setDataSource('realtime')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: dataSource === 'realtime' ? '2px solid #00ff88' : '1px solid #333',
              background: dataSource === 'realtime' ? '#00ff88' : 'transparent',
              color: dataSource === 'realtime' ? '#000' : '#fff',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            실시간 수집
          </button>
        </div>

        {/* 시간 범위 선택 */}
        {dataSource === 'stored' && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
            <button
              onClick={() => setTimeRange('all')}
              style={{
                padding: '6px 12px',
                borderRadius: '15px',
                border: timeRange === 'all' ? '2px solid #00ff88' : '1px solid #333',
                background: timeRange === 'all' ? '#00ff88' : 'transparent',
                color: timeRange === 'all' ? '#000' : '#fff',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              전체
            </button>
            <button
              onClick={() => setTimeRange('7days')}
              style={{
                padding: '6px 12px',
                borderRadius: '15px',
                border: timeRange === '7days' ? '2px solid #00ff88' : '1px solid #333',
                background: timeRange === '7days' ? '#00ff88' : 'transparent',
                color: timeRange === '7days' ? '#000' : '#fff',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              최근 7일
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              style={{
                padding: '6px 12px',
                borderRadius: '15px',
                border: timeRange === '30days' ? '2px solid #00ff88' : '1px solid #333',
                background: timeRange === '30days' ? '#00ff88' : 'transparent',
                color: timeRange === '30days' ? '#000' : '#fff',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              최근 30일
            </button>
          </div>
        )}

        {/* 새로고침 버튼 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={dataSource === 'realtime' ? collectAITrends : fetchStoredTrends}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: '25px',
              border: '2px solid #00ff88',
              background: loading ? '#333' : '#00ff88',
              color: loading ? '#fff' : '#000',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '수집 중...' : (dataSource === 'realtime' ? '새로운 데이터 수집' : '데이터 새로고침')}
          </button>
        </div>

        {/* 필터 섹션 */}
        {trendsData && trendsData.trends && (
          <div>
            {/* 카테고리 필터 */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '15px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <span style={{ color: '#fff', marginRight: '10px' }}>카테고리:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: selectedCategory === category ? '2px solid #00ff88' : '1px solid #333',
                    background: selectedCategory === category ? '#00ff88' : 'transparent',
                    color: selectedCategory === category ? '#000' : '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* 번역 제어 섹션 */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '20px',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={translateAllTrends}
                disabled={batchTranslating || filteredTrends.length === 0}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '2px solid #00ff88',
                  background: batchTranslating ? '#333' : showTranslated ? '#00ff88' : 'transparent',
                  color: batchTranslating ? '#666' : showTranslated ? '#000' : '#00ff88',
                  cursor: batchTranslating || filteredTrends.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  opacity: batchTranslating ? 0.6 : 1
                }}
              >
                {batchTranslating ? '번역 중...' : showTranslated ? '한국어 표시 중' : '전체 한국어 번역'}
              </button>

              {/* 번역 표시 토글 */}
              {Object.keys(translatedTrends).length > 0 && (
                <button
                  onClick={() => setShowTranslated(!showTranslated)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '15px',
                    border: '1px solid #666',
                    background: 'transparent',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  {showTranslated ? '원문 보기' : '번역 보기'}
                </button>
              )}

              {/* 번역 상태 표시 */}
              {Object.keys(translatedTrends).length > 0 && (
                <span style={{
                  color: '#888',
                  fontSize: '11px',
                  background: '#2a2a2a',
                  padding: '4px 8px',
                  borderRadius: '10px'
                }}>
                  번역됨: {Object.keys(translatedTrends).length}/{filteredTrends.length}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #333',
              borderTop: '3px solid #00ff88',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p>AI 트렌드 수집 중...</p>
            {jobId && <p style={{ fontSize: '12px', color: '#888' }}>Job ID: {jobId}</p>}
          </div>
        )}

        {/* 오류 상태 */}
        {error && !trendsData && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#fff' }}>
            <p style={{ color: '#ff4444', marginBottom: '20px' }}>❌ 오류: {error}</p>
            <button
              onClick={collectAITrends}
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: '2px solid #ff4444',
                background: 'transparent',
                color: '#ff4444',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 트렌드 목록 */}
        {displayTrends.length > 0 && (
          <div>
            {/* 상태 표시 */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <span style={{
                display: 'inline-block',
                padding: '8px 16px',
                borderRadius: '20px',
                background: trendsData.demo ? '#ff6b35' : '#00ff88',
                color: '#000',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {trendsData.demo 
                  ? '데모 데이터' 
                  : trendsData.source === 'supabase'
                    ? 'Supabase 데이터'
                    : '실시간 데이터'} ({displayTrends.length}개)
                {showTranslated && Object.keys(translatedTrends).length > 0 && (
                  <span style={{ color: '#000', fontSize: '10px', marginLeft: '8px' }}>🌐 한국어</span>
                )}
              </span>
            </div>
            
            {/* 트렌드 카드 그리드 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {displayTrends.map((trend, index) => (
                <div 
                  key={trend.id || index} 
                  onClick={() => setSelectedTrend(trend)}
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '15px',
                    padding: '20px',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2a2a2a';
                    e.currentTarget.style.borderColor = '#00ff88';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#1a1a1a';
                    e.currentTarget.style.borderColor = '#333';
                  }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px'
                  }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{
                        background: '#00ff88',
                        color: '#000',
                        padding: '4px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {trend.category}
                      </span>
                      {/* 번역 상태 표시 */}
                      {showTranslated && translatedTrends[trend.id] && (
                        <span style={{
                          background: '#0088ff',
                          color: '#fff',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '9px',
                          fontWeight: 'bold'
                        }}>
                          🌐 KR
                        </span>
                      )}
                    </div>
                    <span style={{
                      color: '#888',
                      fontSize: '11px'
                    }}>
                      {Math.round((trend.confidence || 0.8) * 100)}%
                    </span>
                  </div>
                  
                  <h3 style={{
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    lineHeight: '1.4'
                  }}>
                    {trend.title}
                  </h3>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: '#888'
                  }}>
                    <span>{trend.source}</span>
                    <span>{new Date(trend.date || Date.now()).toLocaleDateString('ko-KR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 상세보기 모달 */}
      {selectedTrend && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedTrend(null)}
        >
          <div 
            style={{
              background: '#1a1a1a',
              border: '2px solid #00ff88',
              borderRadius: '20px',
              padding: '30px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 버튼 그룹 */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              display: 'flex',
              gap: '10px'
            }}>
              {/* 번역 버튼 */}
              <button
                onClick={async () => {
                  if (translatedTrends[selectedTrend.id]) {
                    // 이미 번역된 경우 원문과 번역 토글
                    const isTranslated = selectedTrend.title !== selectedTrend.originalTitle;
                    if (isTranslated) {
                      // 원문으로 되돌리기
                      setSelectedTrend({
                        ...selectedTrend,
                        title: selectedTrend.originalTitle || selectedTrend.title,
                        content: selectedTrend.originalContent || selectedTrend.content
                      });
                    } else {
                      // 번역본으로 전환
                      setSelectedTrend(translatedTrends[selectedTrend.id]);
                    }
                  } else {
                    // 처음 번역하는 경우
                    const translated = await translateTrend(selectedTrend);
                    setSelectedTrend(translated);
                  }
                }}
                disabled={translating}
                style={{
                  background: translatedTrends[selectedTrend?.id] ? '#00ff88' : 'transparent',
                  border: '1px solid #00ff88',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  color: translatedTrends[selectedTrend?.id] ? '#000' : '#00ff88',
                  cursor: translating ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  opacity: translating ? 0.6 : 1
                }}
              >
                {translating ? '번역중...' : (translatedTrends[selectedTrend?.id] ? '원문/번역' : '한국어 번역')}
              </button>

              {/* 닫기 버튼 */}
              <button
                onClick={() => setSelectedTrend(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid #666',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* 카테고리 */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{
                background: '#00ff88',
                color: '#000',
                padding: '6px 12px',
                borderRadius: '15px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                {selectedTrend.category}
              </span>
            </div>

            {/* 제목 */}
            <h2 style={{
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '20px',
              lineHeight: '1.4'
            }}>
              {selectedTrend.title}
            </h2>

            {/* 메타 정보 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px',
              marginBottom: '25px'
            }}>
              <div style={{
                background: '#0a0a0a',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #333'
              }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>신뢰도</div>
                <div style={{ color: '#00ff88', fontSize: '20px', fontWeight: 'bold' }}>
                  {Math.round((selectedTrend.confidence || 0.8) * 100)}%
                </div>
              </div>
              <div style={{
                background: '#0a0a0a',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #333'
              }}>
                <div style={{ color: '#888', fontSize: '12px', marginBottom: '5px' }}>출처</div>
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold' }}>
                  {selectedTrend.source}
                </div>
              </div>
            </div>

            {/* 날짜 */}
            <div style={{
              color: '#888',
              fontSize: '14px',
              marginBottom: '25px'
            }}>
              수집일: {new Date(selectedTrend.date || Date.now()).toLocaleString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>

            {/* 내용 (있는 경우 - 타이틀과 다른 경우에만 표시) */}
            {selectedTrend.content && 
             selectedTrend.content.trim() !== selectedTrend.title.trim() && 
             !selectedTrend.content.includes(selectedTrend.title) && (
              <div style={{
                background: '#0a0a0a',
                padding: '20px',
                borderRadius: '15px',
                border: '1px solid #333',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#00ff88', fontSize: '16px', marginBottom: '10px' }}>상세 내용</h3>
                <p style={{ color: '#fff', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {selectedTrend.content}
                </p>
              </div>
            )}

            {/* 태그 (있는 경우) */}
            {selectedTrend.tags && selectedTrend.tags.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#00ff88', fontSize: '16px', marginBottom: '10px' }}>태그</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedTrend.tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        background: '#2a2a2a',
                        border: '1px solid #444',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* URL (있는 경우) */}
            {selectedTrend.source_url && (
              <div style={{ marginTop: '25px' }}>
                <a
                  href={selectedTrend.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#00ff88',
                    color: '#000',
                    padding: '10px 20px',
                    borderRadius: '20px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#00cc70';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#00ff88';
                  }}
                >
                  원문 보기 →
                </a>
              </div>
            )}

            {/* 추가 메타데이터 (있는 경우) */}
            {selectedTrend.metadata && Object.keys(selectedTrend.metadata).length > 0 && (
              <div style={{
                marginTop: '20px',
                padding: '15px',
                background: '#0a0a0a',
                borderRadius: '10px',
                border: '1px solid #333'
              }}>
                <h4 style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>추가 정보</h4>
                {selectedTrend.metadata.publishDate && (
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>
                    게시일: {new Date(selectedTrend.metadata.publishDate).toLocaleDateString('ko-KR')}
                  </div>
                )}
                {selectedTrend.metadata.blobType && (
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px' }}>
                    콘텐츠 타입: {selectedTrend.metadata.blobType}
                  </div>
                )}
              </div>
            )}

            {/* 번역 상태 표시 */}
            {translatedTrends[selectedTrend.id] && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: '#2a2a2a',
                borderRadius: '10px',
                border: '1px solid #00ff88',
                fontSize: '12px',
                color: '#00ff88',
                textAlign: 'center'
              }}>
                🌐 한국어 번역 가능 (번역 버튼으로 원문/번역 전환)
              </div>
            )}

            {/* ID 정보 (디버깅용) */}
            <div style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid #333',
              color: '#666',
              fontSize: '11px'
            }}>
              ID: {selectedTrend.id}
              {selectedTrend.originalTitle && (
                <div style={{ marginTop: '5px' }}>
                  번역됨: {selectedTrend.title !== selectedTrend.originalTitle ? '예' : '아니오'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

export default AITrendsCollection;