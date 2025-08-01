const express = require('express');
const https = require('https');
const router = express.Router();

// OpenAI API를 사용한 번역 엔드포인트
router.post('/', async (req, res) => {
  try {
    const { text, targetLang = 'ko' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // OpenAI API 키 확인
    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log(`🌐 Translating to ${targetLang}:`, text.substring(0, 100) + '...');

    // OpenAI API 호출 (https 모듈 사용)
    const postData = JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${targetLang === 'ko' ? 'Korean' : targetLang}. Maintain the original meaning and tone. Only return the translated text without any additional comments or explanations.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    });

    const options = {
      hostname: 'api.openai.com',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const apiResponse = await new Promise((resolve, reject) => {
      const req = https.request(options, (apiRes) => {
        let data = '';
        
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        
        apiRes.on('end', () => {
          resolve({
            statusCode: apiRes.statusCode,
            data: data
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });

    if (apiResponse.statusCode !== 200) {
      console.error('❌ OpenAI API Error:', apiResponse.statusCode, apiResponse.data);
      throw new Error(`OpenAI API error: ${apiResponse.statusCode}`);
    }

    const data = JSON.parse(apiResponse.data);
    const translatedText = data.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      throw new Error('No translation received from OpenAI');
    }

    console.log(`✅ Translation completed:`, translatedText.substring(0, 100) + '...');

    res.json({
      success: true,
      translatedText: translatedText,
      originalText: text,
      targetLang: targetLang
    });

  } catch (error) {
    console.error('❌ Translation error:', error);
    res.status(500).json({
      error: 'Translation failed',
      message: error.message
    });
  }
});

module.exports = router;