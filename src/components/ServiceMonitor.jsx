// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ServiceMonitor({
  $w,
  services
}) {
  const [monitoringData, setMonitoringData] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, [services]);
  const loadMonitoringData = async () => {
    try {
      // 模拟监控数据
      const data = {};
      services.forEach(service => {
        data[service._id] = {
          status: Math.random() > 0.8 ? 'error' : Math.random() > 0.3 ? 'active' : 'warning',
          responseTime: Math.floor(Math.random() * 1000) + 100,
          uptime: Math.floor(Math.random() * 100),
          lastCheck: new Date(),
          errorRate: Math.random() * 5,
          successRate: 100 - Math.random() * 5
        };
      });
      setMonitoringData(data);
    } catch (error) {
      console.error('加载监控数据失败:', error);
    }
  };
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadMonitoringData();
    setIsRefreshing(false);
  };
  const getStatusIcon = status => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">正常</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-white">警告</Badge>;
      case 'error':
        return <Badge className="bg-red-500 text-white">错误</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">未知</Badge>;
    }
  };
  const getTrendIcon = trend => {
    return trend > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />;
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">服务监控</CardTitle>
            <CardDescription className="text-gray-300">实时监控第三方服务状态</CardDescription>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map(service => {
          const data = monitoringData[service._id] || {};
          return <div key={service._id} className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(data.status)}
                    <div>
                      <div className="text-white font-medium">{service.name}</div>
                      <div className="text-gray-400 text-sm">{service.provider}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(data.status)}
                    <div className="text-gray-400 text-sm">
                      {new Date(data.lastCheck).toLocaleTimeString('zh-CN')}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-gray-400 text-sm">响应时间</div>
                    <div className="text-white font-medium flex items-center">
                      {data.responseTime || 0}ms
                      {getTrendIcon(Math.random() * 10 - 5)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">可用性</div>
                    <div className="text-white font-medium">{data.uptime || 0}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">成功率</div>
                    <div className="text-white font-medium">{(data.successRate || 0).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">错误率</div>
                    <div className="text-white font-medium">{(data.errorRate || 0).toFixed(1)}%</div>
                  </div>
                </div>
              </div>;
        })}
        </div>
        
        {services.length === 0 && <div className="text-center py-8">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-white mb-2">暂无服务</h3>
            <p className="text-gray-400">请先配置第三方服务</p>
          </div>}
      </CardContent>
    </Card>;
}