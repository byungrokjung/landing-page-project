const express = require('express');
const { supabase } = require('../config/supabase');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Supabase Auth로 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    // 프로필은 트리거에 의해 자동 생성됨
    res.status(201).json({
      message: '회원가입이 완료되었습니다. 이메일 확인을 해주세요.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Supabase Auth로 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(400).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 프로필 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('프로필 조회 오류:', profileError);
      return res.status(500).json({ message: '프로필 조회 오류가 발생했습니다.' });
    }

    // 마지막 로그인 시간 업데이트
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', authData.user.id);

    res.json({
      message: '로그인 성공',
      session: authData.session,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        subscription: profile.subscription,
        subscriptionStatus: profile.subscription_status
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 정보 조회
router.get('/me', auth, async (req, res) => {
  try {
    // 프로필 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (profileError) {
      console.error('프로필 조회 오류:', profileError);
      return res.status(500).json({ message: '프로필 조회 오류가 발생했습니다.' });
    }

    res.json({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        subscription: profile.subscription,
        subscriptionStatus: profile.subscription_status,
        subscriptionEndDate: profile.subscription_end_date
      }
    });
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;