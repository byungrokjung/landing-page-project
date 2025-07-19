import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./FlowBenchmark.css";

const FlowBenchmark = () => {
  const navigate = useNavigate();
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const galleryVideos = [
    {
      id: 1,
      title: "Cinematic Portrait",
      description: "AI-generated cinematic character study",
      thumbnail: "https://via.placeholder.com/300x200/2c5364/ffffff?text=Cinematic+Portrait",
      duration: "0:45"
    },
    {
      id: 2,
      title: "Urban Landscape",
      description: "Dynamic city scenes with AI flow effects",
      thumbnail: "https://via.placeholder.com/300x200/0f2027/ffffff?text=Urban+Landscape",
      duration: "1:12"
    },
    {
      id: 3,
      title: "Abstract Motion",
      description: "Experimental visual effects showcase",
      thumbnail: "https://via.placeholder.com/300x200/00c6ff/ffffff?text=Abstract+Motion",
      duration: "0:32"
    },
    {
      id: 4,
      title: "Nature Flow",
      description: "Organic movements and transformations",
      thumbnail: "https://via.placeholder.com/300x200/0072ff/ffffff?text=Nature+Flow",
      duration: "1:05"
    }
  ];
  
  const handleStartCreating = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/ai-video-generator');
    }, 1000);
  };
  
  const handlePurchase = (plan) => {
    alert(`${plan} 플랜을 선택하셨습니다. 결제 페이지로 이동합니다.`);
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % galleryVideos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [galleryVideos.length]);
  
  return (
    <div className="flow-root">
      {/* 네비게이션 바 */}
      <nav className="flow-nav">
        <button className="flow-nav-back" onClick={handleBackToHome}>
          ← Back to Home
        </button>
        <div className="flow-nav-logo">Flow AI</div>
      </nav>
      
      {/* 시네마틱 배경 */}
      <div className="flow-hero-bg">
        <div className="flow-hero-particles"></div>
        <div className="flow-hero-overlay">
          <h1 className="flow-title">Flow Effect for Animation</h1>
          <p className="flow-subtitle">Where the next wave of storytelling happens with Veo</p>
          <button 
            className={`flow-cta ${isLoading ? 'loading' : ''}`}
            onClick={handleStartCreating}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Start Creating'}
          </button>
        </div>
      </div>
      {/* 섹션: 소개 */}
      <section className="flow-section flow-about">
        <h2>Overview</h2>
        <p>Flow는 Google의 최신 AI 모델로 창작자들을 위한 시네마틱 영상 제작 툴입니다. 아이디어에서 완성까지, 모든 과정을 혁신적으로 바꿉니다.</p>
      </section>
      {/* 섹션: 갤러리 */}
      <section className="flow-section flow-gallery">
        <h2>Gallery</h2>
        <div className="flow-gallery-container">
          <div className="flow-gallery-main">
            <div className="flow-video-player">
              <img 
                src={galleryVideos[currentVideo].thumbnail} 
                alt={galleryVideos[currentVideo].title}
                className="flow-video-thumbnail"
              />
              <div className="flow-video-overlay">
                <div className="flow-play-button">▶</div>
                <div className="flow-video-info">
                  <h3>{galleryVideos[currentVideo].title}</h3>
                  <p>{galleryVideos[currentVideo].description}</p>
                  <span className="flow-duration">{galleryVideos[currentVideo].duration}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flow-gallery-list">
            {galleryVideos.map((video, index) => (
              <div 
                key={video.id}
                className={`flow-card ${index === currentVideo ? 'active' : ''}`}
                onClick={() => setCurrentVideo(index)}
              >
                <img src={video.thumbnail} alt={video.title} />
                <div className="flow-card-content">
                  <h4>{video.title}</h4>
                  <p>{video.description}</p>
                  <span>{video.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* 섹션: 가격 */}
      <section className="flow-section flow-pricing">
        <h2>Pricing</h2>
        <div className="flow-pricing-list">
          <div className="flow-price-card">
            <div className="flow-price-badge">Most Popular</div>
            <h3>Pro</h3>
            <div className="flow-price">$19.99<span>/월</span></div>
            <ul className="flow-features">
              <li>✓ 월 100개 영상 생성</li>
              <li>✓ HD 품질 (1080p)</li>
              <li>✓ 기본 AI 모델</li>
              <li>✓ 이메일 지원</li>
            </ul>
            <button onClick={() => handlePurchase('Pro')}>구매하기</button>
          </div>
          <div className="flow-price-card premium">
            <div className="flow-price-badge premium">Premium</div>
            <h3>Ultra</h3>
            <div className="flow-price">$124.99<span>/월</span></div>
            <ul className="flow-features">
              <li>✓ 무제한 영상 생성</li>
              <li>✓ 4K 품질</li>
              <li>✓ 고급 AI 모델 (Veo)</li>
              <li>✓ 우선 지원</li>
              <li>✓ 커스텀 브랜딩</li>
            </ul>
            <button onClick={() => handlePurchase('Ultra')}>구매하기</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FlowBenchmark; 