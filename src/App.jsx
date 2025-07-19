import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FlowBenchmark from "./flow/FlowBenchmark";
import GoogleLogin from "./GoogleLogin";
import AIChatbot from "./AIChatbot";

function App() {
  const [serverStatus, setServerStatus] = useState('확인 중...');
  const [popularCases, setPopularCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    console.log('🟢 [DEBUG] App 컴포넌트 useEffect 시작');
    
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
  };

  const handleGoogleLoginError = (error) => {
    console.error('Google 로그인 실패:', error);
    alert(error);
  };

  const handleLogout = () => {
    setUser(null);
    if (window.gapi && window.gapi.auth2) {
      window.gapi.auth2.getAuthInstance().signOut();
    }
  };

  return (
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
              `}
            </style>
            {/* User Status Section */}
            <div style={{ 
              position: 'fixed', 
              top: '20px', 
              right: '20px', 
              zIndex: 1000
            }}>
              {user ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
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
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                      e.target.nextSibling.style.opacity = '1';
                      e.target.nextSibling.style.visibility = 'visible';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.nextSibling.style.opacity = '0';
                      e.target.nextSibling.style.visibility = 'hidden';
                    }}
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNlMGUwZTAiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI4IiB5PSI4Ij4KPHBhdGggZD0iTTEyIDEyQzE0LjIxIDEyIDE2IDEwLjIxIDE2IDhDMTYgNS43OSAxNC4yMSA0IDEyIDRDOS43OSA0IDggNS43OSA4IDhDOCAxMC4yMSA5Ljc5IDEyIDEyIDEyWk0xMiAxNEM5LjMzIDE0IDQgMTUuMzQgNCAyMFYyMkgyMFYyMEMyMCAxNS4zNCAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM5ZTllOWUiLz4KPHN2Zz4KPHN2Zz4=';
                    }}
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      top: '50px',
                      right: '0',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(250, 250, 250, 0.98))',
                      backdropFilter: 'blur(20px)',
                      padding: '18px 20px',
                      borderRadius: '20px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 16px rgba(0, 0, 0, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      opacity: '0',
                      visibility: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      zIndex: 1001,
                      whiteSpace: 'nowrap',
                      minWidth: '260px',
                      transform: 'translateY(-8px) scale(0.95)',
                      transformOrigin: 'top right'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '1';
                      e.target.style.visibility = 'visible';
                      e.target.style.transform = 'translateY(0) scale(1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '0';
                      e.target.style.visibility = 'hidden';
                      e.target.style.transform = 'translateY(-8px) scale(0.95)';
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
            <section className="hero">
              <div className="container">
                <div className="hero-content">
                  <h1>'이미 검증된' 비즈니스성공 사례를 무제한으로</h1>
                  <p>
                    1인 기업가부터 최신 AI 스타트업까지,<br />
                    전 세계 모든 성공 케이스를 확인하고 비즈니스에 적용해보세요.
                  </p>
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a href="/videos" className="cta-button">
                      지금 무료로 시작하기
                    </a>
                    <a href="/creative-studio" className="cta-button" style={{
                      background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
                      boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                      border: 'none'
                    }}>
                      🎬 AI Creative Studio
                    </a>
                    <a href="/ai-video-generator" className="cta-button" style={{
                      background: 'linear-gradient(45deg, #ffa500, #ff6b47)',
                      boxShadow: '0 4px 15px rgba(255, 165, 0, 0.3)',
                      border: 'none'
                    }}>
                      🚀 AI Video Generator
                    </a>
                  </div>
                  <div className="member-count">
                    500명 이상의 멤버들이 함께하고 있습니다!
                  </div>
                  <div style={{marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
                    서버 상태: {serverStatus}
                  </div>
                </div>
              </div>
            </section>
            {/* Features Section */}
            <section className="features section">
              <div className="container">
                <h2 className="section-title">히든 리치스만의 특별한 가치</h2>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h3>이미 시장 검증된, 150+ 가지 이상의 온라인 비즈니스 아이디어</h3>
                    <p>
                      해외에서 실제로 매출을 내고있는 150개 이상의 성공 케이스에 무제한으로 접근하세요. 
                      '잘 될까?'와 같은 추측이 아닌, '이미 잘 팔린 구조'를 벤치마킹하는 것부터 시작해보세요.
                    </p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h3>바닥부터 시작한 사업가들의 '실전 마케팅 전략' 그대로 공개</h3>
                    <p>
                      광고 없이 시작한 사례, SNS로 시작한 사례, 모든 전략과 흐름을 A부터 Z까지 확인할 수 있습니다.
                    </p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🎓</div>
                    <h3>억대 수익을 낸 사업가들의 고급 비즈니스 강의도 함께</h3>
                    <p>
                      케이스 스터디만으로는 막막할 수 있습니다. 그래서 히든 리치스는 Alex Hormozi 등 
                      글로벌 사업가들의 강의를 한글 자막과 함께 시청, 요약 스크립트까지 제공해드립니다.
                    </p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🚀</div>
                    <h3>사업의 '시작'을 만드는 실행 피드백과 트래픽</h3>
                    <p>
                      히든 리치스에서는 같은 방향을 향하는 멤버들에게 론칭 소식을 알리고, 
                      실시간 피드백을 주고받을 수 있는 전용 커뮤니티를 운영합니다.
                    </p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">📅</div>
                    <h3>주 3회, 최신 전략을 실시간으로</h3>
                    <p>
                      매주 월·수·금, 최신 아이템과 성공 전략을 이메일로 바로 받아보세요. 
                      놓쳐도 걱정 마세요. 모든 콘텐츠는 아카이브에서 다시 볼 수 있습니다.
                    </p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">💎</div>
                    <h3>첫 달, 부담 없이 경험해보세요</h3>
                    <p>
                      처음이라 고민되시나요? 히든 리치스는 첫 30일 무료 체험 기간을 제공합니다. 
                      리스크 0%, 먼저 경험해보세요.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            {/* Case Studies Section */}
            <section className="cases section">
              <div className="container">
                <h2 className="section-title">최신 케이스 스터디</h2>
                <div className="cases-grid">
                  {loading ? (
                    <div style={{textAlign: 'center', padding: '20px', gridColumn: '1 / -1'}}>
                      케이스 스터디를 불러오는 중...
                    </div>
                  ) : (
                    popularCases.map((caseStudy, index) => (
                      <div key={caseStudy.id} className="case-card">
                        <div className="case-image">
                          {caseStudy.is_new ? 'NEW' : 
                           caseStudy.views > 2000 ? 'HOT' : 
                           caseStudy.likes > 100 ? '인기' : '추천'}
                        </div>
                        <div className="case-content">
                          <span className="case-tag">
                            {caseStudy.category} · {caseStudy.revenue_period} {caseStudy.revenue_amount.toLocaleString()}원
                          </span>
                          <h3>{caseStudy.title}</h3>
                          <div className="case-meta">
                            {caseStudy.founder} · {new Date(caseStudy.published_at).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
            {/* Testimonials Section */}
            <section className="testimonials section">
              <div className="container">
                <h2 className="section-title">구독자들의 생생한 반응</h2>
                <div className="testimonials-grid">
                  <div className="testimonial-card">
                    <blockquote>
                      "히든 리치스 덕분에 실제로 해외에서 성공한 사업 모델들을 빠르게 파악할 수 있었어요. 
                      특히 마케팅 전략 부분이 정말 도움이 되었습니다."
                    </blockquote>
                    <div className="testimonial-author">- 김○○님</div>
                  </div>
                  <div className="testimonial-card">
                    <blockquote>
                      "온라인 비즈니스 초보였는데, 케이스 스터디를 보면서 어떤 방향으로 가야 할지 
                      명확해졌어요. 실전 예시가 정말 많아서 좋습니다."
                    </blockquote>
                    <div className="testimonial-author">- 박○○님</div>
                  </div>
                  <div className="testimonial-card">
                    <blockquote>
                      "매주 오는 이메일 뉴스레터가 정말 알차요. 최신 트렌드와 성공 사례를 
                      놓치지 않고 받아볼 수 있어서 감사합니다."
                    </blockquote>
                    <div className="testimonial-author">- 이○○님</div>
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
          </div>
        } />
        <Route path="/flow" element={<FlowBenchmark />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App