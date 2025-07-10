const { supabase } = require('../config/supabase');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '토큰이 필요합니다.' });
    }

    // Supabase 세션 검증
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }

    // 프로필 정보 조회
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return res.status(401).json({ message: '사용자 정보 조회에 실패했습니다.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: profile.name,
      subscription: profile.subscription,
      subscription_status: profile.subscription_status
    };
    next();
  } catch (error) {
    res.status(401).json({ message: '토큰 검증에 실패했습니다.' });
  }
};

const requireSubscription = (req, res, next) => {
  if (req.user.subscription === 'free' || req.user.subscription_status !== 'active') {
    return res.status(403).json({ message: '구독이 필요한 콘텐츠입니다.' });
  }
  next();
};

module.exports = { auth, requireSubscription };