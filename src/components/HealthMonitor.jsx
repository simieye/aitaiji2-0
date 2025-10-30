// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Activity, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

export function HealthMonitor({
  $w
}) {
  const [healthStatus, setHealthStatus] = useState({
    database: 'checking',
    api: 'checking',
    websocket: 'checking',
    lastCheck: new Date()
  });
  const [loading, setLoading] = useState(false);
  const checkHealth = async () => {
    setLoading(true);
    const newStatus = {
      lastCheck: new Date()
    };
    try {
      // 检查数据库连接
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaGetRecordsV2',
        params: {
          pageSize: 1,
          pageNumber: 1
        }
      });
      newStatus.database = 'healthy';
    } catch (error) {
      newStatus.database = 'error';
    }
    try {
      // 检查API响应
      await $w.cloud.callFunction({
        name: 'health-check',
        data: {}
      });
      newStatus.api = 'healthy';
    } catch (error) {
      newStatus.api = 'error';
    }
    try {
      // 检查WebSocket连接
      const tcb = await $w.cloud.getCloudInstance();
      if (tcb) {
        newStatus.websocket = 'healthy';
      } else {
        newStatus.websocket = 'error';
      }
    } catch (error) {
      newStatus.websocket = 'error';
    }
    setHealthStatus(newStatus);
    setLoading(false);
  };
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // 每分钟检查一次
    return () => clearInterval(interval);
  }, []);
  const getStatusIcon = status => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500 text-white">正常</Badge>;
      case 'error':
        return <Badge className="bg-red-500 text-white">异常</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white">检查中</Badge>;
    }
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">系统健康状态</CardTitle>
          <Button onClick={checkHealth} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-gray-300">数据库连接</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(healthStatus.database)}
              {getStatusBadge(healthStatus.database)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <span className="text-gray-300">API服务</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(healthStatus.api)}
              {getStatusBadge(healthStatus.api)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-500" />
              <span className="text-gray-300">实时连接</span>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(healthStatus.websocket)}
              {getStatusBadge(healthStatus.websocket)}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-700">
            <div className="text-xs text-gray-400">
              最后检查: {healthStatus.lastCheck.toLocaleTimeString('zh-CN')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}