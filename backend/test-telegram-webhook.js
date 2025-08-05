const https = require('https');
require('dotenv').config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;
console.log('🔍 봇 토큰:', botToken ? `설정됨 (${botToken.substring(0, 10)}...)` : '없음');

// 웹훅 정보 확인
function checkWebhook() {
  console.log('\n📡 웹훅 정보 확인 중...');
  https.get(`https://api.telegram.org/bot${botToken}/getWebhookInfo`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      console.log('웹훅 URL:', result.result.url || '설정되지 않음');
      console.log('대기 중인 업데이트:', result.result.pending_update_count || 0);
      
      if (!result.result.url) {
        console.log('\n✅ 폴링 모드로 작동 중입니다.');
        getUpdates();
      } else {
        console.log('\n⚠️ 웹훅이 설정되어 있습니다. 삭제하시겠습니까?');
        deleteWebhook();
      }
    });
  }).on('error', err => console.error('오류:', err));
}

// 웹훅 삭제
function deleteWebhook() {
  console.log('\n🗑️ 웹훅 삭제 중...');
  https.get(`https://api.telegram.org/bot${botToken}/deleteWebhook`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      console.log('삭제 결과:', result);
      setTimeout(getUpdates, 1000);
    });
  }).on('error', err => console.error('오류:', err));
}

// 업데이트 확인
function getUpdates() {
  console.log('\n📬 메시지 확인 중...');
  https.get(`https://api.telegram.org/bot${botToken}/getUpdates`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      
      if (result.ok && result.result.length > 0) {
        console.log(`\n✉️ ${result.result.length}개의 메시지가 있습니다:`);
        
        result.result.forEach((update, index) => {
          if (update.message) {
            console.log(`\n[메시지 ${index + 1}]`);
            console.log('- 보낸 사람:', update.message.from.username || update.message.from.first_name);
            console.log('- 메시지:', update.message.text);
            console.log('- 시간:', new Date(update.message.date * 1000).toLocaleString('ko-KR'));
          }
        });
        
        // 마지막 메시지에 응답 보내기
        const lastUpdate = result.result[result.result.length - 1];
        if (lastUpdate.message) {
          sendTestReply(lastUpdate.message.chat.id);
        }
      } else {
        console.log('\n📭 새로운 메시지가 없습니다.');
      }
    });
  }).on('error', err => console.error('오류:', err));
}

// 테스트 응답 보내기
function sendTestReply(chatId) {
  console.log(`\n💬 테스트 응답 전송 중 (chat_id: ${chatId})...`);
  
  const message = '🤖 안녕하세요! AI 트렌드 알림 봇입니다.\\n\\n봇이 정상 작동하고 있습니다! ✅\\n\\n사용 가능한 명령어:\\n/start - 시작하기\\n/trends - 최신 트렌드\\n/help - 도움말';
  
  const postData = JSON.stringify({
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML'
  });
  
  const options = {
    hostname: 'api.telegram.org',
    path: `/bot${botToken}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const result = JSON.parse(data);
      if (result.ok) {
        console.log('✅ 메시지 전송 성공!');
      } else {
        console.log('❌ 메시지 전송 실패:', result);
      }
    });
  });
  
  req.on('error', err => console.error('오류:', err));
  req.write(postData);
  req.end();
}

// 실행
checkWebhook();