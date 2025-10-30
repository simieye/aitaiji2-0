// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowRight, Zap, Shield, Users, TrendingUp, Play, Star, CheckCircle } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { PersonalizedRecommendations } from '@/components/PersonalizedRecommendations';
// @ts-ignore;
import { RealTimeNotifications } from '@/components/RealTimeNotifications';
// @ts-ignore;
import { ContentShowcase } from '@/components/ContentShowcase';
// @ts-ignore;
import { MetricCard } from '@/components/MetricCard';
function IndexContent(props) {
  const {
    $w,
    style
  } = props;
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalWorkflows: 0,
    totalCases: 0,
    totalWhitepapers: 0
  });
  const [loading, setLoading] = useState(true);
  const [pageViewTracked, setPageViewTracked] = useState(false);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const heroExperiment = useExperiment('hero_layout');
  const ctaExperiment = useExperiment('cta_button_style');
  const contentExperiment = useExperiment('content_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadMetricsData, 60000); // 每分钟刷新一次
  useEffect(() => {
    loadMetricsData();
    trackPageView();
    setupSEO();
  }, []);
  const loadMetricsData = async () => {
    try {
      const [usersResult, agentsResult, workflowsResult, casesResult, whitepapersResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
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
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
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
        totalWorkflows: workflowsResult.total || 0,
        totalCases: casesResult.total || 0,
        totalWhitepapers: whitepapersResult.total || 0
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
  const trackPageView = async () => {
    if (pageViewTracked) return;
    try {
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'page_view',
            event_category: 'engagement',
            event_label: 'homepage',
            timestamp: new Date(),
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            referrer: document.referrer
          }
        }
      }));
      setPageViewTracked(true);
    } catch (error) {
      console.error('页面访问追踪失败:', error);
    }
  };
  const setupSEO = () => {
    // 设置页面标题和描述
    document.title = 'AI太极 - 智能代理平台 | 构建下一代AI工作流';

    // 设置meta标签
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = 'AI太极是领先的智能代理平台，提供自动化工作流、AI代理管理和企业级解决方案。立即体验AI驱动的数字化转型。';
    }

    // 设置结构化数据
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "AI太极",
      "description": "智能代理平台，提供自动化工作流和AI解决方案",
      "url": "https://ai-taiji.com",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "CNY"
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  };
  const handleGetStarted = () => {
    // 记录CTA点击事件
    withRetry(() => $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'cta_click',
          event_category: 'conversion',
          event_label: 'get_started',
          timestamp: new Date()
        }
      }
    })).catch(error => console.error('CTA点击追踪失败:', error));
    $w.utils.navigateTo({
      pageId: 'product',
      params: {}
    });
  };
  const handleWatchDemo = () => {
    // 记录演示观看事件
    withRetry(() => $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'demo_click',
          event_category: 'engagement',
          event_label: 'watch_demo',
          timestamp: new Date()
        }
      }
    })).catch(error => console.error('演示点击追踪失败:', error));
    toast({
      title: "演示视频",
      description: "正在加载演示视频...",
      variant: "default"
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
      {/* SEO Meta Tags */}
      <meta name="keywords" content="AI代理,智能工作流,自动化,数字化转型,AI太极" />
      <meta name="author" content="AI太极团队" />
      <meta property="og:title" content="AI太极 - 智能代理平台" />
      <meta property="og:description" content="构建下一代AI工作流，实现企业数字化转型" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="/og-image.jpg" />

      <div className="container mx-auto px-4 py-8">
        {/* Header with Notifications */}
        <div className="flex items-center justify-between mb-8">
          <div></div>
          <RealTimeNotifications $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} />
        </div>

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
            <Button onClick={handleWatchDemo} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
              <Play className="w-4 h-4 mr-2" />
              观看演示
            </Button>
          </div>
        </div>

        {/* Enhanced Metrics */}
        <div className="grid md:grid-cols-5 gap-6 mb-16">
          <MetricCard title="活跃用户" value={metrics.totalUsers.toLocaleString()} icon={<Users className="w-5 h-5" />} trend="+12%" />
          <MetricCard title="智能代理" value={metrics.totalAgents.toLocaleString()} icon={<Zap className="w-5 h-5" />} trend="+8%" />
          <MetricCard title="工作流" value={metrics.totalWorkflows.toLocaleString()} icon={<TrendingUp className="w-5 h-5" />} trend="+15%" />
          <MetricCard title="案例研究" value={metrics.totalCases.toLocaleString()} icon={<Star className="w-5 h-5" />} trend="+20%" />
          <MetricCard title="技术白皮书" value={metrics.totalWhitepapers.toLocaleString()} icon={<CheckCircle className="w-5 h-5" />} trend="+10%" />
        </div>

        {/* Personalized Recommendations */}
        {contentExperiment === 'personalized' && <div className="mb-16">
            <PersonalizedRecommendations $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} />
          </div>}

        {/* Content Showcase */}
        <div className="mb-16">
          <ContentShowcase $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} />
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

        {/* Trust Indicators */}
        <div className="text-center py-12 border-t border-gray-700">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400">企业客户</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">10M+</div>
              <div className="text-gray-400">API调用</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">技术支持</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-gray-400">SLA保证</div>
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