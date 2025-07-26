import React, { createContext, useContext, useState, useEffect } from 'react';

// Create subscription context
const SubscriptionContext = createContext();

// Hook to use subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

// Subscription provider component
export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState({
    plan: 'free',
    status: 'active',
    features: {
      case_studies_limit: 5,
      ai_chatbot_limit: 10,
      premium_videos: false,
      priority_support: false,
      monthly_reports: false,
      mentoring_sessions: 0,
      team_accounts: 0,
      custom_case_studies: false,
      dedicated_manager: false,
      weekly_consulting: false,
      api_access: false
    },
    usage: {
      case_studies_viewed: 0,
      ai_chatbot_used: 0,
      last_reset: new Date().toDateString()
    }
  });

  const [loading, setLoading] = useState(true);

  // Load subscription data from API
  useEffect(() => {
    const loadSubscriptionData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/dashboard/subscription`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setSubscription(prev => ({
            ...prev,
            plan: data.plan || 'free',
            status: data.status || 'active',
            features: {
              ...prev.features,
              ...data.features
            }
          }));
        }
      } catch (error) {
        console.error('구독 정보 로드 실패:', error);
      }
      setLoading(false);
    };

    loadSubscriptionData();
  }, []);

  // Check if user can access a feature
  const canAccessFeature = (featureName) => {
    return subscription.features[featureName] === true || 
           subscription.features[featureName] === 'unlimited' ||
           (typeof subscription.features[featureName] === 'number' && subscription.features[featureName] > 0);
  };

  // Check usage limits
  const isWithinUsageLimit = (featureName) => {
    const limit = subscription.features[`${featureName}_limit`];
    const usage = subscription.usage[`${featureName}_used`];
    
    if (limit === 'unlimited') return true;
    if (typeof limit === 'number' && typeof usage === 'number') {
      return usage < limit;
    }
    return true;
  };

  // Track feature usage
  const trackUsage = async (featureName) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Update local state
      setSubscription(prev => ({
        ...prev,
        usage: {
          ...prev.usage,
          [`${featureName}_used`]: (prev.usage[`${featureName}_used`] || 0) + 1
        }
      }));

      // Send to API
      await fetch(`${import.meta.env.VITE_API_URL || ''}/api/dashboard/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          activity_type: featureName,
          description: `${featureName} 기능 사용`
        })
      });
    } catch (error) {
      console.error('사용량 추적 실패:', error);
    }
  };

  // Get remaining usage for a feature
  const getRemainingUsage = (featureName) => {
    const limit = subscription.features[`${featureName}_limit`];
    const usage = subscription.usage[`${featureName}_used`] || 0;
    
    if (limit === 'unlimited') return '무제한';
    if (typeof limit === 'number') {
      return Math.max(0, limit - usage);
    }
    return 0;
  };

  // Check if user needs to upgrade
  const needsUpgrade = (requiredPlan = 'pro') => {
    const planLevels = { free: 0, pro: 1, enterprise: 2 };
    return planLevels[subscription.plan] < planLevels[requiredPlan];
  };

  // Get upgrade message
  const getUpgradeMessage = (featureName) => {
    const messages = {
      case_studies_limit: '더 많은 케이스 스터디를 보려면 프로 플랜으로 업그레이드하세요.',
      ai_chatbot_limit: 'AI 챗봇을 무제한으로 사용하려면 프로 플랜으로 업그레이드하세요.',
      premium_videos: '프리미엄 비디오 콘텐츠는 프로 플랜 이상에서 이용 가능합니다.',
      team_accounts: '팀 계정 기능은 엔터프라이즈 플랜에서만 이용 가능합니다.',
      api_access: 'API 접근은 엔터프라이즈 플랜에서만 가능합니다.'
    };
    
    return messages[featureName] || '이 기능을 사용하려면 플랜을 업그레이드하세요.';
  };

  const value = {
    subscription,
    loading,
    canAccessFeature,
    isWithinUsageLimit,
    trackUsage,
    getRemainingUsage,
    needsUpgrade,
    getUpgradeMessage,
    refreshSubscription: () => window.location.reload()
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Feature Gate Component
export const FeatureGate = ({ 
  featureName, 
  requiredPlan = 'pro', 
  children, 
  fallback = null,
  showUpgradePrompt = true 
}) => {
  const { subscription, canAccessFeature, needsUpgrade, getUpgradeMessage } = useSubscription();

  if (needsUpgrade(requiredPlan) || !canAccessFeature(featureName)) {
    if (showUpgradePrompt) {
      return (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(147, 51, 234, 0.1))',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '12px',
          textAlign: 'center',
          margin: '20px 0'
        }}>
          <div style={{
            fontSize: '24px',
            marginBottom: '10px'
          }}>
            🔒
          </div>
          <h3 style={{
            color: '#667eea',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '10px'
          }}>
            프리미엄 기능
          </h3>
          <p style={{
            color: '#6b7280',
            fontSize: '14px',
            marginBottom: '15px'
          }}>
            {getUpgradeMessage(featureName)}
          </p>
          <button
            onClick={() => window.location.href = '/subscription'}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
            }}
          >
            플랜 업그레이드
          </button>
        </div>
      );
    }
    return fallback;
  }

  return children;
};

// Usage Indicator Component
export const UsageIndicator = ({ featureName, showBar = true }) => {
  const { subscription, getRemainingUsage } = useSubscription();
  
  const limit = subscription.features[`${featureName}_limit`];
  const usage = subscription.usage[`${featureName}_used`] || 0;
  const remaining = getRemainingUsage(featureName);

  if (limit === 'unlimited') {
    return (
      <div style={{
        fontSize: '12px',
        color: '#10b981',
        fontWeight: '500'
      }}>
        ✨ 무제한 사용 가능
      </div>
    );
  }

  const percentage = typeof limit === 'number' ? (usage / limit) * 100 : 0;
  const isNearLimit = percentage > 80;

  return (
    <div style={{
      fontSize: '12px',
      color: isNearLimit ? '#ef4444' : '#6b7280'
    }}>
      {showBar && typeof limit === 'number' && (
        <div style={{
          width: '100%',
          height: '4px',
          background: '#e5e7eb',
          borderRadius: '2px',
          marginBottom: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(percentage, 100)}%`,
            height: '100%',
            background: isNearLimit ? '#ef4444' : '#3b82f6',
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}
      <div>
        {typeof remaining === 'string' ? remaining : `${remaining}회 남음`}
        {typeof limit === 'number' && ` (${usage}/${limit})`}
      </div>
    </div>
  );
};