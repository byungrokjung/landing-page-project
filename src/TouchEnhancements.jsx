import React, { useState, useEffect } from 'react';

// 모바일 터치 향상 컴포넌트
export const TouchEnhancedButton = ({ children, onClick, style, ...props }) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => {
    setIsPressed(true);
    // 햅틱 피드백 (지원하는 기기에서)
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={onClick}
      style={{
        ...style,
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'transform 0.1s ease',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none'
      }}
      {...props}
    >
      {children}
    </button>
  );
};

// 스와이프 제스처 훅
export const useSwipe = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};

// 모바일 네비게이션 개선
export const MobileOptimizedNav = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false); // 스크롤 다운 시 숨김
      } else {
        setIsVisible(true); // 스크롤 업 시 표시
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
    >
      {children}
    </div>
  );
};

// 풀스크린 모달 (모바일 친화적)
export const MobileModal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          maxWidth: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

// 무한 스크롤 컴포넌트
export const InfiniteScroll = ({ 
  hasNextPage, 
  isLoading, 
  loadMore, 
  children,
  threshold = 100 
}) => {
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - threshold
      ) {
        if (hasNextPage && !isLoading) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isLoading, loadMore, threshold]);

  return (
    <>
      {children}
      {isLoading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          color: '#666'
        }}>
          로딩 중...
        </div>
      )}
    </>
  );
};