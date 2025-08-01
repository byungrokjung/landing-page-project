const { supabase, supabaseAdmin } = require('./config/supabase');
require('dotenv').config();

async function simpleSupabaseTest() {
  console.log('🧪 간단한 Supabase 테스트...\n');

  try {
    // NODE_TLS_REJECT_UNAUTHORIZED 임시 제거
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    
    console.log('🔍 AI trends jobs 테이블 테스트...');
    
    // 직접 쿼리 실행
    const { data, error, count } = await supabaseAdmin
      .from('ai_trends_jobs')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      console.log('❌ 오류:', error.message);
      console.log('오류 상세:', error);
    } else {
      console.log('✅ 성공!');
      console.log('- 테이블 접근 성공');
      console.log('- 현재 레코드 수:', count);
      console.log('- 데이터:', data);
    }

    // 테스트 데이터 삽입
    console.log('\n🔍 테스트 데이터 삽입...');
    const testJobId = `test_${Date.now()}`;
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('ai_trends_jobs')
      .insert({
        job_id: testJobId,
        status: 'completed',
        progress: 100
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ 삽입 실패:', insertError.message);
    } else {
      console.log('✅ 삽입 성공:', insertData.job_id);
      
      // 정리
      await supabaseAdmin
        .from('ai_trends_jobs')
        .delete()
        .eq('job_id', testJobId);
      console.log('🧹 테스트 데이터 정리됨');
    }

  } catch (error) {
    console.error('❌ 예외 발생:', error.message);
    console.error('전체 오류:', error);
  }
}

simpleSupabaseTest();