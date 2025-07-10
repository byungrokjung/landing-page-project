import React, { useEffect, useState } from 'react';

function TopVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🟢 [DEBUG] TopVideos 컴포넌트 마운트');
    console.log('🟡 [DEBUG] Top Videos API 호출 시작');
    
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/content/top-videos`)
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>상위 성과 비디오</h1>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: 'white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={tableHeaderStyle}>순위</th>
              <th style={tableHeaderStyle}>제목</th>
              <th style={tableHeaderStyle}>채널</th>
              <th style={tableHeaderStyle}>조회수</th>
              <th style={tableHeaderStyle}>좋아요</th>
              <th style={tableHeaderStyle}>참여율</th>
              <th style={tableHeaderStyle}>길이</th>
              <th style={tableHeaderStyle}>업로드 날짜</th>
              <th style={tableHeaderStyle}>키워드</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video, index) => (
              <tr key={video.video_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tableCellStyle}>{index + 1}</td>
                <td style={{...tableCellStyle, maxWidth: '300px'}}>
                  <a 
                    href={`https://youtube.com/watch?v=${video.video_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#1a73e8',
                      textDecoration: 'none',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                    title={video.title}
                  >
                    {video.title}
                  </a>
                </td>
                <td style={tableCellStyle}>{video.channel_name}</td>
                <td style={tableCellStyle}>{video.views.toLocaleString()}</td>
                <td style={tableCellStyle}>{video.likes.toLocaleString()}</td>
                <td style={tableCellStyle}>{video.engagement_rate.toFixed(1)}%</td>
                <td style={tableCellStyle}>{video.duration_minutes}분</td>
                <td style={tableCellStyle}>{new Date(video.upload_date).toLocaleDateString('ko-KR')}</td>
                <td style={{...tableCellStyle, maxWidth: '200px'}}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    maxHeight: '60px',
                    overflow: 'hidden'
                  }}>
                    {video.keywords.slice(0, 3).map((keyword, keyIndex) => (
                      <span
                        key={keyIndex}
                        style={{
                          backgroundColor: '#e3f2fd',
                          color: '#1565c0',
                          padding: '2px 6px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                    {video.keywords.length > 3 && (
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        +{video.keywords.length - 3}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          뒤로 가기
        </button>
      </div>
    </div>
  );
}

const tableHeaderStyle = {
  padding: '12px 8px',
  textAlign: 'left',
  fontWeight: 'bold',
  borderBottom: '2px solid #dee2e6'
};

const tableCellStyle = {
  padding: '12px 8px',
  textAlign: 'left',
  verticalAlign: 'top'
};

export default TopVideos;