const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🚀 API 테스트 시작\n');

  try {
    // 1. Health Check
    console.log('1. Health Check 테스트...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', health.data.message);
    console.log('');

    // 2. 회원가입 테스트
    console.log('2. 회원가입 테스트...');
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'test123456',
      name: '테스트 사용자'
    };
    
    try {
      const register = await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('✅ 회원가입 성공:', register.data.message);
      console.log('');
    } catch (error) {
      console.log('❌ 회원가입 실패:', error.response?.data?.message || error.message);
      console.log('');
    }

    // 3. 케이스 스터디 목록 조회 테스트 (인증 없음)
    console.log('3. 인기 케이스 스터디 조회 테스트...');
    try {
      const popular = await axios.get(`${BASE_URL}/content/popular`);
      console.log('✅ 인기 케이스 스터디:', popular.data.length + '개');
      console.log('');
    } catch (error) {
      console.log('❌ 인기 케이스 스터디 조회 실패:', error.response?.data?.message || error.message);
      console.log('');
    }

    // 4. 최신 케이스 스터디 조회 테스트
    console.log('4. 최신 케이스 스터디 조회 테스트...');
    try {
      const latest = await axios.get(`${BASE_URL}/content/latest`);
      console.log('✅ 최신 케이스 스터디:', latest.data.length + '개');
      console.log('');
    } catch (error) {
      console.log('❌ 최신 케이스 스터디 조회 실패:', error.response?.data?.message || error.message);
      console.log('');
    }

  } catch (error) {
    console.log('❌ API 테스트 중 오류 발생:', error.message);
  }
}

// 서버가 실행되기까지 기다린 후 테스트 실행
setTimeout(testAPI, 3000);