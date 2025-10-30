// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Calendar, CreditCard, CheckCircle, AlertCircle } from 'lucide-react';

export function CurrentSubscription({
  subscription,
  onManage
}) {
  if (!subscription) return null;
  const getStatusBadge = status => {
    const statusMap = {
      active: {
        color: 'bg-green-500',
        text: '活跃',
        icon: <CheckCircle className="w-4 h-4" />
      },
      trialing: {
        color: 'bg-blue-500',
        text: '试用中',
        icon: <Calendar className="w-4 h-4" />
      },
      past_due: {
        color: 'bg-yellow-500',
        text: '逾期',
        icon: <AlertCircle className="w-4 h-4" />
      },
      canceled: {
        color: 'bg-red-500',
        text: '已取消',
        icon: <AlertCircle className="w-4 h-4" />
      },
      pending: {
        color: 'bg-gray-500',
        text: '待处理',
        icon: <Calendar className="w-4 h-4" />
      }
    };
    return statusMap[status] || statusMap.pending;
  };
  const status = getStatusBadge(subscription.status);
  const plan = subscription.plan || {};
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">当前订阅</CardTitle>
          <Badge className={`${status.color} text-white flex items-center gap-1`}>
            {status.icon}
            {status.text}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-gray-400 text-sm mb-1">套餐</h4>
            <p className="text-white text-lg font-semibold">{plan.name}</p>
          </div>
          
          <div>
            <h4 className="text-gray-400 text-sm mb-1">价格</h4>
            <p className="text-white text-lg font-semibold">
              ${plan.price}/{plan.interval}
            </p>
          </div>
          
          <div>
            <h4 className="text-gray-400 text-sm mb-1">到期时间</h4>
            <p className="text-white text-lg font-semibold">
              {subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : '永久有效'}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800" onClick={onManage}>
            管理订阅
          </Button>
          <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
            取消订阅
          </Button>
        </div>
      </CardContent>
    </Card>;
}