import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const SubscriptionPlans = () => {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: '무료 플랜',
      price: 0,
      period: '월',
      features: [
        '기본 케이스 스터디 5개/월',
        'AI 챗봇 제한적 사용',
        '커뮤니티 접근',
        '기본 이메일 지원'
      ],
      buttonText: '현재 플랜',
      popular: false
    },
    {
      id: 'pro',
      name: '프로 플랜',
      price: 29000,
      period: '월',
      features: [
        '모든 케이스 스터디 무제한',
        'AI 챗봇 무제한 사용',
        '프리미엄 비디오 콘텐츠',
        '우선순위 고객 지원',
        '월간 전략 리포트',
        '1:1 멘토링 세션 (월 1회)'
      ],
      buttonText: '프로 시작하기',
      popular: true,
      stripeId: 'price_1234567890' // 실제 Stripe Price ID
    },
    {
      id: 'enterprise',
      name: '엔터프라이즈',
      price: 99000,
      period: '월',
      features: [
        '프로 플랜의 모든 기능',
        '팀 계정 관리 (최대 10명)',
        '커스텀 케이스 스터디 제작',
        '전용 계정 매니저',
        '주간 전략 컨설팅',
        'API 접근 권한'
      ],
      buttonText: '엔터프라이즈 문의',
      popular: false,
      stripeId: 'price_0987654321' // 실제 Stripe Price ID
    }
  ];

  const handleSubscribe = async (plan) => {
    if (plan.id === 'free') return;
    
    setLoading(true);
    setSelectedPlan(plan.id);

    try {
      // Stripe Checkout 세션 생성
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          priceId: plan.stripeId,
          planName: plan.name
        })
      });

      const data = await response.json();
      
      if (!data.sessionId) {
        throw new Error('결제 세션 ID를 받지 못했습니다.');
      }

      // Stripe Checkout으로 리디렉션
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (!stripe) {
        throw new Error('Stripe를 로드할 수 없습니다.');
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      
      if (error) {
        throw new Error(error.message);
      }

    } catch (error) {
      console.error('결제 오류:', error);
      alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div style={{
      padding: '100px 0',
      background: 'transparent',
      position: 'relative',
      zIndex: 10
    }}>
      <div className="container" style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            나에게 맞는 플랜을 선택하세요
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#cccccc',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            비즈니스 성공을 위한 검증된 케이스 스터디와 AI 멘토링을 경험해보세요
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '30px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: plan.popular 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
                  : 'rgba(26, 26, 26, 0.8)',
                backdropFilter: 'blur(20px)',
                border: plan.popular 
                  ? '2px solid #3b82f6' 
                  : '1px solid #333',
                borderRadius: '20px',
                padding: '40px 30px',
                position: 'relative',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = plan.popular 
                  ? '0 20px 40px rgba(59, 130, 246, 0.3)'
                  : '0 20px 40px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  color: 'white',
                  padding: '8px 24px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  가장 인기있는 플랜
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  color: '#ffffff',
                  marginBottom: '10px'
                }}>
                  {plan.name}
                </h3>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'center',
                  gap: '5px',
                  marginBottom: '20px'
                }}>
                  <span style={{
                    fontSize: '3rem',
                    fontWeight: '700',
                    color: plan.popular ? '#3b82f6' : '#ffffff'
                  }}>
                    {plan.price.toLocaleString()}
                  </span>
                  <span style={{
                    fontSize: '1.2rem',
                    color: '#cccccc'
                  }}>
                    원 / {plan.period}
                  </span>
                </div>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 30px 0'
              }}>
                {plan.features.map((feature, index) => (
                  <li key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px',
                    color: '#cccccc',
                    fontSize: '15px'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: plan.popular ? '#3b82f6' : '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: 'white'
                    }}>
                      ✓
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading && selectedPlan === plan.id}
                style={{
                  width: '100%',
                  background: plan.id === 'free' 
                    ? 'rgba(255, 255, 255, 0.1)'
                    : plan.popular 
                      ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                      : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: plan.id === 'free' ? 'default' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: (loading && selectedPlan === plan.id) ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (plan.id !== 'free') {
                    e.target.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.id !== 'free') {
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {loading && selectedPlan === plan.id ? '처리 중...' : plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '60px',
          color: '#888',
          fontSize: '14px'
        }}>
          <p>✓ 언제든지 취소 가능 ✓ 30일 환불 보장 ✓ 카드 정보는 안전하게 암호화됩니다</p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;