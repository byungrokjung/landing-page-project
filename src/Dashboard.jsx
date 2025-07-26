import React, { useEffect, useState } from 'react';
import { useSubscription, FeatureGate, UsageIndicator } from './SubscriptionContext';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [userActivities, setUserActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // 사용자 정보 로드
    fetchUserProfile();
    fetchUserActivities();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/dashboard/activities`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const activities = await response.json();
        setUserActivities(activities);
      }
    } catch (error) {
      console.error('활동 내역 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        alert('프로필이 성공적으로 업데이트되었습니다.');
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>로딩 중...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              ← 홈으로
            </button>
            <h1 style={{ 
              color: 'white', 
              margin: 0, 
              fontSize: '24px',
              fontWeight: '600'
            }}>
              마이 대시보드
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {user && (
              <span style={{ color: 'white', fontSize: '16px' }}>
                {user.name || user.email}님 환영합니다
              </span>
            )}
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        {/* 탭 네비게이션 */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'profile', label: '프로필' },
            { id: 'activity', label: '활동 내역' },
            { id: 'subscription', label: '구독 정보' },
            { id: 'settings', label: '설정' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id 
                  ? 'rgba(255, 255, 255, 0.9)' 
                  : 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: activeTab === tab.id ? '#333' : 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 콘텐츠 영역 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '15px',
          padding: '2rem',
          minHeight: '400px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
        }}>
          {activeTab === 'profile' && <ProfileSection user={user} onUpdate={handleUpdateProfile} />}
          {activeTab === 'activity' && <ActivitySection activities={userActivities} />}
          {activeTab === 'subscription' && <SubscriptionSection user={user} />}
          {activeTab === 'settings' && <SettingsSection user={user} onUpdate={handleUpdateProfile} />}
        </div>
      </div>
    </div>
  );
}

// 프로필 섹션 컴포넌트
function ProfileSection({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '24px' }}>프로필 정보</h2>
      
      {!isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                이름
              </label>
              <div style={{ 
                padding: '0.75rem', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                {user?.name || '설정되지 않음'}
              </div>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                이메일
              </label>
              <div style={{ 
                padding: '0.75rem', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                {user?.email}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
              소개
            </label>
            <div style={{ 
              padding: '0.75rem', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              minHeight: '60px'
            }}>
              {user?.bio || '자기소개를 입력해주세요.'}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
              전화번호
            </label>
            <div style={{ 
              padding: '0.75rem', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              {user?.phone || '설정되지 않음'}
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              alignSelf: 'flex-start',
              transition: 'background 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#5a6fd8'}
            onMouseOut={(e) => e.target.style.background = '#667eea'}
          >
            프로필 수정
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
                전화번호
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#555' }}>
              소개
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '16px',
                minHeight: '100px',
                resize: 'vertical'
              }}
              placeholder="자기소개를 입력해주세요"
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              취소
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// 활동 내역 섹션 컴포넌트
function ActivitySection({ activities }) {
  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '24px' }}>활동 내역</h2>
      
      {activities.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          color: '#666',
          fontSize: '16px'
        }}>
          아직 활동 내역이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activities.map((activity, index) => (
            <div
              key={index}
              style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <h4 style={{ margin: 0, color: '#333' }}>{activity.title}</h4>
                <small style={{ color: '#666' }}>
                  {new Date(activity.created_at).toLocaleDateString('ko-KR')}
                </small>
              </div>
              <p style={{ margin: 0, color: '#555' }}>{activity.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 구독 정보 섹션 컴포넌트
function SubscriptionSection({ user }) {
  const { subscription, loading, getRemainingUsage } = useSubscription();
  
  const planNames = {
    free: '무료 플랜',
    pro: '프로 플랜',
    enterprise: '엔터프라이즈'
  };

  const planColors = {
    free: '#6c757d',
    pro: '#3b82f6',
    enterprise: '#8b5cf6'
  };

  const planIcons = {
    free: '📱',
    pro: '⭐',
    enterprise: '👑'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{
          display: 'inline-block',
          width: '32px',
          height: '32px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem', color: '#666' }}>구독 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '24px' }}>구독 정보</h2>
      
      {/* 현재 플랜 정보 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: '2rem' }}>{planIcons[subscription.plan]}</div>
          <div>
            <h3 style={{ color: '#333', marginBottom: '0.25rem', fontSize: '20px' }}>
              {planNames[subscription.plan]}
            </h3>
            <div style={{ 
              fontSize: '14px',
              color: planColors[subscription.plan],
              fontWeight: '600'
            }}>
              {subscription.status === 'active' ? '활성' : '비활성'}
            </div>
          </div>
        </div>
        
        {subscription.plan !== 'free' && (
          <div style={{
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#666'
          }}>
            💡 프리미엄 기능을 모두 이용하실 수 있습니다!
          </div>
        )}
      </div>

      {/* 사용량 현황 */}
      <div style={{
        background: '#f8f9fa',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#333', marginBottom: '1.5rem', fontSize: '18px' }}>사용량 현황</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <div style={{
            padding: '1rem',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>케이스 스터디</span>
              <span style={{ fontSize: '12px', color: '#999' }}>이번 달</span>
            </div>
            <UsageIndicator featureName="case_studies" />
          </div>
          
          <div style={{
            padding: '1rem',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>AI 챗봇</span>
              <span style={{ fontSize: '12px', color: '#999' }}>이번 달</span>
            </div>
            <UsageIndicator featureName="ai_chatbot" />
          </div>
        </div>
      </div>

      {/* 플랜 기능 */}
      <div style={{
        background: '#f8f9fa',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        marginBottom: '2rem'
      }}>
        <h3 style={{ color: '#333', marginBottom: '1.5rem', fontSize: '18px' }}>플랜 혜택</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {Object.entries(subscription.features).map(([feature, value]) => {
            const isEnabled = value === true || value === 'unlimited' || (typeof value === 'number' && value > 0);
            
            const featureLabels = {
              case_studies_limit: '케이스 스터디',
              ai_chatbot_limit: 'AI 챗봇',
              premium_videos: '프리미엄 비디오',
              priority_support: '우선 고객지원',
              monthly_reports: '월간 리포트',
              mentoring_sessions: '멘토링 세션',
              team_accounts: '팀 계정',
              custom_case_studies: '커스텀 케이스 스터디',
              dedicated_manager: '전담 매니저',
              weekly_consulting: '주간 컨설팅',
              api_access: 'API 접근'
            };

            const label = featureLabels[feature];
            if (!label) return null;

            return (
              <div key={feature} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem',
                background: isEnabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <div style={{
                  fontSize: '12px',
                  color: isEnabled ? '#10b981' : '#9ca3af'
                }}>
                  {isEnabled ? '✓' : '✗'}
                </div>
                <span style={{ color: isEnabled ? '#059669' : '#6b7280' }}>
                  {label}
                </span>
                {typeof value === 'number' && value > 0 && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    marginLeft: 'auto'
                  }}>
                    {value}
                  </span>
                )}
                {value === 'unlimited' && (
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#10b981',
                    marginLeft: 'auto'
                  }}>
                    무제한
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 업그레이드 섹션 */}
      {subscription.plan === 'free' && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          padding: '2rem',
          borderRadius: '16px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🚀</div>
          <h3 style={{ marginBottom: '1rem', fontSize: '20px' }}>더 많은 기능을 이용해보세요!</h3>
          <p style={{ marginBottom: '1.5rem', opacity: 0.9 }}>
            프로 플랜으로 업그레이드하고 모든 케이스 스터디와 프리미엄 기능을 무제한으로 사용하세요.
          </p>
          <button
            onClick={() => window.location.href = '/subscription'}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            지금 업그레이드하기
          </button>
        </div>
      )}

      {subscription.plan !== 'free' && (
        <div style={{
          background: '#f0f9ff',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #bae6fd',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✨</div>
          <h4 style={{ color: '#0369a1', marginBottom: '0.5rem' }}>프리미엄 멤버</h4>
          <p style={{ color: '#0369a1', fontSize: '14px' }}>
            모든 기능을 자유롭게 이용하고 계십니다!
          </p>
        </div>
      )}
    </div>
  );
}

// 설정 섹션 컴포넌트
function SettingsSection({ user, onUpdate }) {
  const [settings, setSettings] = useState({
    emailNotifications: user?.email_notifications || true,
    pushNotifications: user?.push_notifications || false,
    theme: user?.theme || 'light',
    language: user?.language || 'ko'
  });

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onUpdate(newSettings);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', color: '#333', fontSize: '24px' }}>설정</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>알림 설정</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              />
              <span>이메일 알림</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
              />
              <span>푸시 알림</span>
            </label>
          </div>
        </div>

        <div>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>테마 설정</h3>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              minWidth: '200px'
            }}
          >
            <option value="light">라이트 테마</option>
            <option value="dark">다크 테마</option>
            <option value="auto">시스템 설정 따라가기</option>
          </select>
        </div>

        <div>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>언어 설정</h3>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '16px',
              minWidth: '200px'
            }}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </div>

        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '1rem',
          marginTop: '2rem'
        }}>
          <h4 style={{ color: '#856404', margin: '0 0 0.5rem 0' }}>계정 삭제</h4>
          <p style={{ color: '#856404', margin: '0 0 1rem 0', fontSize: '14px' }}>
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
          </p>
          <button
            onClick={() => {
              if (confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
                alert('계정 삭제 기능은 준비 중입니다.');
              }
            }}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            계정 삭제
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;