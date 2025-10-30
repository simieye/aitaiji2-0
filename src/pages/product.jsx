// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, Zap, Shield, Users, TrendingUp, ArrowRight, Star, CheckCircle } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { ProductComparison } from '@/components/ProductComparison';
// @ts-ignore;
import { UserReviews } from '@/components/UserReviews';
// @ts-ignore;
import { TrialApplication } from '@/components/TrialApplication';
// @ts-ignore;
import { ProductFeatures } from '@/components/ProductFeatures';
// @ts-ignore;
import { MetricCard } from '@/components/MetricCard';
function ProductContent(props) {
  const {
    $w,
    style
  } = props;
  const [products, setProducts] = useState([]);
  const [tools, setTools] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('product_layout');
  const pricingExperiment = useExperiment('pricing_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadProductData, 30000);
  useEffect(() => {
    loadProductData();
  }, []);
  const loadProductData = async () => {
    try {
      setLoading(true);
      const [productsResult, toolsResult, workflowsResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_tool',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 20,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_workflow',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 20,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 6,
          pageNumber: 1
        }
      }))]);

      // 转换工具数据为产品格式
      const productData = (toolsResult.records || []).map(tool => ({
        _id: tool._id,
        name: tool.name || '未命名产品',
        description: tool.description || '暂无描述',
        price: Math.floor(Math.random() * 1000) + 99,
        category: tool.category || '通用',
        features: ['AI驱动', '实时处理', '数据安全', '易于集成'],
        rating: 4.5 + Math.random() * 0.5,
        userCount: Math.floor(Math.random() * 10000) + 1000
      }));
      setProducts(productData);
      setTools(toolsResult.records || []);
      setWorkflows(workflowsResult.records || []);
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
    // 记录转化事件
    withRetry(() => $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'product_get_started',
          event_category: 'conversion',
          event_label: 'product_page',
          timestamp: new Date()
        }
      }
    })).catch(error => console.error('转化事件记录失败:', error));
    $w.utils.navigateTo({
      pageId: 'subscription',
      params: {}
    });
  };
  const handleStartTrial = () => {
    setActiveTab('trial');
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载产品信息...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-white mb-6">
            AI太极产品套件
            <span className="text-red-500">智能解决方案</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            从智能代理到工作流自动化，我们提供完整的AI解决方案
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleGetStarted} className="bg-red-500 hover:bg-red-600">
              开始免费试用 <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button onClick={handleStartTrial} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
              申请演示
            </Button>
          </div>
        </div>

        {/* Product Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <MetricCard title="活跃工具" value={tools.length.toLocaleString()} icon={<Zap className="w-5 h-5" />} trend="+12%" />
          <MetricCard title="工作流" value={workflows.length.toLocaleString()} icon={<TrendingUp className="w-5 h-5" />} trend="+8%" />
          <MetricCard title="企业用户" value="500+" icon={<Users className="w-5 h-5" />} trend="+15%" />
          <MetricCard title="满意度" value="98%" icon={<Star className="w-5 h-5" />} trend="稳定" />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            <Button onClick={() => setActiveTab('overview')} variant={activeTab === 'overview' ? 'default' : 'ghost'} className={`${activeTab === 'overview' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              产品概览
            </Button>
            <Button onClick={() => setActiveTab('comparison')} variant={activeTab === 'comparison' ? 'default' : 'ghost'} className={`${activeTab === 'comparison' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              产品对比
            </Button>
            <Button onClick={() => setActiveTab('reviews')} variant={activeTab === 'reviews' ? 'default' : 'ghost'} className={`${activeTab === 'reviews' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              用户评价
            </Button>
            <Button onClick={() => setActiveTab('trial')} variant={activeTab === 'trial' ? 'default' : 'ghost'} className={`${activeTab === 'trial' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              申请试用
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && <div className="space-y-16">
            {/* Product Features */}
            <ProductFeatures features={[]} />

            {/* Products Grid */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white text-center">核心产品</h2>
              <div className={`grid gap-8 ${layoutExperiment === 'grid' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                {products.map(product => <Card key={product._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{product.name}</CardTitle>
                        <Badge className="bg-blue-500 text-white">{product.category}</Badge>
                      </div>
                      <CardDescription className="text-gray-300">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-white">¥{product.price}</div>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 mr-1" />
                            <span className="text-yellow-500">{product.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-400">
                          {product.userCount.toLocaleString()} 用户正在使用
                        </div>
                        <Button onClick={() => handleGetStarted()} className="w-full bg-red-500 hover:bg-red-600">
                          立即开始
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>

            {/* Tools and Workflows */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">智能工具</h3>
                <div className="space-y-4">
                  {tools.slice(0, 3).map(tool => <Card key={tool._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{tool.name || '未命名工具'}</h4>
                            <p className="text-gray-400 text-sm">{tool.description || '暂无描述'}</p>
                          </div>
                          <Badge className="bg-green-500 text-white">可用</Badge>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white">工作流模板</h3>
                <div className="space-y-4">
                  {workflows.slice(0, 3).map(workflow => <Card key={workflow._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-medium">{workflow.name || '未命名工作流'}</h4>
                            <p className="text-gray-400 text-sm">{workflow.description || '暂无描述'}</p>
                          </div>
                          <Badge className="bg-purple-500 text-white">模板</Badge>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>
              </div>
            </div>
          </div>}

        {/* Comparison Tab */}
        {activeTab === 'comparison' && <ProductComparison products={products} onGetStarted={handleGetStarted} />}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && <UserReviews $w={$w} productId="product_page" />}

        {/* Trial Tab */}
        {activeTab === 'trial' && <div className="max-w-2xl mx-auto">
            <TrialApplication $w={$w} productId="product_page" />
          </div>}
      </div>
    </div>;
}
export default function ProductPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ProductContent {...props} />
    </ExperimentProvider>;
}