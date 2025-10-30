// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowRight, Zap, Shield, Users, TrendingUp, Play } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
function IndexContent(props) {
  const {
    $w,
    style
  } = props;
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalWorkflows: 0
  });
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const heroExperiment = useExperiment('hero_layout');
  const ctaExperiment = useExperiment('cta_button_style');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadMetricsData, 30000);
  useEffect(() => {
    loadMetricsData();
  }, []);
  const loadMetricsData = async () => {
    try {
      const [usersResult, agentsResult, workflowsResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
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
      }))]);
      setMetrics({
        totalUsers: usersResult.total || 0,
        totalAgents: agentsResult.total || 0,
        totalWorkflows: workflowsResult.total || 0
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
  const handleGetStarted = () => {
    $w.utils.navigateTo({
      pageId: 'product',
      params: {}
    });
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className={`text-6xl font-bold text-white mb-6 ${heroExperiment === 'large' ? 'text-7xl' : ''}`}>
            AI太极
            <span className="text-red-500">智能代理</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            构建下一代AI代理，自动化您的工作流程，释放无限可能
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleGetStarted} className={`bg-red-500 hover:bg-red-600 ${ctaExperiment === 'large' ? 'px-8 py-4 text-lg' : ''}`}>
              立即开始 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
              <Play className="w-4 h-4 mr-2" />
              观看演示
            </Button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                活跃用户
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{metrics.totalUsers.toLocaleString()}</div>
              <Badge className="bg-green-500 text-white mt-2">+12% 本月</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                智能代理
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{metrics.totalAgents.toLocaleString()}</div>
              <Badge className="bg-blue-500 text-white mt-2">+8% 本月</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                工作流
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{metrics.totalWorkflows.toLocaleString()}</div>
              <Badge className="bg-purple-500 text-white mt-2">+15% 本月</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">智能自动化</h2>
            <p className="text-gray-300 mb-6">
              利用先进的AI技术，自动处理重复性任务，让您专注于更有价值的工作。
            </p>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center"><Shield className="w-5 h-5 mr-2 text-green-500" />企业级安全保障</li>
              <li className="flex items-center"><Zap className="w-5 h-5 mr-2 text-blue-500" />毫秒级响应速度</li>
              <li className="flex items-center"><Users className="w-5 h-5 mr-2 text-purple-500" />团队协作支持</li>
            </ul>
          </div>
          <div className="bg-gray-800 rounded-lg p-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-red-500 mb-2">99.9%</div>
              <div className="text-gray-300">系统可用性</div>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export default function IndexPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <IndexContent {...props} />
    </ExperimentProvider>;
}