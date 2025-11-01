// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Check, Zap, TrendingUp, Crown, Users, Building } from 'lucide-react';

export function SubscriptionCard({
  plan,
  onSubscribe,
  isCurrent,
  processing,
  buttonColor
}) {
  const getButtonClass = color => {
    const colorMap = {
      red: 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600',
      blue: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
      green: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
    };
    return colorMap[color] || 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600';
  };
  return <Card className={`bg-gray-900/50 backdrop-blur border-gray-700 relative ${plan.popular ? 'border-red-500' : ''}`}>
      {plan.popular && <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white">
          最受欢迎
        </Badge>}
      
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getButtonClass(buttonColor)} p-3`}>
            {plan.icon}
          </div>
          {isCurrent && <Badge variant="outline" className="border-green-500 text-green-500">
              当前订阅
            </Badge>}
        </div>
        
        <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-gray-300">{plan.description}</CardDescription>
        
        <div className="mt-4">
          <span className="text-4xl font-bold text-white">${plan.price}</span>
          <span className="text-gray-400">/{plan.interval}</span>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => <li key={index} className="flex items-center text-gray-300">
              <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>)}
        </ul>

        <Button className={`w-full bg-gradient-to-r ${getButtonClass(buttonColor)} text-white`} onClick={() => onSubscribe(plan)} disabled={processing || isCurrent}>
          {processing ? '处理中...' : isCurrent ? '当前订阅' : '立即订阅'}
        </Button>
      </CardContent>
    </Card>;
}