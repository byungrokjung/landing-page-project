const express = require('express');
const axios = require('axios');
const router = express.Router();

// AI 트렌드 수집 라우트
router.post('/ai-trends', async (req, res) => {
  try {
    console.log('🔄 AI trends collection requested:', req.body);

    // n8n webhook URL (환경변수에서 가져오기)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      return res.status(500).json({
        error: 'N8N webhook URL not configured',
        message: 'Please set N8N_WEBHOOK_URL environment variable'
      });
    }

    // n8n으로 요청 전달
    const n8nResponse = await axios.post(n8nWebhookUrl, {
      action: 'collect_ai_trends',
      timestamp: new Date().toISOString(),
      user_id: req.body.user_id || 'anonymous',
      source: 'landing-page-project'
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const n8nData = n8nResponse.data;

    if (n8nResponse.status >= 200 && n8nResponse.status < 300) {
      console.log('✅ N8N workflow triggered successfully:', n8nData);
      
      res.json({
        success: true,
        message: 'AI trends collection started',
        workflow_id: n8nData.workflow_id || 'unknown',
        data: n8nData,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(`N8N API error: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

  } catch (error) {
    console.error('❌ AI trends collection error:', error);
    
    res.status(500).json({
      error: 'Failed to trigger AI trends collection',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// AI 트렌드 결과 조회 라우트
router.get('/ai-trends/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    // n8n에서 워크플로우 실행 결과 조회
    const n8nExecutionUrl = `${process.env.N8N_BASE_URL}/api/v1/executions/${workflowId}`;
    
    const response = await axios.get(n8nExecutionUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.N8N_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status >= 200 && response.status < 300) {
      const executionData = response.data;
      
      res.json({
        success: true,
        execution: executionData,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(`N8N API error: ${response.status} ${response.statusText}`);
    }

  } catch (error) {
    console.error('❌ Failed to fetch execution result:', error);
    
    res.status(500).json({
      error: 'Failed to fetch execution result',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 데모 데이터 (n8n이 없을 때)
router.post('/ai-trends/demo', (req, res) => {
  console.log('🎭 Demo AI trends collection triggered');
  
  // 시뮬레이션된 응답
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Demo AI trends collected',
      data: {
        trends: [
          {
            id: 1,
            title: 'GPT-4 Turbo Performance Improvements',
            category: 'Language Models',
            confidence: 0.95,
            source: 'OpenAI Blog',
            date: new Date().toISOString()
          },
          {
            id: 2,
            title: 'Computer Vision Breakthroughs in 2024',
            category: 'Computer Vision',
            confidence: 0.88,
            source: 'arXiv',
            date: new Date().toISOString()
          },
          {
            id: 3,
            title: 'Edge AI Deployment Strategies',
            category: 'Edge Computing',
            confidence: 0.82,
            source: 'TechCrunch',
            date: new Date().toISOString()
          }
        ],
        collection_time: new Date().toISOString(),
        sources_scanned: 25,
        total_articles: 150
      },
      timestamp: new Date().toISOString()
    });
  }, 2000); // 2초 지연으로 실제 작업 시뮬레이션
});

module.exports = router;