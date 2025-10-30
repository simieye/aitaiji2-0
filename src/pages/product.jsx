// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, Zap, Shield, Users, ArrowRight, Star } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
function ProductContent(props) {
  const {
    $w,
    style
  } = props;
  const [products, setProducts] = useState([]);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const [productsResult, featuresResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_tool',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10,
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
      setProducts(productsResult.records || []);
      setFeatures(featuresResult.records || []);
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
  const handleStartTrial = () => {
    $w.utils.navigateTo({
      pageId: 'subscription',
      params: {}
    });
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
          <Button onClick={handleStartTrial} className="bg-red-500 hover:bg-red-600">
            开始免费试用 <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Products */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">核心产品</h2>
          <div className={`grid gap-8 ${layoutExperiment === 'grid' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {products.map(product => <Card key={product._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{product.name || '未命名产品'}</CardTitle>
                  <CardDescription className="text-gray-300">{product.description || '暂无描述'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-500 text-white">{product.category || '通用'}</Badge>
                    <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                      了解详情
                    </Button>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">产品特性</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  极速部署
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">一键部署，分钟级上线</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-500" />
                  企业安全
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">端到端加密，企业级安全</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-500" />
                  团队协作
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">多人协作，权限管理</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Case Studies */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">成功案例</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.slice(0, 4).map(feature => <Card key={feature._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">{feature.title || '案例研究'}</CardTitle>
                  <CardDescription className="text-gray-300">{feature.description || '暂无描述'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-gray-300 text-sm">客户满意度: {feature.satisfaction || '95%'}</span>
                  </div>
                </CardContent>
              </Card>)}
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