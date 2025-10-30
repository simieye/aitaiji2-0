// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Check, X, Star, Zap as AlipayIcon, Shield, CreditCard, DollarSign } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { PaymentProviderCard } from '@/components/PaymentProviderCard';
function SubscriptionContent(props) {
  const {
    $w,
    style
  } = props;
  const [subscriptions, setSubscriptions] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('stripe');
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const {
    toast
  } = useToast();

  // 支付提供商配置
  const paymentProviders = [{
    type: 'stripe',
    name: 'Stripe',
    description: '全球领先的支付处理平台',
    security: 'PCI DSS 一级认证',
    processingTime: '即时处理',
    isRecommended: true
  }, {
    type: 'paypal',
    name: 'PayPal',
    description: '全球广泛使用的在线支付',
    security: '买家保护计划',
    processingTime: '1-2分钟',
    isRecommended: false
  }, {
    type: 'alipay',
    name: '支付宝',
    description: '中国领先的移动支付平台',
    security: '支付宝担保交易',
    processingTime: '即时处理',
    isRecommended: false
  }];
  const plans = [{
    id: 'basic',
    name: '基础版',
    price: 9900,
    currency: 'CNY',
    description: '适合个人和小型团队',
    features: ['最多5个代理', '基础工作流', '邮件支持', '1GB存储空间'],
    popular: false
  }, {
    id: 'professional',
    name: '专业版',
    price: 29900,
    currency: 'CNY',
    description: '适合中型企业和团队',
    features: ['最多50个代理', '高级工作流', '优先支持', '10GB存储空间', 'API访问'],
    popular: true
  }, {
    id: 'enterprise',
    name: '企业版',
    price: 99900,
    currency: 'CNY',
    description: '适合大型企业和机构',
    features: ['无限代理', '自定义工作流', '专属客服', '100GB存储空间', '高级API', 'SLA保证'],
    popular: false
  }];
  useEffect(() => {
    loadSubscriptionData();
  }, []);
  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subscriptionsResult, currentResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: $w.auth.currentUser?.userId || 'anonymous'
              },
              status: {
                $in: ['active', 'trialing']
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1,
          pageNumber: 1
        }
      })]);
      setSubscriptions(subscriptionsResult.records || []);
      if (currentResult.records && currentResult.records.length > 0) {
        setCurrentSubscription(currentResult.records[0]);
      }
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
  const handleSelectPlan = plan => {
    setSelectedPlan(plan);
  };
  const handleSelectProvider = provider => {
    setSelectedProvider(provider);
  };
  const handlePayment = async () => {
    if (!selectedPlan || !selectedProvider) {
      toast({
        title: "选择不完整",
        description: "请选择订阅计划和支付提供商",
        variant: "destructive"
      });
      return;
    }
    setProcessingPayment(true);
    try {
      // 创建支付记录
      const paymentRecord = await $w.cloud.callDataSource({
        dataSourceName: 'taiji_payment_provider',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            provider: selectedProvider,
            providerId: `payment_${Date.now()}`,
            status: 'pending',
            amount: selectedPlan.price,
            currency: selectedPlan.currency,
            userId: $w.auth.currentUser?.userId || 'anonymous',
            subscriptionId: selectedPlan.id,
            metadata: {
              plan: selectedPlan,
              timestamp: new Date()
            },
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      });

      // 模拟支付处理
      setTimeout(async () => {
        const success = Math.random() > 0.1; // 90%成功率
        await $w.cloud.callDataSource({
          dataSourceName: 'taiji_payment_provider',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              status: success ? 'succeeded' : 'failed',
              updatedAt: new Date()
            },
            filter: {
              where: {
                _id: {
                  $eq: paymentRecord.id
                }
              }
            }
          }
        });
        if (success) {
          // 创建订阅记录
          await $w.cloud.callDataSource({
            dataSourceName: 'taiji_subscription',
            methodName: 'wedaCreateV2',
            params: {
              data: {
                user_id: $w.auth.currentUser?.userId || 'anonymous',
                plan: {
                  id: selectedPlan.id,
                  name: selectedPlan.name,
                  price: selectedPlan.price,
                  currency: selectedPlan.currency
                },
                status: 'active',
                current_period_start: new Date(),
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                // 30天后
                payment_provider: selectedProvider,
                payment_id: paymentRecord.id,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            }
          });
          toast({
            title: "支付成功",
            description: `您已成功订阅 ${selectedPlan.name}`,
            variant: "default"
          });
          loadSubscriptionData();
        } else {
          toast({
            title: "支付失败",
            description: "支付处理失败，请重试",
            variant: "destructive"
          });
        }
        setProcessingPayment(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "支付错误",
        description: error.message,
        variant: "destructive"
      });
      setProcessingPayment(false);
    }
  };
  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: 'canceled',
            canceled_at: new Date(),
            updatedAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: currentSubscription._id
              }
            }
          }
        }
      });
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
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载订阅信息...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">订阅管理</h1>
          <p className="text-xl text-gray-300">选择适合您的AI太极订阅计划</p>
        </div>

        {/* Current Subscription */}
        {currentSubscription && <div className="mb-8">
            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">当前订阅</CardTitle>
                <CardDescription className="text-gray-300">管理您的活跃订阅</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{currentSubscription.plan?.name || '未知计划'}</h3>
                    <p className="text-gray-300">状态: {currentSubscription.status}</p>
                    <p className="text-gray-300">到期时间: {new Date(currentSubscription.current_period_end).toLocaleDateString('zh-CN')}</p>
                  </div>
                  <Button onClick={handleCancelSubscription} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                    取消订阅
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>}

        {/* Subscription Plans */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">选择订阅计划</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map(plan => <Card key={plan.id} className={`bg-gray-900/50 backdrop-blur border-gray-700 ${selectedPlan?.id === plan.id ? 'border-red-500' : ''} ${plan.popular ? 'border-yellow-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{plan.name}</CardTitle>
                    {plan.popular && <Badge className="bg-yellow-500 text-white">最受欢迎</Badge>}
                  </div>
                  <CardDescription className="text-gray-300">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-4">
                    ¥{plan.price / 100}
                    <span className="text-sm text-gray-400">/月</span>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => <li key={index} className="flex items-center text-gray-300">
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        {feature}
                      </li>)}
                  </ul>
                  <Button onClick={() => handleSelectPlan(plan)} className={`w-full ${selectedPlan?.id === plan.id ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                    {selectedPlan?.id === plan.id ? '已选择' : '选择计划'}
                  </Button>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Payment Providers */}
        {selectedPlan && <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">选择支付方式</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {paymentProviders.map(provider => <PaymentProviderCard key={provider.type} provider={provider} onSelect={handleSelectProvider} isActive={selectedProvider === provider.type} />)}
            </div>
          </div>}

        {/* Payment Summary */}
        {selectedPlan && selectedProvider && <div className="mb-8">
            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">支付摘要</CardTitle>
                <CardDescription className="text-gray-300">确认您的订阅信息</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">订阅计划:</span>
                    <span className="text-white font-medium">{selectedPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">支付方式:</span>
                    <span className="text-white font-medium">{paymentProviders.find(p => p.type === selectedProvider)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">金额:</span>
                    <span className="text-white font-bold text-xl">¥{selectedPlan.price / 100}</span>
                  </div>
                  <Button onClick={handlePayment} disabled={processingPayment} className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50">
                    {processingPayment ? '处理中...' : '确认支付'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>}
      </div>
    </div>;
}
export default function SubscriptionPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <SubscriptionContent {...props} />
    </ExperimentProvider>;
}