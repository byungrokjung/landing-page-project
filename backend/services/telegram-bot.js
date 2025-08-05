const https = require('https');

class TelegramBot {
  constructor(botToken) {
    this.botToken = botToken;
    this.apiUrl = `https://api.telegram.org/bot${botToken}`;
  }

  // 텔레그램 API 호출 헬퍼
  async callTelegramAPI(method, data = {}) {
    const postData = JSON.stringify(data);
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.telegram.org',
        path: `/bot${this.botToken}/${method}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(responseData);
            if (response.ok) {
              resolve(response.result);
            } else {
              reject(new Error(response.description || 'Telegram API error'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  // 메시지 전송
  async sendMessage(chatId, text, options = {}) {
    return this.callTelegramAPI('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      ...options
    });
  }

  // 알림 메시지 포맷팅
  formatTrendAlert(trend) {
    const emoji = this.getCategoryEmoji(trend.category);
    const score = Math.round((trend.trendScore || 0.8) * 100);
    
    return `${emoji} <b>새로운 AI 트렌드 발견!</b>\n\n` +
           `📰 <b>${trend.title}</b>\n` +
           `📊 카테고리: ${trend.category}\n` +
           `🎯 트렌드 점수: ${score}점\n` +
           `🔗 출처: ${trend.source}\n\n` +
           `💡 ${trend.content ? trend.content.substring(0, 150) + '...' : '자세한 내용은 앱에서 확인하세요.'}\n\n` +
           `#AI트렌드 #${trend.category.replace(/\s/g, '')}`;
  }

  // 카테고리별 이모지
  getCategoryEmoji(category) {
    const emojis = {
      'Language Models': '🤖',
      'Computer Vision': '👁️',
      'Machine Learning': '🧠',
      'Robotics': '🦾',
      'AI Technology': '🚀',
      'Technology': '💻',
      'General': '📌'
    };
    return emojis[category] || '📌';
  }

  // 주간 리포트 포맷팅
  formatWeeklyReport(stats) {
    return `📊 <b>주간 AI 트렌드 리포트</b>\n\n` +
           `📈 총 트렌드: ${stats.totalTrends}개\n` +
           `🎯 평균 신뢰도: ${stats.avgConfidence}%\n` +
           `🏆 인기 카테고리: ${stats.topCategory}\n\n` +
           `🔥 <b>상위 3개 트렌드:</b>\n` +
           stats.topTrends.map((trend, index) => 
             `${index + 1}. ${trend.title} (${trend.score}점)`
           ).join('\n') +
           `\n\n자세한 리포트는 웹사이트에서 확인하세요! 🚀`;
  }

  // 인라인 키보드 버튼 생성
  createInlineKeyboard(buttons) {
    return {
      inline_keyboard: buttons
    };
  }

  // 웹훅 설정
  async setWebhook(url) {
    return this.callTelegramAPI('setWebhook', { url });
  }

  // 봇 정보 가져오기
  async getMe() {
    return this.callTelegramAPI('getMe');
  }
}

module.exports = TelegramBot;