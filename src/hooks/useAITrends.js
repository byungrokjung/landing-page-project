import { useState, useCallback } from 'react';

export const useAITrends = () => {
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const webhookUrl = "https://ac2826c38022.ngrok-free.app/webhook-test/1382176b-a335-4a4b-8ad2-6bb615680246";

  // 1단계: 수집 작업 시작
  const startCollection = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'collect_ai_trends',
          timestamp: new Date().toISOString(),
          user_id: 'web_user'
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.job_id) {
          // 비동기 처리 - job_id 받음
          setJobId(data.job_id);
          pollJobStatus(data.job_id);
        } else {
          // 기존 동기 처리 - 바로 결과 받음
          setTrendsData(data);
          setLoading(false);
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Collection failed:', error);
      setError(error.message);
      
      // 폴백: 데모 데이터
      setTrendsData({
        demo: true,
        message: 'Demo mode activated',
        trends: [
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
          }
        ]
      });
      setLoading(false);
    }
  }, []);

  // 2단계: 작업 상태 폴링
  const pollJobStatus = useCallback(async (jobId) => {
    const maxAttempts = 60; // 5분간 폴링 (5초 * 60)
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        setProgress((attempts / maxAttempts) * 100);

        // 상태 확인 API 호출 (n8n 또는 백엔드)
        const statusResponse = await fetch(`${webhookUrl}/status/${jobId}`);
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          
          if (statusData.status === 'completed') {
            // 완료 - 결과 데이터 가져오기
            setTrendsData(statusData.data);
            setLoading(false);
            setJobId(null);
            return;
          } else if (statusData.status === 'failed') {
            // 실패
            throw new Error(statusData.error || 'Job failed');
          }
          // 아직 처리 중 - 계속 폴링
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // 5초 후 재시도
        } else {
          throw new Error('Timeout: Job took too long');
        }
      } catch (error) {
        console.error('❌ Polling failed:', error);
        setError(error.message);
        setLoading(false);
        setJobId(null);
      }
    };

    poll();
  }, []);

  // 3단계: 수동으로 결과 가져오기
  const fetchResults = useCallback(async (jobId) => {
    try {
      const response = await fetch(`${webhookUrl}/results/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setTrendsData(data);
      }
    } catch (error) {
      console.error('❌ Fetch results failed:', error);
      setError(error.message);
    }
  }, []);

  return {
    loading,
    jobId,
    trendsData,
    error,
    progress,
    startCollection,
    fetchResults
  };
};