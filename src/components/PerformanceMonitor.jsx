// @ts-ignore;
import React, { useEffect, useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Activity, Clock, Zap, AlertTriangle } from 'lucide-react';

export function PerformanceMonitor({
  $w
}) {
  const [performance, setPerformance] = useState({
    fp: 0,
    fcp: 0,
    lcp: 0,
    ttfb: 0,
    cls: 0,
    fid: 0
  });
  const [alerts, setAlerts] = useState([]);
  useEffect(() => {
    // 监听性能指标
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-paint') {
          setPerformance(prev => ({
            ...prev,
            fp: entry.startTime
          }));
        } else if (entry.name === 'first-contentful-paint') {
          setPerformance(prev => ({
            ...prev,
            fcp: entry.startTime
          }));
        } else if (entry.entryType === 'largest-contentful-paint') {
          setPerformance(prev => ({
            ...prev,
            lcp: entry.startTime
          }));
        } else if (entry.entryType === 'navigation') {
          setPerformance(prev => ({
            ...prev,
            ttfb: entry.responseStart - entry.fetchStart
          }));
        }
      });
    });
    observer.observe({
      type: 'paint',
      buffered: true
    });
    observer.observe({
      type: 'largest-contentful-paint',
      buffered: true
    });
    observer.observe({
      type: 'navigation',
      buffered: true
    });

    // 记录性能数据
    const recordPerformance = async () => {
      try {
        await $w.cloud.callDataSource({
          dataSourceName: 'taiji_user_event',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              user_id: $w.auth.currentUser?.userId || 'anonymous',
              event: 'performance_metric',
              event_category: 'performance',
              event_action: 'web_vitals',
              event_label: 'performance_summary',
              metadata: {
                fp: performance.fp,
                fcp: performance.fcp,
                lcp: performance.lcp,
                ttfb: performance.ttfb,
                cls: performance.cls,
                fid: performance.fid,
                url: window.location.href,
                timestamp: new Date().toISOString()
              },
              timestamp: new Date()
            }
          }
        });
      } catch (error) {
        console.error('Failed to record performance:', error);
      }
    };

    // 延迟记录性能数据
    setTimeout(recordPerformance, 1000);
    return () => observer.disconnect();
  }, [performance, $w]);

  // 检查性能告警
  useEffect(() => {
    const newAlerts = [];
    if (performance.lcp > 2500) {
      newAlerts.push({
        type: 'LCP',
        message: '页面加载速度较慢',
        severity: 'warning',
        value: `${performance.lcp.toFixed(0)}ms`
      });
    }
    if (performance.ttfb > 600) {
      newAlerts.push({
        type: 'TTFB',
        message: '服务器响应时间较长',
        severity: 'warning',
        value: `${performance.ttfb.toFixed(0)}ms`
      });
    }
    setAlerts(newAlerts);
  }, [performance]);
  const getPerformanceColor = value => {
    if (value < 1000) return 'text-green-400';
    if (value < 2500) return 'text-yellow-400';
    return 'text-red-400';
  };
  return <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-xs">FP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${getPerformanceColor(performance.fp)}`}>
              {performance.fp.toFixed(0)}ms
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-xs">FCP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${getPerformanceColor(performance.fcp)}`}>
              {performance.fcp.toFixed(0)}ms
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-xs">LCP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${getPerformanceColor(performance.lcp)}`}>
              {performance.lcp.toFixed(0)}ms
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-xs">TTFB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${getPerformanceColor(performance.ttfb)}`}>
              {performance.ttfb.toFixed(0)}ms
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-xs">CLS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${performance.cls < 0.1 ? 'text-green-400' : 'text-yellow-400'}`}>
              {performance.cls.toFixed(3)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-xs">FID</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-bold ${performance.fid < 100 ? 'text-green-400' : 'text-yellow-400'}`}>
              {performance.fid.toFixed(0)}ms
            </div>
          </CardContent>
        </Card>
      </div>

      {alerts.length > 0 && <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              性能告警
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <div>
                    <span className="text-white text-sm">{alert.type}</span>
                    <p className="text-gray-400 text-xs">{alert.message}</p>
                  </div>
                  <span className="text-yellow-400 text-sm">{alert.value}</span>
                </div>)}
            </div>
          </CardContent>
        </Card>}
    </div>;
}