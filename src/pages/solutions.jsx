// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, TrendingUp, Clock, Users, Star, ExternalLink, BookOpen, MessageSquare } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
function SolutionsContent(props) {
  const {
    $w,
    style
  } = props;
  const [cases, setCases] = useState([]);
  const [whitepapers, setWhitepapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('solutions_layout');
  const filterExperiment = useExperiment('solutions_filter');
  useEffect(() => {
    loadSolutionsData();
  }, []);
  const loadSolutionsData = async () => {
    try {
      setLoading(true);

      // 并行加载解决方案数据
      const [casesResult, whitepapersResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      })]);
      setCases(casesResult.records || []);
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
  const handleViewCase = caseId => {
    $w.utils.navigateTo({
      pageId: 'solutions',
      params: {
        caseId
      }
    });
  };
  const handleDownloadWhitepaper = whitepaperId => {
    // 记录下载事件
    $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'whitepaper_download',
          event_category: 'engagement',
          event_action: 'download',
          event_label: whitepaperId,
          timestamp: new Date()
        }
      }
    });
    toast({
      title: "下载成功",
      description: "白皮书已开始下载",
      variant: "default"
    });
  };
  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || caseItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === 'all' || caseItem.industry === selectedIndustry;
    const matchesCategory = selectedCategory === 'all' || caseItem.category === selectedCategory;
    return matchesSearch && matchesIndustry && matchesCategory;
  });
  const filteredWhitepapers = whitepapers.filter(whitepaper => {
    const matchesSearch = whitepaper.title.toLowerCase().includes(searchTerm.toLowerCase()) || whitepaper.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || whitepaper.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const getCaseStatus = caseItem => {
    if (caseItem.status === 'published') return {
      color: 'bg-green-500',
      text: '已发布'
    };
    if (caseItem.status === 'draft') return {
      color: 'bg-yellow-500',
      text: '草稿'
    };
    return {
      color: 'bg-blue-500',
      text: '进行中'
    };
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
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">解决方案与案例</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            探索AI太极在不同行业的成功应用案例和深度研究报告
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="搜索案例或白皮书..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            </div>
            {filterExperiment?.variant !== 'hidden' && <div className="flex gap-2">
                <select value={selectedIndustry} onChange={e => setSelectedIndustry(e.target.value)} className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
                  <option value="all">所有行业</option>
                  <option value="finance">金融</option>
                  <option value="healthcare">医疗</option>
                  <option value="retail">零售</option>
                  <option value="manufacturing">制造</option>
                  <option value="education">教育</option>
                </select>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
                  <option value="all">所有类别</option>
                  <option value="automation">自动化</option>
                  <option value="analytics">分析</option>
                  <option value="optimization">优化</option>
                </select>
              </div>}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cases" className="space-y-8">
          <TabsList className="bg-gray-800 border-gray-600">
            <TabsTrigger value="cases" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">成功案例</TabsTrigger>
            <TabsTrigger value="whitepapers" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">白皮书</TabsTrigger>
          </TabsList>

          <TabsContent value="cases">
            <div className={`grid ${layoutExperiment?.variant === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
              {filteredCases.map(caseItem => {
              const status = getCaseStatus(caseItem);
              return <Card key={caseItem._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{caseItem.title}</CardTitle>
                        <Badge className={`${status.color} text-white text-xs`}>{status.text}</Badge>
                      </div>
                      <CardDescription className="text-gray-300">{caseItem.industry} • {caseItem.company_size}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-gray-400 text-sm">{caseItem.description}</p>
                        <div className="flex items-center text-sm text-gray-400">
                          <TrendingUp className="w-4 h-4 mr-2" />
                          <span>效率提升: {caseItem.efficiency_improvement || '30%'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>实施周期: {caseItem.implementation_time || '2周'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Users className="w-4 h-4 mr-2" />
                          <span>团队规模: {caseItem.team_size || '5人'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Star className="w-4 h-4 mr-2" />
                          <span>满意度: {caseItem.satisfaction_score || '4.8'}/5</span>
                        </div>
                      </div>
                      <Button onClick={() => handleViewCase(caseItem._id)} variant="outline" className="w-full mt-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        查看详情
                      </Button>
                    </CardContent>
                  </Card>;
            })}
            </div>
          </TabsContent>

          <TabsContent value="whitepapers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredWhitepapers.map(whitepaper => <Card key={whitepaper._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">{whitepaper.title}</CardTitle>
                    <CardDescription className="text-gray-300">{whitepaper.category} • {whitepaper.author}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-gray-400 text-sm">{whitepaper.description}</p>
                      <div className="flex items-center text-sm text-gray-400">
                        <BookOpen className="w-4 h-4 mr-2" />
                        <span>页数: {whitepaper.page_count || '15页'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>发布时间: {new Date(whitepaper.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>下载次数: {whitepaper.download_count || 0}</span>
                      </div>
                    </div>
                    <Button onClick={() => handleDownloadWhitepaper(whitepaper._id)} variant="outline" className="w-full mt-4 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                      <BookOpen className="w-4 h-4 mr-2" />
                      下载白皮书
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}
export default function SolutionsPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <SolutionsContent {...props} />
    </ExperimentProvider>;
}