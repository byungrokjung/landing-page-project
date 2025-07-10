const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_development_key');
const { supabase } = require('../config/supabase');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Stripe 결제 세션 생성
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { plan } = req.body; // 'monthly' or 'yearly'
    
    const prices = {
      monthly: 'price_monthly_id', // Stripe에서 생성한 가격 ID
      yearly: 'price_yearly_id'    // Stripe에서 생성한 가격 ID
    };

    if (!prices[plan]) {
      return res.status(400).json({ message: '유효하지 않은 구독 플랜입니다.' });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: prices[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      metadata: {
        userId: req.user.id,
        plan: plan
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('결제 세션 생성 오류:', error);
    res.status(500).json({ message: '결제 세션 생성에 실패했습니다.' });
  }
});

// 구독 상태 확인
router.get('/status', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('사용자 조회 오류:', error);
      return res.status(500).json({ message: '사용자 정보 조회 오류가 발생했습니다.' });
    }
    
    let subscriptionDetails = null;
    
    if (user.stripe_subscription_id) {
      try {
        subscriptionDetails = await stripe.subscriptions.retrieve(user.stripe_subscription_id);
      } catch (stripeError) {
        console.error('Stripe 구독 조회 오류:', stripeError);
      }
    }

    res.json({
      subscription: user.subscription,
      subscriptionStatus: user.subscription_status,
      subscriptionEndDate: user.subscription_end_date,
      stripeSubscription: subscriptionDetails
    });
  } catch (error) {
    console.error('구독 상태 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 구독 취소
router.post('/cancel', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('사용자 조회 오류:', error);
      return res.status(500).json({ message: '사용자 정보 조회 오류가 발생했습니다.' });
    }
    
    if (!user.stripe_subscription_id) {
      return res.status(400).json({ message: '활성화된 구독이 없습니다.' });
    }

    // Stripe에서 구독 취소
    await stripe.subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // 사용자 상태 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_status: 'cancelled' })
      .eq('id', req.user.id);

    if (updateError) {
      console.error('구독 상태 업데이트 오류:', updateError);
    }

    res.json({ message: '구독이 취소되었습니다. 현재 구독 기간이 끝날 때까지 이용할 수 있습니다.' });
  } catch (error) {
    console.error('구독 취소 오류:', error);
    res.status(500).json({ message: '구독 취소에 실패했습니다.' });
  }
});

// Stripe 웹훅 (결제 완료 처리)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('웹훅 서명 검증 실패:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;
        
        // 구독 정보 업데이트
        const { data: user, error: userError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (user && !userError) {
          // 구독 종료일 계산
          const endDate = new Date();
          if (plan === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              subscription: plan,
              subscription_status: 'active',
              stripe_customer_id: session.customer,
              subscription_end_date: endDate.toISOString()
            })
            .eq('id', userId);

          if (updateError) {
            console.error('구독 정보 업데이트 오류:', updateError);
          }
        }
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // 구독 상태 변경 처리
        const subscription = event.data.object;
        const { data: customer, error: customerError } = await supabase
          .from('profiles')
          .select('*')
          .eq('stripe_customer_id', subscription.customer)
          .single();
        
        if (customer && !customerError) {
          let updateData = {};
          
          if (event.type === 'customer.subscription.deleted') {
            updateData = {
              subscription: 'free',
              subscription_status: 'inactive',
              stripe_subscription_id: null
            };
          } else {
            updateData = {
              subscription_status: subscription.status
            };
          }
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', customer.id);

          if (updateError) {
            console.error('구독 상태 업데이트 오류:', updateError);
          }
        }
        break;

      default:
        console.log(`처리되지 않은 이벤트 타입: ${event.type}`);
    }

    res.json({received: true});
  } catch (error) {
    console.error('웹훅 처리 오류:', error);
    res.status(500).json({ message: '웹훅 처리 실패' });
  }
});

module.exports = router;