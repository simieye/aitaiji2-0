// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { AlertTriangle, Bell, CheckCircle, X, RefreshCw } from 'lucide-react';

export function AlertPanel({
  alerts = [],
  onRefresh,
  onDismiss
}) {
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const getSeverityIcon = severity => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };
  const getSeverityBadge = severity => {
    const colors = {
      critical: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500',
      success: 'bg-green-500'
    };
    return <Badge className={`${colors[severity]} text-white text-xs`}>{severity}</Badge>;
  };
  const handleDismiss = alertId => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
    if (onDismiss) {
      onDismiss(alertId);
    }
  };
  const activeAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            系统告警
          </CardTitle>
          {onRefresh && <Button onClick={onRefresh} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </Button>}
        </div>
      </CardHeader>
      <CardContent>
        {activeAlerts.length === 0 ? <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-300">暂无告警信息</p>
          </div> : <div className="space-y-3">
            {activeAlerts.map(alert => <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="flex-shrink-0 mt-1">{getSeverityIcon(alert.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium">{alert.title || alert.message}</p>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{alert.description || alert.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-500 text-xs">{new Date(alert.timestamp).toLocaleString()}</span>
                    {onDismiss && <Button onClick={() => handleDismiss(alert.id)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <X className="w-3 h-3" />
                      </Button>}
                  </div>
                </div>
              </div>)}
          </div>}
      </CardContent>
    </Card>;
}