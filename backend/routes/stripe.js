const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { priceId, planName } = req.body;
    
    // 사용자 인증 확인 (선택적)
    const userId = req.user?.id || 'anonymous';
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment/cancel`,
      metadata: {
        userId: userId,
        planName: planName
      },
      // 한국어 설정
      locale: 'ko',
      // 고객 이메일 수집
      customer_email: req.user?.email || undefined,
      // 할인 코드 허용
      allow_promotion_codes: true,
      // 청구 주소 수집
      billing_address_collection: 'required',
    });

    res.json({ 
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Stripe checkout session 생성 오류:', error);
    res.status(500).json({ 
      error: '결제 세션 생성에 실패했습니다.',
      details: error.message 
    });
  }
});

// Stripe Webhook Handler
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('결제 세션 완료:', session.id);
      
      // 구독 정보를 데이터베이스에 저장
      try {
        await handleSubscriptionCreated(session);
      } catch (error) {
        console.error('구독 생성 처리 오류:', error);
      }
      break;

    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('구독 생성됨:', subscription.id);
      break;

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('구독 업데이트됨:', updatedSubscription.id);
      
      try {
        await handleSubscriptionUpdated(updatedSubscription);
      } catch (error) {
        console.error('구독 업데이트 처리 오류:', error);
      }
      break;

    case 'customer.subscription.deleted':
      const canceledSubscription = event.data.object;
      console.log('구독 취소됨:', canceledSubscription.id);
      
      try {
        await handleSubscriptionCanceled(canceledSubscription);
      } catch (error) {
        console.error('구독 취소 처리 오류:', error);
      }
      break;

    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('결제 실패:', failedInvoice.id);
      
      try {
        await handlePaymentFailed(failedInvoice);
      } catch (error) {
        console.error('결제 실패 처리 오류:', error);
      }
      break;

    default:
      console.log(`처리되지 않은 이벤트 타입: ${event.type}`);
  }

  res.json({received: true});
});

// Get customer's subscription info
router.get('/subscription/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return res.json({ 
        hasActiveSubscription: false,
        plan: 'free'
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    // Price ID를 기반으로 플랜 결정
    let planName = 'free';
    if (priceId === 'price_1234567890') { // 프로 플랜
      planName = 'pro';
    } else if (priceId === 'price_0987654321') { // 엔터프라이즈 플랜
      planName = 'enterprise';
    }

    res.json({
      hasActiveSubscription: true,
      plan: planName,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('구독 정보 조회 오류:', error);
    res.status(500).json({ 
      error: '구독 정보를 가져올 수 없습니다.',
      details: error.message 
    });
  }
});

// Cancel subscription
router.post('/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    res.json({ 
      success: true,
      subscription: {
        id: subscription.id,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: subscription.current_period_end
      }
    });
  } catch (error) {
    console.error('구독 취소 오류:', error);
    res.status(500).json({ 
      error: '구독 취소에 실패했습니다.',
      details: error.message 
    });
  }
});

// Helper functions
async function handleSubscriptionCreated(session) {
  // 여기서 Supabase에 구독 정보 저장
  const { supabase } = require('../config/supabase');
  
  try {
    const { error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: session.metadata.userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan_name: session.metadata.planName,
          status: 'active',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw error;
    }

    console.log('구독 정보가 데이터베이스에 저장되었습니다.');
  } catch (error) {
    console.error('데이터베이스 저장 오류:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  const { supabase } = require('../config/supabase');
  
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        updated_at: new Date().toISOString()
      })
      .match({ stripe_subscription_id: subscription.id });

    if (error) {
      throw error;
    }

    console.log('구독 상태가 업데이트되었습니다.');
  } catch (error) {
    console.error('구독 업데이트 오류:', error);
  }
}

async function handleSubscriptionCanceled(subscription) {
  const { supabase } = require('../config/supabase');
  
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString()
      })
      .match({ stripe_subscription_id: subscription.id });

    if (error) {
      throw error;
    }

    console.log('구독이 취소되었습니다.');
  } catch (error) {
    console.error('구독 취소 처리 오류:', error);
  }
}

async function handlePaymentFailed(invoice) {
  const { supabase } = require('../config/supabase');
  
  try {
    // 결제 실패 로그 저장
    const { error } = await supabase
      .from('payment_failures')
      .insert([
        {
          stripe_invoice_id: invoice.id,
          stripe_customer_id: invoice.customer,
          amount: invoice.amount_due,
          currency: invoice.currency,
          failure_reason: invoice.last_finalization_error?.message || 'Unknown',
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      throw error;
    }

    console.log('결제 실패가 기록되었습니다.');
  } catch (error) {
    console.error('결제 실패 기록 오류:', error);
  }
}

module.exports = router;