const { supabaseAdmin } = require('./config/supabase');
const fs = require('fs');
const path = require('path');

async function createAITrendsTables() {
  try {
    console.log('🚀 Creating AI trends tables...');
    
    // SQL 스키마 파일 읽기
    const schemaPath = path.join(__dirname, 'database', 'ai-trends-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    // SQL을 세미콜론으로 분리해서 실행
    const statements = schemaSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
      
      const { data, error } = await supabaseAdmin.rpc('exec_sql', {
        sql: statement
      });
      
      if (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error);
        
        // 일부 오류는 무시 (테이블이 이미 존재하는 경우 등)
        if (!error.message.includes('already exists')) {
          throw error;
        } else {
          console.log('⚠️ Table already exists, skipping...');
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }
    
    // 테이블 생성 확인
    const { data: tables, error: tableError } = await supabaseAdmin
      .from('ai_trends_jobs')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table verification failed:', tableError);
      throw tableError;
    }
    
    console.log('✅ AI trends tables created successfully!');
    
    // 샘플 데이터 추가
    console.log('📊 Adding sample data...');
    
    const sampleJobId = `sample_job_${Date.now()}`;
    
    // 샘플 작업 추가
    const { data: job, error: jobError } = await supabaseAdmin
      .from('ai_trends_jobs')
      .insert({
        job_id: sampleJobId,
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString()
      })
      .select();
    
    if (jobError) {
      console.error('❌ Error adding sample job:', jobError);
    } else {
      console.log('✅ Sample job added');
    }
    
    // 샘플 트렌드 데이터 추가
    const sampleTrends = [
      {
        job_id: sampleJobId,
        trend_title: 'GPT-4 Turbo의 새로운 성능 개선사항',
        trend_category: 'Language Models',
        confidence: 0.95,
        source: 'OpenAI Blog',
        source_url: 'https://openai.com/blog/gpt-4-turbo',
        content: 'OpenAI가 GPT-4 Turbo의 성능 개선사항을 발표했습니다. 더 빠른 응답 속도와 향상된 정확도를 제공합니다.',
        tags: ['GPT-4', 'Performance', 'OpenAI', 'Language Model']
      },
      {
        job_id: sampleJobId,
        trend_title: 'Claude 3.5 Sonnet의 코딩 능력 향상',
        trend_category: 'AI Reasoning',
        confidence: 0.92,
        source: 'Anthropic Blog',
        source_url: 'https://anthropic.com/claude-3-5-sonnet',
        content: 'Anthropic의 Claude 3.5 Sonnet이 코딩 작업에서 인간 수준의 성능을 보여주고 있습니다.',
        tags: ['Claude', 'Coding', 'Anthropic', 'AI Reasoning']
      },
      {
        job_id: sampleJobId,
        trend_title: '컴퓨터 비전 분야의 2024년 혁신',
        trend_category: 'Computer Vision',
        confidence: 0.88,
        source: 'arXiv Papers',
        source_url: 'https://arxiv.org/list/cs.CV/recent',
        content: '2024년 컴퓨터 비전 분야에서 주목할 만한 연구 성과들이 발표되고 있습니다.',
        tags: ['Computer Vision', '2024', 'Research', 'Innovation']
      },
      {
        job_id: sampleJobId,
        trend_title: '엣지 AI 칩셋의 전력 효율성 향상',
        trend_category: 'Edge Computing',
        confidence: 0.85,
        source: 'IEEE Spectrum',
        source_url: 'https://spectrum.ieee.org/edge-ai',
        content: '새로운 엣지 AI 칩셋들이 10배 향상된 전력 효율성을 달성했습니다.',
        tags: ['Edge AI', 'Power Efficiency', 'Hardware', 'Innovation']
      },
      {
        job_id: sampleJobId,
        trend_title: '멀티모달 AI 시스템의 혁신적 발전',
        trend_category: 'Machine Learning',
        confidence: 0.91,
        source: 'Nature AI',
        source_url: 'https://nature.com/articles/ai',
        content: '멀티모달 AI 시스템이 텍스트, 이미지, 음성을 통합적으로 처리하는 새로운 방법을 제시했습니다.',
        tags: ['Multimodal', 'AI Systems', 'Integration', 'Innovation']
      }
    ];
    
    const { data: trendsData, error: trendsError } = await supabaseAdmin
      .from('ai_trends_data')
      .insert(sampleTrends)
      .select();
    
    if (trendsError) {
      console.error('❌ Error adding sample trends:', trendsError);
    } else {
      console.log(`✅ ${trendsData.length} sample trends added`);
    }
    
    console.log('🎉 Setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// 직접 실행된 경우
if (require.main === module) {
  createAITrendsTables()
    .then(() => {
      console.log('✅ All done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { createAITrendsTables };