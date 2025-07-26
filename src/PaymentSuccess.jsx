import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionIdParam = searchParams.get('session_id');
    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }
    setLoading(false);
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        {loading ? (
          <div>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <p style={{ color: '#666', fontSize: '16px' }}>결제 정보를 확인하는 중...</p>
          </div>
        ) : (
          <>
            {/* 성공 아이콘 */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 30px',
              animation: 'bounce 0.6s ease-out'
            }}>
              <svg 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              결제가 완료되었습니다!
            </h1>

            <p style={{
              fontSize: '1.1rem',
              color: '#6b7280',
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              구독이 성공적으로 활성화되었습니다.<br/>
              이제 히든 리치스의 모든 프리미엄 기능을 이용하실 수 있습니다.
            </p>

            {sessionId && (
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#9ca3af',
                  marginBottom: '8px'
                }}>
                  결제 세션 ID
                </p>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  fontFamily: 'monospace',
                  background: '#ffffff',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  wordBreak: 'break-all'
                }}>
                  {sessionId}
                </p>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => window.location.href = '/dashboard'}
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
                }}
              >
                마이페이지로 이동
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#667eea';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#667eea';
                }}
              >
                홈으로 돌아가기
              </button>
            </div>

            <div style={{
              marginTop: '40px',
              padding: '20px',
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '12px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0369a1',
                marginBottom: '10px'
              }}>
                다음 단계
              </h3>
              <ul style={{
                fontSize: '14px',
                color: '#0369a1',
                textAlign: 'left',
                listStyle: 'none',
                padding: 0
              }}>
                <li style={{ marginBottom: '8px' }}>
                  ✓ 결제 확인 이메일을 받아보세요
                </li>
                <li style={{ marginBottom: '8px' }}>
                  ✓ 마이페이지에서 구독 상태를 확인하세요
                </li>
                <li style={{ marginBottom: '8px' }}>
                  ✓ 프리미엄 콘텐츠를 마음껏 이용하세요
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes bounce {
            0%, 20%, 53%, 80%, 100% {
              transform: translate3d(0,0,0);
            }
            40%, 43% {
              transform: translate3d(0,-8px,0);
            }
            70% {
              transform: translate3d(0,-4px,0);
            }
            90% {
              transform: translate3d(0,-2px,0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default PaymentSuccess;