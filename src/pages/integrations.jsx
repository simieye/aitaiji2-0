// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Mail, MessageSquare, Plus, Settings, Activity, BarChart3, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { ServiceConfigCard } from '@/components/ServiceConfigCard';
// @ts-ignore;
import { ServiceMonitor } from '@/components/ServiceMonitor';
// @ts-ignore;
import { ServiceConfigForm } from '@/components/ServiceConfigForm';
// @ts-ignore;
import { useLanguage } from '@/components/LanguageContext';
function IntegrationsContent(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [stats, setStats] = useState({
    totalServices: 0,
    activeServices: 0,
    totalRequests: 0,
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
  const layoutExperiment = useExperiment('integrations_layout');
  const serviceExperiment = useExperiment('service_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadIntegrationsData, 30000);
  useEffect(() => {
    loadIntegrationsData();
  }, []);
  const loadIntegrationsData = async () => {
    try {
      setLoading(true);
      // 模拟服务数据
      const mockServices = [{
        _id: '1',
        name: '邮件通知服务',
        type: 'email',
        provider: '阿里云邮件推送',
        description: '用于发送系统通知和营销邮件',
        status: 'active',
        config: {
          smtpHost: 'smtpdm.aliyun.com',
          smtpPort: '587',
          username: 'noreply@aitaiji.com',
          password: '***',
          fromEmail: 'noreply@aitaiji.com'
        },
        usageCount: 1250,
        lastCheck: new Date(Date.now() - 300000),
        createdAt: new Date('2023-01-15')
      }, {
        _id: '2',
        name: '短信验证服务',
        type: 'sms',
        provider: '腾讯云短信',
        description: '用于发送验证码和通知短信',
        status: 'active',
        config: {
          apiKey: '***',
          apiSecret: '***',
          apiEndpoint: 'https://sms.tencentcloudapi.com',
          signature: '【AI太极】'
        },
        usageCount: 3420,
        lastCheck: new Date(Date.now() - 180000),
        createdAt: new Date('2023-02-20')
      }, {
        _id: '3',
        name: '营销邮件服务',
        type: 'email',
        provider: 'SendGrid',
        description: '用于营销邮件和批量邮件发送',
        status: 'warning',
        config: {
          smtpHost: 'smtp.sendgrid.net',
          smtpPort: '587',
          username: 'apikey',
          password: '***',
          fromEmail: 'marketing@aitaiji.com'
        },
        usageCount: 890,
        lastCheck: new Date(Date.now() - 600000),
        createdAt: new Date('2023-03-10')
      }];
      setServices(mockServices);
      setStats({
        totalServices: mockServices.length,
        activeServices: mockServices.filter(s => s.status === 'active').length,
        totalRequests: mockServices.reduce((sum, s) => sum + s.usageCount, 0),
        successRate: 98.5
      });
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
  const handleEditService = service => {
    setEditingService(service);
    setShowConfigForm(true);
  };
  const handleDeleteService = async service => {
    try {
      setServices(services.filter(s => s._id !== service._id));
      toast({
        title: "删除成功",
        description: `服务 ${service.name} 已删除`,
        variant: "default"
      });
      loadIntegrationsData();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleTestService = async service => {
    try {
      // 模拟测试
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "测试成功",
        description: `${service.name} 连接测试通过`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "测试失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleSaveService = async serviceData => {
    try {
      if (editingService) {
        // 更新服务
        setServices(services.map(s => s._id === editingService._id ? {
          ...s,
          ...serviceData,
          updatedAt: new Date()
        } : s));
      } else {
        // 创建新服务
        const newService = {
          _id: Date.now().toString(),
          ...serviceData,
          status: 'inactive',
          usageCount: 0,
          lastCheck: new Date(),
          createdAt: new Date()
        };
        setServices([...services, newService]);
      }
      setShowConfigForm(false);
      setEditingService(null);
      loadIntegrationsData();
    } catch (error) {
      throw error;
    }
  };
  const handleCancelConfig = () => {
    setShowConfigForm(false);
    setEditingService(null);
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4 text-sm sm:text-base">{t('common.loading', '加载中...')}</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{t('nav.integrations', '第三方服务集成')}</h1>
            <p className="text-gray-300 text-sm sm:text-base">管理和配置第三方服务集成</p>
          </div>
          <Button onClick={loadIntegrationsData} className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新数据
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">总服务数</CardTitle>
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalServices}</div>
              <p className="text-xs text-gray-500">已配置服务</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">活跃服务</CardTitle>
              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.activeServices}</div>
              <p className="text-xs text-gray-500">正常运行</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">总请求数</CardTitle>
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalRequests.toLocaleString()}</div>
              <p className="text-xs text-gray-500">累计请求</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">成功率</CardTitle>
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.successRate}%</div>
              <p className="text-xs text-gray-500">请求成功率</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="services" className="space-y-6 sm:space-y-8">
          <TabsList className="bg-gray-800 border-gray-600 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="services" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 py-2">
              服务配置
            </TabsTrigger>
            <TabsTrigger value="monitor" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 py-2">
              服务监控
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white">服务配置</h2>
                <Button onClick={() => setShowConfigForm(true)} className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  新增服务
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {services.map(service => <ServiceConfigCard key={service._id} $w={$w} service={service} onEdit={handleEditService} onDelete={handleDeleteService} onTest={handleTestService} />)}
              </div>
              
              {services.length === 0 && <div className="text-center py-8 sm:py-12">
                  <Settings className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">暂无服务配置</h3>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">点击上方按钮添加第三方服务</p>
                  <Button onClick={() => setShowConfigForm(true)} className="bg-red-500 hover:bg-red-600">
                    <Plus className="w-4 h-4 mr-2" />
                    添加服务
                  </Button>
                </div>}
            </div>
          </TabsContent>

          <TabsContent value="monitor">
            <ServiceMonitor $w={$w} services={services} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Config Form Modal */}
      {showConfigForm && <ServiceConfigForm $w={$w} service={editingService} onSave={handleSaveService} onCancel={handleCancelConfig} />}
    </div>;
}
export default function IntegrationsPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <IntegrationsContent {...props} />
    </ExperimentProvider>;
}