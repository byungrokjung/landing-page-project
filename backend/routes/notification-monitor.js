const express = require('express');
const NotificationMonitor = require('../services/notification-monitor');
const router = express.Router();

// 전역 모니터 인스턴스
let monitor = null;

// 모니터 시작 API
router.post('/start', async (req, res) => {
  try {
    if (monitor && monitor.getStatus().isRunning) {
      return res.json({
        success: true,
        message: 'Notification monitor is already running',
        status: monitor.getStatus()
      });
    }
    
    monitor = new NotificationMonitor();
    monitor.start();
    
    console.log('✅ Notification monitor started via API');
    
    res.json({
      success: true,
      message: 'Notification monitor started successfully',
      status: monitor.getStatus()
    });
    
  } catch (error) {
    console.error('❌ Failed to start notification monitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start notification monitor',
      message: error.message
    });
  }
});

// 모니터 중지 API
router.post('/stop', async (req, res) => {
  try {
    if (!monitor || !monitor.getStatus().isRunning) {
      return res.json({
        success: true,
        message: 'Notification monitor is not running'
      });
    }
    
    monitor.stop();
    
    console.log('✅ Notification monitor stopped via API');
    
    res.json({
      success: true,
      message: 'Notification monitor stopped successfully'
    });
    
  } catch (error) {
    console.error('❌ Failed to stop notification monitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop notification monitor',
      message: error.message
    });
  }
});

// 모니터 상태 조회 API
router.get('/status', (req, res) => {
  try {
    const status = monitor ? monitor.getStatus() : { isRunning: false };
    
    res.json({
      success: true,
      status: {
        ...status,
        hasMonitor: !!monitor,
        serverTime: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to get monitor status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monitor status',
      message: error.message
    });
  }
});

// 수동 트렌드 체크 API
router.post('/check-trends', async (req, res) => {
  try {
    if (!monitor) {
      monitor = new NotificationMonitor();
    }
    
    console.log('🔍 Manual trend check requested');
    await monitor.checkForNewTrends();
    
    res.json({
      success: true,
      message: 'Manual trend check completed'
    });
    
  } catch (error) {
    console.error('❌ Manual trend check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Manual trend check failed',
      message: error.message
    });
  }
});

// 주간 리포트 전송 API
router.post('/send-weekly-reports', async (req, res) => {
  try {
    if (!monitor) {
      monitor = new NotificationMonitor();
    }
    
    console.log('📊 Manual weekly report send requested');
    await monitor.sendWeeklyReports();
    
    res.json({
      success: true,
      message: 'Weekly reports sent successfully'
    });
    
  } catch (error) {
    console.error('❌ Weekly report send failed:', error);
    res.status(500).json({
      success: false,
      error: 'Weekly report send failed',
      message: error.message
    });
  }
});

// 모니터 재시작 API
router.post('/restart', async (req, res) => {
  try {
    if (monitor && monitor.getStatus().isRunning) {
      monitor.stop();
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
    }
    
    monitor = new NotificationMonitor();
    monitor.start();
    
    console.log('✅ Notification monitor restarted via API');
    
    res.json({
      success: true,
      message: 'Notification monitor restarted successfully',
      status: monitor.getStatus()
    });
    
  } catch (error) {
    console.error('❌ Failed to restart notification monitor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restart notification monitor',
      message: error.message
    });
  }
});

module.exports = router;