// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Download, Plus, FileSpreadsheet, FileText, Clock, CheckCircle, AlertTriangle, RefreshCw, Edit } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { ExportConfigForm } from '@/components/ExportConfigForm';
// @ts-ignore;
import { ExportHistory } from '@/components/ExportHistory';
// @ts-ignore;
import { ExportProgress } from '@/components/ExportProgress';
// @ts-ignore;
import { useLanguage } from '@/components/LanguageContext';
function ExportsContent(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('configs');
  const [exportConfigs, setExportConfigs] = useState([]);
  const [currentExport, setCurrentExport] = useState(null);
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [stats, setStats] = useState({
    totalExports: 0,
    completedExports: 0,
    processingExports: 0,
    failedExports: 0
  });
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();

  // 获取实验变体
  const layoutExperiment = useExperiment('exports_layout');
  const exportExperiment = useExperiment('export_functionality');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadExportsData, 30000);
  useEffect(() => {
    loadExportsData();
  }, []);
  const loadExportsData = async () => {
    try {
      setLoading(true);
      // 模拟导出配置数据
      const mockConfigs = [{
        _id: '1',
        name: '用户数据导出',
        dataSource: 'taiji_user',
        format: 'excel',
        fields: ['name', 'email', 'status', 'createdAt'],
        filters: {
          status: 'active',
          timeRange: 'month'
        },
        description: '导出活跃用户数据',
        createdAt: new Date('2023-11-01'),
        lastUsed: new Date('2023-11-15')
      }, {
        _id: '2',
        name: '订阅数据报表',
        dataSource: 'taiji_subscription',
        format: 'pdf',
        fields: ['userId', 'planId', 'status', 'amount', 'createdAt'],
        filters: {
          timeRange: 'month'
        },
        description: '月度订阅数据报表',
        createdAt: new Date('2023-11-05'),
        lastUsed: new Date('2023-11-20')
      }, {
        _id: '3',
        name: '工作流配置备份',
        dataSource: 'taiji_workflow',
        format: 'csv',
        fields: ['name', 'description', 'status', 'createdAt'],
        filters: {},
        description: '工作流配置备份',
        createdAt: new Date('2023-11-10'),
        lastUsed: new Date('2023-11-18')
      }];
      setExportConfigs(mockConfigs);
      setStats({
        totalExports: 156,
        completedExports: 142,
        processingExports: 2,
        failedExports: 12
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
  const handleCreateExport = config => {
    const exportTask = {
      _id: Date.now().toString(),
      ...config,
      status: 'processing',
      createdAt: new Date()
    };
    setCurrentExport(exportTask);
    setActiveTab('progress');
    toast({
      title: "导出任务已创建",
      description: "正在处理导出任务",
      variant: "default"
    });
  };
  const handleEditConfig = config => {
    setEditingConfig(config);
    setShowConfigForm(true);
  };
  const handleDeleteConfig = async configId => {
    try {
      setExportConfigs(exportConfigs.filter(c => c._id !== configId));
      toast({
        title: "删除成功",
        description: "导出配置已删除",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleSaveConfig = async configData => {
    try {
      if (editingConfig) {
        // 更新配置
        setExportConfigs(exportConfigs.map(c => c._id === editingConfig._id ? {
          ...c,
          ...configData,
          updatedAt: new Date()
        } : c));
      } else {
        // 创建新配置
        const newConfig = {
          _id: Date.now().toString(),
          ...configData,
          createdAt: new Date()
        };
        setExportConfigs([...exportConfigs, newConfig]);
      }
      setShowConfigForm(false);
      setEditingConfig(null);
      toast({
        title: "保存成功",
        description: "导出配置已保存",
        variant: "default"
      });
    } catch (error) {
      throw error;
    }
  };
  const handleCancelConfig = () => {
    setShowConfigForm(false);
    setEditingConfig(null);
  };
  const handleExecuteExport = config => {
    handleCreateExport(config);
  };
  const getFormatIcon = format => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{t('nav.exports', '数据导出')}</h1>
            <p className="text-gray-300 text-sm sm:text-base">管理和执行数据导出任务</p>
          </div>
          <Button onClick={loadExportsData} className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新数据
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">总导出数</CardTitle>
              <Download className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalExports}</div>
              <p className="text-xs text-gray-500">累计导出</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">已完成</CardTitle>
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.completedExports}</div>
              <p className="text-xs text-gray-500">成功导出</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">处理中</CardTitle>
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.processingExports}</div>
              <p className="text-xs text-gray-500">正在处理</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">失败</CardTitle>
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.failedExports}</div>
              <p className="text-xs text-gray-500">导出失败</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="configs" className="space-y-6 sm:space-y-8">
          <TabsList className="bg-gray-800 border-gray-600 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="configs" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 py-2">
              导出配置
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 py-2">
              导出历史
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 py-2">
              导出进度
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configs">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-white">导出配置</h2>
                <Button onClick={() => setShowConfigForm(true)} className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  新建配置
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {exportConfigs.map(config => <Card key={config._id} className="bg-gray-800/50 border-gray-600">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getFormatIcon(config.format)}
                          <CardTitle className="text-white text-sm sm:text-base">{config.name}</CardTitle>
                        </div>
                        <Badge className="bg-blue-500 text-white text-xs">{config.format.toUpperCase()}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-4">{config.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">数据源</span>
                          <span className="text-white text-xs">{config.dataSource}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">字段数</span>
                          <span className="text-white text-xs">{config.fields.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">最后使用</span>
                          <span className="text-white text-xs">{config.lastUsed ? new Date(config.lastUsed).toLocaleDateString('zh-CN') : '从未'}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button onClick={() => handleExecuteExport(config)} className="flex-1 bg-red-500 hover:bg-red-600 text-xs sm:text-sm">
                          <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          导出
                        </Button>
                        <Button onClick={() => handleEditConfig(config)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
              
              {exportConfigs.length === 0 && <div className="text-center py-8 sm:py-12">
                  <FileSpreadsheet className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">暂无导出配置</h3>
                  <p className="text-gray-400 mb-4 text-sm sm:text-base">创建导出配置以快速导出数据</p>
                  <Button onClick={() => setShowConfigForm(true)} className="bg-red-500 hover:bg-red-600">
                    <Plus className="w-4 h-4 mr-2" />
                    创建配置
                  </Button>
                </div>}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <ExportHistory $w={$w} />
          </TabsContent>

          <TabsContent value="progress">
            {currentExport ? <ExportProgress $w={$w} exportTask={currentExport} /> : <div className="text-center py-8 sm:py-12">
                <Clock className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">暂无导出任务</h3>
                <p className="text-gray-400 text-sm sm:text-base">创建导出配置并执行导出任务</p>
              </div>}
          </TabsContent>
        </Tabs>
      </div>

      {/* Config Form Modal */}
      {showConfigForm && <ExportConfigForm $w={$w} exportConfig={editingConfig} onSave={handleSaveConfig} onCancel={handleCancelConfig} />}
    </div>;
}
export default function ExportsPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ExportsContent {...props} />
    </ExperimentProvider>;
}