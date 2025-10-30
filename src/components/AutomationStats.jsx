// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

export function AutomationStats({
  stats
}) {
  const formatNumber = num => {
    return num.toLocaleString('zh-CN');
  };
  const formatDuration = ms => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };
  return <div className="grid md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">今日成功</CardTitle>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatNumber(stats.todaySuccess || 0)}</div>
          <p className="text-xs text-gray-500">任务</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">今日失败</CardTitle>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatNumber(stats.todayFailed || 0)}</div>
          <p className="text-xs text-gray-500">任务</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">平均响应</CardTitle>
          <Clock className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{formatDuration(stats.avgResponseTime || 0)}</div>
          <p className="text-xs text-gray-500">响应时间</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">成功率</CardTitle>
          <TrendingUp className="w-4 h-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{((stats.successRate || 0) * 100).toFixed(1)}%</div>
          <p className="text-xs text-gray-500">成功率</p>
        </CardContent>
      </Card>
    </div>;
}