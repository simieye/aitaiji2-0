// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Zap, Shield, Users, TrendingUp, ArrowRight, Filter, Calculator, Star } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { SolutionFilter } from '@/components/SolutionFilter';
// @ts-ignore;
import { ROICalculator } from '@/components/ROICalculator';
// @ts-ignore;
import { CustomerSuccessStory } from '@/components/CustomerSuccessStory';
// @ts-ignore;
import { SolutionRecommendations } from '@/components/SolutionRecommendations';
// @ts-ignore;
import { MetricCard } from '@/components/MetricCard';
function SolutionsContent(props) {
  const {
    $w,
    style
  } = props;
  const [solutions, setSolutions] = useState([]);
  const [whitepapers, setWhitepapers] = useState([]);
  const [filteredSolutions, setFilteredSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [activeTab, setActiveTab] = useState('solutions');
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
  useEffect(() => {
    filterSolutions();
  }, [solutions, searchTerm, selectedIndustry, selectedDifficulty, selectedTags]);
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
          pageSize: 50,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 30,
          pageNumber: 1
        }
      }))]);

      // 转换案例数据为解决方案格式
      const solutionData = (solutionsResult.records || []).map(item => ({
        _id: item._id,
        title: item.title || '未命名解决方案',
        description: item.description || '暂无描述',
        industry: item.industry || ['科技', '金融', '医疗', '教育', '零售'][Math.floor(Math.random() * 5)],
        difficulty: item.difficulty || ['初级', '中级', '高级'][Math.floor(Math.random() * 3)],
        tags: item.tags || ['AI驱动', '自动化', '效率提升', '成本优化'].slice(0, Math.floor(Math.random() * 3) + 1),
        popularity: Math.random() > 0.5 ? '高' : '中',
        rating: 4.0 + Math.random(),
        implementationTime: Math.floor(Math.random() * 90) + 30,
        roi: Math.floor(Math.random() * 300) + 100
      }));
      setSolutions(solutionData);
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
  const filterSolutions = () => {
    let filtered = solutions;
    if (selectedIndustry !== 'all') {
      filtered = filtered.filter(solution => solution.industry === selectedIndustry);
    }
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(solution => solution.difficulty === selectedDifficulty);
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter(solution => selectedTags.some(tag => solution.tags?.includes(tag)));
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(solution => solution.title?.toLowerCase().includes(term) || solution.description?.toLowerCase().includes(term));
    }
    setFilteredSolutions(filtered);
  };
  const handleViewSolution = solutionId => {
    // 记录查看事件
    withRetry(() => $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'solution_view',
          event_category: 'engagement',
          event_label: solutionId,
          timestamp: new Date(),
          metadata: {
            industry: selectedIndustry,
            difficulty: selectedDifficulty,
            tags: selectedTags
          }
        }
      }
    })).catch(error => console.error('记录查看事件失败:', error));
    $w.utils.navigateTo({
      pageId: 'resources',
      params: {
        id: solutionId
      }
    });
  };
  // 获取筛选选项
  const industries = [...new Set(solutions.map(s => s.industry).filter(Boolean))];
  const difficulties = [...new Set(solutions.map(s => s.difficulty).filter(Boolean))];
  const allTags = [...new Set(solutions.flatMap(s => s.tags || []).filter(Boolean))];

  // 客户成功故事数据
  const customerStories = [{
    _id: '1',
    customerName: '科技创新有限公司',
    industry: '科技',
    rating: 5,
    implementationDate: '2023年6月',
    testimonial: 'AI太极的解决方案帮助我们提升了45%的工作效率，ROI达到了200%以上。',
    fullTestimonial: 'AI太极的解决方案帮助我们提升了45%的工作效率，ROI达到了200%以上。他们的团队非常专业，实施过程顺利，后续支持也很到位。我们强烈推荐给需要数字化转型的企业。',
    efficiencyGain: 45,
    roi: 200,
    satisfaction: 98,
    tags: ['AI驱动', '自动化', '效率提升'],
    customerLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop&crop=face'
  }, {
    _id: '2',
    customerName: '金融服务集团',
    industry: '金融',
    rating: 5,
    implementationDate: '2023年8月',
    testimonial: '通过AI太极的智能工作流，我们的处理时间缩短了60%，客户满意度显著提升。',
    fullTestimonial: '通过AI太极的智能工作流，我们的处理时间缩短了60%，客户满意度显著提升。这个解决方案不仅提高了效率，还降低了运营成本。投资回报率超出了我们的预期。',
    efficiencyGain: 60,
    roi: 180,
    satisfaction: 96,
    tags: ['金融科技', '流程优化', '成本降低'],
    customerLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop&crop=face'
  }, {
    _id: '3',
    customerName: '医疗健康机构',
    industry: '医疗',
    rating: 4,
    implementationDate: '2023年10月',
    testimonial: 'AI太极的解决方案帮助我们优化了患者管理流程，医护人员的工作负担明显减轻。',
    fullTestimonial: 'AI太极的解决方案帮助我们优化了患者管理流程，医护人员的工作负担明显减轻。系统的智能化程度很高，学习成本相对较低。我们计划在更多部门推广使用。',
    efficiencyGain: 35,
    roi: 150,
    satisfaction: 92,
    tags: ['医疗AI', '流程优化', '效率提升'],
    customerLogo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop&crop=face'
  }];
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
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-white mb-6">
            行业解决方案
            <span className="text-red-500">专业定制</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            为不同行业量身定制的AI解决方案，助力企业数字化转型
          </p>
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <MetricCard title="解决方案" value={solutions.length.toLocaleString()} icon={<Zap className="w-5 h-5" />} trend="+15%" />
          <MetricCard title="服务客户" value="500+" icon={<Users className="w-5 h-5" />} trend="+20%" />
          <MetricCard title="平均ROI" value="180%" icon={<TrendingUp className="w-5 h-5" />} trend="+10%" />
          <MetricCard title="客户满意度" value="96%" icon={<Star className="w-5 h-5" />} trend="稳定" />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            <Button onClick={() => setActiveTab('solutions')} variant={activeTab === 'solutions' ? 'default' : 'ghost'} className={`${activeTab === 'solutions' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              解决方案
            </Button>
            <Button onClick={() => setActiveTab('roi')} variant={activeTab === 'roi' ? 'default' : 'ghost'} className={`${activeTab === 'roi' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              ROI计算器
            </Button>
            <Button onClick={() => setActiveTab('stories')} variant={activeTab === 'stories' ? 'default' : 'ghost'} className={`${activeTab === 'stories' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              成功案例
            </Button>
            <Button onClick={() => setActiveTab('recommendations')} variant={activeTab === 'recommendations' ? 'default' : 'ghost'} className={`${activeTab === 'recommendations' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              为您推荐
            </Button>
          </div>
        </div>

        {/* Solutions Tab */}
        {activeTab === 'solutions' && <div className="space-y-8">
            {/* Filter */}
            <SolutionFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedIndustry={selectedIndustry} onIndustryChange={setSelectedIndustry} selectedDifficulty={selectedDifficulty} onDifficultyChange={setSelectedDifficulty} selectedTags={selectedTags} onTagsChange={setSelectedTags} industries={industries} difficulties={difficulties} tags={allTags} />

            {/* Solutions Grid */}
            <div className={`grid gap-8 ${layoutExperiment === 'compact' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {filteredSolutions.map(solution => <Card key={solution._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-500 text-white">{solution.industry}</Badge>
                        <Badge className="bg-green-500 text-white">{solution.difficulty}</Badge>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        <span className="text-yellow-500 text-sm">{solution.rating?.toFixed(1)}</span>
                      </div>
                    </div>
                    <CardTitle className="text-white">{solution.title}</CardTitle>
                    <CardDescription className="text-gray-300">{solution.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">实施周期: {solution.implementationTime}天</span>
                        <span className="text-gray-400 text-sm">ROI: {solution.roi}%</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {solution.tags?.map((tag, index) => <span key={index} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>)}
                      </div>
                      <Button onClick={() => handleViewSolution(solution._id)} className="w-full bg-red-500 hover:bg-red-600">
                        查看详情 <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>

            {filteredSolutions.length === 0 && <div className="text-center py-12">
                <div className="text-gray-400">
                  <Filter className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">暂无匹配的解决方案</h3>
                  <p className="text-gray-400">请调整筛选条件或搜索关键词</p>
                </div>
              </div>}
          </div>}

        {/* ROI Calculator Tab */}
        {activeTab === 'roi' && <div className="max-w-4xl mx-auto">
            <ROICalculator />
          </div>}

        {/* Customer Stories Tab */}
        {activeTab === 'stories' && <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">客户成功故事</h2>
              <p className="text-gray-300">了解其他企业如何通过AI太极实现数字化转型</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {customerStories.map(story => <CustomerSuccessStory key={story._id} story={story} />)}
            </div>
          </div>}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && <div className="space-y-8">
            <SolutionRecommendations $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} solutions={solutions} />
          </div>}

        {/* Whitepapers */}
        <div className="mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">技术白皮书</h2>
            <p className="text-gray-300">深入了解AI太极的技术架构和最佳实践</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {whitepapers.slice(0, 4).map(whitepaper => <Card key={whitepaper._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{whitepaper.name}</CardTitle>
                  <CardDescription className="text-gray-300">{whitepaper.summary}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-purple-500 text-white">技术白皮书</Badge>
                    <span className="text-gray-400 text-sm">{new Date(whitepaper.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </div>;
}
export default function SolutionsPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <SolutionsContent {...props} />
    </ExperimentProvider>;
}