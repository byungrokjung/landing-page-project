import React, { useState } from 'react';

function CreativeStudio() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // 실제 AI 동영상 데이터
  const advertisements = [
    {
      id: 1,
      title: "AI 생성 동영상 #1",
      description: "미드저니로 생성된 AI 동영상",
      duration: "30초",
      category: "AI Art",
      thumbnail: "/api/placeholder/400/225", // 임시 썸네일
      videoUrl: "/videos/byungrok_hi_httpss.mj.runEXGyC03pCkA_Fixed_lens_slowly_pushes_f0264b94-643d-4087-abec-15b2e27829d6_0.mp4" // 실제 동영상 경로
    },
    {
      id: 2,
      title: "AI 생성 동영상 #2", 
      description: "혁신적인 AI 기술로 제작된 영상",
      duration: "45초",
      category: "Creative",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "/videos/byungrok_hi_httpss.mj.runEXGyC03pCkA_Fixed_lens_slowly_pushes_f0264b94-643d-4087-abec-15b2e27829d6_0.mp4"
    },
    {
      id: 3,
      title: "AI 생성 동영상 #3",
      description: "창의적인 AI 비주얼 아트",
      duration: "60초", 
      category: "Visual",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "/videos/byungrok_hi_httpss.mj.runEXGyC03pCkA_Fixed_lens_slowly_pushes_f0264b94-643d-4087-abec-15b2e27829d6_0.mp4"
    },
    {
      id: 4,
      title: "AI 생성 동영상 #4",
      description: "미래적인 AI 콘텐츠",
      duration: "40초",
      category: "Future",
      thumbnail: "/api/placeholder/400/225",
      videoUrl: "/videos/byungrok_hi_httpss.mj.runEXGyC03pCkA_Fixed_lens_slowly_pushes_f0264b94-643d-4087-abec-15b2e27829d6_0.mp4"
    }
  ];

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      padding: '0'
    }}>
      {/* 히어로 섹션 */}
      <section style={{
        textAlign: 'center',
        padding: '80px 20px 60px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px'
        }}>
          <button
            onClick={() => window.history.back()}
            style={{
              padding: '12px 24px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ← 뒤로 가기
          </button>
        </div>

        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          margin: '0 0 20px 0',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradient 3s ease infinite'
        }}>
          🎬 AI Creative Studio
        </h1>
        
        <p style={{
          fontSize: '1.3rem',
          opacity: '0.9',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          인공지능으로 제작된 창의적인 광고 컬렉션을 만나보세요
        </p>
      </section>

      {/* 광고 섹션 */}
      <section style={{
        padding: '0 40px 80px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          textAlign: 'center',
          margin: '0 0 50px 0',
          color: '#4ecdc4'
        }}>
          📺 AI 광고 컬렉션
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '30px'
        }}>
          {advertisements.map((ad) => (
            <div
              key={ad.id}
              onClick={() => openVideoModal(ad)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '20px',
                padding: '0',
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
                e.currentTarget.style.border = '1px solid rgba(78, 205, 196, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
              }}
            >
              {/* 썸네일 영역 */}
              <div style={{
                width: '100%',
                height: '200px',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {/* 플레이 버튼 */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: '#333',
                  transition: 'all 0.3s ease'
                }}>
                  ▶️
                </div>
                
                {/* 카테고리 배지 */}
                <div style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: '#ff6b6b',
                  padding: '5px 12px',
                  borderRadius: '15px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {ad.category}
                </div>

                {/* 재생시간 */}
                <div style={{
                  position: 'absolute',
                  bottom: '15px',
                  right: '15px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  padding: '4px 8px',
                  borderRadius: '10px',
                  fontSize: '12px'
                }}>
                  {ad.duration}
                </div>
              </div>

              {/* 콘텐츠 영역 */}
              <div style={{
                padding: '25px'
              }}>
                <h3 style={{
                  fontSize: '1.4rem',
                  fontWeight: '600',
                  margin: '0 0 10px 0',
                  color: 'white'
                }}>
                  {ad.title}
                </h3>
                
                <p style={{
                  fontSize: '0.95rem',
                  opacity: '0.8',
                  margin: '0 0 20px 0',
                  lineHeight: '1.5'
                }}>
                  {ad.description}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{
                    fontSize: '0.9rem',
                    color: '#4ecdc4',
                    fontWeight: '500'
                  }}>
                    AI 생성 광고
                  </span>
                  
                  <div style={{
                    fontSize: '0.9rem',
                    color: '#45b7d1'
                  }}>
                    클릭하여 재생 →
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 동영상 모달 */}
      {selectedVideo && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1000',
            backdropFilter: 'blur(5px)'
          }}
          onClick={closeVideoModal}
        >
          <div
            style={{
              maxWidth: '80%',
              maxHeight: '80%',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideoModal}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                backgroundColor: 'transparent',
                color: 'white',
                border: 'none',
                fontSize: '30px',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
            
            {/* 실제 동영상 플레이어 */}
            <video 
              width="800" 
              height="450" 
              controls 
              autoPlay
              style={{ borderRadius: '10px' }}
            >
              <source src={selectedVideo.videoUrl} type="video/mp4" />
              동영상을 지원하지 않는 브라우저입니다.
            </video>
          </div>
        </div>
      )}

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

export default CreativeStudio;