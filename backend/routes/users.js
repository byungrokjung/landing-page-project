const express = require('express');
const { supabase } = require('../config/supabase');
const { auth } = require('../middleware/auth');

const router = express.Router();

// 사용자 프로필 조회
router.get('/profile', auth, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('프로필 조회 오류:', error);
      return res.status(500).json({ message: '프로필 조회 오류가 발생했습니다.' });
    }

    res.json(profile);
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 프로필 업데이트
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // 이메일 중복 확인 (본인 제외)
    if (email && email !== req.user.email) {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .neq('id', req.user.id)
        .single();
      
      if (existingUser) {
        return res.status(400).json({ message: '이미 사용 중인 이메일입니다.' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', req.user.id)
      .select('*')
      .single();

    if (error) {
      console.error('프로필 업데이트 오류:', error);
      return res.status(500).json({ message: '프로필 업데이트 오류가 발생했습니다.' });
    }

    res.json({
      message: '프로필이 업데이트되었습니다.',
      user: updatedProfile
    });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 비밀번호 변경
router.put('/change-password', auth, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: '새 비밀번호를 입력해주세요.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: '새 비밀번호는 최소 6자 이상이어야 합니다.' });
    }

    // Supabase Auth로 비밀번호 변경
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('비밀번호 변경 오류:', error);
      return res.status(400).json({ message: '비밀번호 변경에 실패했습니다.' });
    }

    res.json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (error) {
    console.error('비밀번호 변경 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 계정 삭제
router.delete('/account', auth, async (req, res) => {
  try {
    // TODO: Stripe 구독이 있다면 취소 처리

    // Supabase Auth에서 사용자 삭제 (관리자 권한 필요)
    const { supabaseAdmin } = require('../config/supabase');
    const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user.id);

    if (error) {
      console.error('계정 삭제 오류:', error);
      return res.status(500).json({ message: '계정 삭제에 실패했습니다.' });
    }

    res.json({ message: '계정이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('계정 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

module.exports = router;