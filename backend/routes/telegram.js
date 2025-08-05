const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const TelegramBot = require('../services/telegram-bot');
require('dotenv').config();
const router = express.Router();

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Telegram Bot 초기화
const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN || 'demo-token');

// 텔레그램 봇 설정 API
router.post('/setup', async (req, res) => {
  try {
    const { userId, botToken } = req.body;
    
    if (!userId || !botToken) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Bot Token are required'
      });
    }
    
    // 봇 토큰 검증
    const testBot = new TelegramBot(botToken);
    const botInfo = await testBot.getMe();
    
    console.log('✅ Telegram bot verified:', botInfo.username);
    
    res.json({
      success: true,
      botInfo: {
        username: botInfo.username,
        first_name: botInfo.first_name,
        id: botInfo.id
      }
    });
    
  } catch (error) {
    console.error('❌ Telegram bot setup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Bot setup failed',
      message: error.message
    });
  }
});

// 웹훅 설정 API
router.post('/webhook/setup', async (req, res) => {
  try {
    const { webhookUrl } = req.body;
    
    if (!webhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'Webhook URL is required'
      });
    }
    
    const result = await telegramBot.setWebhook(webhookUrl);
    console.log('✅ Webhook set successfully:', result);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('❌ Webhook setup failed:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook setup failed',
      message: error.message
    });
  }
});

// 텔레그램 웹훅 수신 엔드포인트
router.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('📲 Telegram webhook received:', JSON.stringify(update, null, 2));
    
    if (update.message) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;
      const username = update.message.from.username;
      const text = update.message.text;
      
      console.log(`💬 Message from ${username} (${userId}): ${text}`);
      
      if (text === '/start') {
        // 사용자 등록 프로세스
        const welcomeMessage = `🤖 안녕하세요! AI 트렌드 알림 봇입니다.
        
이 봇을 통해 다음 기능을 이용할 수 있습니다:
• 🔥 실시간 AI 트렌드 알림
• 📊 주간/월간 트렌드 리포트
• 🎯 관심 키워드 맞춤 알림

/help - 도움말 보기
/settings - 알림 설정
/trends - 최신 트렌드 보기

웹사이트에서 계정을 연결하여 개인화된 알림을 받아보세요!`;
        
        await telegramBot.sendMessage(chatId, welcomeMessage);
        
        // 사용자 정보를 데이터베이스에 저장 시도
        try {
          const { data, error } = await supabase
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
            })
            .select();
            
          if (error) {
            console.error('❌ Failed to save user settings:', error);
          } else {
            console.log('✅ User settings saved:', data);
          }
        } catch (dbError) {
          console.error('❌ Database operation failed:', dbError);
        }
        
      } else if (text === '/help') {
        const helpMessage = `📚 도움말

사용 가능한 명령어:
/start - 봇 시작하기
/settings - 알림 설정 변경
/trends - 최신 AI 트렌드 보기
/help - 이 도움말 보기

💡 팁:
• 웹사이트에서 계정을 연결하면 개인화된 알림을 받을 수 있습니다
• 관심 키워드를 설정하여 맞춤 알림을 받아보세요
• 알림 빈도를 조절할 수 있습니다`;
        
        await telegramBot.sendMessage(chatId, helpMessage);
        
      } else if (text === '/trends') {
        // 최신 트렌드 요청
        try {
          const { data: trends, error } = await supabase
            .from('ai_trend_news')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
            
          if (error) throw error;
          
          if (trends && trends.length > 0) {
            let trendsMessage = '🔥 최신 AI 트렌드 TOP 5:\n\n';
            
            trends.forEach((trend, index) => {
              const emoji = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📌';
              trendsMessage += `${emoji} **${trend.title}**\n`;
              trendsMessage += `📊 출처: ${trend.source}\n`;
              trendsMessage += `📅 ${new Date(trend.created_at).toLocaleDateString('ko-KR')}\n\n`;
            });
            
            trendsMessage += '더 자세한 분석은 웹사이트에서 확인하세요! 🚀';
            
            await telegramBot.sendMessage(chatId, trendsMessage);
          } else {
            await telegramBot.sendMessage(chatId, '😅 현재 표시할 트렌드가 없습니다. 나중에 다시 시도해주세요.');
          }
        } catch (error) {
          console.error('❌ Failed to fetch trends:', error);
          await telegramBot.sendMessage(chatId, '❌ 트렌드를 가져오는 중 오류가 발생했습니다.');
        }
        
      } else if (text === '/settings') {
        const settingsMessage = `⚙️ 알림 설정
        
현재 설정:
• 🔔 즉시 알림: 활성화
• 📅 주간 리포트: 활성화
• 🎯 최소 트렌드 점수: 70점

설정 변경은 웹사이트에서 가능합니다.
더 세부적인 설정을 원하시면 웹사이트의 알림 설정 페이지를 이용해주세요.`;
        
        const keyboard = telegramBot.createInlineKeyboard([
          [{ text: '🌐 웹사이트 열기', url: 'https://your-website.com/notifications' }],
          [{ text: '🔕 알림 끄기', callback_data: 'disable_notifications' }]
        ]);
        
        await telegramBot.sendMessage(chatId, settingsMessage, { reply_markup: keyboard });
        
      } else {
        // 일반 메시지에 대한 응답
        const responseMessage = `🤖 안녕하세요! 다음 명령어를 사용해보세요:

/start - 시작하기
/trends - 최신 트렌드 보기  
/settings - 설정 변경
/help - 도움말

AI 트렌드에 대해 궁금한 점이 있으시면 웹사이트를 방문해주세요!`;
        
        await telegramBot.sendMessage(chatId, responseMessage);
      }
    }
    
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;
      
      if (data === 'disable_notifications') {
        // 알림 비활성화
        try {
          const { error } = await supabase
            .from('notification_settings')
            .update({ enabled: false })
            .eq('telegram_chat_id', chatId.toString());
            
          if (error) throw error;
          
          await telegramBot.sendMessage(chatId, '🔕 알림이 비활성화되었습니다. /start 명령어로 언제든 다시 활성화할 수 있습니다.');
        } catch (error) {
          console.error('❌ Failed to disable notifications:', error);
          await telegramBot.sendMessage(chatId, '❌ 설정 변경 중 오류가 발생했습니다.');
        }
      }
    }
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

// 알림 설정 저장 API
router.post('/settings', async (req, res) => {
  try {
    const {
      userId,
      telegramChatId,
      telegramUsername,
      enabled = true,
      keywords = [],
      categories = [],
      minTrendScore = 0.7,
      notificationTypes = { instant: true, daily: false, weekly: true }
    } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({
        user_id: userId,
        telegram_chat_id: telegramChatId,
        telegram_username: telegramUsername,
        enabled,
        keywords,
        categories,
        min_trend_score: minTrendScore,
        notification_types: notificationTypes
      })
      .select();
      
    if (error) throw error;
    
    console.log('✅ Notification settings saved:', data[0]);
    
    res.json({
      success: true,
      data: data[0]
    });
    
  } catch (error) {
    console.error('❌ Settings save failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save settings',
      message: error.message
    });
  }
});

// 알림 설정 조회 API
router.get('/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    res.json({
      success: true,
      data: data || {
        enabled: false,
        keywords: [],
        categories: [],
        min_trend_score: 0.7,
        notification_types: { instant: true, daily: false, weekly: true }
      }
    });
    
  } catch (error) {
    console.error('❌ Settings fetch failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch settings',
      message: error.message
    });
  }
});

// 테스트 알림 전송 API
router.post('/send-test', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    // 사용자의 텔레그램 설정 조회
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('telegram_chat_id, enabled')
      .eq('user_id', userId)
      .single();
      
    if (error || !settings || !settings.enabled || !settings.telegram_chat_id) {
      return res.status(404).json({
        success: false,
        error: 'Telegram notifications not configured or disabled'
      });
    }
    
    const testMessage = message || `🧪 테스트 알림입니다!
    
이것은 AI 트렌드 알림 시스템의 테스트 메시지입니다.
알림이 정상적으로 작동하고 있습니다! ✅

설정을 변경하려면 /settings 명령어를 사용하세요.`;
    
    await telegramBot.sendMessage(settings.telegram_chat_id, testMessage);
    
    // 알림 히스토리 저장
    await supabase
      .from('notification_history')
      .insert({
        user_id: userId,
        notification_type: 'test',
        channel: 'telegram',
        message: testMessage,
        status: 'sent'
      });
    
    console.log('✅ Test notification sent successfully');
    
    res.json({
      success: true,
      message: 'Test notification sent successfully'
    });
    
  } catch (error) {
    console.error('❌ Test notification failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification',
      message: error.message
    });
  }
});

// 트렌드 알림 전송 함수 (내부 사용)
const sendTrendNotification = async (userId, trend) => {
  try {
    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true)
      .single();
      
    if (error || !settings || !settings.telegram_chat_id) {
      return false;
    }
    
    // 트렌드 점수 확인
    if (trend.trendScore < settings.min_trend_score) {
      return false;
    }
    
    // 키워드 매칭 확인
    const hasMatchingKeyword = settings.keywords.some(keyword => 
      trend.title.toLowerCase().includes(keyword.toLowerCase()) ||
      trend.content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (settings.keywords.length > 0 && !hasMatchingKeyword) {
      return false;
    }
    
    const alertMessage = telegramBot.formatTrendAlert(trend);
    await telegramBot.sendMessage(settings.telegram_chat_id, alertMessage);
    
    // 알림 히스토리 저장
    await supabase
      .from('notification_history')
      .insert({
        user_id: userId,
        notification_type: 'instant',
        channel: 'telegram',
        trend_id: trend.id,
        message: alertMessage,
        status: 'sent'
      });
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send trend notification:', error);
    return false;
  }
};

// 주간 리포트 전송 API
router.post('/send-weekly-report', async (req, res) => {
  try {
    // 주간 리포트 대상 사용자 조회
    const { data: users, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('enabled', true)
      .contains('notification_types', { weekly: true });
      
    if (error) throw error;
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        if (!user.telegram_chat_id) continue;
        
        // 주간 통계 계산 (최근 7일)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const { data: weeklyTrends, error: trendsError } = await supabase
          .from('ai_trend_news')
          .select('*')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false });
          
        if (trendsError) throw trendsError;
        
        const stats = {
          totalTrends: weeklyTrends.length,
          avgConfidence: Math.round(
            weeklyTrends.reduce((sum, trend) => sum + (trend.importance_score || 0.8), 0) / 
            weeklyTrends.length * 100
          ),
          topCategory: 'AI Technology',
          topTrends: weeklyTrends.slice(0, 3).map(trend => ({
            title: trend.title,
            score: Math.round((trend.importance_score || 0.8) * 100)
          }))
        };
        
        const reportMessage = telegramBot.formatWeeklyReport(stats);
        await telegramBot.sendMessage(user.telegram_chat_id, reportMessage);
        
        // 알림 히스토리 저장
        await supabase
          .from('notification_history')
          .insert({
            user_id: user.user_id,
            notification_type: 'weekly',
            channel: 'telegram',
            message: reportMessage,
            status: 'sent'
          });
        
        successCount++;
      } catch (userError) {
        console.error(`❌ Failed to send weekly report to user ${user.user_id}:`, userError);
        errorCount++;
      }
    }
    
    console.log(`✅ Weekly reports sent: ${successCount} success, ${errorCount} errors`);
    
    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        successCount,
        errorCount
      }
    });
    
  } catch (error) {
    console.error('❌ Weekly report broadcast failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send weekly reports',
      message: error.message
    });
  }
});

module.exports = router;