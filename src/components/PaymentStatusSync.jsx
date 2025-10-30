// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { RefreshCw, AlertCircle, CheckCircle, Clock, Mail } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function PaymentStatusSync({
  $w,
  subscriptions,
  onStatusUpdate
}) {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const {
    toast
  } = useToast();

  // 自动同步支付状态
  useEffect(() => {
    const syncInterval = setInterval(syncPaymentStatus, 5 * 60 * 1000); // 每5分钟同步一次
    syncPaymentStatus(); // 立即执行一次

    return () => clearInterval(syncInterval);
  }, [subscriptions]);
  const syncPaymentStatus = async () => {
    try {
      setSyncStatus('syncing');

      // 获取所有pending状态的订阅
      const pendingSubscriptions = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'pending'
              }
            }
          },
          pageSize: 100,
          pageNumber: 1
        }
      }));
      setPendingCount(pendingSubscriptions.records?.length || 0);

      // 更新每个pending订阅的状态
      for (const subscription of pendingSubscriptions.records || []) {
        await updateSubscriptionStatus(subscription);
      }
      setLastSync(new Date());
      setSyncStatus('success');

      // 通知父组件更新
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: "支付状态同步失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const updateSubscriptionStatus = async subscription => {
    try {
      // 模拟检查支付提供商状态
      const paymentStatus = await checkPaymentProviderStatus(subscription.paymentIntentId);
      if (paymentStatus !== subscription.status) {
        // 更新订阅状态
        await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_subscription',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              status: paymentStatus,
              updatedAt: new Date()
            },
            filter: {
              where: {
                _id: {
                  $eq: subscription._id
                }
              }
            }
          }
        }));

        // 记录状态变更
        await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_automation_log',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              taskType: 'payment_sync',
              taskName: '支付状态同步',
              status: paymentStatus === 'active' ? 'success' : 'failed',
              executeTime: Date.now(),
              duration: 0,
              metadata: {
                subscriptionId: subscription._id,
                oldStatus: subscription.status,
                newStatus: paymentStatus
              },
              retryCount: 0
            }
          }
        }));

        // 如果支付失败，发送邮件通知
        if (paymentStatus === 'failed') {
          await sendPaymentFailureNotification(subscription);
        }
        toast({
          title: "支付状态更新",
          description: `订阅 ${subscription.id} 状态更新为 ${paymentStatus}`,
          variant: paymentStatus === 'active' ? 'default' : 'destructive'
        });
      }
    } catch (error) {
      console.error('更新订阅状态失败:', error);
    }
  };
  const checkPaymentProviderStatus = async paymentIntentId => {
    // 模拟从支付提供商获取状态
    // 实际实现中会调用支付提供商的API
    const mockStatuses = ['active', 'failed', 'pending'];
    return mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
  };
  const sendPaymentFailureNotification = async subscription => {
    try {
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_email_notification',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            recipient: subscription.customerEmail,
            subject: '支付失败通知',
            content: `
              <h2>支付失败通知</h2>
              <p>您的订阅支付失败，订阅ID: ${subscription.id}</p>
              <p>请检查您的支付方式并重试。</p>
              <p>如有疑问，请联系客服。</p>
            `,
            status: 'pending',
            createdAt: new Date(),
            type: 'payment_failure'
          }
        }
      }));
      toast({
        title: "通知已发送",
        description: "支付失败通知邮件已发送",
        variant: "default"
      });
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  };
  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">支付状态同步</CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <Button onClick={syncPaymentStatus} variant="outline" size="sm" disabled={syncStatus === 'syncing'} className="border-gray-600 text-white hover:bg-gray-700">
              <RefreshCw className="w-4 h-4 mr-1" />
              立即同步
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">待处理订单</span>
            <Badge className="bg-yellow-500 text-white">{pendingCount}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">最后同步</span>
            <span className="text-gray-400 text-sm">
              {lastSync ? lastSync.toLocaleTimeString('zh-CN') : '从未'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">自动同步</span>
            <Badge className="bg-green-500 text-white">每5分钟</Badge>
          </div>
        </div>
      </CardContent>
    </Card>;
}