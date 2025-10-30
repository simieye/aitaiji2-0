// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { CreditCard, DollarSign, Zap, Shield } from 'lucide-react';

export function PaymentProviderCard({
  provider,
  onSelect,
  isActive = false
}) {
  const getProviderIcon = () => {
    switch (provider.type) {
      case 'stripe':
        return <CreditCard className="w-8 h-8 text-purple-500" />;
      case 'paypal':
        return <DollarSign className="w-8 h-8 text-blue-500" />;
      case 'alipay':
        return <Zap className="w-8 h-8 text-blue-600" />;
      default:
        return <CreditCard className="w-8 h-8 text-gray-500" />;
    }
  };
  const getProviderColor = () => {
    switch (provider.type) {
      case 'stripe':
        return 'border-purple-500 hover:border-purple-400';
      case 'paypal':
        return 'border-blue-500 hover:border-blue-400';
      case 'alipay':
        return 'border-blue-600 hover:border-blue-500';
      default:
        return 'border-gray-500 hover:border-gray-400';
    }
  };
  return <Card className={`bg-gray-900/50 backdrop-blur border-2 ${getProviderColor()} transition-all duration-300 ${isActive ? 'border-opacity-100' : 'border-opacity-50'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getProviderIcon()}
            <div>
              <CardTitle className="text-white">{provider.name}</CardTitle>
              <CardDescription className="text-gray-300">{provider.description}</CardDescription>
            </div>
          </div>
          {provider.isRecommended && <Badge className="bg-green-500 text-white">推荐</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-400">
            <Shield className="w-4 h-4 mr-2" />
            <span>{provider.security}</span>
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Zap className="w-4 h-4 mr-2" />
            <span>{provider.processingTime}</span>
          </div>
        </div>
        <Button onClick={() => onSelect(provider.type)} className={`w-full mt-4 ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          选择 {provider.name}
        </Button>
      </CardContent>
    </Card>;
}