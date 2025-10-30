// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowRight, Zap, Shield, Users, TrendingUp, Play, BookOpen, MessageSquare, Star, Clock } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
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
  const [featuredAgents, setFeaturedAgents] = useState([]);
  const [latestCases, setLatestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const heroExperiment = useExperiment('hero_layout');
  const ctaExperiment = useExperiment('cta_button_color');
  useEffect(() => {
    loadHomepageData();
  }, []);
  const loadHomepageData = async () => {
    try {
      setLoading(true);

      // 并行加载所有首页数据
      const [usersResult, agentsResult, workflowsResult, casesResult] = await Promise.all([$w.cloud.callDataSource({
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
          filter: {
            where: {
              is_featured: {
                $eq: true
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 3,
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
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 3,
          pageNumber: 1
        }
      })]);
      setStats({
        totalUsers: usersResult.total || 0,
        totalAgents: agentsResult.records?.length || 0,
        totalWorkflows: workflowsResult.total || 0,
        totalCases: casesResult.records?.length || 0
      });
      setFeaturedAgents(agentsResult.records || []);
      setLatestCases(casesResult.records || []);
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
  const handleViewAgent = agentId => {
    $w.utils.navigateTo({
      pageId: 'product',
      params: {
        agentId
      }
    });
  };
  const handleViewCase = caseId => {
    $w.utils.navigateTo({
      pageId: 'solutions',
      params: {
        caseId
      }
    });
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载数据...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      {/* Hero Section */}
      <section className={`relative overflow-hidden ${heroExperiment?.variant === 'video' ? 'min-h-screen' : 'min-h-screen'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-black/50 to-white/10"></div>
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">
                AI太极
              </span>
              <br />
              <span className="text-3xl md:text-5xl text-gray-300">
                智能代理平台
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              基于太极哲学的智能代理系统，让AI像太极一样刚柔并济，为您的业务提供灵活而强大的自动化解决方案。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleGetStarted} className={`bg-gradient-to-r ${ctaExperiment?.value || 'from-red-500 to-red-600'} hover:from-red-600 hover:to-red-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                立即开始
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-full">
                <Play className="w-5 h-5 mr-2" />
                观看演示
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-bold text-red-400 mb-2">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-gray-300">活跃用户</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-blue-400 mb-2">{stats.totalAgents}</div>
              <div className="text-gray-300">智能代理</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-green-400 mb-2">{stats.totalWorkflows}</div>
              <div className="text-gray-300">工作流</div>
            </div>
            <div className="group">
              <div className="text-4xl font-bold text-purple-400 mb-2">{stats.totalCases}</div>
              <div className="text-gray-300">成功案例</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">精选智能代理</h2>
            <p className="text-gray-300">基于太极哲学设计的智能代理，刚柔并济</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredAgents.map(agent => <Card key={agent._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">{agent.name}</CardTitle>
                  <CardDescription className="text-gray-300">{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-400">
                      <Zap className="w-4 h-4 mr-2" />
                      <span>{agent.capabilities?.join(', ') || '智能分析'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Shield className="w-4 h-4 mr-2" />
                      <span>隐私保护: {agent.privacy_level || '高'}</span>
                    </div>
                  </div>
                  <Button onClick={() => handleViewAgent(agent._id)} variant="outline" className="w-full mt-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                    查看详情
                  </Button>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Latest Cases */}
      <section className="py-20 bg-gray-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">最新成功案例</h2>
            <p className="text-gray-300">真实客户的成功故事</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {latestCases.map(caseItem => <Card key={caseItem._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{caseItem.title}</CardTitle>
                  <CardDescription className="text-gray-300">{caseItem.industry}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-400">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      <span>效率提升: {caseItem.efficiency_improvement || '30%'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>实施周期: {caseItem.implementation_time || '2周'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <Star className="w-4 h-4 mr-2" />
                      <span>满意度: {caseItem.satisfaction_score || '4.8'}/5</span>
                    </div>
                  </div>
                  <Button onClick={() => handleViewCase(caseItem._id)} variant="outline" className="w-full mt-4 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                    查看详情
                  </Button>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600/20 to-blue-600/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">开始您的AI太极之旅</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            加入数千家企业，体验太极哲学与AI技术的完美融合
          </p>
          <Button onClick={handleGetStarted} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 text-lg rounded-full shadow-lg">
            立即开始免费试用
          </Button>
        </div>
      </section>
    </div>;
}
export default function IndexPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <IndexContent {...props} />
    </ExperimentProvider>;
}