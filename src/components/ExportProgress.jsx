// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export function ExportProgress({
  exportTask,
  onCancel,
  onComplete
}) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('pending');
  const [timeElapsed, setTimeElapsed] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      // 模拟进度更新
      if (status === 'processing') {
        setProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 10, 100);
          if (newProgress >= 100) {
            setStatus('completed');
            return 100;
          }
          return newProgress;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);
  useEffect(() => {
    // 模拟导出开始
    setTimeout(() => {
      setStatus('processing');
    }, 1000);
  }, []);
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Download className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };
  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">等待中</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 text-white">处理中</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white">已完成</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white">失败</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">未知</Badge>;
    }
  };
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const handleDownload = () => {
    // 模拟下载
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${exportTask.fileName}.${exportTask.format}`;
    link.click();
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-white">{exportTask.fileName}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            {status !== 'processing' && <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="w-4 h-4" />
              </Button>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 进度条 */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-300">进度</span>
              <span className="text-white">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full transition-all duration-300" style={{
              width: `${progress}%`
            }}></div>
            </div>
          </div>

          {/* 任务信息 */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">格式:</span>
              <span className="text-white ml-2">{exportTask.format.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-400">大小:</span>
              <span className="text-white ml-2">{exportTask.fileSize || '计算中...'}</span>
            </div>
            <div>
              <span className="text-gray-400">记录数:</span>
              <span className="text-white ml-2">{exportTask.recordCount || '处理中...'}</span>
            </div>
            <div>
              <span className="text-gray-400">耗时:</span>
              <span className="text-white ml-2">{formatTime(timeElapsed)}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-2">
            {status === 'completed' && <Button onClick={handleDownload} className="flex-1 bg-green-500 hover:bg-green-600">
                <Download className="w-4 h-4 mr-2" />
                下载文件
              </Button>}
            {status === 'failed' && <Button onClick={() => window.location.reload()} className="flex-1 bg-red-500 hover:bg-red-600">
                重试
              </Button>}
            {status === 'processing' && <Button onClick={onCancel} variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-700">
                取消
              </Button>}
          </div>
        </div>
      </CardContent>
    </Card>;
}