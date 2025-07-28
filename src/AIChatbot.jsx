import React, { useState, useRef, useEffect } from 'react';
import OpenAI from 'openai';
import { useSubscription, FeatureGate } from './SubscriptionContext';

const AIChatbot = ({ isOpen, onClose }) => {
  const { isWithinUsageLimit, trackUsage } = useSubscription();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi there! I'm your AI assistant, ready to help with any questions about our platform, creative tools, or digital solutions. Feel free to ask anything! 🚀",
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

    // Check usage limit before sending message
    if (!isWithinUsageLimit('ai_chatbot')) {
      const limitMessage = {
        id: Date.now(),
        text: "Sorry, you've reached your AI chatbot usage limit. Upgrade to Pro plan for unlimited access to all features! 🔒",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, limitMessage]);
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Track usage
    await trackUsage('ai_chatbot');

    try {
      // 실제 OpenAI API 호출
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful AI assistant for a modern digital platform. 

            Important Guidelines:
            1. Never make up specific facts, numbers, or company names that you're not certain about
            2. When unsure, honestly say "I'd need to verify that information"
            3. Focus on general principles and practical advice
            4. Use phrases like "for example" or "typically" when mentioning specific cases

            Your Role:
            - Provide technology and creative solutions guidance
            - Explain digital tools and AI features
            - Offer practical advice for productivity and creativity
            - Help with general questions about digital platforms and modern tools

            Response Style:
            - Friendly and professional tone
            - Use English primarily (respond in user's language if they ask in another language)
            - Use emojis appropriately
            - Be clear about uncertainty when it exists`
          },
          {
            role: "user",
            content: inputText
          }
        ],
        max_tokens: 800,
        temperature: 0.3
      });

      const responseContent = completion.choices[0].message.content;
      console.log('OpenAI 응답 길이:', responseContent.length);
      console.log('완료 이유:', completion.choices[0].finish_reason);
      
      const botResponse = {
        id: Date.now() + 1,
        text: responseContent,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      
      const errorResponse = {
        id: Date.now() + 1,
        text: "Sorry, I'm experiencing some technical difficulties right now. Please try again in a moment! 🤖",
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

  // 모바일 감지
  const isMobile = window.innerWidth <= 768;

  return (
    <div 
      className="chatbot-container"
      style={{
        position: 'fixed',
        bottom: isMobile ? '10px' : '20px',
        right: isMobile ? '10px' : '20px',
        left: isMobile ? '10px' : 'auto',
      width: isMobile ? 'auto' : '380px',
      height: isMobile ? '70vh' : '500px',
      maxHeight: isMobile ? '500px' : 'none',
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