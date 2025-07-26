import React from 'react';

const PaymentCancel = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
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
        {/* 취소 아이콘 */}
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          animation: 'shake 0.6s ease-out'
        }}>
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M18 6L6 18M6 6L18 18" 
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
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          결제가 취소되었습니다
        </h1>

        <p style={{
          fontSize: '1.1rem',
          color: '#6b7280',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          결제를 진행하지 않고 취소하셨습니다.<br/>
          언제든지 다시 구독하실 수 있습니다.
        </p>

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '40px'
        }}>
          <button
            onClick={() => window.history.back()}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
            }}
          >
            다시 선택하기
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            style={{
              background: 'transparent',
              color: '#ef4444',
              border: '2px solid #ef4444',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#ef4444';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#ef4444';
            }}
          >
            홈으로 돌아가기
          </button>
        </div>

        <div style={{
          padding: '20px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '12px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#991b1b',
            marginBottom: '10px'
          }}>
            취소 이유가 있으신가요?
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#991b1b',
            marginBottom: '15px'
          }}>
            더 나은 서비스를 위해 피드백을 주시면 감사하겠습니다.
          </p>
          <button
            onClick={() => window.location.href = 'mailto:support@hiddenriches.co.kr'}
            style={{
              background: 'transparent',
              color: '#991b1b',
              border: '1px solid #991b1b',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#991b1b';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#991b1b';
            }}
          >
            피드백 보내기
          </button>
        </div>

        <div style={{
          marginTop: '30px',
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          카드에 청구되지 않았으며, 계정에 변경사항이 없습니다.
        </div>
      </div>

      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
          }
        `}
      </style>
    </div>
  );
};

export default PaymentCancel;