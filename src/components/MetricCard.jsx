// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function MetricCard({
  title,
  value,
  unit = '',
  trend = 0,
  icon,
  color = 'text-white',
  description
}) {
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };
  const getTrendColor = () => {
    if (trend > 0) return 'text-green-400';
    if (trend < 0) return 'text-red-400';
    return 'text-gray-400';
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-gray-600 transition-all duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-sm font-medium ${color}`}>{title}</CardTitle>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-baseline space-x-2">
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
            {unit && <span className="text-sm text-gray-400">{unit}</span>}
          </div>
          {description && <p className="text-xs text-gray-400">{description}</p>}
          {trend !== 0 && <div className={`flex items-center text-xs ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">{Math.abs(trend)}% 较上周</span>
            </div>}
        </div>
      </CardContent>
    </Card>;
}