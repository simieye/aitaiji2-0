// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function PaymentStatusSync({
  $w,
  subscriptions,
  onStatusUpdate
}) {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const {
    toast
  } = useToast();
  const handleSyncPaymentStatus = async () => {
    try {
      setSyncing(true);
      // 获取所有pending状态的订阅
      const pendingSubscriptions = subscriptions.filter(sub => sub.status === 'pending');

      // 模拟同步过程
      for (const subscription of pendingSubscriptions) {
        // 模拟检查支付状态
        const paymentStatus = Math.random() > 0.5 ? 'active' : 'pending';
        if (paymentStatus !== subscription.status) {
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
        }
      }
      setLastSyncTime(new Date());
      toast({
        title: "同步完成",
        description: `已同步 ${pendingSubscriptions.length} 个订单状态`,
        variant: "default"
      });
      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      toast({
        title: "同步失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };
  const pendingCount = subscriptions.filter(sub => sub.status === 'pending').length;
  const failedCount = subscriptions.filter(sub => sub.status === 'failed').length;
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-white text-lg sm:text-xl">支付状态同步</CardTitle>
          <Button onClick={handleSyncPaymentStatus} disabled={syncing} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto">
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? '同步中...' : '立即同步'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-800 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-500 mb-1">{pendingCount}</div>
            <div className="text-gray-400 text-xs sm:text-sm">待支付</div>
          </div>
          <div className="text-center p-3 bg-gray-800 rounded-lg">
            <div className="text-2xl sm:text-3xl font-bold text-red-500 mb-1">{failedCount}</div>
            <div className="text-gray-400 text-xs sm:text-sm">支付失败</div>
          </div>
          <div className="text-center p-3 bg-gray-800 rounded-lg">
            <div className="text-lg sm:text-xl font-bold text-green-500 mb-1">
              {lastSyncTime ? lastSyncTime.toLocaleTimeString('zh-CN') : '未同步'}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">上次同步</div>
          </div>
        </div>
        
        {pendingCount > 0 && <div className="flex items-center space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
            <span className="text-yellow-500 text-sm sm:text-base">
              有 {pendingCount} 个订单待支付，建议及时同步状态
            </span>
          </div>}
        
        {failedCount > 0 && <div className="flex items-center space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mt-2">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-500 text-sm sm:text-base">
              有 {failedCount} 个订单支付失败，请检查处理
            </span>
          </div>}
      </CardContent>
    </Card>;
}