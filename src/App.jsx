import React, { useEffect, useState } from 'react'

function App() {
  const [serverStatus, setServerStatus] = useState('확인 중...');
  const [popularCases, setPopularCases] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="App">
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

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>지금 150+ 케이스 무료 잠금해제</h2>
          <p>더이상 '검증된 아이템' 찾느라 헤매지 마세요.</p>
          <a href="/videos" className="cta-button">
            지금 무료로 시작하기
          </a>
        </div>
      </section>
    </div>
  )
}

export default App