const TelegramBot = require('./services/telegram-bot');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 클라이언트
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 텔레그램 봇 인스턴스
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// 마지막 업데이트 ID 추적
let lastUpdateId = 0;

// 메시지 처리 함수
async function handleMessage(update) {
  if (!update.message) return;
  
  const chatId = update.message.chat.id;
  const userId = update.message.from.id;
  const username = update.message.from.username;
  const text = update.message.text;
  
  console.log(`💬 메시지 받음: ${username} - ${text}`);
  
  try {
    if (text === '/start') {
      const welcomeMessage = `🤖 안녕하세요! AI 트렌드 알림 봇입니다.

이 봇을 통해 다음 기능을 이용할 수 있습니다:
• 🔥 실시간 AI 트렌드 알림
• 📊 주간/월간 트렌드 리포트
• 🎯 관심 키워드 맞춤 알림

<b>사용 가능한 명령어:</b>
/help - 도움말 보기
/settings - 알림 설정
/trends - 최신 트렌드 보기

웹사이트에서 계정을 연결하여 개인화된 알림을 받아보세요!`;
      
      await bot.sendMessage(chatId, welcomeMessage);
      
      // 사용자 정보 저장 시도
      try {
        await supabase
          .from('notification_settings')
          .upsert({
            user_id: `telegram_${userId}`,
            telegram_chat_id: chatId.toString(),
            telegram_username: username,
            enabled: true,
            keywords: ['ai', 'artificial intelligence'],
            categories: ['Language Models', 'Machine Learning'],
            min_trend_score: 0.7,
            notification_types: {
              instant: true,
              daily: false,
              weekly: true
            }
          });
        console.log('✅ 사용자 설정 저장됨');
      } catch (dbError) {
        console.error('❌ DB 오류:', dbError);
      }
      
    } else if (text === '/help') {
      const helpMessage = `📚 <b>도움말</b>

<b>사용 가능한 명령어:</b>
/start - 봇 시작하기
/settings - 알림 설정 변경
/trends - 최신 AI 트렌드 보기
/help - 이 도움말 보기

💡 <b>팁:</b>
• 웹사이트에서 계정을 연결하면 개인화된 알림을 받을 수 있습니다
• 관심 키워드를 설정하여 맞춤 알림을 받아보세요
• 알림 빈도를 조절할 수 있습니다

🌐 웹사이트: http://localhost:5174/telegram-notifications`;
      
      await bot.sendMessage(chatId, helpMessage);
      
    } else if (text === '/trends') {
      // 최신 트렌드 가져오기
      const { data: trends, error } = await supabase
        .from('ai_trend_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!error && trends && trends.length > 0) {
        let trendsMessage = '🔥 <b>최신 AI 트렌드 TOP 5:</b>\n\n';
        
        trends.forEach((trend, index) => {
          const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📌';
          trendsMessage += `${emoji} <b>${trend.title}</b>\n`;
          trendsMessage += `📊 출처: ${trend.source}\n`;
          trendsMessage += `📅 ${new Date(trend.created_at).toLocaleDateString('ko-KR')}\n\n`;
        });
        
        trendsMessage += '더 자세한 분석은 웹사이트에서 확인하세요! 🚀';
        
        await bot.sendMessage(chatId, trendsMessage);
      } else {
        await bot.sendMessage(chatId, '😅 현재 표시할 트렌드가 없습니다. 나중에 다시 시도해주세요.');
      }
      
    } else if (text === '/settings') {
      const settingsMessage = `⚙️ <b>알림 설정</b>

현재 설정:
• 🔔 즉시 알림: 활성화
• 📅 주간 리포트: 활성화
• 🎯 최소 트렌드 점수: 70점

설정 변경은 웹사이트에서 가능합니다:
http://localhost:5174/telegram-notifications

더 세부적인 설정을 원하시면 웹사이트의 알림 설정 페이지를 이용해주세요.`;
      
      await bot.sendMessage(chatId, settingsMessage);
      
    } else {
      // 일반 메시지에 대한 응답
      const responseMessage = `🤖 안녕하세요! 다음 명령어를 사용해보세요:

/start - 시작하기
/trends - 최신 트렌드 보기
/settings - 설정 변경
/help - 도움말

AI 트렌드에 대해 궁금한 점이 있으시면 웹사이트를 방문해주세요!`;
      
      await bot.sendMessage(chatId, responseMessage);
    }
  } catch (error) {
    console.error('❌ 메시지 처리 오류:', error);
  }
}

// 폴링 함수
async function pollUpdates() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await response.json();
    
    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        await handleMessage(update);
        lastUpdateId = update.update_id;
      }
    }
  } catch (error) {
    console.error('❌ 폴링 오류:', error);
  }
  
  // 다음 폴링
  setTimeout(pollUpdates, 1000);
}

// 시작
console.log('🤖 텔레그램 봇 폴링 시작...');
console.log('📱 봇 사용자명: @byungrokbot');
console.log('✅ 메시지를 기다리는 중...');

pollUpdates();