import React, { useEffect, useState } from 'react';

function TopVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🟢 [DEBUG] TopVideos 컴포넌트 마운트');
    console.log('🟡 [DEBUG] Top Videos API 호출 시작');
    
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/content/top-videos`)
      .then(response => {
        console.log('🟡 [DEBUG] Top Videos API 응답:', response);
        if (!response.ok) {
          throw new Error('비디오 데이터를 불러오는데 실패했습니다.');
        }
        return response.json();
      })
      .then(data => {
        console.log('🟢 [DEBUG] Top Videos API 성공:', data);
        console.log('🟢 [DEBUG] 받은 비디오 개수:', data.length);
        setVideos(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('🔴 [DEBUG] Top Videos API 실패:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>상위 성과 비디오를 불러오는 중...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>오류 발생: {error}</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            color: '#2d5016',
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 10px 0',
            textShadow: '0 2px 4px rgba(255,255,255,0.8)'
          }}>
            🌿 상위 성과 비디오
          </h1>
          <p style={{
            color: '#3e7b27',
            fontSize: '1.1rem',
            margin: '0',
            fontWeight: '500'
          }}>
            조회수와 참여율이 높은 인기 비디오들을 확인해보세요
          </p>
        </div>

        {/* 카드 그리드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {videos.map((video, index) => (
            <div key={video.video_id} style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-8px)';
              e.target.style.boxShadow = '0 16px 48px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
            }}>
              {/* 순위 배지 */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: index < 3 ? '#388e3c' : '#66bb6a',
                color: 'white',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}>
                #{index + 1}
              </div>

              {/* 제목 */}
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '1.2rem',
                fontWeight: '600',
                color: '#2c3e50',
                lineHeight: '1.4',
                paddingRight: '50px'
              }}>
                <a 
                  href={`https://youtube.com/watch?v=${video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#2c3e50',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#3498db';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#2c3e50';
                  }}
                >
                  {video.title}
                </a>
              </h3>

              {/* 채널명 */}
              <div style={{
                backgroundColor: '#e8f5e8',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#2e7d32',
                fontWeight: '500'
              }}>
                📺 {video.channel_name}
              </div>

              {/* 통계 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: '#f1f8e9',
                  borderRadius: '12px',
                  border: '1px solid #c8e6c9'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2e7d32' }}>
                    {video.views.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4e342e', marginTop: '4px' }}>
                    조회수
                  </div>
                </div>
                <div style={{
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: '#e8f5e8',
                  borderRadius: '12px',
                  border: '1px solid #a5d6a7'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#388e3c' }}>
                    {video.likes.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4e342e', marginTop: '4px' }}>
                    좋아요
                  </div>
                </div>
              </div>

              {/* 참여율과 길이 */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <div style={{
                  backgroundColor: '#dcedc8',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: '#1b5e20',
                  fontWeight: '600',
                  border: '1px solid #aed581'
                }}>
                  📊 {video.engagement_rate.toFixed(1)}%
                </div>
                <div style={{
                  backgroundColor: '#f9fbe7',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: '#33691e',
                  fontWeight: '600',
                  border: '1px solid #c5e1a5'
                }}>
                  ⏰ {video.duration_minutes}분
                </div>
              </div>

              {/* 업로드 날짜 */}
              <div style={{
                fontSize: '13px',
                color: '#4e342e',
                marginBottom: '12px',
                fontWeight: '500'
              }}>
                📅 {new Date(video.upload_date).toLocaleDateString('ko-KR')}
              </div>

              {/* 키워드 */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px'
              }}>
                {video.keywords.slice(0, 4).map((keyword, keyIndex) => (
                  <span
                    key={keyIndex}
                    style={{
                      backgroundColor: '#e8f5e8',
                      color: '#1b5e20',
                      padding: '4px 8px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: '1px solid #a5d6a7'
                    }}
                  >
                    #{keyword}
                  </span>
                ))}
                {video.keywords.length > 4 && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#4e342e',
                    padding: '4px 8px'
                  }}>
                    +{video.keywords.length - 4}개
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* 뒤로 가기 버튼 */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '16px 32px',
              backgroundColor: 'white',
              color: '#2e7d32',
              border: '2px solid white',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#2e7d32';
              e.target.style.color = 'white';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#2e7d32';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ← 홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

// 이전 테이블 스타일은 더 이상 사용하지 않음

export default TopVideos;