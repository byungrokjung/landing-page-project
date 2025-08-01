const express = require('express');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 간단한 직접 HTTP 요청 함수 (페이징 지원)
async function getSupabaseData(limit = 10, offset = 0) {
  return new Promise((resolve, reject) => {
    const url = `${process.env.SUPABASE_URL}/rest/v1/ai_trend_news?limit=${limit}&offset=${offset}&order=created_at.desc`;
    
    const options = {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (err) {
          reject(new Error('Failed to parse JSON'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 전체 데이터 개수를 가져오는 함수
async function getTotalCount() {
  return new Promise((resolve, reject) => {
    const url = `${process.env.SUPABASE_URL}/rest/v1/ai_trend_news?select=count`;
    
    const options = {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const countHeader = res.headers['content-range'];
        console.log('📊 Count header:', countHeader);
        
        if (countHeader) {
          const total = parseInt(countHeader.split('/')[1]);
          console.log('📊 Parsed total count:', total);
          resolve(total);
        } else {
          // 폴백: 데이터에서 개수 세기
          try {
            const responseData = JSON.parse(data);
            console.log('📊 Fallback count from data:', responseData.length);
            resolve(responseData.length);
          } catch (e) {
            console.error('📊 Count parsing failed:', e);
            resolve(0);
          }
        }
      });
    }).on('error', (err) => {
      console.error('📊 Count request failed:', err);
      reject(err);
    });
  });
}

// 단순한 API 엔드포인트 (페이징 지원)
app.get('/api/ai-trends/trends/all', async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    console.log(`📊 Fetching trends - Page ${page}, Limit ${limit}, Offset ${offset}`);
    
    // 병렬로 데이터와 총 개수 가져오기
    const [rawData, totalCount] = await Promise.all([
      getSupabaseData(limit, offset),
      getTotalCount()
    ]);
    
    console.log(`✅ Got ${rawData.length} raw items`);
    
    // 첫 번째 데이터의 구조 확인 (디버깅용)
    if (rawData.length > 0) {
      console.log('📊 Sample raw data structure:', Object.keys(rawData[0]));
      console.log('📊 Sample data:', rawData[0]);
    }
    
    // 데이터 포맷팅
    const formattedTrends = rawData.map(trend => ({
      id: trend.id,
      title: trend.title,
      category: trend.category || 'General',
      confidence: parseFloat(trend.importance_score || trend.confidence || 0.8),
      source: trend.source || 'Unknown',
      source_url: trend.link || '',
      content: trend.content || trend.tag_content || '',
      tags: trend.tags || [],
      date: trend.created_at || trend.published_date,
      metadata: trend.metadata || {}
    }));
    
    console.log(`✅ Formatted ${formattedTrends.length} trends, Total: ${totalCount}`);
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    
    res.json({
      success: true,
      data: {
        trends: formattedTrends,
        pagination: {
          currentPage: parseInt(page),
          limit: parseInt(limit),
          offset: offset,
          total: totalCount,
          totalPages: totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch trends',
      message: error.message
    });
  }
});

app.listen(5001, () => {
  console.log('🚀 Test API server running on port 5001');
  console.log('🔗 Test URL: http://localhost:5001/api/ai-trends/trends/all?limit=5');
});