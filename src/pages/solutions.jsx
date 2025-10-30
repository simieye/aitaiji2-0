// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Zap, Shield, Users, TrendingUp, ArrowRight } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
function SolutionsContent(props) {
  const {
    $w,
    style
  } = props;
  const [solutions, setSolutions] = useState([]);
  const [whitepapers, setWhitepapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('solutions_layout');
  const contentExperiment = useExperiment('content_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadSolutionsData, 30000);
  useEffect(() => {
    loadSolutionsData();
  }, []);
  const loadSolutionsData = async () => {
    try {
      setLoading(true);
      const [solutionsResult, whitepapersResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 12,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 6,
          pageNumber: 1
        }
      }))]);
      setSolutions(solutionsResult.records || []);
      setWhitepapers(whitepapersResult.records || []);
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
  const handleViewSolution = solutionId => {
    $w.utils.navigateTo({
      pageId: 'resources',
      params: {
        id: solutionId
      }
    });
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载解决方案...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-white mb-6">
            行业解决方案
            <span className="text-red-500">专业定制</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            为不同行业量身定制的AI解决方案，助力企业数字化转型
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">解决方案</h2>
          <div className={`grid gap-8 ${layoutExperiment === 'compact' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
            {solutions.map(solution => <Card key={solution._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-white">{solution.title || '解决方案'}</CardTitle>
                  <CardDescription className="text-gray-300">{solution.description || '暂无描述'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500 text-white">{solution.industry || '通用'}</Badge>
                      <Badge className="bg-green-500 text-white">{solution.difficulty || '中级'}</Badge>
                    </div>
                    <Button onClick={() => handleViewSolution(solution._id)} variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-700">
                      查看详情 <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Whitepapers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">技术白皮书</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {whitepapers.map(paper => <Card key={paper._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{paper.title || '技术白皮书'}</CardTitle>
                  <CardDescription className="text-gray-300">{paper.summary || '暂无摘要'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-500 text-white">{paper.category || '技术'}</Badge>
                    <span className="text-sm text-gray-400">{new Date(paper.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                快速部署
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">7天内完成部署，立即见效</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-green-500" />
                安全可靠
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">企业级安全，数据加密保护</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                持续优化
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">AI持续学习，效果不断提升</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
export default function SolutionsPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <SolutionsContent {...props} />
    </ExperimentProvider>;
}