import React, { useState, useEffect } from 'react';

const GoogleLogin = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGsiReady, setIsGsiReady] = useState(false);

  useEffect(() => {
    // Google Identity Services 스크립트 로드
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log('Google Identity Services 스크립트 로드 완료');
      initializeGsi();
    };
    script.onerror = () => {
      console.error('Google Identity Services 스크립트 로드 실패');
      onError && onError('Google 로그인 서비스를 로드할 수 없습니다.');
    };
    document.head.appendChild(script);

    return () => {
      // 스크립트는 유지 (재사용을 위해)
    };
  }, []);

  const initializeGsi = () => {
    if (window.google && window.google.accounts) {
      console.log('Google Identity Services 초기화 시작');
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: false
        });
        console.log('Google Identity Services 초기화 완료');
        setIsGsiReady(true);
      } catch (error) {
        console.error('Google Identity Services 초기화 실패:', error);
        onError && onError('Google 로그인 초기화에 실패했습니다.');
      }
    } else {
      console.log('Google Identity Services 아직 로드되지 않음');
      setTimeout(initializeGsi, 100);
    }
  };

  const handleCredentialResponse = (response) => {
    console.log('Google 로그인 응답 받음:', response);
    try {
      // JWT 토큰 디코딩
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const userInfo = JSON.parse(jsonPayload);
      
      const userData = {
        id: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
        imageUrl: userInfo.picture,
        idToken: response.credential
      };

      onSuccess && onSuccess(userData);
    } catch (error) {
      console.error('사용자 정보 파싱 실패:', error);
      onError && onError('로그인 정보를 처리할 수 없습니다.');
    }
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    if (!isGsiReady || !window.google || !window.google.accounts) {
      onError && onError('Google 로그인 서비스가 아직 준비되지 않았습니다.');
      return;
    }

    setIsLoading(true);
    
    try {
      // 직접 OAuth 팝업 열기 (로컬 개발용)
      window.google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: (response) => {
          console.log('OAuth 응답:', response);
          if (response.access_token) {
            // 사용자 정보 가져오기
            fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`)
              .then(res => res.json())
              .then(userInfo => {
                console.log('사용자 정보:', userInfo);
                const userData = {
                  id: userInfo.id,
                  name: userInfo.name,
                  email: userInfo.email,
                  imageUrl: userInfo.picture,
                  accessToken: response.access_token
                };
                onSuccess && onSuccess(userData);
              })
              .catch(error => {
                console.error('사용자 정보 가져오기 실패:', error);
                onError && onError('사용자 정보를 가져올 수 없습니다.');
              });
          } else {
            onError && onError('액세스 토큰을 받을 수 없습니다.');
          }
          setIsLoading(false);
        }
      }).requestAccessToken();
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      onError && onError('로그인에 실패했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading || !isGsiReady}
        title={isLoading ? '로그인 중...' : !isGsiReady ? 'Google 로그인 준비 중...' : 'Google로 로그인'}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#fff',
          border: '1px solid #dadce0',
          cursor: (isLoading || !isGsiReady) ? 'not-allowed' : 'pointer',
          opacity: (isLoading || !isGsiReady) ? 0.6 : 1,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          if (!isLoading && isGsiReady) {
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            e.target.style.transform = 'scale(1.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading && isGsiReady) {
            e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.target.style.transform = 'scale(1)';
          }
        }}
      >
        {isLoading ? (
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #f3f3f3',
            borderTop: '2px solid #4285f4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
      </button>
      <div id="google-signin-button" style={{ display: 'none' }}></div>
    </div>
  );
};

export default GoogleLogin;