// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Database, FileSpreadsheet, FileText, History, Settings } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { ExportConfig } from '@/components/ExportConfig';
// @ts-ignore;
import { ExportProgress } from '@/components/ExportProgress';
// @ts-ignore;
import { ExportHistory } from '@/components/ExportHistory';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function ExportContent(props) {
  const {
    $w,
    style
  } = props;
  const [dataSources, setDataSources] = useState([]);
  const [selectedDataSource, setSelectedDataSource] = useState(null);
  const [exportTasks, setExportTasks] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();

  // 获取实验变体
  const layoutExperiment = useExperiment('export_layout');
  const formatExperiment = useExperiment('export_format');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadDataSources, 30000);
  useEffect(() => {
    loadDataSources();
  }, []);
  const loadDataSources = async () => {
    try {
      setLoading(true);
      // 获取可导出的数据源
      const sources = [{
        id: 'taiji_user',
        name: '用户数据',
        description: '用户基本信息和角色权限',
        fields: ['name', 'email', 'role', 'status', 'createdAt', 'lastLoginAt'],
        icon: <Database className="w-4 h-4 sm:w-5 sm:h-5" />
      }, {
        id: 'taiji_subscription',
        name: '订阅数据',
        description: '用户订阅和支付记录',
        fields: ['userId', 'planId', 'status', 'amount', 'createdAt', 'updatedAt'],
        icon: <Database className="w-4 h-4 sm:w-5 sm:h-5" />
      }, {
        id: 'taiji_agent',
        name: '智能代理',
        description: 'AI代理配置和使用记录',
        fields: ['name', 'type', 'status', 'config', 'createdAt'],
        icon: <Database className="w-4 h-4 sm:w-5 sm:h-5" />
      }, {
        id: 'taiji_workflow',
        name: '工作流',
        description: '自动化工作流配置',
        fields: ['name', 'description', 'status', 'steps', 'createdAt'],
        icon: <Database className="w-4 h-4 sm:w-5 sm:h-5" />
      }, {
        id: 'taiji_case',
        name: '案例研究',
        description: '产品案例和解决方案',
        fields: ['title', 'description', 'category', 'industry', 'createdAt'],
        icon: <Database className="w-4 h-4 sm:w-5 sm:h-5" />
      }];
      setDataSources(sources);
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
  const handleDataSourceSelect = dataSource => {
    setSelectedDataSource(dataSource);
  };
  const handleExport = async config => {
    try {
      const taskId = `export_${Date.now()}`;
      const exportTask = {
        id: taskId,
        fileName: `${config.dataSource}_${new Date().toISOString().split('T')[0]}`,
        format: config.format,
        status: 'pending',
        progress: 0,
        config
      };
      setExportTasks(prev => [...prev, exportTask]);
      // 记录导出任务
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_export_history',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            taskId,
            fileName: exportTask.fileName,
            format: config.format,
            dataSource: config.dataSource,
            status: 'pending',
            config,
            createdAt: new Date()
          }
        }
      }));
      toast({
        title: "导出任务已创建",
        description: "正在处理您的导出请求...",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleCancelExport = taskId => {
    setExportTasks(prev => prev.filter(task => task.id !== taskId));
    toast({
      title: "导出已取消",
      variant: "default"
    });
  };
  const handleCompleteExport = taskId => {
    setExportTasks(prev => prev.map(task => task.id === taskId ? {
      ...task,
      status: 'completed'
    } : task));
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{t('export.title', '数据导出')}</h1>
            <p className="text-gray-300 text-sm sm:text-base">{t('export.description', '导出系统数据为Excel、PDF等格式')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={() => setShowHistory(!showHistory)} variant={showHistory ? 'default' : 'outline'} className={`${showHistory ? 'bg-red-500 hover:bg-red-600' : 'border-gray-600 text-white hover:bg-gray-700'} w-full sm:w-auto`}>
              <History className="w-4 h-4 mr-2" />
              {t('export.history', '导出历史')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <Database className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('export.dataSources', '数据源')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{dataSources.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('export.supportedFormats', '支持格式')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">3</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('export.inProgress', '进行中')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{exportTasks.filter(task => task.status === 'processing').length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <History className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('export.totalExports', '总导出')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{exportTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* 数据源选择 */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">{t('export.selectDataSource', '选择数据源')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dataSources.map(source => <button key={source.id} onClick={() => handleDataSourceSelect(source)} className={`w-full p-3 sm:p-4 rounded-lg border transition-all text-left ${selectedDataSource?.id === source.id ? 'border-red-500 bg-red-500/10' : 'border-gray-600 bg-gray-800 hover:border-gray-500'}`}>
                      <div className="flex items-center space-x-3">
                        {source.icon}
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium text-sm sm:text-base truncate">{source.name}</div>
                          <div className="text-gray-400 text-xs sm:text-sm truncate">{source.description}</div>
                        </div>
                      </div>
                    </button>)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 导出配置和进度 */}
          <div className="lg:col-span-2 space-y-6">
            {selectedDataSource ? <>
                {/* 导出配置 */}
                <ExportConfig config={selectedDataSource} onConfigChange={setSelectedDataSource} onExport={handleExport} />
                
                {/* 当前导出任务 */}
                {exportTasks.length > 0 && <div>
                    <h3 className="text-white font-semibold mb-4 text-lg sm:text-xl">{t('export.currentTasks', '当前导出任务')}</h3>
                    <div className="space-y-4">
                      {exportTasks.map(task => <ExportProgress key={task.id} exportTask={task} onCancel={() => handleCancelExport(task.id)} onComplete={() => handleCompleteExport(task.id)} />)}
                    </div>
                  </div>}
              </> : <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
                <CardContent className="text-center py-8 sm:py-12">
                  <Database className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">{t('export.selectDataSourceTitle', '选择数据源')}</h3>
                  <p className="text-gray-400 text-sm sm:text-base">{t('export.selectDataSourceDesc', '请从左侧选择要导出的数据源')}</p>
                </CardContent>
              </Card>}
          </div>
        </div>

        {/* 导出历史 */}
        {showHistory && <div className="mt-8">
            <ExportHistory $w={$w} onHistoryUpdate={loadDataSources} />
          </div>}
      </div>
    </div>;
}
export default function ExportPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ExportContent {...props} />
    </ExperimentProvider>;
}