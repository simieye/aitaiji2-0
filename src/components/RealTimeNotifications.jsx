// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function RealTimeNotifications({
  $w,
  userId
}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // 每30秒检查一次
    return () => clearInterval(interval);
  }, [userId]);
  const loadNotifications = async () => {
    try {
      // 获取未读通知
      const notificationsResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_email_notification',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              recipient: {
                $eq: userId
              },
              status: {
                $eq: 'unread'
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10,
          pageNumber: 1
        }
      }));
      const notifications = notificationsResult.records || [];
      setNotifications(notifications);
      setUnreadCount(notifications.length);
    } catch (error) {
      console.error('加载通知失败:', error);
    }
  };
  const handleMarkAsRead = async notificationId => {
    try {
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_email_notification',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: 'read',
            readAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: notificationId
              }
            }
          }
        }
      }));
      loadNotifications();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };
  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(notifications.map(notification => withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_email_notification',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: 'read',
            readAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: notification._id
              }
            }
          }
        }
      }))));
      loadNotifications();
    } catch (error) {
      console.error('标记全部已读失败:', error);
    }
  };
  const getNotificationIcon = type => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
  const formatTime = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString('zh-CN');
  };
  return <div className="relative">
      <Button onClick={() => setShowNotifications(!showNotifications)} variant="outline" className="relative border-gray-600 text-white hover:bg-gray-700">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>}
      </Button>

      {showNotifications && <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          <Card className="bg-transparent border-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">通知</CardTitle>
                <div className="flex space-x-2">
                  {unreadCount > 0 && <Button onClick={handleMarkAllAsRead} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      全部已读
                    </Button>}
                  <Button onClick={() => setShowNotifications(false)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? <div className="text-center py-8">
                  <div className="text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-4" />
                    <p>暂无新通知</p>
                  </div>
                </div> : <div className="space-y-3">
                  {notifications.map(notification => <div key={notification._id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1">
                          <div className="text-white font-medium text-sm">{notification.subject}</div>
                          <div className="text-gray-400 text-xs mt-1">{notification.content}</div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-gray-500 text-xs">{formatTime(notification.createdAt)}</span>
                            <Button onClick={() => handleMarkAsRead(notification._id)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              标记已读
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>)}
                </div>}
            </CardContent>
          </Card>
        </div>}
    </div>;
}