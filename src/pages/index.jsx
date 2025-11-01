// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowRight, Brain, Zap, Shield, Star, Users, TrendingUp, CheckCircle, Play, Menu, X } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { useLanguage } from '@/components/LanguageContext';
function IndexContent(props) {
  const {
    $w,
    style
  } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalWorkflows: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();

  // 获取实验变体
  const heroExperiment = useExperiment('hero_section');
  const featuresExperiment = useExperiment('features_layout');

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
      // 模拟数据加载
      const mockStats = {
        totalUsers: 12580,
        totalAgents: 342,
        totalWorkflows: 1289,
        successRate: 98.7
      };
      setStats(mockStats);
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
      pageId: 'product',
      params: {}
    });
  };
  const features = [{
    icon: <Brain className="w-8 h-8 text-red-500" />,
    title: '智能代理',
    description: '基于先进AI技术的智能代理，为您提供专业的解决方案',
    color: 'from-blue-500 to-purple-600'
  }, {
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    title: '快速部署',
    description: '一键部署，快速集成，让您的业务立即享受AI带来的便利',
    color: 'from-yellow-500 to-orange-600'
  }, {
    icon: <Shield className="w-8 h-8 text-green-500" />,
    title: '安全可靠',
    description: '企业级安全保障，确保您的数据和隐私得到最高级别的保护',
    color: 'from-green-500 to-teal-600'
  }];
  const testimonials = [{
    name: '张三',
    role: 'CTO',
    company: '科技创新公司',
    content: 'AI太极的智能代理解决方案极大地提升了我们的工作效率，推荐给所有需要AI赋能的企业。',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    rating: 5
  }, {
    name: '李四',
    role: '产品经理',
    company: '互联网企业',
    content: '简单易用的界面，强大的功能，AI太极是我们数字化转型的重要伙伴。',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    rating: 5
  }, {
    name: '王五',
    role: '技术总监',
    company: '金融科技公司',
    content: '安全性和稳定性都让我们非常满意，AI太极为我们的业务带来了革命性的变化。',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    rating: 5
  }];
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-b-2 border-red-500 mx-auto"></div>
          <p className="text-white mt-4 text-sm sm:text-base">{t('common.loading', '加载中...')}</p>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-blue-900/20"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 sm:mb-6">
            AI太极
            <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 text-red-500">
              智能代理解决方案
            </span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 px-4">
            基于先进AI技术的智能代理平台，为您的企业提供全方位的智能化解决方案
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Button onClick={handleGetStarted} className="bg-red-500 hover:bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
              {t('common.add', '开始使用')}
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button onClick={handleLearnMore} variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg">
              了解更多
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                {stats.totalUsers.toLocaleString()}+
              </div>
              <div className="text-gray-400 text-sm sm:text-base">活跃用户</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                {stats.totalAgents}+
              </div>
              <div className="text-gray-400 text-sm sm:text-base">智能代理</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                {stats.totalWorkflows}+
              </div>
              <div className="text-gray-400 text-sm sm:text-base">工作流程</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                {stats.successRate}%
              </div>
              <div className="text-gray-400 text-sm sm:text-base">成功率</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              核心功能
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              我们提供全面的AI解决方案，助力您的业务数字化转型
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => <Card key={index} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500 transition-all duration-300">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl sm:text-2xl text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-sm sm:text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              客户评价
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              听听我们的客户怎么说
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => <Card key={index} className="bg-gray-900/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full" />
                    <div>
                      <CardTitle className="text-white text-base sm:text-lg">{testimonial.name}</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">
                        {testimonial.role} @ {testimonial.company}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current" />)}
                  </div>
                  <p className="text-gray-300 text-sm sm:text-base italic">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              准备好开始您的AI之旅了吗？
            </h2>
            <p className="text-lg sm:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto">
              立即体验AI太极的强大功能，让AI为您的业务带来革命性的变化
            </p>
            <Button onClick={handleGetStarted} className="bg-white text-red-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
              {t('common.add', '开始使用')}
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