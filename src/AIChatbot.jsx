import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';

const AIChatbot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "안녕하세요! 저는 히든 리치스 AI 도우미입니다. 비즈니스 케이스 스터디에 대해 궁금한 것이 있으시면 언제든 물어보세요! 🚀",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // OpenAI 클라이언트 초기화
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // 클라이언트 사이드에서 사용
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 실제 OpenAI API 호출
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `당신은 "히든 리치스"라는 비즈니스 케이스 스터디 플랫폼의 AI 도우미입니다. 
            
            다음과 같은 역할을 수행합니다:
            - 비즈니스 케이스 스터디에 대한 정보 제공
            - 스타트업, 1인 기업, AI 비즈니스 등의 성공 사례 소개
            - 마케팅 전략, 수익 모델, 비즈니스 모델에 대한 조언
            - 온라인 비즈니스 아이디어 추천
            
            항상 친근하고 전문적인 톤으로 대답하며, 구체적이고 실용적인 조언을 제공해주세요.
            답변은 한국어로 해주시고, 이모지를 적절히 사용해서 친근하게 대화해주세요.`
          },
          {
            role: "user",
            content: inputText
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const botResponse = {
        id: Date.now() + 1,
        text: completion.choices[0].message.content,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      
      const errorResponse = {
        id: Date.now() + 1,
        text: "죄송합니다. 현재 AI 서비스에 문제가 있어 답변을 드릴 수 없습니다. 잠시 후 다시 시도해 주세요. 🤖",
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    }
    
    setIsLoading(false);
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '380px',
      height: '500px',
      backgroundColor: '#ffffff',
      borderRadius: '20px',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '10px',
            height: '10px',
            backgroundColor: '#4ade80',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '16px' }}>AI 도우미</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>온라인</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            color: 'white',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>

      {/* 메시지 영역 */}
      <div style={{
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        background: '#f8fafc'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.isBot ? 'flex-start' : 'flex-end',
              marginBottom: '16px'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: message.isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
              backgroundColor: message.isBot ? '#ffffff' : '#667eea',
              color: message.isBot ? '#1f2937' : 'white',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              {message.text}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              gap: '4px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#667eea',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#667eea',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out 0.2s'
              }}></div>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#667eea',
                borderRadius: '50%',
                animation: 'bounce 1.4s infinite ease-in-out 0.4s'
              }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{
              padding: '12px 16px',
              backgroundColor: inputText.trim() && !isLoading ? '#667eea' : '#e5e7eb',
              color: inputText.trim() && !isLoading ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '12px',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            전송
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default AIChatbot;