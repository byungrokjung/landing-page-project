const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 뉴스레터 구독
router.post('/subscribe', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: '이메일은 필수입니다.' });
    }

    // 환영 이메일 발송
    const welcomeEmail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '히든 리치스에 오신 것을 환영합니다! 🎉',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #007bff;">환영합니다, ${name || '새로운 멤버'}님!</h1>
          <p>히든 리치스 뉴스레터 구독을 완료해주셔서 감사합니다.</p>
          <p>앞으로 매주 월·수·금마다 최신 비즈니스 성공 사례와 전략을 받아보실 수 있습니다.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>📊 무료로 받을 수 있는 것들:</h3>
            <ul>
              <li>주 3회 최신 케이스 스터디</li>
              <li>해외 성공 사례 분석</li>
              <li>실전 마케팅 전략</li>
              <li>독점 비즈니스 인사이트</li>
            </ul>
          </div>
          
          <p>더 많은 프리미엄 콘텐츠를 원하신다면 언제든 구독을 업그레이드하실 수 있습니다.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background: #007bff; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              히든 리치스 방문하기
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            이 이메일이 스팸함에 들어가지 않도록 주소록에 추가해주세요!
          </p>
        </div>
      `
    };

    await transporter.sendMail(welcomeEmail);

    res.json({ 
      message: '뉴스레터 구독이 완료되었습니다! 환영 이메일을 확인해주세요.',
      success: true 
    });
  } catch (error) {
    console.error('뉴스레터 구독 오류:', error);
    res.status(500).json({ 
      message: '뉴스레터 구독 처리 중 오류가 발생했습니다.',
      success: false 
    });
  }
});

// 문의하기 이메일 발송
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: '모든 필수 필드를 입력해주세요.' });
    }

    // 관리자에게 문의 내용 전송
    const contactEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // 관리자 이메일
      subject: `[히든 리치스 문의] ${subject || '제목 없음'}`,
      html: `
        <h2>새로운 문의가 도착했습니다.</h2>
        <p><strong>이름:</strong> ${name}</p>
        <p><strong>이메일:</strong> ${email}</p>
        <p><strong>제목:</strong> ${subject || '제목 없음'}</p>
        <p><strong>내용:</strong></p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      `
    };

    // 사용자에게 자동 응답 이메일 전송
    const autoReplyEmail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '문의 접수 완료 - 히든 리치스',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #007bff;">문의 접수가 완료되었습니다</h1>
          <p>안녕하세요, ${name}님!</p>
          <p>히든 리치스에 문의해주셔서 감사합니다.</p>
          <p>24-48시간 내에 답변드리겠습니다.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3>접수된 문의 내용:</h3>
            <p><strong>제목:</strong> ${subject || '제목 없음'}</p>
            <p><strong>내용:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p>감사합니다.</p>
          <p>히든 리치스 팀</p>
        </div>
      `
    };

    await Promise.all([
      transporter.sendMail(contactEmail),
      transporter.sendMail(autoReplyEmail)
    ]);

    res.json({ 
      message: '문의가 성공적으로 접수되었습니다. 답변 이메일을 확인해주세요.',
      success: true 
    });
  } catch (error) {
    console.error('문의 이메일 발송 오류:', error);
    res.status(500).json({ 
      message: '문의 처리 중 오류가 발생했습니다.',
      success: false 
    });
  }
});

module.exports = router;