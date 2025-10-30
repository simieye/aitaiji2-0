// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Users, Target, Activity } from 'lucide-react';

export function ExperimentMetrics({
  metrics
}) {
  const formatNumber = num => {
    return num.toLocaleString('zh-CN');
  };
  const formatPercentage = num => {
    return `${num.toFixed(1)}%`;
  };
  return <div className="grid md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">总实验数</CardTitle>
          <Target className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatNumber(metrics.totalExperiments || 0)}</div>
          <p className="text-xs text-gray-500">活跃实验</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">启用功能</CardTitle>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatNumber(metrics.enabledFeatures || 0)}</div>
          <p className="text-xs text-gray-500">已启用</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">影响用户</CardTitle>
          <Users className="w-4 h-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatNumber(metrics.affectedUsers || 0)}</div>
          <p className="text-xs text-gray-500">受影响用户</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">成功率</CardTitle>
          <Activity className="w-4 h-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatPercentage(metrics.successRate || 0)}</div>
          <p className="text-xs text-gray-500">实验成功率</p>
        </CardContent>
      </Card>
    </div>;
}