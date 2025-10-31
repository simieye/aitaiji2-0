// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Globe, Download, Upload, RefreshCw, Settings, BarChart3 } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { TranslationEditor } from '@/components/TranslationEditor';
// @ts-ignore;
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function I18nContent(props) {
  const {
    $w,
    style
  } = props;
  const [stats, setStats] = useState({
    totalKeys: 0,
    totalTranslations: 0,
    languages: 0,
    lastUpdated: null
  });
  const [activeTab, setActiveTab] = useState('editor');
  const [loading, setLoading] = useState(true);
  const {
    t
  } = useI18n();
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('i18n_layout');
  const managementExperiment = useExperiment('translation_management');

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
      // 模拟统计数据
      const mockStats = {
        totalKeys: 150,
        totalTranslations: 300,
        languages: 2,
        lastUpdated: new Date()
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
  const handleExportTranslations = async () => {
    try {
      // 模拟导出翻译
      const translations = {
        zh: {},
        en: {}
      };
      const blob = new Blob([JSON.stringify(translations, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translations.json';
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "导出成功",
        description: "翻译文件已导出",
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
  const handleImportTranslations = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = async e => {
        const file = e.target.files[0];
        if (file) {
          const text = await file.text();
          const translations = JSON.parse(text);
          // 这里可以处理导入的翻译数据
          toast({
            title: "导入成功",
            description: "翻译文件已导入",
            variant: "default"
          });
        }
      };
      input.click();
    } catch (error) {
      toast({
        title: "导入失败",
        description: error.message,
        variant: "destructive"
      });
    }
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{t('i18n.title', '国际化管理')}</h1>
            <p className="text-gray-300 text-sm sm:text-base">{t('i18n.description', '管理多语言内容和翻译')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <LanguageSwitcher onLanguageChange={lang => console.log('Language changed to:', lang)} />
            <Button onClick={handleExportTranslations} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              {t('common.export', '导出')}
            </Button>
            <Button onClick={handleImportTranslations} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 w-full sm:w-auto">
              <Upload className="w-4 h-4 mr-2" />
              {t('common.import', '导入')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('i18n.totalKeys', '翻译键')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalKeys}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('i18n.totalTranslations', '翻译条目')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalTranslations}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('i18n.languages', '支持语言')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.languages}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('i18n.lastUpdated', '最后更新')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-bold text-white">
                {stats.lastUpdated ? stats.lastUpdated.toLocaleDateString() : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 bg-gray-800 p-1 rounded-lg">
            <Button onClick={() => setActiveTab('editor')} variant={activeTab === 'editor' ? 'default' : 'ghost'} className={`${activeTab === 'editor' ? 'bg-red-500 text-white' : 'text-gray-300'} flex-1 sm:flex-none text-sm sm:text-base px-3 sm:px-4 py-2`}>
              {t('i18n.editor', '翻译编辑器')}
            </Button>
            <Button onClick={() => setActiveTab('stats')} variant={activeTab === 'stats' ? 'default' : 'ghost'} className={`${activeTab === 'stats' ? 'bg-red-500 text-white' : 'text-gray-300'} flex-1 sm:flex-none text-sm sm:text-base px-3 sm:px-4 py-2`}>
              {t('i18n.statistics', '统计信息')}
            </Button>
            <Button onClick={() => setActiveTab('settings')} variant={activeTab === 'settings' ? 'default' : 'ghost'} className={`${activeTab === 'settings' ? 'bg-red-500 text-white' : 'text-gray-300'} flex-1 sm:flex-none text-sm sm:text-base px-3 sm:px-4 py-2`}>
              {t('i18n.settings', '设置')}
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'editor' && <TranslationEditor $w={$w} onTranslationUpdate={loadStats} />}
        
        {activeTab === 'stats' && <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">{t('i18n.statistics', '统计信息')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 sm:py-12">
                <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">{t('i18n.comingSoon', '功能开发中')}</h3>
                <p className="text-gray-400 text-sm sm:text-base">{t('i18n.statsDescription', '详细的翻译统计功能即将推出')}</p>
              </div>
            </CardContent>
          </Card>}
        
        {activeTab === 'settings' && <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg sm:text-xl">{t('i18n.settings', '设置')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 sm:py-12">
                <Settings className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-white text-lg sm:text-xl font-semibold mb-2">{t('i18n.comingSoon', '功能开发中')}</h3>
                <p className="text-gray-400 text-sm sm:text-base">{t('i18n.settingsDescription', '国际化设置功能即将推出')}</p>
              </div>
            </CardContent>
          </Card>}
      </div>
    </div>;
}
export default function I18nPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <I18nContent {...props} />
    </ExperimentProvider>;
}