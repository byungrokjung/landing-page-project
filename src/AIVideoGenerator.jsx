import React, { useState } from 'react';

function AIVideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // 실제 AI 동영상 생성 API 호출 로직
    setTimeout(() => {
      setIsGenerating(false);
      alert('동영상 생성이 완료되었습니다!');
    }, 3000);
  };

  const samplePrompts = [
    "A futuristic city with flying cars at sunset",
    "Ocean waves crashing on a sandy beach in slow motion",
    "A cat playing with a ball of yarn in a cozy living room",
    "Lightning striking during a thunderstorm at night",
    "Cherry blossoms falling in a Japanese garden",
    "A spaceship landing on an alien planet"
  ];

  const features = [
    {
      icon: "🎬",
      title: "High-Quality Output",
      description: "Generate stunning 4K videos with professional-grade quality"
    },
    {
      icon: "⚡",
      title: "Lightning Fast",
      description: "Create videos in seconds with our advanced AI technology"
    },
    {
      icon: "🎨",
      title: "Creative Control",
      description: "Fine-tune every aspect of your video with detailed prompts"
    },
    {
      icon: "🚀",
      title: "Latest AI Models",
      description: "Powered by cutting-edge AI models for best results"
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      color: 'white',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 동영상 */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: '-1'
        }}
      >
        <source src="/videos/veo30generatepreview_A_cinematic_romantic_scene_in_a_cozy_Seou_0_0aa88ecb-1bbf-4dd5-8e36-9a30d144b963.mp4" type="video/mp4" />
      </video>

      {/* 오버레이 */}
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: '0'
      }}></div>
      {/* 배경 애니메이션 효과 */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(255,165,0,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        top: '-200px',
        right: '-200px',
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(0,191,255,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        bottom: '-100px',
        left: '-100px',
        animation: 'float 8s ease-in-out infinite reverse'
      }}></div>

      {/* 헤더 */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          background: 'linear-gradient(45deg, #ffa500, #ff6b47)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AI Video Generator
        </div>
        
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255,165,0,0.2)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(255,165,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.1)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          ← Back
        </button>
      </header>

      {/* 메인 섹션 */}
      <main style={{
        padding: '80px 40px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 100
      }}>
        {/* 히어로 섹션 */}
        <section style={{
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: '800',
            margin: '0 0 24px 0',
            background: 'linear-gradient(45deg, #ffa500, #ff6b47, #00bfff)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient 4s ease infinite'
          }}>
            Create Amazing Videos with AI
          </h1>
          
          <p style={{
            fontSize: '1.25rem',
            opacity: '0.9',
            maxWidth: '600px',
            margin: '0 auto 40px auto',
            lineHeight: '1.6'
          }}>
            Transform your ideas into stunning videos using cutting-edge artificial intelligence. 
            Just describe what you want, and watch it come to life.
          </p>
        </section>

        {/* 프롬프트 입력 섹션 */}
        <section style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          border: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '80px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '24px',
            color: '#ffa500'
          }}>
            Describe Your Video
          </h2>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            flexWrap: 'wrap'
          }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A majestic dragon flying through clouds at sunset..."
              style={{
                flex: '1',
                minWidth: '300px',
                height: '120px',
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '16px',
                color: 'white',
                fontSize: '16px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                backdropFilter: 'blur(10px)'
              }}
              onFocus={(e) => {
                e.target.style.border = '1px solid #ffa500';
                e.target.style.boxShadow = '0 0 0 3px rgba(255,165,0,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255,255,255,0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
            
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              style={{
                padding: '16px 32px',
                background: isGenerating ? 'rgba(255,165,0,0.5)' : 'linear-gradient(45deg, #ffa500, #ff6b47)',
                color: 'white',
                border: 'none',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '150px',
                height: 'fit-content'
              }}
              onMouseEnter={(e) => {
                if (!isGenerating && prompt.trim()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px rgba(255,165,0,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {isGenerating ? '🎬 Generating...' : '🚀 Generate Video'}
            </button>
          </div>

          {/* 샘플 프롬프트 */}
          <div style={{
            marginTop: '24px'
          }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#00bfff'
            }}>
              ✨ Try these prompts:
            </h3>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {samplePrompts.map((samplePrompt, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(samplePrompt)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(0,191,255,0.1)',
                    border: '1px solid rgba(0,191,255,0.3)',
                    borderRadius: '20px',
                    color: '#00bfff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(0,191,255,0.2)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(0,191,255,0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {samplePrompt}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 기능 소개 섹션 */}
        <section>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '60px',
            background: 'linear-gradient(45deg, #ffa500, #00bfff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Why Choose Our AI Video Generator?
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: '20px',
                  padding: '32px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.4s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.border = '1px solid rgba(255,165,0,0.3)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(255,165,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '16px'
                }}>
                  {feature.icon}
                </div>
                
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  marginBottom: '12px',
                  color: '#ffa500'
                }}>
                  {feature.title}
                </h3>
                
                <p style={{
                  opacity: '0.8',
                  lineHeight: '1.6',
                  margin: '0'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>
    </div>
  );
}

export default AIVideoGenerator;