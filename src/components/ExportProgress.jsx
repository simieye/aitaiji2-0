// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Progress } from '@/components/ui';
// @ts-ignore;
import { Activity, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ExportProgress({
  $w,
  exportTask
}) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [currentStep, setCurrentStep] = useState('');
  useEffect(() => {
    if (exportTask) {
      simulateProgress();
    }
  }, [exportTask]);
  const simulateProgress = () => {
    const steps = ['初始化导出任务', '连接数据源', '查询数据', '处理数据', '生成文件', '保存文件'];
    let currentStepIndex = 0;
    setStatus('processing');
    setCurrentStep(steps[0]);
    const interval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setCurrentStep(steps[currentStepIndex]);
        setProgress(currentStepIndex * 20);
      } else {
        setProgress(100);
        setStatus('completed');
        setCurrentStep('导出完成');
        clearInterval(interval);
      }
    }, 1000);
  };
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-500" />;
      case 'processing':
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'failed':
        return '失败';
      default:
        return '未知';
    }
  };
  const getProgressColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  if (!exportTask) {
    return null;
  }
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-white">导出进度</CardTitle>
              <CardDescription className="text-gray-300">{exportTask.name}</CardDescription>
            </div>
          </div>
          <div className="text-white font-medium">
            {getStatusText()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 text-sm">当前步骤</span>
              <span className="text-white text-sm">{currentStep}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-400 text-xs">进度</span>
              <span className="text-gray-400 text-xs">{progress}%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">数据源</div>
              <div className="text-white">{exportTask.dataSource}</div>
            </div>
            <div>
              <div className="text-gray-400">导出格式</div>
              <div className="text-white">{exportTask.format.toUpperCase()}</div>
            </div>
          </div>
          
          {status === 'completed' && <div className="flex items-center justify-center p-3 bg-green-900/30 border border-green-500 rounded">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-400">导出完成！文件已准备就绪</span>
            </div>}
          
          {status === 'failed' && <div className="flex items-center justify-center p-3 bg-red-900/30 border border-red-500 rounded">
              <XCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-400">导出失败，请重试</span>
            </div>}
        </div>
      </CardContent>
    </Card>;
}