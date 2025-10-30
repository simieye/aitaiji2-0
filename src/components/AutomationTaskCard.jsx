// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Clock, CheckCircle, AlertTriangle, Play, RotateCcw } from 'lucide-react';

export function AutomationTaskCard({
  task,
  onRetry,
  onViewDetails
}) {
  const getStatusIcon = status => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 text-white">成功</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white">失败</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">进行中</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">未知</Badge>;
    }
  };
  const formatDuration = ms => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon(task.status)}
            <CardTitle className="text-white text-sm">{task.taskName}</CardTitle>
          </div>
          {getStatusBadge(task.status)}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          <div className="text-xs text-gray-400">
            类型: {task.taskType}
          </div>
          <div className="text-xs text-gray-400">
            执行时间: {formatDate(task.executeTime)}
          </div>
          <div className="text-xs text-gray-400">
            耗时: {formatDuration(task.duration)}
          </div>
          {task.retryCount > 0 && <div className="text-xs text-yellow-400">
              重试次数: {task.retryCount}
            </div>}
          {task.errorMessage && <div className="text-xs text-red-400 truncate">
              错误: {task.errorMessage}
            </div>}
          
          <div className="flex space-x-2 pt-2">
            {task.status === 'failed' && <Button onClick={() => onRetry(task)} size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                <RotateCcw className="w-3 h-3 mr-1" />
                重试
              </Button>}
            <Button onClick={() => onViewDetails(task)} size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              详情
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}