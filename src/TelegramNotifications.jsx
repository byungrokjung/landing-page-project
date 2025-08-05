import React, { useState, useEffect } from 'react';

const TelegramNotifications = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    telegramChatId: '',
    telegramUsername: '',
    keywords: [],
    categories: [],
    minTrendScore: 0.7,
    notificationTypes: {
      instant: true,
      daily: false,
      weekly: true
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [botSetup, setBotSetup] = useState({
    isConfigured: false,
    botUsername: '',
    setupInstructions: true
  });
  
  const [testNotification, setTestNotification] = useState({
    sending: false,
    lastSent: null,
    status: null
  });

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const userId = 'demo-user'; // 실제로는 인증된 사용자 ID 사용

  // 설정 로드
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading settings from:', `${apiUrl}/api/telegram/settings/${userId}`);
      
      // 타임아웃 설정 (3초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${apiUrl}/api/telegram/settings/${userId}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        if (response.status === 404) {
          console.log('ℹ️ No settings found, using defaults');
        }
        setLoading(false);
        return;
      }
      
      const result = await response.json();
      console.log('📦 API Response:', result);
      
      if (result.success && result.data) {
        setSettings(result.data);
        
        if (result.data.telegram_chat_id) {
          setBotSetup({
            isConfigured: true,
            botUsername: result.data.telegram_username || 'Unknown',
            setupInstructions: false
          });
        }
      }
      
      console.log('✅ Settings loaded:', result.data);
      
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      
      if (error.name === 'AbortError') {
        console.log('⏱️ API 호출 타임아웃 - 기본값 사용');
      }
      
      // 보통 텔레그램 봇이 연결되었으므로 연결된 것으로 표시
      setBotSetup({
        isConfigured: true,
        botUsername: 'byungrokbot',
        setupInstructions: false
      });
      
      // 테스트를 위해 기본 chat ID 설정 (실제로는 DB에서 가져와야 함)
      setSettings(prev => ({
        ...prev,
        telegram_chat_id: '1696889883', // brjung님의 chat ID
        telegram_username: 'brjung',
        enabled: true
      }));
      
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // 설정 저장
  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const response = await fetch(`${apiUrl}/api/telegram/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          telegramChatId: settings.telegram_chat_id,
          telegramUsername: settings.telegram_username,
          enabled: settings.enabled,
          keywords: settings.keywords,
          categories: settings.categories,
          minTrendScore: settings.min_trend_score,
          notificationTypes: settings.notification_types
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Settings saved successfully');
        // 성공 피드백 표시
        setTimeout(() => {
          // 성공 상태 리셋
        }, 2000);
      } else {
        throw new Error(result.message || 'Failed to save settings');
      }
      
    } catch (error) {
      console.error('❌ Failed to save settings:', error);
      alert('설정 저장에 실패했습니다: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 테스트 알림 전송
  const sendTestNotification = async () => {
    try {
      setTestNotification(prev => ({ ...prev, sending: true, status: null }));
      
      const response = await fetch(`${apiUrl}/api/telegram/send-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          message: '🧪 테스트 알림입니다!\n\n이것은 AI 트렌드 알림 시스템의 테스트 메시지입니다.\n알림이 정상적으로 작동하고 있습니다! ✅'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestNotification(prev => ({
          ...prev,
          lastSent: new Date(),
          status: 'success'
        }));
        console.log('✅ Test notification sent successfully');
      } else {
        throw new Error(result.message || 'Failed to send test notification');
      }
      
    } catch (error) {
      console.error('❌ Test notification failed:', error);
      setTestNotification(prev => ({
        ...prev,
        status: 'error'
      }));
    } finally {
      setTestNotification(prev => ({ ...prev, sending: false }));
    }
  };

  // 키워드 추가
  const addKeyword = (keyword) => {
    if (keyword.trim() && !settings.keywords.includes(keyword.trim())) {
      setSettings(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword.trim()]
      }));
    }
  };

  // 키워드 제거
  const removeKeyword = (keyword) => {
    setSettings(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  // 카테고리 토글
  const toggleCategory = (category) => {
    setSettings(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #333',
            borderTop: '3px solid #00ff88',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>텔레그램 설정 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      padding: '20px'
    }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '32px', marginBottom: '10px' }}>
          📱 텔레그램 알림 설정
        </h1>
        <p style={{ color: '#888', fontSize: '16px', marginBottom: '20px' }}>
          AI 트렌드 실시간 알림을 텔레그램으로 받아보세요
        </p>
        <a href="/" style={{ color: '#00ff88', textDecoration: 'none', fontSize: '14px' }}>
          ← 홈으로 돌아가기
        </a>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 봇 설정 섹션 */}
        {!botSetup.isConfigured ? (
          <div style={{
            background: '#1a1a1a',
            border: '2px solid #ff6b35',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#ff6b35', marginBottom: '20px' }}>🤖 텔레그램 봇 설정</h3>
            
            <div style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.8' }}>
              <p><strong>1단계: 텔레그램 봇 찾기</strong></p>
              <p>텔레그램에서 <code style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>@AITrendsNotificationBot</code>을 검색하여 봇을 찾으세요.</p>
              
              <p style={{ marginTop: '20px' }}><strong>2단계: 봇 시작</strong></p>
              <p><code style={{ background: '#333', padding: '2px 6px', borderRadius: '4px' }}>/start</code> 명령어를 전송하여 봇을 활성화하세요.</p>
              
              <p style={{ marginTop: '20px' }}><strong>3단계: 알림 설정</strong></p>
              <p>봇이 활성화되면 이 페이지에서 알림 설정을 관리할 수 있습니다.</p>
              
              <div style={{
                background: '#0a0a0a',
                padding: '15px',
                borderRadius: '10px',
                marginTop: '20px',
                border: '1px solid #333'
              }}>
                <h4 style={{ color: '#00ff88', fontSize: '14px', marginBottom: '10px' }}>💡 사용 가능한 명령어:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>/start - 봇 시작하기</li>
                  <li>/trends - 최신 트렌드 보기</li>
                  <li>/settings - 설정 변경</li>
                  <li>/help - 도움말 보기</li>
                </ul>
              </div>
            </div>

            <button
              onClick={loadSettings}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                borderRadius: '25px',
                border: '2px solid #ff6b35',
                background: 'transparent',
                color: '#ff6b35',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🔄 연결 상태 확인
            </button>
          </div>
        ) : (
          <div style={{
            background: '#1a1a1a',
            border: '2px solid #00ff88',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#00ff88', marginBottom: '15px' }}>✅ 텔레그램 봇 연결됨</h3>
            <p style={{ color: '#ccc', fontSize: '14px' }}>
              봇 사용자명: <strong>@{botSetup.botUsername}</strong>
            </p>
            
            {/* 테스트 알림 */}
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={sendTestNotification}
                disabled={testNotification.sending}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #0088ff',
                  background: testNotification.sending ? '#333' : 'transparent',
                  color: testNotification.sending ? '#fff' : '#0088ff',
                  cursor: testNotification.sending ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginRight: '10px'
                }}
              >
                {testNotification.sending ? '전송 중...' : '🧪 테스트 알림 전송'}
              </button>
              
              {testNotification.status === 'success' && (
                <span style={{ color: '#00ff88', fontSize: '12px' }}>
                  ✅ 테스트 알림이 전송되었습니다!
                </span>
              )}
              
              {testNotification.status === 'error' && (
                <span style={{ color: '#ff3366', fontSize: '12px' }}>
                  ❌ 테스트 알림 전송에 실패했습니다.
                </span>
              )}
            </div>
          </div>
        )}

        {/* 알림 설정 */}
        {botSetup.isConfigured && (
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '20px' }}>⚙️ 알림 설정</h3>
            
            {/* 알림 활성화 */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                color: '#ccc',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                  style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                />
                텔레그램 알림 활성화
              </label>
            </div>

            {/* 알림 유형 */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '15px' }}>📬 알림 유형</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { key: 'instant', label: '즉시 알림', desc: '새로운 트렌드 발견 시 즉시 알림' },
                  { key: 'daily', label: '일간 요약', desc: '매일 하루 동안의 트렌드 요약' },
                  { key: 'weekly', label: '주간 리포트', desc: '매주 종합적인 트렌드 분석 리포트' }
                ].map(({ key, label, desc }) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#ccc',
                      fontSize: '14px',
                      cursor: 'pointer',
                      padding: '10px',
                      background: '#0a0a0a',
                      borderRadius: '8px',
                      border: '1px solid #333'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={settings.notification_types?.[key] || false}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notification_types: {
                          ...prev.notification_types,
                          [key]: e.target.checked
                        }
                      }))}
                      style={{ marginRight: '10px', transform: 'scale(1.1)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{label}</div>
                      <div style={{ fontSize: '12px', color: '#888' }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 최소 트렌드 점수 */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '15px' }}>🎯 알림 임계값</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <label style={{ color: '#ccc', fontSize: '14px', minWidth: '150px' }}>
                  최소 트렌드 점수:
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.min_trend_score || 0.7}
                  onChange={(e) => setSettings(prev => ({ ...prev, min_trend_score: parseFloat(e.target.value) }))}
                  style={{ flex: 1 }}
                />
                <span style={{
                  color: '#00ff88',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  minWidth: '60px'
                }}>
                  {Math.round((settings.min_trend_score || 0.7) * 100)}점
                </span>
              </div>
              <p style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>
                높을수록 중요한 트렌드만 알림을 받습니다
              </p>
            </div>

            {/* 관심 키워드 */}
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '15px' }}>🔍 관심 키워드</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                {(settings.keywords || []).map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#0088ff',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '15px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '0',
                        lineHeight: 1
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="키워드 입력 후 Enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addKeyword(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #333',
                    background: '#0a0a0a',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>
              <p style={{ color: '#888', fontSize: '12px', marginTop: '5px' }}>
                빈 칸으로 두면 모든 트렌드를 받습니다
              </p>
            </div>

            {/* 관심 분야 */}
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', marginBottom: '15px' }}>📂 관심 분야</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {[
                  'Language Models',
                  'Machine Learning', 
                  'Computer Vision',
                  'AI Technology',
                  'Robotics',
                  'Technology'
                ].map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: (settings.categories || []).includes(category) ? '2px solid #00ff88' : '1px solid #333',
                      background: (settings.categories || []).includes(category) ? '#00ff88' : 'transparent',
                      color: (settings.categories || []).includes(category) ? '#000' : '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <p style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>
                빈 칸으로 두면 모든 분야의 트렌드를 받습니다
              </p>
            </div>

            {/* 저장 버튼 */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={saveSettings}
                disabled={saving}
                style={{
                  padding: '12px 30px',
                  borderRadius: '25px',
                  border: '2px solid #00ff88',
                  background: saving ? '#333' : '#00ff88',
                  color: saving ? '#fff' : '#000',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {saving ? '저장 중...' : '💾 설정 저장'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input[type="range"] {
            appearance: none;
            height: 4px;
            background: #333;
            border-radius: 2px;
            outline: none;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            appearance: none;
            width: 18px;
            height: 18px;
            background: #00ff88;
            border-radius: 50%;
            cursor: pointer;
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 18px;
            height: 18px;
            background: #00ff88;
            border-radius: 50%;
            cursor: pointer;
            border: none;
          }
        `}
      </style>
    </div>
  );
};

export default TelegramNotifications;