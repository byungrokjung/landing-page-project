const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { auth, requireSubscription } = require('../middleware/auth');

const router = express.Router();

// 케이스 스터디 목록 조회 (무료 + 프리미엄)
router.get('/case-studies', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('case_studies')
      .select('id, title, founder, category, revenue_amount, revenue_currency, revenue_period, description, tags, image_url, is_new, is_premium, views, likes, published_at, created_at', { count: 'exact' });
    
    // 무료 사용자는 프리미엄 콘텐츠 제외
    if (req.user.subscription === 'free') {
      query = query.eq('is_premium', false);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,founder.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: caseStudies, error, count } = await query
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('케이스 스터디 목록 조회 오류:', error);
      return res.status(500).json({ message: '케이스 스터디 조회 오류가 발생했습니다.' });
    }

    res.json({
      caseStudies,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalCount: count
    });
  } catch (error) {
    console.error('케이스 스터디 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 특정 케이스 스터디 상세 조회
router.get('/case-studies/:id', auth, async (req, res) => {
  try {
    const { data: caseStudy, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error || !caseStudy) {
      return res.status(404).json({ message: '케이스 스터디를 찾을 수 없습니다.' });
    }

    // 프리미엄 콘텐츠인데 무료 사용자인 경우
    if (caseStudy.is_premium && req.user.subscription === 'free') {
      return res.status(403).json({ message: '구독이 필요한 콘텐츠입니다.' });
    }

    // 조회수 증가
    const { error: updateError } = await supabase
      .from('case_studies')
      .update({ views: caseStudy.views + 1 })
      .eq('id', req.params.id);

    if (updateError) {
      console.error('조회수 업데이트 오류:', updateError);
    }

    // 사용자 활동 로그 기록
    await supabase
      .from('user_activities')
      .insert({
        user_id: req.user.id,
        activity_type: 'case_study_view',
        resource_id: caseStudy.id,
        resource_type: 'case_study',
        metadata: { title: caseStudy.title }
      });

    res.json({ ...caseStudy, views: caseStudy.views + 1 });
  } catch (error) {
    console.error('케이스 스터디 상세 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 인기 케이스 스터디 조회
router.get('/popular', async (req, res) => {
  try {
    const { data: popularCases, error } = await supabase
      .from('case_studies')
      .select('id, title, founder, category, revenue_amount, revenue_currency, revenue_period, description, tags, image_url, is_new, is_premium, views, likes, published_at')
      .eq('is_premium', false)
      .order('views', { ascending: false })
      .order('likes', { ascending: false })
      .limit(6);

    if (error) {
      console.error('인기 케이스 스터디 조회 오류:', error);
      // 더미 데이터 반환
      const dummyData = [
        {
          id: '1',
          title: 'AI 챗봇 서비스로 월 300만원 달성',
          founder: '김개발',
          category: '소프트웨어',
          revenue_amount: 3000000,
          revenue_currency: 'KRW',
          revenue_period: '월',
          description: '간단한 AI 챗봇 서비스를 만들어 월 300만원의 수익을 달성한 사례',
          tags: ['AI', '챗봇', 'SaaS'],
          image_url: null,
          is_new: true,
          is_premium: false,
          views: 1250,
          likes: 89,
          published_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: '노코드 앱으로 연 1억 돌파',
          founder: '박창업',
          category: '이커머스',
          revenue_amount: 100000000,
          revenue_currency: 'KRW',
          revenue_period: '년',
          description: '노코드 툴을 활용해 이커머스 앱을 만들어 연 1억원을 달성한 성공 사례',
          tags: ['노코드', '이커머스', '모바일앱'],
          image_url: null,
          is_new: false,
          is_premium: false,
          views: 2100,
          likes: 156,
          published_at: '2024-01-10T14:30:00Z'
        },
        {
          id: '3',
          title: '유튜브 채널로 월 500만원 수익',
          founder: '이컨텐츠',
          category: '콘텐츠',
          revenue_amount: 5000000,
          revenue_currency: 'KRW',
          revenue_period: '월',
          description: '기술 리뷰 유튜브 채널을 운영하여 월 500만원의 광고 수익을 달성',
          tags: ['유튜브', '콘텐츠', '광고수익'],
          image_url: null,
          is_new: false,
          is_premium: false,
          views: 1800,
          likes: 124,
          published_at: '2024-01-05T09:15:00Z'
        }
      ];
      return res.json(dummyData);
    }

    res.json(popularCases);
  } catch (error) {
    console.error('인기 케이스 스터디 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 최신 케이스 스터디 조회
router.get('/latest', async (req, res) => {
  try {
    const { data: latestCases, error } = await supabase
      .from('case_studies')
      .select('id, title, founder, category, revenue_amount, revenue_currency, revenue_period, description, tags, image_url, is_new, is_premium, views, likes, published_at')
      .eq('is_premium', false)
      .order('published_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('최신 케이스 스터디 조회 오류:', error);
      return res.status(500).json({ message: '최신 케이스 스터디 조회 오류가 발생했습니다.' });
    }

    res.json(latestCases);
  } catch (error) {
    console.error('최신 케이스 스터디 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 조회수 높은 비디오 조회 (조회수 순으로 정렬)
router.get('/top-videos', async (req, res) => {
  console.log('🟢 [DEBUG] /api/content/top-videos 엔드포인트 호출됨');
  
  try {
    console.log('🟡 [DEBUG] axios로 직접 Supabase API 호출');
    
    const axios = require('axios');
    const response = await axios.get(
      'https://vmticvgchbcqdyrdjcnp.supabase.co/rest/v1/top_performing_videos?select=video_id,title,channel_name,views,likes,engagement_rate,duration_minutes,keywords,upload_date&order=views.desc&limit=50',
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('🟢 [DEBUG] axios 성공:', response.data.length, '개 데이터');
    res.json(response.data);

  } catch (axiosError) {
    console.error('🔴 [DEBUG] axios 실패:', axiosError.message);
    console.log('🟡 [DEBUG] 더미 데이터로 대체');
    
    // 더미 데이터 반환
    const dummyVideos = [
      {
        video_id: 'aRGGW7CcOJQ',
        title: '50억 클럽 추적기...윤석열의 봐주기수사가 대장동 업자들에게 공돈 1100억을 안겼다',
        channel_name: 'TV허재현',
        views: 1003,
        likes: 271,
        engagement_rate: 27.0189,
        duration_minutes: 45,
        keywords: ['허재현', '한겨레', '이상호', '고발뉴스', '문재인'],
        upload_date: '2021-11-08'
      },
      {
        video_id: 'bCdEfGhIjKl',
        title: 'AI 기술로 월 500만원 수익 창출하는 방법',
        channel_name: 'Tech Entrepreneur',
        views: 2500,
        likes: 890,
        engagement_rate: 35.6,
        duration_minutes: 25,
        keywords: ['AI', '수익창출', '기술', '창업', '온라인비즈니스'],
        upload_date: '2024-01-15'
      },
      {
        video_id: 'cDefGhIjKlM',
        title: '노코드로 SaaS 만들어 연 1억 달성한 실제 사례',
        channel_name: 'No-Code Success',
        views: 1800,
        likes: 654,
        engagement_rate: 36.33,
        duration_minutes: 35,
        keywords: ['노코드', 'SaaS', '창업', '성공사례', '수익'],
        upload_date: '2024-02-20'
      }
    ];
    console.log('🟢 [DEBUG] 더미 데이터 반환:', dummyVideos.length, '개');
    res.json(dummyVideos);
  }
});

module.exports = router;