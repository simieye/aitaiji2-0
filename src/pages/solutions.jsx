// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Lightbulb, Building, ShoppingCart, Factory, GraduationCap, Heart, ArrowRight, CheckCircle } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function SolutionsContent(props) {
  const {
    $w,
    style
  } = props;
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();

  // 获取实验变体
  const solutionExperiment = useExperiment('solution_display');
  const layoutExperiment = useExperiment('solution_layout');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadSolutions, 30000);
  useEffect(() => {
    loadSolutions();
  }, []);
  const loadSolutions = async () => {
    try {
      setLoading(true);
      const result = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      }));
      setSolutions(result.records || []);
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
  const industries = [{
    id: 'all',
    name: '全部行业',
    icon: <Lightbulb className="w-4 h-4" />
  }, {
    id: 'retail',
    name: '零售电商',
    icon: <ShoppingCart className="w-4 h-4" />
  }, {
    id: 'manufacturing',
    name: '制造业',
    icon: <Factory className="w-4 h-4" />
  }, {
    id: 'finance',
    name: '金融',
    icon: <Building className="w-4 h-4" />
  }, {
    id: 'education',
    name: '教育',
    icon: <GraduationCap className="w-4 h-4" />
  }, {
    id: 'healthcare',
    name: '医疗',
    icon: <Heart className="w-4 h-4" />
  }];
  const filteredSolutions = selectedIndustry === 'all' ? solutions : solutions.filter(solution => solution.industry === selectedIndustry);
  const handleLearnMore = solution => {
    toast({
      title: "查看详情",
      description: `正在加载 ${solution.title} 的详细信息...`,
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
            {t('solutions.title', '解决方案')}
            <span className="text-red-500 block mt-2">{t('solutions.subtitle', '行业解决方案')}</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            {t('solutions.description', '为各行业提供定制化AI解决方案')}
          </p>
        </div>

        {/* Industries */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {industries.map(industry => <button key={industry.id} onClick={() => setSelectedIndustry(industry.id)} className={`flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border transition-all text-sm sm:text-base ${selectedIndustry === industry.id ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-gray-600 text-gray-300 hover:border-gray-500'}`}>
                {industry.icon}
                <span>{industry.name}</span>
              </button>)}
          </div>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {filteredSolutions.map(solution => <Card key={solution._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <Badge className="bg-blue-500 text-white text-xs sm:text-sm">
                    {solution.category || 'AI解决方案'}
                  </Badge>
                </div>
                <CardTitle className="text-white text-lg sm:text-xl mb-2">{solution.title}</CardTitle>
                <CardDescription className="text-gray-300 text-sm sm:text-base mb-4">
                  {solution.description || '为您的行业量身定制的AI解决方案'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-300 text-sm sm:text-base">提升效率 30%+</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-300 text-sm sm:text-base">降低成本 25%+</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-300 text-sm sm:text-base">快速部署 7天</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={() => handleLearnMore(solution)} className="flex-1 bg-blue-500 hover:bg-blue-600 text-sm sm:text-base">
                      了解详情
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-700 text-sm sm:text-base">
                      预约演示
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Stats Section */}
        <div className="py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">成功案例</h2>
            <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto">
              已为众多企业成功部署AI解决方案
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400 text-sm sm:text-base">服务企业</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-400 text-sm sm:text-base">客户满意度</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">50%</div>
              <div className="text-gray-400 text-sm sm:text-base">效率提升</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400 text-sm sm:text-base">技术支持</div>
            </div>
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