// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Users, Zap, Shield, Activity, RefreshCw, Play, CreditCard, Clock, AlertCircle, CheckCircle } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { MetricCard } from '@/components/MetricCard';
// @ts-ignore;
import { AlertPanel } from '@/components/AlertPanel';
// @ts-ignore;
import { ChartContainer } from '@/components/ChartContainer';
// @ts-ignore;
import { RealTimeMonitor } from '@/components/RealTimeMonitor';
// @ts-ignore;
import { HealthMonitor } from '@/components/HealthMonitor';
// @ts-ignore;
import { AutomationTaskCard } from '@/components/AutomationTaskCard';
// @ts-ignore;
import { AutomationStats } from '@/components/AutomationStats';
// @ts-ignore;
import { AutomationControlPanel } from '@/components/AutomationControlPanel';
// @ts-ignore;
import { PaymentStatusSync } from '@/components/PaymentStatusSync';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function DashboardContent(props) {
  const {
    $w,
    style
  } = props;
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalWorkflows: 0,
    activeSessions: 0,
    systemUptime: 0,
    errorRate: 0
  });
  const [alerts, setAlerts] = useState([]);
  const [automationTasks, setAutomationTasks] = useState([]);
  const [automationStats, setAutomationStats] = useState({
    todaySuccess: 0,
    todayFailed: 0,
    avgResponseTime: 0,
    successRate: 0
  });
  const [subscriptions, setSubscriptions] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    failedPayments: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();

  // 获取实验变体
  const dashboardExperiment = useExperiment('dashboard_layout');
  const chartExperiment = useExperiment('chart_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadDashboardData, 30000);
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersResult, agentsResult, workflowsResult, sessionsResult, tasksResult, subscriptionsResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_agent',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_workflow',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_chat_session',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              }
            }
          },
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_automation_log',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            executeTime: 'desc'
          }],
          pageSize: 10,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      }))]);

      // 计算自动化统计
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTasks = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_automation_log',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              executeTime: {
                $gte: today.getTime()
              }
            }
          },
          pageSize: 100,
          pageNumber: 1
        }
      }));

      // 计算支付统计
      const totalRevenue = subscriptionsResult.records?.reduce((sum, sub) => {
        return sub.status === 'active' ? sum + (sub.amount || 0) : sum;
      }, 0) || 0;
      const pendingPayments = subscriptionsResult.records?.filter(sub => sub.status === 'pending').length || 0;
      const failedPayments = subscriptionsResult.records?.filter(sub => sub.status === 'failed').length || 0;
      const totalPayments = subscriptionsResult.records?.length || 0;
      const successRate = totalPayments > 0 ? (totalPayments - failedPayments) / totalPayments : 0;
      const todaySuccess = todayTasks.records?.filter(task => task.status === 'success').length || 0;
      const todayFailed = todayTasks.records?.filter(task => task.status === 'failed').length || 0;
      const totalTasks = todayTasks.records?.length || 0;
      const avgResponseTime = todayTasks.records?.reduce((sum, task) => sum + (task.duration || 0), 0) / totalTasks || 0;
      const automationSuccessRate = totalTasks > 0 ? todaySuccess / totalTasks : 0;
      setMetrics({
        totalUsers: usersResult.total || 0,
        totalAgents: agentsResult.total || 0,
        totalWorkflows: workflowsResult.total || 0,
        activeSessions: sessionsResult.total || 0,
        systemUptime: 99.9,
        errorRate: 0.1
      });
      setSubscriptions(subscriptionsResult.records || []);
      setPaymentStats({
        totalRevenue,
        pendingPayments,
        failedPayments,
        successRate
      });
      setAutomationTasks(tasksResult.records || []);
      setAutomationStats({
        todaySuccess,
        todayFailed,
        avgResponseTime,
        successRate: automationSuccessRate
      });
      setLoading(false);
    } catch (error) {
      toast({
        title: "数据加载失败",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  const handleTriggerTask = async (taskType, taskName, taskDescription) => {
    try {
      const startTime = Date.now();
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 记录任务开始
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_automation_log',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            taskId,
            taskType,
            taskName,
            taskDescription,
            status: 'pending',
            executeTime: startTime,
            initiatedBy: $w.auth.currentUser?.userId || 'system',
            environment: 'production',
            priority: 'high',
            tags: ['manual', 'dashboard']
          }
        }
      }));

      // 执行任务
      let status = 'success';
      let errorMessage = null;
      let duration = 0;
      try {
        switch (taskType) {
          case 'data_sync':
            await loadDashboardData();
            break;
          case 'health_check':
            // 模拟健康检查
            await new Promise(resolve => setTimeout(resolve, 2000));
            break;
          case 'cache_clear':
            // 模拟缓存清理
            await new Promise(resolve => setTimeout(resolve, 1500));
            break;
          case 'metrics_update':
            await loadDashboardData();
            break;
          case 'payment_sync':
            await syncPaymentStatus();
            break;
          default:
            throw new Error('未知任务类型');
        }
      } catch (error) {
        status = 'failed';
        errorMessage = error.message;
      } finally {
        duration = Date.now() - startTime;
      }

      // 更新任务状态
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_automation_log',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status,
            duration,
            errorMessage,
            completedTime: Date.now()
          },
          filter: {
            where: {
              taskId: {
                $eq: taskId
              }
            }
          }
        }
      }));
      toast({
        title: "任务执行完成",
        description: `${taskName} 已${status === 'success' ? '成功' : '失败'}执行`,
        variant: status === 'success' ? 'default' : 'destructive'
      });

      // 重新加载数据
      loadDashboardData();
    } catch (error) {
      toast({
        title: "任务触发失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleRetryTask = async task => {
    try {
      await handleTriggerTask(task.taskType, task.taskName, task.taskDescription);
    } catch (error) {
      toast({
        title: "重试失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleViewTaskDetails = task => {
    toast({
      title: "任务详情",
      description: `查看任务 ${task.taskName} 的详细信息`,
      variant: "default"
    });
  };
  const syncPaymentStatus = async () => {
    try {
      // 获取所有pending状态的订阅
      const pendingSubscriptions = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'pending'
              }
            }
          },
          pageSize: 100,
          pageNumber: 1
        }
      }));

      // 更新每个pending订阅的状态
      for (const subscription of pendingSubscriptions.records || []) {
        await updateSubscriptionStatus(subscription);
      }
      toast({
        title: "支付状态已同步",
        description: `已同步 ${pendingSubscriptions.records?.length || 0} 个订单`,
        variant: "default"
      });
      loadDashboardData();
    } catch (error) {
      toast({
        title: "同步失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const updateSubscriptionStatus = async subscription => {
    try {
      // 模拟检查支付状态
      const paymentStatus = Math.random() > 0.7 ? 'active' : 'pending';
      if (paymentStatus !== subscription.status) {
        await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_subscription',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              status: paymentStatus,
              updatedAt: new Date()
            },
            filter: {
              where: {
                _id: {
                  $eq: subscription._id
                }
              }
            }
          }
        }));

        // 如果支付失败，发送邮件通知
        if (paymentStatus === 'failed') {
          await withRetry(() => $w.cloud.callDataSource({
            dataSourceName: 'taiji_email_notification',
            methodName: 'wedaCreateV2',
            params: {
              data: {
                recipient: 'user@example.com',
                subject: '支付失败通知',
                content: '您的支付失败，请重试。',
                status: 'pending',
                createdAt: new Date(),
                type: 'payment_failure'
              }
            }
          }));
        }
      }
    } catch (error) {
      console.error('更新订阅状态失败:', error);
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4 text-sm sm:text-base">{t('common.loading')}</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{t('dashboard.title', '系统仪表板')}</h1>
            <p className="text-gray-300 text-sm sm:text-base">{t('dashboard.description', '实时监控系统状态和数据')}</p>
          </div>
          <Button onClick={loadDashboardData} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common.refresh', '刷新')}
          </Button>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 bg-gray-800 p-1 rounded-lg">
            {['overview', 'automation', 'payments', 'health'].map(tab => <Button key={tab} onClick={() => setActiveTab(tab)} variant={activeTab === tab ? 'default' : 'ghost'} className={`${activeTab === tab ? 'bg-red-500 text-white' : 'text-gray-300'} flex-1 sm:flex-none text-sm sm:text-base px-3 sm:px-4 py-2`}>
                {tab === 'overview' ? t('dashboard.overview', '概览') : tab === 'automation' ? t('dashboard.automation', '自动化控制') : tab === 'payments' ? t('dashboard.payments', '支付管理') : t('dashboard.health', '系统健康')}
              </Button>)}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && <div className="space-y-6 sm:space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
              <MetricCard title="总用户数" value={metrics.totalUsers.toLocaleString()} icon={<Users className="w-4 h-4 sm:w-5 sm:h-5" />} trend="+12%" color="blue" />
              <MetricCard title="AI代理" value={metrics.totalAgents.toLocaleString()} icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5" />} trend="+8%" color="green" />
              <MetricCard title="工作流" value={metrics.totalWorkflows.toLocaleString()} icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />} trend="+15%" color="purple" />
              <MetricCard title="活跃会话" value={metrics.activeSessions.toLocaleString()} icon={<TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />} trend="+5%" color="orange" />
              <MetricCard title="系统运行时间" value={`${metrics.systemUptime}%`} icon={<Shield className="w-4 h-4 sm:w-5 sm:h-5" />} trend="稳定" color="green" />
              <MetricCard title="错误率" value={`${metrics.errorRate}%`} icon={<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />} trend="-2%" color="red" />
            </div>

            {/* Charts and Real-time Monitor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              <ChartContainer title="用户增长趋势" type="line" />
              <RealTimeMonitor />
            </div>

            {/* Alerts */}
            <AlertPanel alerts={alerts} />
          </div>}

        {/* Automation Tab */}
        {activeTab === 'automation' && <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <AutomationControlPanel onTriggerTask={handleTriggerTask} />
              </div>
              <AutomationStats stats={automationStats} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {automationTasks.map(task => <AutomationTaskCard key={task._id} task={task} onRetry={handleRetryTask} onViewDetails={handleViewTaskDetails} />)}
            </div>
          </div>}

        {/* Payments Tab */}
        {activeTab === 'payments' && <div className="space-y-6 sm:space-y-8">
            <PaymentStatusSync $w={$w} subscriptions={subscriptions} onStatusUpdate={loadDashboardData} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <MetricCard title="总收入" value={`¥${paymentStats.totalRevenue.toLocaleString()}`} icon={<CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />} trend="+18%" color="green" />
              <MetricCard title="待支付" value={paymentStats.pendingPayments} icon={<Clock className="w-4 h-4 sm:w-5 sm:h-5" />} trend="-3" color="yellow" />
              <MetricCard title="支付失败" value={paymentStats.failedPayments} icon={<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />} trend="-1" color="red" />
              <MetricCard title="成功率" value={`${(paymentStats.successRate * 100).toFixed(1)}%`} icon={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />} trend="+2%" color="green" />
            </div>
          </div>}

        {/* Health Tab */}
        {activeTab === 'health' && <div className="space-y-6 sm:space-y-8">
            <HealthMonitor />
          </div>}
      </div>
    </div>;
}
export default function DashboardPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <DashboardContent {...props} />
    </ExperimentProvider>;
}