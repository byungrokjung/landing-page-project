import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FlowBenchmark from "./flow/FlowBenchmark";
import GoogleLogin from "./GoogleLogin";
import AIChatbot from "./AIChatbot";
import { SubscriptionProvider } from "./SubscriptionContext";
import { TouchEnhancedButton } from "./TouchEnhancements";

function App() {
  const [serverStatus, setServerStatus] = useState('확인 중...');
  const [popularCases, setPopularCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    console.log('🟢 [DEBUG] App 컴포넌트 useEffect 시작');
    
    // 저장된 사용자 정보 확인 (자동 로그인)
    const savedUserInfo = localStorage.getItem('userInfo');
    const savedToken = localStorage.getItem('token');
    if (savedUserInfo && savedToken) {
      try {
        const userData = JSON.parse(savedUserInfo);
        setUser(userData);
        console.log('🟢 [DEBUG] 저장된 사용자 정보로 자동 로그인:', userData);
      } catch (error) {
        console.error('🔴 [DEBUG] 저장된 사용자 정보 파싱 실패:', error);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
      }
    }
    
    // 백엔드 API 연결 테스트
    console.log('🟡 [DEBUG] Health API 호출 시작');
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/health`)
      .then(response => {
        console.log('🟡 [DEBUG] Health API 응답:', response);
        return response.json();
      })
      .then(data => {
        console.log('🟢 [DEBUG] Health API 성공:', data);
        setServerStatus(data.message);
      })
      .catch(error => {
        console.error('🔴 [DEBUG] Health API 실패:', error);
        setServerStatus('백엔드 연결 실패');
      });

    // 인기 케이스 스터디 데이터 로드
    console.log('🟡 [DEBUG] Popular Cases API 호출 시작');
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/content/popular`)
      .then(response => {
        console.log('🟡 [DEBUG] Popular Cases API 응답:', response);
        return response.json();
      })
      .then(data => {
        console.log('🟢 [DEBUG] Popular Cases API 성공:', data);
        setPopularCases(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('🔴 [DEBUG] Popular Cases API 실패:', error);
        setLoading(false);
      });
  }, []);

  const handleGoogleLoginSuccess = (userData) => {
    console.log('Google 로그인 성공:', userData);
    setUser(userData);
    
    // JWT 토큰 또는 액세스 토큰을 localStorage에 저장
    if (userData.idToken) {
      localStorage.setItem('token', userData.idToken);
    } else if (userData.accessToken) {
      localStorage.setItem('token', userData.accessToken);
    }
    
    // 사용자 정보도 저장 (Dashboard에서 사용)
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const handleGoogleLoginError = (error) => {
    console.error('Google 로그인 실패:', error);
    alert(error);
  };

  const handleLogout = () => {
    setUser(null);
    
    // localStorage에서 토큰과 사용자 정보 제거
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    
    if (window.gapi && window.gapi.auth2) {
      window.gapi.auth2.getAuthInstance().signOut();
    }
  };


  return (
    <SubscriptionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <div className="App">
            <style>
              {`
                @keyframes pulse {
                  0%, 100% { opacity: 1; transform: scale(1); }
                  50% { opacity: 0.7; transform: scale(1.1); }
                }
                
                .fullscreen-video {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100vw;
                  height: 100vh;
                  object-fit: cover;
                  z-index: 0;
                  background: #000;
                  opacity: 1;
                  visibility: visible;
                }
                
                .content-overlay {
                  position: relative;
                  z-index: 10;
                  background: transparent;
                  min-height: 100vh;
                  width: 100%;
                }
                
                /* 모바일 최적화 */
                @media (max-width: 768px) {
                  .fullscreen-video {
                    object-fit: cover;
                    transform: none;
                  }
                  
                  .content-overlay {
                    background: rgba(0, 0, 0, 0.4);
                  }
                }
                
                @media (max-width: 480px) {
                  .fullscreen-video {
                    object-position: center center;
                    min-height: 100vh;
                  }
                }
              `}
            </style>
            
            {/* Hero 섹션까지만 배경 동영상 */}
            <video 
              autoPlay 
              muted 
              loop 
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                objectFit: 'cover',
                zIndex: -1,
                backgroundColor: '#000'
              }}
              onError={(e) => console.error('동영상 로드 오류:', e)}
              onLoadStart={() => console.log('동영상 로드 시작')}
              onCanPlay={() => console.log('동영상 재생 가능')}
              onPlay={() => console.log('동영상 재생 중')}
            >
              <source src="/videos/byungrok_hi_httpss.mj.runPGfg1yubUco_a_cinematic_horizontal_s_1e075117-a7a3-4840-af45-28fed78c500e_1.mp4" type="video/mp4" />
            </video>
            
            {/* 콘텐츠 오버레이 */}
            <div className="content-overlay">
            {/* User Status Section */}
            <div style={{ 
              position: 'fixed', 
              top: '20px', 
              right: '20px', 
              zIndex: 1000
            }}>
              {user ? (
                <div 
                  style={{ 
                    position: 'relative', 
                    display: 'inline-block' 
                  }}
                  onMouseEnter={(e) => {
                    const tooltip = e.currentTarget.querySelector('[data-tooltip]');
                    const profileImg = e.currentTarget.querySelector('img');
                    if (tooltip && profileImg) {
                      // 기존 timeout이 있으면 클리어
                      if (tooltip.hideTimeout) {
                        clearTimeout(tooltip.hideTimeout);
                      }
                      profileImg.style.transform = 'scale(1.05)';
                      tooltip.style.opacity = '1';
                      tooltip.style.visibility = 'visible';
                      tooltip.style.transform = 'translateY(0) scale(1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    const tooltip = e.currentTarget.querySelector('[data-tooltip]');
                    const profileImg = e.currentTarget.querySelector('img');
                    if (tooltip && profileImg) {
                      // 300ms 지연 후 숨김
                      tooltip.hideTimeout = setTimeout(() => {
                        profileImg.style.transform = 'scale(1)';
                        tooltip.style.opacity = '0';
                        tooltip.style.visibility = 'hidden';
                        tooltip.style.transform = 'translateY(-8px) scale(0.95)';
                      }, 300);
                    }
                  }}
                >
                  <img 
                    src={user.imageUrl} 
                    alt="프로필" 
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%',
                      cursor: 'default',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      objectFit: 'cover',
                      border: '2px solid #fff',
                      transition: 'transform 0.2s ease'
                    }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlMGUwZTAiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTEyIDEyQzE0LjIxIDEyIDE2IDEwLjIxIDE2IDhDMTYgNS43OSAxNC4yMSA0IDEyIDRDOS43OSA0IDggNS43OSA4IDhDOCAxMC4yMSA5Ljc5IDEyIDEyIDEyWk0xMiAxNEM5LjMzIDE0IDQgMTUuMzQgNCAyMFYyMkgyMFYyMEMyMCAxNS4zNCAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM5ZTllOWUiLz4KPHN2Zz4KPHN2Zz4=';
                    }}
                  />
                  <div 
                    data-tooltip="true"
                    style={{
                      position: 'absolute',
                      top: '48px',
                      right: '-8px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 250, 250, 0.98))',
                      backdropFilter: 'blur(20px)',
                      padding: '18px 20px',
                      borderRadius: '20px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      opacity: '0',
                      visibility: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      zIndex: 1001,
                      whiteSpace: 'nowrap',
                      minWidth: '260px',
                      transform: 'translateY(-8px) scale(0.95)',
                      transformOrigin: 'top right'
                    }}
                    onMouseEnter={(e) => {
                      // timeout 클리어해서 사라지지 않게 함
                      if (e.currentTarget.hideTimeout) {
                        clearTimeout(e.currentTarget.hideTimeout);
                      }
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.visibility = 'visible';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    }}
                    onMouseLeave={(e) => {
                      const profileImg = e.currentTarget.parentElement.querySelector('img');
                      if (profileImg) {
                        // 300ms 지연 후 숨김
                        e.currentTarget.hideTimeout = setTimeout(() => {
                          profileImg.style.transform = 'scale(1)';
                          e.currentTarget.style.opacity = '0';
                          e.currentTarget.style.visibility = 'hidden';
                          e.currentTarget.style.transform = 'translateY(-8px) scale(0.95)';
                        }, 300);
                      }
                    }}
                  >
                    {/* 화살표 */}
                    <div style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '15px',
                      width: '12px',
                      height: '12px',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 250, 250, 0.98))',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      borderBottom: 'none',
                      borderRight: 'none',
                      transform: 'rotate(45deg)'
                    }}></div>

                    {/* 프로필 헤더 */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '14px',
                      marginBottom: '12px'
                    }}>
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={user.imageUrl} 
                          alt="프로필" 
                          style={{ 
                            width: '48px', 
                            height: '48px', 
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '2px',
                          right: '2px',
                          width: '14px',
                          height: '14px',
                          backgroundColor: '#10b981',
                          borderRadius: '50%',
                          border: '2px solid white',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
                        }}></div>
                      </div>
                      <div>
                        <div style={{ 
                          fontWeight: '700', 
                          fontSize: '16px', 
                          color: '#1f2937',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          marginBottom: '2px'
                        }}>
                          {user.name}
                        </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: '#6b7280',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}>
                          {user.email}
                        </div>
                      </div>
                    </div>

                    {/* 그라데이션 구분선 */}
                    <div style={{
                      height: '1px',
                      background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), rgba(0,0,0,0.12), rgba(0,0,0,0.08), transparent)',
                      margin: '12px 0'
                    }}></div>

                    {/* 상태 표시 */}
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '12px',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#10b981',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                      }}></div>
                      <span style={{ 
                        fontSize: '13px', 
                        color: '#059669',
                        fontWeight: '600',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>
                        온라인
                      </span>
                    </div>

                    {/* 버튼 섹션 */}
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      marginTop: '12px'
                    }}>
                      <button
                        onClick={() => {
                          window.history.pushState({}, '', '/dashboard');
                          window.location.reload();
                        }}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.25)';
                        }}
                      >
                        마이페이지
                      </button>
                      <button
                        onClick={handleLogout}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.25)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.25)';
                        }}
                      >
                        로그아웃
                      </button>
                    </div>

                    {/* 추가 정보 */}
                    <div style={{
                      marginTop: '12px',
                      padding: '8px 0',
                      fontSize: '11px',
                      color: '#9ca3af',
                      textAlign: 'center',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      Google 계정으로 로그인됨
                    </div>
                  </div>
                </div>
              ) : (
                <GoogleLogin 
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                />
              )}
            </div>
            {/* Hero Section */}
            <section className="hero" style={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              padding: '0'
            }}>
              <div className="container">
                <div className="hero-content" style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '32px',
                  padding: '80px 60px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 32px 80px rgba(0, 0, 0, 0.15)',
                  textAlign: 'center',
                  maxWidth: '900px',
                  margin: '0 auto'
                }}>
                  <h1 style={{
                    fontSize: 'clamp(3rem, 6vw, 5rem)',
                    fontWeight: '900',
                    lineHeight: '1.1',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '32px',
                    letterSpacing: '-0.02em'
                  }}>
                    Discover Amazing<br />
                    <span style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      Digital Experience
                    </span>
                  </h1>
                  
                  <p style={{
                    fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                    lineHeight: '1.7',
                    color: '#6b7280',
                    marginBottom: '48px',
                    maxWidth: '600px',
                    margin: '0 auto 48px',
                    fontWeight: '400'
                  }}>
                    Explore cutting-edge technology and creative solutions.<br />
                    Transform your ideas into reality with our powerful tools.
                  </p>

                  {/* 메인 CTA 버튼들 */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '24px', 
                    justifyContent: 'center', 
                    flexWrap: 'wrap',
                    marginBottom: '40px'
                  }}>
                    <a href="/videos" 
                       className="cta-button" 
                       style={{
                         background: 'linear-gradient(135deg, #667eea, #764ba2)',
                         color: 'white',
                         padding: '20px 40px',
                         fontSize: '1.1rem',
                         fontWeight: '700',
                         borderRadius: '60px',
                         textDecoration: 'none',
                         boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3)',
                         border: 'none',
                         transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                         minWidth: '200px',
                         textAlign: 'center',
                         position: 'relative',
                         overflow: 'hidden'
                       }}
                       onMouseEnter={(e) => {
                         e.target.style.transform = 'translateY(-4px) scale(1.02)';
                         e.target.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.4)';
                       }}
                       onMouseLeave={(e) => {
                         e.target.style.transform = 'translateY(0) scale(1)';
                         e.target.style.boxShadow = '0 12px 40px rgba(102, 126, 234, 0.3)';
                       }}
                    >
                      🚀 Get Started Free
                    </a>
                    
                    <a href="/subscription" 
                       className="cta-button" 
                       style={{
                         background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                         color: 'white',
                         padding: '20px 40px',
                         fontSize: '1.1rem',
                         fontWeight: '700',
                         borderRadius: '60px',
                         textDecoration: 'none',
                         boxShadow: '0 12px 40px rgba(240, 147, 251, 0.3)',
                         border: 'none',
                         transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                         minWidth: '200px',
                         textAlign: 'center',
                         position: 'relative',
                         overflow: 'hidden'
                       }}
                       onMouseEnter={(e) => {
                         e.target.style.transform = 'translateY(-4px) scale(1.02)';
                         e.target.style.boxShadow = '0 20px 60px rgba(240, 147, 251, 0.4)';
                       }}
                       onMouseLeave={(e) => {
                         e.target.style.transform = 'translateY(0) scale(1)';
                         e.target.style.boxShadow = '0 12px 40px rgba(240, 147, 251, 0.3)';
                       }}
                    >
                      💎 Go Premium
                    </a>
                  </div>

                  {/* 보조 링크들 */}
                  <div style={{
                    display: 'flex',
                    gap: '24px',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginBottom: '40px'
                  }}>
                    <a href="/creative-studio" style={{
                      color: '#6b7280',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: '600',
                      padding: '12px 24px',
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.color = '#374151';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.target.style.color = '#6b7280';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    }}
                    >
                      🎬 Creative Studio
                    </a>
                    <a href="/ai-video-generator" style={{
                      color: '#6b7280',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: '600',
                      padding: '12px 24px',
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.color = '#374151';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.target.style.color = '#6b7280';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    }}
                    >
                      ⚡ AI Video Generator
                    </a>
                    <a href="/ai-trends" style={{
                      color: '#6b7280',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: '600',
                      padding: '12px 24px',
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.color = '#374151';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.target.style.color = '#6b7280';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    }}
                    >
                      📊 AI Trends
                    </a>
                    <a href="/telegram-notifications" style={{
                      color: '#6b7280',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: '600',
                      padding: '12px 24px',
                      borderRadius: '24px',
                      background: 'rgba(255, 255, 255, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.8)',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                      e.target.style.color = '#374151';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.6)';
                      e.target.style.color = '#6b7280';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                    }}
                    >
                      📱 텔레그램 알림
                    </a>
                  </div>

                  {/* 사용자 수 표시 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    color: '#9ca3af',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    <div style={{
                      display: 'flex',
                      marginRight: '12px'
                    }}>
                      {[...Array(5)].map((_, i) => (
                        <div key={i} style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, hsl(${200 + i * 40}, 70%, 60%), hsl(${220 + i * 40}, 70%, 50%))`,
                          marginLeft: i > 0 ? '-12px' : '0',
                          border: '3px solid rgba(255, 255, 255, 0.8)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          zIndex: 5 - i,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'white'
                        }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                      ))}
                    </div>
                    <span>Join 500+ users already exploring</span>
                  </div>
                </div>
              </div>
            </section>
            {/* Features Section */}
            <section className="features section" style={{
              background: '#000000',
              padding: '120px 0',
              position: 'relative'
            }}>
              <div className="container">
                <h2 style={{
                  fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                  fontWeight: '800',
                  textAlign: 'center',
                  color: '#ffffff',
                  marginBottom: '80px',
                  letterSpacing: '-0.02em'
                }}>
                  Why Choose Our Platform?
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '32px',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 32px 80px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>🚀</div>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      marginBottom: '16px',
                      lineHeight: '1.3'
                    }}>
                      Lightning Fast Performance
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      lineHeight: '1.6',
                      fontSize: '1rem'
                    }}>
                      Experience blazing-fast load times and smooth interactions. 
                      Built with cutting-edge technology for optimal performance.
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 32px 80px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>🎨</div>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      marginBottom: '16px',
                      lineHeight: '1.3'
                    }}>
                      Beautiful Design System
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      lineHeight: '1.6',
                      fontSize: '1rem'
                    }}>
                      Stunning UI components and layouts that make your content shine. 
                      Modern aesthetics meet functional design.
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 32px 80px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>🤖</div>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      marginBottom: '16px',
                      lineHeight: '1.3'
                    }}>
                      AI-Powered Features
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      lineHeight: '1.6',
                      fontSize: '1rem'
                    }}>
                      Harness the power of artificial intelligence to boost your productivity 
                      and create amazing content effortlessly.
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 32px 80px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>🔒</div>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      marginBottom: '16px',
                      lineHeight: '1.3'
                    }}>
                      Enterprise Security
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      lineHeight: '1.6',
                      fontSize: '1rem'
                    }}>
                      Your data is protected with bank-level security. 
                      SSL encryption and secure authentication systems.
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 32px 80px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>📱</div>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      marginBottom: '16px',
                      lineHeight: '1.3'
                    }}>
                      Mobile Optimized
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      lineHeight: '1.6',
                      fontSize: '1rem'
                    }}>
                      Perfect experience across all devices. 
                      Responsive design that works flawlessly on mobile and desktop.
                    </p>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 32px 80px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>💎</div>
                    <h3 style={{
                      fontSize: '1.4rem',
                      fontWeight: '700',
                      color: '#1a1a1a',
                      marginBottom: '16px',
                      lineHeight: '1.3'
                    }}>
                      Premium Experience
                    </h3>
                    <p style={{
                      color: '#6b7280',
                      lineHeight: '1.6',
                      fontSize: '1rem'
                    }}>
                      Try our platform risk-free for 30 days. 
                      No commitments, cancel anytime, premium features included.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            {/* Featured Content Section */}
            <section style={{
              background: '#000000',
              padding: '120px 0',
              position: 'relative'
            }}>
              <div className="container">
                <h2 style={{
                  fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                  fontWeight: '800',
                  textAlign: 'center',
                  color: '#ffffff',
                  marginBottom: '80px',
                  letterSpacing: '-0.02em'
                }}>
                  Latest Featured Content
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '32px',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}>
                  {loading ? (
                    <div style={{
                      textAlign: 'center', 
                      padding: '60px 20px', 
                      gridColumn: '1 / -1',
                      color: '#6b7280',
                      fontSize: '1.1rem'
                    }}>
                      Loading amazing content...
                    </div>
                  ) : (
                    popularCases.map((caseStudy, index) => (
                      <div key={caseStudy.id} style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '32px',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 32px 80px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
                      }}
                      >
                        <div style={{
                          position: 'absolute',
                          top: '20px',
                          right: '20px',
                          background: caseStudy.is_new ? 'linear-gradient(135deg, #10b981, #059669)' : 
                                     caseStudy.views > 2000 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 
                                     'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {caseStudy.is_new ? 'NEW' : 
                           caseStudy.views > 2000 ? 'HOT' : 
                           caseStudy.likes > 100 ? 'Popular' : 'Featured'}
                        </div>
                        
                        <div style={{ marginTop: '20px' }}>
                          <span style={{
                            display: 'inline-block',
                            background: 'rgba(102, 126, 234, 0.1)',
                            color: '#667eea',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            marginBottom: '16px'
                          }}>
                            {caseStudy.category} • ${caseStudy.revenue_amount?.toLocaleString() || '0'}/{caseStudy.revenue_period || 'month'}
                          </span>
                          
                          <h3 style={{
                            fontSize: '1.3rem',
                            fontWeight: '700',
                            color: '#1a1a1a',
                            marginBottom: '12px',
                            lineHeight: '1.4'
                          }}>
                            {caseStudy.title}
                          </h3>
                          
                          <div style={{
                            color: '#6b7280',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}>
                            {caseStudy.founder} • {new Date(caseStudy.published_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section style={{
              background: '#000000',
              padding: '120px 0',
              position: 'relative'
            }}>
              <div className="container">
                <h2 style={{
                  fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                  fontWeight: '800',
                  textAlign: 'center',
                  color: '#ffffff',
                  marginBottom: '80px',
                  letterSpacing: '-0.02em'
                }}>
                  What Our Users Say
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: '32px',
                  maxWidth: '1200px',
                  margin: '0 auto'
                }}>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 28px 70px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      color: '#667eea',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>⭐⭐⭐⭐⭐</div>
                    
                    <blockquote style={{
                      fontSize: '1.1rem',
                      lineHeight: '1.7',
                      color: '#374151',
                      fontStyle: 'italic',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>
                      "This platform completely transformed how I approach digital projects. 
                      The AI features are incredibly intuitive and save me hours of work every day."
                    </blockquote>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1.2rem'
                      }}>
                        A
                      </div>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: '#1a1a1a'
                        }}>Alex Chen</div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#6b7280'
                        }}>Product Designer</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 28px 70px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      color: '#667eea',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>⭐⭐⭐⭐⭐</div>
                    
                    <blockquote style={{
                      fontSize: '1.1rem',
                      lineHeight: '1.7',
                      color: '#374151',
                      fontStyle: 'italic',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>
                      "Amazing user experience and fantastic results. 
                      The creative tools are exactly what I needed for my startup projects."
                    </blockquote>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1.2rem'
                      }}>
                        S
                      </div>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: '#1a1a1a'
                        }}>Sarah Johnson</div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#6b7280'
                        }}>Startup Founder</div>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '40px 32px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 28px 70px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.1)';
                  }}
                  >
                    <div style={{
                      fontSize: '3rem',
                      color: '#667eea',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>⭐⭐⭐⭐⭐</div>
                    
                    <blockquote style={{
                      fontSize: '1.1rem',
                      lineHeight: '1.7',
                      color: '#374151',
                      fontStyle: 'italic',
                      marginBottom: '24px',
                      textAlign: 'center'
                    }}>
                      "The video generation features are incredible! 
                      I've been able to create professional content in minutes instead of hours."
                    </blockquote>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: '600',
                        fontSize: '1.2rem'
                      }}>
                        M
                      </div>
                      <div>
                        <div style={{
                          fontWeight: '600',
                          color: '#1a1a1a'
                        }}>Mike Rodriguez</div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#6b7280'
                        }}>Content Creator</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI 챗봇 플로팅 버튼 */}
            {!isChatbotOpen && (
              <button
                onClick={() => setIsChatbotOpen(true)}
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  right: '20px',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  zIndex: 999
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
                }}
              >
                <svg 
                  width="28" 
                  height="28" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}

            {/* AI 챗봇 컴포넌트 */}
            <AIChatbot 
              isOpen={isChatbotOpen} 
              onClose={() => setIsChatbotOpen(false)} 
            />
            </div> {/* content-overlay 닫기 */}
          </div>
        } />
        <Route path="/flow" element={<FlowBenchmark />} />
      </Routes>
    </BrowserRouter>
    </SubscriptionProvider>
  )
}

export default App