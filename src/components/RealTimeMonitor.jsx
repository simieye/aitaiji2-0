// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Activity, Users, DollarSign, AlertTriangle } from 'lucide-react';

export function RealTimeMonitor({
  $w
}) {
  const [realTimeData, setRealTimeData] = useState({
    activeUsers: 0,
    revenueToday: 0,
    errorsToday: 0,
    conversionsToday: 0
  });
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    // 模拟实时数据更新
    const updateRealTimeData = async () => {
      try {
        // 获取今日活跃用户
        const usersResult = await $w.cloud.callDataSource({
          dataSourceName: 'taiji_user',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                createdAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              }
            },
            getCount: true
          }
        });

        // 获取今日收入
        const revenueResult = await $w.cloud.callDataSource({
          dataSourceName: 'taiji_subscription',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                createdAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0))
                },
                status: 'active'
              }
            },
            getCount: true
          }
        });

        // 获取今日错误
        const errorsResult = await $w.cloud.callDataSource({
          dataSourceName: 'taiji_user_event',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                timestamp: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0))
                },
                event_category: 'error'
              }
            },
            getCount: true
          }
        });

        // 获取今日转化
        const conversionsResult = await $w.cloud.callDataSource({
          dataSourceName: 'taiji_user_event',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                timestamp: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0))
                },
                event: 'subscription_success'
              }
            },
            getCount: true
          }
        });
        setRealTimeData({
          activeUsers: usersResult.total || 0,
          revenueToday: (revenueResult.total || 0) * 299,
          errorsToday: errorsResult.total || 0,
          conversionsToday: conversionsResult.total || 0
        });
      } catch (error) {
        console.error('实时数据更新失败:', error);
        setIsConnected(false);
      }
    };
    updateRealTimeData();
    const interval = setInterval(updateRealTimeData, 10000); // 每10秒更新一次
    return () => clearInterval(interval);
  }, [$w]);
  const metrics = [{
    label: '今日活跃用户',
    value: realTimeData.activeUsers,
    icon: <Users className="w-5 h-5" />,
    color: 'text-blue-400'
  }, {
    label: '今日收入',
    value: `$${realTimeData.revenueToday.toLocaleString()}`,
    icon: <DollarSign className="w-5 h-5" />,
    color: 'text-green-400'
  }, {
    label: '今日错误',
    value: realTimeData.errorsToday,
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'text-red-400'
  }, {
    label: '今日转化',
    value: realTimeData.conversionsToday,
    icon: <Activity className="w-5 h-5" />,
    color: 'text-purple-400'
  }];
  return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => <Card key={index} className={`bg-gray-900/50 backdrop-blur border-gray-700 ${!isConnected ? 'opacity-50' : ''}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className={`text-sm font-medium ${metric.color}`}>{metric.label}</CardTitle>
              <div className={metric.color}>{metric.icon}</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
            <div className={`text-xs ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? '实时更新' : '连接中断'}
            </div>
          </CardContent>
        </Card>)}
    </div>;
}