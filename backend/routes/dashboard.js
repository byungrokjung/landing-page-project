const express = require('express');
const { supabase } = require('../config/supabase');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 사용자 활동 기록 조회
router.get('/activities', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('활동 기록 조회 오류:', error);
      return res.status(500).json({ message: '활동 기록 조회에 실패했습니다.' });
    }

    res.json(data || []);
  } catch (error) {
    console.error('활동 기록 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 대시보드 통계 정보
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 활동 통계
    const { data: activities, error: activitiesError } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId);

    if (activitiesError) {
      console.error('활동 통계 조회 오류:', activitiesError);
    }

    // 프로필 정보
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('프로필 조회 오류:', profileError);
    }

    const stats = {
      totalActivities: activities?.length || 0,
      memberSince: profile?.created_at || null,
      lastLogin: profile?.last_login_at || null,
      subscriptionType: profile?.subscription_type || 'free',
      subscriptionEndDate: profile?.subscription_end_date || null
    };

    res.json(stats);
  } catch (error) {
    console.error('대시보드 통계 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 설정 업데이트
router.put('/settings', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      emailNotifications, 
      pushNotifications, 
      theme, 
      language 
    } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        theme: theme,
        language: language,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('설정 업데이트 오류:', error);
      return res.status(500).json({ message: '설정 업데이트에 실패했습니다.' });
    }

    res.json(data);
  } catch (error) {
    console.error('설정 업데이트 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 활동 기록 생성 (내부 사용)
router.post('/activity', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, activity_type } = req.body;

    const { data, error } = await supabase
      .from('user_activities')
      .insert([
        {
          user_id: userId,
          title: title,
          description: description,
          activity_type: activity_type || 'general',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('활동 기록 생성 오류:', error);
      return res.status(500).json({ message: '활동 기록 생성에 실패했습니다.' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('활동 기록 생성 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 구독 정보 조회
router.get('/subscription', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('subscription_type, subscription_start_date, subscription_end_date, subscription_status')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('구독 정보 조회 오류:', error);
      return res.status(500).json({ message: '구독 정보 조회에 실패했습니다.' });
    }

    // 구독 상태 계산
    const now = new Date();
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    const isActive = endDate ? now < endDate : false;

    const subscriptionInfo = {
      type: profile.subscription_type || 'free',
      status: isActive ? 'active' : 'expired',
      startDate: profile.subscription_start_date,
      endDate: profile.subscription_end_date,
      daysRemaining: endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : 0
    };

    res.json(subscriptionInfo);
  } catch (error) {
    console.error('구독 정보 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;