// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { CreditCard, CheckCircle, AlertCircle, Clock, RefreshCw, Mail } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { SubscriptionCard } from '@/components/SubscriptionCard';
// @ts-ignore;
import { CurrentSubscription } from '@/components/CurrentSubscription';
// @ts-ignore;
import { PaymentStatusSync } from '@/components/PaymentStatusSync';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function SubscriptionContent(props) {
  const {
    $w,
    style
  } = props;
  const [subscriptions, setSubscriptions] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [paymentProviders, setPaymentProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();

  // 获取实验变体
  const pricingExperiment = useExperiment('pricing_display');
  const checkoutExperiment = useExperiment('checkout_flow');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadSubscriptionData, 30000);
  useEffect(() => {
    loadSubscriptionData();
  }, []);
  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subscriptionsResult, providersResult, currentResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_payment_provider',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId
              },
              status: {
                $in: ['active', 'pending', 'past_due']
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1,
          pageNumber: 1
        }
      }))]);
      setSubscriptions(subscriptionsResult.records || []);
      setPaymentProviders(providersResult.records || []);
      setCurrentSubscription(currentResult.records?.[0] || null);
      setLoading(false);
    } catch (error) {
      toast({
        title: "数据加载失败",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  const handleRefreshPayments = async () => {
    setRefreshing(true);
    try {
      await loadSubscriptionData();
      toast({
        title: "支付记录已更新",
        description: "所有支付记录已同步最新状态",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };
  const handleSubscribe = async plan => {
    try {
      // 创建订阅记录
      const subscription = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            userId: $w.auth.currentUser?.userId,
            planId: plan.id,
            status: 'pending',
            amount: plan.price,
            currency: 'CNY',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      }));

      // 记录支付事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId,
            event: 'subscription_created',
            event_category: 'conversion',
            event_label: plan.name,
            value: plan.price,
            timestamp: new Date()
          }
        }
      }));
      toast({
        title: "订阅创建成功",
        description: `正在跳转到支付页面...`,
        variant: "default"
      });

      // 模拟支付流程
      setTimeout(() => {
        handlePaymentComplete(subscription.id);
      }, 3000);
    } catch (error) {
      toast({
        title: "订阅创建失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handlePaymentComplete = async subscriptionId => {
    try {
      // 更新订阅状态为active
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: 'active',
            updatedAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: subscriptionId
              }
            }
          }
        }
      }));

      // 发送确认邮件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_email_notification',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            recipient: $w.auth.currentUser?.email,
            subject: '订阅成功确认',
            content: `
              <h2>订阅成功！</h2>
              <p>感谢您订阅AI太极服务。</p>
              <p>您的订阅已激活，可以开始使用所有功能。</p>
            `,
            status: 'pending',
            createdAt: new Date(),
            type: 'subscription_confirmation'
          }
        }
      }));
      toast({
        title: "支付成功",
        description: "订阅已激活，欢迎开始使用！",
        variant: "default"
      });

      // 重新加载数据
      loadSubscriptionData();
    } catch (error) {
      toast({
        title: "支付处理失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleCancelSubscription = async subscriptionId => {
    try {
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: 'cancelled',
            updatedAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: subscriptionId
              }
            }
          }
        }
      }));
      toast({
        title: "订阅已取消",
        description: "您的订阅将在当前周期结束后终止",
        variant: "default"
      });
      loadSubscriptionData();
    } catch (error) {
      toast({
        title: "取消失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4 text-sm sm:text-base">{t('common.loading')}</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            {t('subscription.title', '订阅管理')}
            <span className="text-red-500 block mt-2">{t('subscription.subtitle', '灵活选择')}</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            选择最适合您的订阅计划，享受AI太极的完整功能
          </p>
        </div>

        {/* Payment Status Sync */}
        <div className="mb-8">
          <PaymentStatusSync $w={$w} subscriptions={subscriptions} onStatusUpdate={loadSubscriptionData} />
        </div>

        {/* Current Subscription */}
        {currentSubscription && <div className="mb-8">
            <CurrentSubscription subscription={currentSubscription} onCancel={handleCancelSubscription} />
          </div>}

        {/* Subscription Plans */}
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8">
          {[{
          id: 'basic',
          name: '基础版',
          price: 99,
          features: ['基础AI代理', '5个工作流', '邮件支持'],
          popular: false
        }, {
          id: 'pro',
          name: '专业版',
          price: 299,
          features: ['高级AI代理', '无限工作流', '优先支持', 'API访问'],
          popular: true
        }, {
          id: 'enterprise',
          name: '企业版',
          price: 999,
          features: ['企业级AI代理', '无限工作流', '24/7支持', '专属顾问'],
          popular: false
        }].map(plan => <SubscriptionCard key={plan.id} plan={plan} onSubscribe={handleSubscribe} currentPlan={currentSubscription?.planId} />)}
        </div>

        {/* Payment History */}
        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-white text-lg sm:text-xl">支付记录</CardTitle>
              <Button onClick={handleRefreshPayments} disabled={refreshing} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto">
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                刷新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {subscriptions.map(subscription => <div key={subscription._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-800 rounded-lg gap-2 sm:gap-0">
                  <div className="flex-1">
                    <div className="text-white font-semibold text-sm sm:text-base">
                      {subscription.planId === 'basic' ? '基础版' : subscription.planId === 'pro' ? '专业版' : '企业版'}
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm">
                      ¥{subscription.amount} - {new Date(subscription.createdAt).toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                  <Badge className={`${subscription.status === 'active' ? 'bg-green-500' : subscription.status === 'pending' ? 'bg-yellow-500' : subscription.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'} text-white text-xs sm:text-sm`}>
                    {subscription.status === 'active' ? '已激活' : subscription.status === 'pending' ? '待支付' : subscription.status === 'failed' ? '支付失败' : '已取消'}
                  </Badge>
                </div>)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}
export default function SubscriptionPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <SubscriptionContent {...props} />
    </ExperimentProvider>;
}