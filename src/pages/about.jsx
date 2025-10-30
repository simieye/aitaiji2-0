// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { MapPin, Phone, Mail, Globe, Award, Users, Target, Heart, Lightbulb, Building2 } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { CompanyTimeline } from '@/components/CompanyTimeline';
// @ts-ignore;
import { TeamMembers } from '@/components/TeamMembers';
// @ts-ignore;
import { CompanyCulture } from '@/components/CompanyCulture';
// @ts-ignore;
import { Partners } from '@/components/Partners';
// @ts-ignore;
import { ContactForm } from '@/components/ContactForm';
// @ts-ignore;
import { MetricCard } from '@/components/MetricCard';
function AboutContent(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('overview');
  const [companyStats, setCompanyStats] = useState({
    employees: 100,
    customers: 500,
    patents: 25,
    awards: 15
  });
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('about_layout');
  const contentExperiment = useExperiment('content_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadCompanyData, 60000);
  useEffect(() => {
    loadCompanyData();
  }, []);
  const loadCompanyData = async () => {
    try {
      // 模拟公司数据加载
      const stats = {
        employees: 100 + Math.floor(Math.random() * 20),
        customers: 500 + Math.floor(Math.random() * 50),
        patents: 25 + Math.floor(Math.random() * 5),
        awards: 15 + Math.floor(Math.random() * 3)
      };
      setCompanyStats(stats);
    } catch (error) {
      toast({
        title: "数据加载失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleContactSubmit = async () => {
    try {
      // 记录联系事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'contact_click',
            event_category: 'engagement',
            event_label: 'about_page',
            timestamp: new Date()
          }
        }
      }));
    } catch (error) {
      console.error('记录联系事件失败:', error);
    }
  };
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-white mb-6">
            关于AI太极
            <span className="text-red-500">企业介绍</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            我们是一家专注于AI技术的创新企业，致力于通过人工智能技术推动企业数字化转型
          </p>
        </div>

        {/* Company Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <MetricCard title="团队成员" value={companyStats.employees + '+'} icon={<Users className="w-5 h-5" />} trend="+12%" />
          <MetricCard title="服务客户" value={companyStats.customers + '+'} icon={<Target className="w-5 h-5" />} trend="+25%" />
          <MetricCard title="技术专利" value={companyStats.patents + '+'} icon={<Award className="w-5 h-5" />} trend="+8%" />
          <MetricCard title="行业奖项" value={companyStats.awards + '+'} icon={<Heart className="w-5 h-5" />} trend="+15%" />
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            <Button onClick={() => setActiveTab('overview')} variant={activeTab === 'overview' ? 'default' : 'ghost'} className={`${activeTab === 'overview' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              公司概览
            </Button>
            <Button onClick={() => setActiveTab('timeline')} variant={activeTab === 'timeline' ? 'default' : 'ghost'} className={`${activeTab === 'timeline' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              发展历程
            </Button>
            <Button onClick={() => setActiveTab('team')} variant={activeTab === 'team' ? 'default' : 'ghost'} className={`${activeTab === 'team' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              团队介绍
            </Button>
            <Button onClick={() => setActiveTab('culture')} variant={activeTab === 'culture' ? 'default' : 'ghost'} className={`${activeTab === 'culture' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              企业文化
            </Button>
            <Button onClick={() => setActiveTab('partners')} variant={activeTab === 'partners' ? 'default' : 'ghost'} className={`${activeTab === 'partners' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              合作伙伴
            </Button>
            <Button onClick={() => setActiveTab('contact')} variant={activeTab === 'contact' ? 'default' : 'ghost'} className={`${activeTab === 'contact' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              联系我们
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">公司简介</h2>
                <p className="text-gray-300 mb-4">
                  AI太极成立于2018年，是一家专注于人工智能技术的创新企业。我们致力于通过AI技术推动企业数字化转型，让每个企业都能享受AI带来的价值。
                </p>
                <p className="text-gray-300 mb-4">
                  公司拥有一支由AI专家、软件工程师、产品经理组成的专业团队，在深度学习、自然语言处理、计算机视觉等领域拥有深厚的技术积累。
                </p>
                <p className="text-gray-300 mb-6">
                  我们的产品和服务已经帮助数百家企业实现了数字化转型，涵盖了金融、制造、零售、医疗等多个行业。
                </p>
                <div className="flex space-x-4">
                  <Button onClick={handleContactSubmit} className="bg-red-500 hover:bg-red-600">
                    联系我们
                  </Button>
                  <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                    了解更多
                  </Button>
                </div>
              </div>
              <div className="bg-gray-800 rounded-lg p-8">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-white mb-2">6年</div>
                  <div className="text-gray-300">行业经验</div>
                </div>
              </div>
            </div>

            {/* Vision & Mission */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    我们的使命
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    以AI技术推动企业数字化转型，让每个企业都能享受AI带来的价值，成为企业数字化转型的最佳伙伴。
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    我们的愿景
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    成为全球领先的AI技术提供商，用AI技术改变世界，让AI成为每个企业的核心竞争力。
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && <CompanyTimeline />}

        {/* Team Tab */}
        {activeTab === 'team' && <TeamMembers />}

        {/* Culture Tab */}
        {activeTab === 'culture' && <CompanyCulture />}

        {/* Partners Tab */}
        {activeTab === 'partners' && <Partners />}

        {/* Contact Tab */}
        {activeTab === 'contact' && <div className="space-y-12">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">联系方式</h2>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">公司地址</div>
                      <div className="text-gray-300">北京市海淀区中关村软件园</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">联系电话</div>
                      <div className="text-gray-300">400-123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">邮箱地址</div>
                      <div className="text-gray-300">contact@ai-taiji.com</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">官方网站</div>
                      <div className="text-gray-300">www.ai-taiji.com</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <ContactForm $w={$w} />
              </div>
            </div>

            {/* Map */}
            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">地图位置</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-800 rounded-lg h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-300">北京市海淀区中关村软件园</p>
                    <p className="text-gray-400 text-sm">地图功能正在开发中...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>}
      </div>
    </div>;
}
export default function AboutPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <AboutContent {...props} />
    </ExperimentProvider>;
}