
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// Stripe Webhook 事件处理
const WEBHOOK_EVENTS = {
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created'
};

// 邮件通知模板
const EMAIL_TEMPLATES = {
  SUBSCRIPTION_ACTIVATED: {
    subject: '订阅已激活 - AI太极',
    template: '您的订阅已成功激活，开始享受高级功能吧！'
  },
  SUBSCRIPTION_CANCELLED: {
    subject: '订阅已取消 - AI太极',
    template: '您的订阅已取消，当前周期结束后将不再扣费。'
  },
  PAYMENT_SUCCEEDED: {
    subject: '支付成功 - AI太极',
    template: '您的订阅费用已成功支付，感谢您的支持！'
  },
  PAYMENT_FAILED: {
    subject: '支付失败 - AI太极',
    template: '您的订阅费用支付失败，请更新支付方式。'
  }
};

// 处理订阅事件
async function handleSubscriptionEvent(event, data) {
  const {
    id: subscriptionId,
    customer: customerId,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    items,
    metadata = {}
  } = data;

  try {
    // 查找用户
    const userResult = await db.collection('taiji_user')
      .where({
        stripe_customer_id: customerId
      })
      .get();

    if (userResult.data.length === 0) {
      throw new Error('用户未找到');
    }

    const user = userResult.data[0];
    const plan = items.data[0].plan;

    // 更新订阅状态
    const subscriptionData = {
      user_id: user._id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      plan: {
        id: plan.id,
        name: plan.nickname || plan.id,
        price: plan.amount / 100,
        currency: plan.currency,
        interval: plan.interval
      },
      status: status,
      current_period_start: new Date(current_period_start * 1000),
      current_period_end: new Date(current_period_end * 1000),
      cancel_at_period_end: cancel_at_period_end,
      amount: plan.amount / 100,
      currency: plan.currency,
      updatedAt: new Date()
    };

    // 更新或创建订阅记录
    await db.collection('taiji_subscription')
      .where({
        stripe_subscription_id: subscriptionId
      })
      .update({
        data: subscriptionData
      })
      .catch(async () => {
        // 如果不存在则创建
        await db.collection('taiji_subscription').add({
          ...subscriptionData,
          createdAt: new Date()
        });
      });

    // 发送通知
    await sendNotification(user, event, subscriptionData);

    return {
      success: true,
      message: `订阅 ${event} 处理成功`
    };
  } catch (error) {
    console.error('处理订阅事件失败:', error);
    throw error;
  }
}

// 处理支付事件
async function handlePaymentEvent(event, data) {
  const {
    id: invoiceId,
    customer: customerId,
    subscription: subscriptionId,
    amount_paid,
    currency,
    status
  } = data;

  try {
    // 查找用户
    const userResult = await db.collection('taiji_user')
      .where({
        stripe_customer_id: customerId
      })
      .get();

    if (userResult.data.length === 0) {
      throw new Error('用户未找到');
    }

    const user = userResult.data[0];

    // 记录支付事件
    await db.collection('taiji_user_event').add({
      user_id: user._id,
      event: 'stripe_payment',
      event_category: 'payment',
      event_action: status,
      event_label: invoiceId,
      event_value: amount_paid / 100,
      currency: currency,
      metadata: {
        invoice_id: invoiceId,
        subscription_id: subscriptionId
      },
      timestamp: new Date()
    });

    // 发送支付通知
    const template = status === 'paid' ? 
      EMAIL_TEMPLATES.PAYMENT_SUCCEEDED : 
      EMAIL_TEMPLATES.PAYMENT_FAILED;

    await sendNotification(user, template.subject, template.template, {
      amount: amount_paid / 100,
      currency: currency.toUpperCase()
    });

    return {
      success: true,
      message: `支付 ${status} 处理成功`
    };
  } catch (error) {
    console.error('处理支付事件失败:', error);
    throw error;
  }
}

// 发送通知
async function sendNotification(user, subject, message, data = {}) {
  try {
    // 记录通知事件
    await db.collection('taiji_user_event').add({
      user_id: user._id,
      event: 'notification_sent',
      event_category: 'notification',
      event_action: 'email',
      event_label: subject,
      metadata: {
        subject,
        message,
        ...data
      },
      timestamp: new Date()
    });

    // 这里可以集成实际的邮件发送服务
    console.log(`发送邮件给用户 ${user.email}: ${subject}`);
    
    return {
      success: true,
      message: '通知已发送'
    };
  } catch (error) {
    console.error('发送通知失败:', error);
    throw error;
  }
}

// 主处理函数
exports.main = async (event, context) => {
  const { eventType, data } = event;

  try {
    console.log('收到 Stripe Webhook:', eventType);

    let result;
    switch (eventType) {
      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_CREATED:
      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_UPDATED:
      case WEBHOOK_EVENTS.CUSTOMER_SUBSCRIPTION_DELETED:
        result = await handleSubscriptionEvent(eventType, data);
        break;
      
      case WEBHOOK_EVENTS.INVOICE_PAYMENT_SUCCEEDED:
      case WEBHOOK_EVENTS.INVOICE_PAYMENT_FAILED:
        result = await handlePaymentEvent(eventType, data);
        break;
      
      default:
        console.log('未处理的事件类型:', eventType);
        result = {
          success: true,
          message: '事件类型未处理'
        };
    }

    return {
      code: 0,
      data: result,
      message: 'Webhook 处理成功'
    };
  } catch (error) {
    console.error('Webhook 处理失败:', error);
    return {
      code: -1,
      message: error.message
    };
  }
};
