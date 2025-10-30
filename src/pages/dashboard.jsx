// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Users, Zap, DollarSign, Filter, RefreshCw, ExternalLink } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { PaymentHistoryTable } from '@/components/PaymentHistoryTable';
// @ts-ignore;
import { MetricCard } from '@/components/MetricCard';
// @ts-ignore;
import { ChartContainer } from '@/components/ChartContainer';
function DashboardContent(props) {
  const {
    $w,
    style
  } = props;
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalWorkflows: 0,
    totalRevenue: 0
  });
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('dashboard_layout');
  const chartExperiment = useExperiment('dashboard_charts');
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [usersResult, agentsResult, workflowsResult, paymentsResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_agent',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_workflow',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_payment_provider',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'anonymous'
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      })]);
      const totalRevenue = paymentsResult.records?.reduce((sum, payment) => payment.status === 'succeeded' ? sum + payment.amount : sum, 0) || 0;
      setMetrics({
        totalUsers: usersResult.total || 0,
        totalAgents: agentsResult.total || 0,
        totalWorkflows: workflowsResult.total || 0,
        totalRevenue: totalRevenue
      });
      setPayments(paymentsResult.records || []);
      setFilteredPayments(paymentsResult.records || []);
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
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast({
      title: "数据已刷新",
      description: "仪表板数据已更新",
      variant: "default"
    });
  };
  const handleProviderFilter = provider => {
    setSelectedProvider(provider);
    if (provider === 'all') {
      setFilteredPayments(payments);
    } else {
      setFilteredPayments(payments.filter(payment => payment.provider === provider));
    }
  };
  const handleViewPaymentDetails = paymentId => {
    // 记录查看事件
    $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'payment_details_view',
          event_category: 'engagement',
          event_action: 'view',
          event_label: paymentId,
          timestamp: new Date()
        }
      }
    });
    toast({
      title: "查看详情",
      description: "正在打开支付详情...",
      variant: "default"
    });
  };
  const getProviderStats = () => {
    const stats = {
      stripe: 0,
      paypal: 0,
      alipay: 0
    };
    payments.forEach(payment => {
      if (payment.status === 'succeeded' && stats.hasOwnProperty(payment.provider)) {
        stats[payment.provider] += payment.amount;
      }
    });
    return stats;
  };
  const providerStats = getProviderStats();
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载仪表板...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">管理仪表板</h1>
            <p className="text-gray-300">AI太极平台运营数据总览</p>
          </div>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? '刷新中...' : '刷新数据'}
          </Button>
        </div>

        {/* Metrics Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <MetricCard icon={Users} title="总用户数" value={metrics.totalUsers.toLocaleString()} color="text-blue-500" trend="+12%" />
          <MetricCard icon={Zap} title="智能代理" value={metrics.totalAgents.toLocaleString()} color="text-green-500" trend="+8%" />
          <MetricCard icon={TrendingUp} title="工作流" value={metrics.totalWorkflows.toLocaleString()} color="text-purple-500" trend="+15%" />
          <MetricCard icon={DollarSign} title="总收入" value={`¥${(metrics.totalRevenue / 100).toLocaleString()}`} color="text-red-500" trend="+20%" />
        </div>

        {/* Provider Revenue Chart */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Stripe收入</CardTitle>
              <CardDescription className="text-gray-300">来自Stripe支付的收入</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">¥{(providerStats.stripe / 100).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">PayPal收入</CardTitle>
              <CardDescription className="text-gray-300">来自PayPal支付的收入</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">¥{(providerStats.paypal / 100).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">支付宝收入</CardTitle>
              <CardDescription className="text-gray-300">来自支付宝支付的收入</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">¥{(providerStats.alipay / 100).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">支付记录</h2>
            <div className="flex items-center space-x-4">
              <Select value={selectedProvider} onValueChange={handleProviderFilter}>
                <SelectTrigger className="w-32 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="筛选提供商" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="alipay">支付宝</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-gray-400">
                共 {filteredPayments.length} 条记录
              </div>
            </div>
          </div>
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardContent className="p-0">
              <PaymentHistoryTable payments={filteredPayments} onViewDetails={handleViewPaymentDetails} />
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <ChartContainer title="支付趋势" data={payments} />
          <ChartContainer title="用户增长" data={[]} />
        </div>
      </div>
    </div>;
}
export default function DashboardPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <DashboardContent {...props} />
    </ExperimentProvider>;
}