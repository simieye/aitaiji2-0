// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { CheckCircle, Star } from 'lucide-react';

export function SubscriptionCard({
  plan,
  onSubscribe,
  currentPlan
}) {
  const isCurrentPlan = currentPlan === plan.id;
  return <Card className={`bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300 ${plan.popular ? 'ring-2 ring-red-500/50' : ''}`}>
      {plan.popular && <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-red-500 text-white px-3 py-1 text-xs sm:text-sm">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            最受欢迎
          </Badge>
        </div>}
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-white text-lg sm:text-xl mb-2">{plan.name}</CardTitle>
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">
          ¥{plan.price}
          <span className="text-sm sm:text-base text-gray-400 font-normal">/月</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 sm:space-y-3">
          {plan.features.map((feature, index) => <div key={index} className="flex items-center space-x-2 sm:space-x-3">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
            </div>)}
        </div>
        <Button onClick={() => onSubscribe(plan)} disabled={isCurrentPlan} className={`w-full py-2 sm:py-3 text-sm sm:text-base ${isCurrentPlan ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}>
          {isCurrentPlan ? '当前计划' : '立即订阅'}
        </Button>
      </CardContent>
    </Card>;
}