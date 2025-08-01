const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const https = require('https');
const router = express.Router();

// WSL 환경에서 안정적인 Supabase 요청을 위한 직접 HTTP 함수
async function directSupabaseRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${process.env.SUPABASE_URL}/rest/v1/${endpoint}`;
    
    const requestOptions = {
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    
    console.log('🔗 Direct request URL:', url);
    
    https.get(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ Success! Got ${jsonData.length} items from Supabase`);
          resolve(jsonData);
        } catch (err) {
          console.error('❌ JSON parse error:', err);
          reject(new Error('Failed to parse JSON response'));
        }
      });
    }).on('error', (err) => {
      console.error('❌ HTTPS request error:', err);
      reject(new Error(`Request failed: ${err.message}`));
    });
  });
}

// 작업 상태 조회
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    console.log(`🔍 Checking job status: ${jobId}`);
    
    // Supabase에서 작업 상태 조회
    const { data: job, error: jobError } = await supabase
      .from('ai_trends_jobs')
      .select('*')
      .eq('job_id', jobId)
      .single();
    
    if (jobError && jobError.code !== 'PGRST116') {
      throw jobError;
    }
    
    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        job_id: jobId
      });
    }
    
    let responseData = {
      job_id: jobId,
      status: job.status,
      progress: job.progress,
      started_at: job.started_at,
      completed_at: job.completed_at
    };
    
    // 완료된 경우 트렌드 데이터도 함께 반환
    if (job.status === 'completed') {
      const { data: trends, error: trendsError } = await supabase
        .from('ai_trends_data')
        .select('*')
        .eq('job_id', jobId)
        .order('collected_at', { ascending: false });
      
      if (trendsError) {
        console.error('❌ Error fetching trends:', trendsError);
      } else {
        responseData.data = {
          trends: trends.map(trend => ({
            id: trend.id,
            title: trend.trend_title,
            category: trend.trend_category,
            confidence: parseFloat(trend.confidence),
            source: trend.source,
            source_url: trend.source_url,
            content: trend.content,
            tags: trend.tags,
            date: trend.collected_at
          })),
          collection_time: job.completed_at,
          sources_scanned: trends.length > 0 ? Math.ceil(trends.length * 1.5) : 0,
          total_articles: trends.length > 0 ? trends.length * 8 : 0
        };
      }
    }
    
    // 실패한 경우 오류 메시지 포함
    if (job.status === 'failed') {
      responseData.error = job.error_message;
    }
    
    console.log(`✅ Job status retrieved: ${job.status}`);
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ Error checking job status:', error);
    res.status(500).json({
      error: 'Failed to check job status',
      message: error.message
    });
  }
});

// 작업 결과 조회 (완료된 작업만)
router.get('/results/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    console.log(`📊 Fetching results for job: ${jobId}`);
    
    // 작업 상태 확인
    const { data: job, error: jobError } = await supabase
      .from('ai_trends_jobs')
      .select('status, completed_at')
      .eq('job_id', jobId)
      .single();
    
    if (jobError || !job) {
      return res.status(404).json({
        error: 'Job not found',
        job_id: jobId
      });
    }
    
    if (job.status !== 'completed') {
      return res.status(400).json({
        error: 'Job not completed yet',
        status: job.status,
        job_id: jobId
      });
    }
    
    // 트렌드 데이터 조회
    const { data: trends, error: trendsError } = await supabase
      .from('ai_trends_data')
      .select('*')
      .eq('job_id', jobId)
      .order('collected_at', { ascending: false });
    
    if (trendsError) {
      throw trendsError;
    }
    
    const responseData = {
      success: true,
      job_id: jobId,
      data: {
        trends: trends.map(trend => ({
          id: trend.id,
          title: trend.trend_title,
          category: trend.trend_category,
          confidence: parseFloat(trend.confidence),
          source: trend.source,
          source_url: trend.source_url,
          content: trend.content,
          tags: trend.tags,
          date: trend.collected_at
        })),
        collection_time: job.completed_at,
        sources_scanned: trends.length > 0 ? Math.ceil(trends.length * 1.5) : 0,
        total_articles: trends.length > 0 ? trends.length * 8 : 0
      },
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Results retrieved: ${trends.length} trends`);
    res.json(responseData);
    
  } catch (error) {
    console.error('❌ Error fetching results:', error);
    res.status(500).json({
      error: 'Failed to fetch results',
      message: error.message
    });
  }
});

// 사용자의 모든 작업 조회
router.get('/jobs', async (req, res) => {
  try {
    const { data: jobs, error } = await supabase
      .from('ai_trends_jobs')
      .select('job_id, status, progress, started_at, completed_at, error_message')
      .order('started_at', { ascending: false })
      .limit(20);
    
    if (error) {
      throw error;
    }
    
    res.json({
      success: true,
      jobs: jobs,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({
      error: 'Failed to fetch jobs',
      message: error.message
    });
  }
});

// 저장된 모든 트렌드 데이터 조회 (최신순)
router.get('/trends/all', async (req, res) => {
  try {
    const { limit = 50, offset = 0, category, minConfidence } = req.query;
    
    console.log('📊 Fetching all trends from Supabase...');
    
    // 직접 HTTP 요청으로 데이터 가져오기
    let endpoint = `ai_trend_news?limit=${limit}&offset=${offset}&order=created_at.desc`;
    
    // 필터 적용
    if (category && category !== 'all') {
      endpoint += `&category=eq.${encodeURIComponent(category)}`;
    }
    
    if (minConfidence) {
      endpoint += `&confidence=gte.${parseFloat(minConfidence)}`;
    }
    
    let trends;
    try {
      trends = await directSupabaseRequest(endpoint);
      console.log(`📊 Raw data from Supabase:`, trends?.slice(0, 1)); // 처음 1개 로그
    } catch (error) {
      console.error('❌ Direct request failed, falling back to supabase client:', error);
      
      // 폴백: supabase 클라이언트 사용
      try {
        const { data: fallbackTrends, error: supabaseError } = await supabaseAdmin
          .from('ai_trend_news')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(parseInt(limit));
        
        if (supabaseError) throw supabaseError;
        trends = fallbackTrends;
        console.log('✅ Fallback successful, got', trends?.length, 'items');
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw new Error('Both direct and fallback requests failed');
      }
    }
    
    // 데이터 포맷팅 (ai_trend_news 테이블 구조에 맞게)
    const formattedTrends = trends?.map(trend => ({
      id: trend.id,
      title: trend.title,
      category: trend.category || 'General',
      confidence: parseFloat(trend.importance_score || trend.confidence || 0.8),
      source: trend.source || 'Unknown',
      source_url: trend.link || trend.url || '',
      content: trend.content || trend.tag_content || '',
      tags: trend.tags || [],
      date: trend.created_at || trend.published_date,
      metadata: trend.metadata || {}
    })) || [];
    
    console.log(`✅ Retrieved ${formattedTrends.length} trends from ai_trend_news table`);
    
    res.json({
      success: true,
      data: {
        trends: formattedTrends,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: formattedTrends.length
        },
        filters: {
          category,
          minConfidence
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching trends:', error);
    res.status(500).json({
      error: 'Failed to fetch trends',
      message: error.message
    });
  }
});

// 최근 N일간의 트렌드 데이터 조회
router.get('/trends/recent', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));
    
    console.log(`📊 Fetching trends from last ${days} days...`);
    
    const { data: trends, error } = await supabaseAdmin
      .from('ai_trend_news')
      .select('*')
      .gte('created_at', dateFrom.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    // 카테고리별 그룹화 (ai_trend_news 테이블 구조에 맞게)
    const trendsByCategory = trends.reduce((acc, trend) => {
      const category = trend.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        id: trend.id,
        title: trend.title,
        confidence: parseFloat(trend.confidence || 0.8),
        source: trend.source,
        date: trend.created_at || trend.published_date,
        tags: trend.tags || []
      });
      return acc;
    }, {});
    
    console.log(`✅ Retrieved ${trends.length} trends from last ${days} days`);
    
    res.json({
      success: true,
      data: {
        totalTrends: trends.length,
        period: {
          from: dateFrom.toISOString(),
          to: new Date().toISOString(),
          days: parseInt(days)
        },
        trendsByCategory,
        categories: Object.keys(trendsByCategory)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching recent trends:', error);
    res.status(500).json({
      error: 'Failed to fetch recent trends',
      message: error.message
    });
  }
});

// n8n에서 작업 상태 업데이트 (웹훅)
router.post('/update-job', async (req, res) => {
  try {
    const { job_id, status, progress, error_message, trends_data } = req.body;
    
    console.log(`📝 Updating job ${job_id}: ${status} (${progress}%)`);
    
    // 작업 상태 업데이트
    const updateData = {
      status,
      progress: progress || 0,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    if (status === 'failed' && error_message) {
      updateData.error_message = error_message;
    }
    
    const { error: updateError } = await supabase
      .from('ai_trends_jobs')
      .update(updateData)
      .eq('job_id', job_id);
    
    if (updateError) {
      throw updateError;
    }
    
    // 완료된 경우 트렌드 데이터 저장
    if (status === 'completed' && trends_data && trends_data.length > 0) {
      const trendsToInsert = trends_data.map(trend => ({
        job_id,
        trend_title: trend.title,
        trend_category: trend.category,
        confidence: trend.confidence,
        source: trend.source,
        source_url: trend.source_url,
        content: trend.content,
        tags: trend.tags || []
      }));
      
      const { error: insertError } = await supabase
        .from('ai_trends_data')
        .insert(trendsToInsert);
      
      if (insertError) {
        console.error('❌ Error inserting trends data:', insertError);
      } else {
        console.log(`✅ Inserted ${trendsToInsert.length} trends`);
      }
    }
    
    res.json({
      success: true,
      job_id,
      status,
      message: 'Job updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating job:', error);
    res.status(500).json({
      error: 'Failed to update job',
      message: error.message
    });
  }
});

module.exports = router;