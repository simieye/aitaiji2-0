// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Zap, Play, Shield, BarChart3, ArrowRight, Star, Users, Clock } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function ProductContent(props) {
  const {
    $w,
    style
  } = props;
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();

  // 获取实验变体
  const productExperiment = useExperiment('product_display');
  const layoutExperiment = useExperiment('product_layout');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadAgents, 30000);
  useEffect(() => {
    loadAgents();
  }, []);
  const loadAgents = async () => {
    try {
      setLoading(true);
      const result = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_agent',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      }));
      setAgents(result.records || []);
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
  const categories = [{
    id: 'all',
    name: '全部',
    icon: <Zap className="w-4 h-4" />
  }, {
    id: 'automation',
    name: '自动化',
    icon: <Play className="w-4 h-4" />
  }, {
    id: 'security',
    name: '安全',
    icon: <Shield className="w-4 h-4" />
  }, {
    id: 'analytics',
    name: '分析',
    icon: <BarChart3 className="w-4 h-4" />
  }];
  const filteredAgents = selectedCategory === 'all' ? agents : agents.filter(agent => agent.category === selectedCategory);
  const handleTryAgent = agent => {
    toast({
      title: "开始体验",
      description: `正在启动 ${agent.name}...`,
      variant: "default"
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            {t('product.title', '产品')}
            <span className="text-red-500 block mt-2">{t('product.subtitle', '智能产品')}</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            {t('product.description', '我们的AI产品系列')}
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {categories.map(category => <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg border transition-all text-sm sm:text-base ${selectedCategory === category.id ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-gray-600 text-gray-300 hover:border-gray-500'}`}>
                {category.icon}
                <span>{category.name}</span>
              </button>)}
          </div>
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {filteredAgents.map(agent => <Card key={agent._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <Badge className="bg-green-500 text-white text-xs sm:text-sm">
                    {agent.status === 'active' ? '可用' : '维护中'}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg sm:text-xl mb-2">{agent.name}</CardTitle>
                <CardDescription className="text-gray-300 text-sm sm:text-base mb-4">
                  {agent.description || '强大的AI智能代理，为您的业务提供智能化支持'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-400">{agent.userCount || 0} 用户</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-gray-400">{agent.rating || 4.8} 评分</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-gray-400">{agent.responseTime || '1.2s'} 响应</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-400">{agent.accuracy || '98%'} 准确率</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => handleTryAgent(agent)} className="flex-1 bg-red-500 hover:bg-red-600 text-sm sm:text-base">
                      立即体验
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-700 text-sm sm:text-base">
                      查看详情
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 sm:py-16">
          <div className="bg-gradient-to-r from-red-500 to-blue-500 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
              准备好体验AI产品了吗？
            </h2>
            <p className="text-gray-100 text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
              立即开始使用我们的AI产品，提升您的工作效率
            </p>
            <Button className="bg-white text-red-500 hover:bg-gray-100 text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4">
              开始使用
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>;
}
export default function ProductPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ProductContent {...props} />
    </ExperimentProvider>;
}