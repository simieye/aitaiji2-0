// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Globe, Plus, Edit, Trash2, CheckCircle, AlertTriangle, RefreshCw, Settings, FileText } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { TranslationManager } from '@/components/TranslationManager';
// @ts-ignore;
import { useLanguage } from '@/components/LanguageContext';
function LanguagesContent(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('languages');
  const [languages, setLanguages] = useState([]);
  const [stats, setStats] = useState({
    totalLanguages: 0,
    activeLanguages: 0,
    totalTranslations: 0,
    publishedTranslations: 0
  });
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const {
    currentLanguage,
    languages: availableLanguages,
    changeLanguage
  } = useLanguage();

  // 获取实验变体
  const layoutExperiment = useExperiment('languages_layout');
  const languageExperiment = useExperiment('language_management');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadLanguagesData, 30000);
  useEffect(() => {
    loadLanguagesData();
  }, []);
  const loadLanguagesData = async () => {
    try {
      setLoading(true);
      // 模拟语言数据
      const mockLanguages = [{
        _id: '1',
        code: 'zh-CN',
        name: 'Chinese',
        displayName: '简体中文',
        flag: '🇨🇳',
        isDefault: true,
        isActive: true,
        sortOrder: 1,
        rtl: false,
        translationCount: 245,
        publishedCount: 245
      }, {
        _id: '2',
        code: 'en-US',
        name: 'English',
        displayName: 'English',
        flag: '🇺🇸',
        isDefault: false,
        isActive: true,
        sortOrder: 2,
        rtl: false,
        translationCount: 245,
        publishedCount: 230
      }, {
        _id: '3',
        code: 'ja-JP',
        name: 'Japanese',
        displayName: '日本語',
        flag: '🇯🇵',
        isDefault: false,
        isActive: false,
        sortOrder: 3,
        rtl: false,
        translationCount: 180,
        publishedCount: 150
      }];
      setLanguages(mockLanguages);
      setStats({
        totalLanguages: mockLanguages.length,
        activeLanguages: mockLanguages.filter(l => l.isActive).length,
        totalTranslations: mockLanguages.reduce((sum, l) => sum + l.translationCount, 0),
        publishedTranslations: mockLanguages.reduce((sum, l) => sum + l.publishedCount, 0)
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
  const handleEditLanguage = language => {
    toast({
      title: "编辑语言",
      description: `正在编辑: ${language.displayName}`,
      variant: "default"
    });
  };
  const handleDeleteLanguage = async languageId => {
    try {
      const language = languages.find(l => l._id === languageId);
      if (language?.isDefault) {
        toast({
          title: "删除失败",
          description: "默认语言不能删除",
          variant: "destructive"
        });
        return;
      }
      setLanguages(languages.filter(l => l._id !== languageId));
      toast({
        title: "删除成功",
        description: "语言已删除",
        variant: "default"
      });
      loadLanguagesData();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleToggleLanguageStatus = async language => {
    try {
      const newStatus = !language.isActive;
      setLanguages(languages.map(l => l._id === language._id ? {
        ...l,
        isActive: newStatus
      } : l));
      toast({
        title: "状态更新成功",
        description: `${language.displayName} 已${newStatus ? '启用' : '禁用'}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "状态更新失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleSetDefaultLanguage = async language => {
    try {
      setLanguages(languages.map(l => ({
        ...l,
        isDefault: l._id === language._id
      })));
      toast({
        title: "默认语言设置成功",
        description: `${language.displayName} 已设为默认语言`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "设置失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载语言管理...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">语言管理</h1>
            <p className="text-gray-300">管理系统多语言支持和翻译内容</p>
          </div>
          <Button onClick={loadLanguagesData} className="bg-red-500 hover:bg-red-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新数据
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">总语言数</CardTitle>
              <Globe className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalLanguages}</div>
              <p className="text-xs text-gray-500">支持语言</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">活跃语言</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeLanguages}</div>
              <p className="text-xs text-gray-500">已启用</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">总翻译数</CardTitle>
              <FileText className="w-4 h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalTranslations}</div>
              <p className="text-xs text-gray-500">翻译条目</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">已发布</CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.publishedTranslations}</div>
              <p className="text-xs text-gray-500">已发布翻译</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="languages" className="space-y-8">
          <TabsList className="bg-gray-800 border-gray-600">
            <TabsTrigger value="languages" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              语言配置
            </TabsTrigger>
            <TabsTrigger value="translations" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              翻译管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="languages">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">语言配置</h2>
                <Button className="bg-red-500 hover:bg-red-600">
                  <Plus className="w-4 h-4 mr-2" />
                  添加语言
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {languages.map(language => <Card key={language._id} className="bg-gray-800/50 border-gray-600">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{language.flag}</span>
                          <div>
                            <CardTitle className="text-white">{language.displayName}</CardTitle>
                            <CardDescription className="text-gray-300">{language.name} ({language.code})</CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-1">
                          {language.isDefault && <Badge className="bg-yellow-500 text-white">默认</Badge>}
                          <Badge className={language.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                            {language.isActive ? '启用' : '禁用'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">翻译进度</span>
                          <span className="text-white">{language.publishedCount}/{language.translationCount}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{
                        width: `${language.publishedCount / language.translationCount * 100}%`
                      }}></div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">排序</span>
                          <span className="text-white">{language.sortOrder}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">从右到左</span>
                          <span className="text-white">{language.rtl ? '是' : '否'}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button onClick={() => handleToggleLanguageStatus(language)} variant="outline" size="sm" className={`flex-1 ${language.isActive ? 'border-red-500 text-red-500 hover:bg-red-500' : 'border-green-500 text-green-500 hover:bg-green-500'} hover:text-white`}>
                          {language.isActive ? '禁用' : '启用'}
                        </Button>
                        {!language.isDefault && <Button onClick={() => handleSetDefaultLanguage(language)} variant="outline" size="sm" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white">
                            设为默认
                          </Button>}
                        <Button onClick={() => handleEditLanguage(language)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!language.isDefault && <Button onClick={() => handleDeleteLanguage(language._id)} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                            <Trash2 className="w-4 h-4" />
                        </Button>}
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="translations">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">翻译管理</h2>
                <div className="flex items-center space-x-4">
                  <select value={currentLanguage} onChange={e => changeLanguage(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                    {languages.filter(l => l.isActive).map(language => <option key={language.code} value={language.code}>
                        {language.flag} {language.displayName}
                      </option>)}
                  </select>
                  <Button className="bg-red-500 hover:bg-red-600">
                    <Plus className="w-4 h-4 mr-2" />
                    添加翻译
                  </Button>
                </div>
              </div>
            </div>
            <TranslationManager $w={$w} selectedLanguage={currentLanguage} onLanguageChange={changeLanguage} />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}
export default function LanguagesPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <LanguagesContent {...props} />
    </ExperimentProvider>;
}