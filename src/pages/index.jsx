// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowRight, Play, Shield, Zap, Globe, BarChart3, Menu, X, ChevronDown } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function IndexContent(props) {
  const {
    $w,
    style
  } = props;
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalWorkflows: 0,
    totalCases: 0
  });
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();

  // 获取实验变体
  const heroExperiment = useExperiment('hero_section');
  const ctaExperiment = useExperiment('cta_button');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadStats, 30000);
  useEffect(() => {
    loadStats();
  }, []);
  const loadStats = async () => {
    try {
      setLoading(true);
      const [usersResult, agentsResult, workflowsResult, casesResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
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
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      }))]);
      setStats({
        totalUsers: usersResult.total || 0,
        totalAgents: agentsResult.total || 0,
        totalWorkflows: workflowsResult.total || 0,
        totalCases: casesResult.total || 0
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
      pageId: 'subscription',
      params: {}
    });
  };
  const handleLearnMore = () => {
    $w.utils.navigateTo({
      pageId: 'about',
      params: {}
    });
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
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-blue-500/10"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6">
            {t('home.title', 'AI太极')}
            <span className="text-red-500 block mt-2">{t('home.subtitle', '智能化解决方案')}</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            {t('home.description', '专业的AI解决方案提供商，助力企业数字化转型')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Button onClick={handleGetStarted} size="lg" className="bg-red-500 hover:bg-red-600 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
              {t('home.getStarted', '开始使用')}
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button onClick={handleLearnMore} variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto">
              {t('home.learnMore', '了解更多')}
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">{stats.totalUsers.toLocaleString()}+</div>
              <div className="text-gray-400 text-sm sm:text-base">活跃用户</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">{stats.totalAgents.toLocaleString()}+</div>
              <div className="text-gray-400 text-sm sm:text-base">智能代理</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">{stats.totalWorkflows.toLocaleString()}+</div>
              <div className="text-gray-400 text-sm sm:text-base">工作流</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">{stats.totalCases.toLocaleString()}+</div>
              <div className="text-gray-400 text-sm sm:text-base">成功案例</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">核心功能</h2>
            <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
              为企业提供全方位的AI智能化解决方案
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-white text-lg sm:text-xl">智能代理</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  强大的AI代理，为您的业务提供智能化支持
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-white text-lg sm:text-xl">工作流自动化</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  自动化业务流程，提升工作效率
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-white text-lg sm:text-xl">数据安全</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  企业级安全保障，保护您的数据隐私
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <CardTitle className="text-white text-lg sm:text-xl">数据分析</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-300 text-sm sm:text-base">
                  深度数据分析，助力业务决策
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-red-500 to-blue-500 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              准备开始您的AI之旅？
            </h2>
            <p className="text-gray-100 text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
              立即体验AI太极的强大功能，让AI为您的业务赋能
            </p>
            <Button onClick={handleGetStarted} size="lg" className="bg-white text-red-500 hover:bg-gray-100 text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4">
              {t('home.getStarted', '开始使用')}
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>;
}
export default function IndexPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <IndexContent {...props} />
    </ExperimentProvider>;
}