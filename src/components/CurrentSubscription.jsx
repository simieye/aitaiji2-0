// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { CreditCard, Calendar, AlertCircle } from 'lucide-react';

export function CurrentSubscription({
  subscription,
  onCancel
}) {
  const getStatusColor = status => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  const getStatusText = status => {
    switch (status) {
      case 'active':
        return '已激活';
      case 'pending':
        return '待支付';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };
  const getPlanName = planId => {
    switch (planId) {
      case 'basic':
        return '基础版';
      case 'pro':
        return '专业版';
      case 'enterprise':
        return '企业版';
      default:
        return '未知计划';
    }
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            <CardTitle className="text-white text-lg sm:text-xl">当前订阅</CardTitle>
          </div>
          <Badge className={`${getStatusColor(subscription.status)} text-white text-xs sm:text-sm`}>
            {getStatusText(subscription.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm mb-1">订阅计划</div>
              <div className="text-white font-semibold text-sm sm:text-base">{getPlanName(subscription.planId)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">订阅金额</div>
              <div className="text-white font-semibold text-sm sm:text-base">¥{subscription.amount}/月</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">开始时间</div>
              <div className="text-white font-semibold text-sm sm:text-base">
                {new Date(subscription.createdAt).toLocaleDateString('zh-CN')}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">下次续费</div>
              <div className="text-white font-semibold text-sm sm:text-base">
                {new Date(subscription.updatedAt).toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>
          
          {subscription.status === 'active' && <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <span className="text-gray-300 text-sm sm:text-base">
                  您的订阅将在 {new Date(subscription.updatedAt).toLocaleDateString('zh-CN')} 自动续费
                </span>
              </div>
              <Button onClick={() => onCancel(subscription._id)} variant="outline" className="w-full sm:w-auto border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-sm sm:text-base">
                取消订阅
              </Button>
            </div>}
            
          {subscription.status === 'pending' && <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <span className="text-gray-300 text-sm sm:text-base">
                  订阅待支付，请完成支付以激活服务
                </span>
              </div>
              <Button className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-sm sm:text-base">
                立即支付
              </Button>
            </div>}
        </div>
      </CardContent>
    </Card>;
}