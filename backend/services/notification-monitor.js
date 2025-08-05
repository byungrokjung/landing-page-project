const { createClient } = require('@supabase/supabase-js');
const TelegramBot = require('./telegram-bot');

class NotificationMonitor {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    this.telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    this.isRunning = false;
    this.checkInterval = 5 * 60 * 1000; // 5분마다 체크
    this.lastCheckedAt = new Date();
  }

  // 모니터링 시작
  start() {
    if (this.isRunning) {
      console.log('⚠️ Notification monitor is already running');
      return;
    }

    console.log('🔄 Starting notification monitor...');
    this.isRunning = true;
    this.checkForNewTrends();
    
    // 정기적으로 체크
    this.intervalId = setInterval(() => {
      this.checkForNewTrends();
    }, this.checkInterval);

    console.log(`✅ Notification monitor started (checking every ${this.checkInterval / 1000}s)`);
  }

  // 모니터링 중지
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ Notification monitor is not running');
      return;
    }

    console.log('🛑 Stopping notification monitor...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('✅ Notification monitor stopped');
  }

  // 새로운 트렌드 체크
  async checkForNewTrends() {
    try {
      console.log('🔍 Checking for new trends...');
      
      // 마지막 체크 이후 새로운 트렌드 조회
      const { data: newTrends, error } = await this.supabase
        .from('ai_trend_news')
        .select('*')
        .gte('created_at', this.lastCheckedAt.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch new trends:', error);
        return;
      }

      if (!newTrends || newTrends.length === 0) {
        console.log('📭 No new trends found');
        return;
      }

      console.log(`📈 Found ${newTrends.length} new trends`);

      // 각 새로운 트렌드에 대해 알림 처리
      for (const trend of newTrends) {
        await this.processTrendForNotifications(trend);
      }

      // 마지막 체크 시간 업데이트
      this.lastCheckedAt = new Date();

    } catch (error) {
      console.error('❌ Error checking for new trends:', error);
    }
  }

  // 트렌드 알림 처리
  async processTrendForNotifications(trend) {
    try {
      // 트렌드 점수 계산
      const trendScore = this.calculateTrendScore(trend);
      const enhancedTrend = {
        ...trend,
        trendScore,
        category: this.categorize(trend)
      };

      console.log(`📊 Processing trend: ${trend.title} (Score: ${(trendScore * 100).toFixed(1)})`);

      // 알림 대상 사용자 조회
      const { data: users, error } = await this.supabase
        .from('notification_settings')
        .select('*')
        .eq('enabled', true)
        .contains('notification_types', { instant: true })
        .lte('min_trend_score', trendScore);

      if (error) {
        console.error('❌ Failed to fetch notification users:', error);
        return;
      }

      if (!users || users.length === 0) {
        console.log('👥 No users match notification criteria');
        return;
      }

      console.log(`📤 Sending notifications to ${users.length} users`);

      // 각 사용자에게 알림 전송
      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        const shouldNotify = await this.shouldNotifyUser(user, enhancedTrend);
        
        if (shouldNotify) {
          const success = await this.sendTrendNotification(user, enhancedTrend);
          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        }
      }

      console.log(`✅ Notifications sent: ${successCount} success, ${errorCount} errors`);

    } catch (error) {
      console.error('❌ Error processing trend for notifications:', error);
    }
  }

  // 트렌드 점수 계산
  calculateTrendScore(trend) {
    const title = (trend.title || '').toLowerCase();
    const content = (trend.content || '').toLowerCase();
    let score = 0.5; // 기본 점수

    // AI 관련 키워드
    if (title.includes('ai') || content.includes('ai ')) score += 0.3;
    if (title.includes('gpt') || title.includes('chatgpt')) score += 0.2;
    if (title.includes('machine learning') || title.includes('ml ')) score += 0.2;

    // 트렌드 키워드
    const trendKeywords = {
      'breakthrough': 0.3, 'revolutionary': 0.25, 'game-changing': 0.2,
      'launches': 0.15, 'announces': 0.1, 'releases': 0.1,
      'raises': 0.2, 'funding': 0.15, 'investment': 0.1,
      'billion': 0.25, 'million': 0.15,
      'new': 0.05, 'first': 0.1, 'latest': 0.05
    };

    Object.entries(trendKeywords).forEach(([keyword, bonus]) => {
      if (title.includes(keyword) || content.includes(keyword)) {
        score += bonus;
      }
    });

    // 날짜 기반 점수 (최신일수록 높은 점수)
    const daysSinceCreated = (Date.now() - new Date(trend.created_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated <= 1) score += 0.2;
    else if (daysSinceCreated <= 3) score += 0.1;
    else if (daysSinceCreated <= 7) score += 0.05;

    // 컨텐츠 길이 기반 점수
    const contentLength = (trend.content || '').length;
    if (contentLength > 500) score += 0.1;
    else if (contentLength > 200) score += 0.05;

    return Math.min(Math.max(score, 0.1), 1.0);
  }

  // 트렌드 카테고리 분류
  categorize(trend) {
    const title = (trend.title || '').toLowerCase();
    const content = (trend.content || '').toLowerCase();

    if (title.includes('gpt') || title.includes('language model') || content.includes('language model')) {
      return 'Language Models';
    } else if (title.includes('vision') || title.includes('image') || content.includes('computer vision')) {
      return 'Computer Vision';
    } else if (title.includes('machine learning') || title.includes('ml ') || content.includes('machine learning')) {
      return 'Machine Learning';
    } else if (title.includes('robot') || content.includes('robot')) {
      return 'Robotics';
    } else if (title.includes('ai') || content.includes('ai ')) {
      return 'AI Technology';
    } else {
      return 'Technology';
    }
  }

  // 사용자에게 알림을 보낼지 확인
  async shouldNotifyUser(user, trend) {
    try {
      // 트렌드 점수 확인
      if (trend.trendScore < user.min_trend_score) {
        return false;
      }

      // 키워드 매칭 확인
      if (user.keywords && user.keywords.length > 0) {
        const hasMatchingKeyword = user.keywords.some(keyword => 
          trend.title.toLowerCase().includes(keyword.toLowerCase()) ||
          trend.content.toLowerCase().includes(keyword.toLowerCase())
        );
        
        if (!hasMatchingKeyword) {
          return false;
        }
      }

      // 카테고리 매칭 확인
      if (user.categories && user.categories.length > 0) {
        if (!user.categories.includes(trend.category)) {
          return false;
        }
      }

      // 중복 알림 방지 (최근 1시간 내 같은 트렌드 알림 체크)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { data: recentNotifications, error } = await this.supabase
        .from('notification_history')
        .select('id')
        .eq('user_id', user.user_id)
        .eq('trend_id', trend.id)
        .eq('channel', 'telegram')
        .gte('sent_at', oneHourAgo.toISOString());

      if (error) {
        console.error('❌ Failed to check recent notifications:', error);
        return true; // 에러 시 알림 전송
      }

      if (recentNotifications && recentNotifications.length > 0) {
        console.log(`⏭️ Skipping duplicate notification for user ${user.user_id}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error checking if should notify user:', error);
      return false;
    }
  }

  // 트렌드 알림 전송
  async sendTrendNotification(user, trend) {
    try {
      if (!user.telegram_chat_id) {
        console.log(`⚠️ No Telegram chat ID for user ${user.user_id}`);
        return false;
      }

      const alertMessage = this.telegramBot.formatTrendAlert(trend);
      await this.telegramBot.sendMessage(user.telegram_chat_id, alertMessage);

      // 알림 히스토리 저장
      await this.supabase
        .from('notification_history')
        .insert({
          user_id: user.user_id,
          notification_type: 'instant',
          channel: 'telegram',
          trend_id: trend.id,
          message: alertMessage,
          status: 'sent',
          metadata: {
            trend_score: trend.trendScore,
            category: trend.category
          }
        });

      console.log(`✅ Notification sent to user ${user.user_id}`);
      return true;

    } catch (error) {
      console.error(`❌ Failed to send notification to user ${user.user_id}:`, error);
      
      // 실패한 알림 히스토리 저장
      try {
        await this.supabase
          .from('notification_history')
          .insert({
            user_id: user.user_id,
            notification_type: 'instant',
            channel: 'telegram',
            trend_id: trend.id,
            message: `Failed: ${error.message}`,
            status: 'failed',
            metadata: {
              error: error.message,
              trend_score: trend.trendScore,
              category: trend.category
            }
          });
      } catch (historyError) {
        console.error('❌ Failed to save error history:', historyError);
      }

      return false;
    }
  }

  // 주간 리포트 전송 스케줄러
  async sendWeeklyReports() {
    try {
      console.log('📊 Sending weekly reports...');

      const { data: users, error } = await this.supabase
        .from('notification_settings')
        .select('*')
        .eq('enabled', true)
        .contains('notification_types', { weekly: true });

      if (error) throw error;

      if (!users || users.length === 0) {
        console.log('👥 No users configured for weekly reports');
        return;
      }

      console.log(`📤 Sending weekly reports to ${users.length} users`);

      let successCount = 0;
      let errorCount = 0;

      for (const user of users) {
        try {
          if (!user.telegram_chat_id) continue;

          // 주간 통계 계산
          const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          const { data: weeklyTrends, error: trendsError } = await this.supabase
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

          const reportMessage = this.telegramBot.formatWeeklyReport(stats);
          await this.telegramBot.sendMessage(user.telegram_chat_id, reportMessage);

          // 알림 히스토리 저장
          await this.supabase
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

    } catch (error) {
      console.error('❌ Weekly report broadcast failed:', error);
    }
  }

  // 상태 정보 조회
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastCheckedAt: this.lastCheckedAt,
      checkInterval: this.checkInterval,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }
}

module.exports = NotificationMonitor;