// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Play, RefreshCw, Database, Activity } from 'lucide-react';

export function AutomationControlPanel({
  onTriggerTask
}) {
  const handleTriggerTask = (taskType, taskName, taskDescription) => {
    onTriggerTask(taskType, taskName, taskDescription);
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">手动控制</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <Button onClick={() => handleTriggerTask('data_sync', '数据同步', '立即同步所有数据模型')} className="bg-blue-500 hover:bg-blue-600">
            <Database className="w-4 h-4 mr-2" />
            立即同步数据
          </Button>
          
          <Button onClick={() => handleTriggerTask('health_check', '健康检查', '执行系统健康状态检查')} className="bg-green-500 hover:bg-green-600">
            <Activity className="w-4 h-4 mr-2" />
            强制健康检查
          </Button>
          
          <Button onClick={() => handleTriggerTask('cache_clear', '缓存清理', '清理系统缓存和临时数据')} className="bg-purple-500 hover:bg-purple-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            清理缓存
          </Button>
          
          <Button onClick={() => handleTriggerTask('metrics_update', '指标更新', '更新所有系统指标和统计')} className="bg-orange-500 hover:bg-orange-600">
            <Play className="w-4 h-4 mr-2" />
            更新指标
          </Button>
        </div>
      </CardContent>
    </Card>;
}