// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Edit, Trash2, Plus, Globe, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function TranslationManager({
  $w,
  selectedLanguage,
  onLanguageChange
}) {
  const [translations, setTranslations] = useState([]);
  const [filteredTranslations, setFilteredTranslations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadTranslations();
  }, [selectedLanguage]);
  useEffect(() => {
    filterTranslations();
  }, [translations, searchTerm, moduleFilter, statusFilter]);
  const loadTranslations = async () => {
    try {
      setLoading(true);
      // 模拟翻译数据
      const mockTranslations = [{
        _id: '1',
        key: 'common.loading',
        languageCode: selectedLanguage,
        value: selectedLanguage === 'zh-CN' ? '加载中...' : 'Loading...',
        module: 'common',
        description: '加载状态提示文本',
        isSystem: true,
        status: 'published'
      }, {
        _id: '2',
        key: 'common.save',
        languageCode: selectedLanguage,
        value: selectedLanguage === 'zh-CN' ? '保存' : 'Save',
        module: 'common',
        description: '保存按钮文本',
        isSystem: true,
        status: 'published'
      }, {
        _id: '3',
        key: 'nav.home',
        languageCode: selectedLanguage,
        value: selectedLanguage === 'zh-CN' ? '首页' : 'Home',
        module: 'navigation',
        description: '首页导航文本',
        isSystem: true,
        status: 'published'
      }, {
        _id: '4',
        key: 'nav.products',
        languageCode: selectedLanguage,
        value: selectedLanguage === 'zh-CN' ? '产品' : 'Products',
        module: 'navigation',
        description: '产品导航文本',
        isSystem: true,
        status: 'published'
      }, {
        _id: '5',
        key: 'error.network',
        languageCode: selectedLanguage,
        value: selectedLanguage === 'zh-CN' ? '网络错误' : 'Network Error',
        module: 'errors',
        description: '网络错误提示',
        isSystem: true,
        status: 'published'
      }];
      setTranslations(mockTranslations);
      setLoading(false);
    } catch (error) {
      toast({
        title: "加载翻译失败",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  const filterTranslations = () => {
    let filtered = translations;
    if (searchTerm) {
      filtered = filtered.filter(t => t.key.toLowerCase().includes(searchTerm.toLowerCase()) || t.value.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(t => t.module === moduleFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }
    setFilteredTranslations(filtered);
  };
  const handleEditTranslation = translation => {
    toast({
      title: "编辑翻译",
      description: `正在编辑: ${translation.key}`,
      variant: "default"
    });
  };
  const handleDeleteTranslation = async translationId => {
    try {
      setTranslations(translations.filter(t => t._id !== translationId));
      toast({
        title: "删除成功",
        description: "翻译已删除",
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
  const getStatusBadge = status => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500 text-white">已发布</Badge>;
      case 'draft':
        return <Badge className="bg-yellow-500 text-white">草稿</Badge>;
      case 'archived':
        return <Badge className="bg-gray-500 text-white">已归档</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">未知</Badge>;
    }
  };
  const getModuleIcon = module => {
    switch (module) {
      case 'common':
        return <Globe className="w-4 h-4 text-blue-500" />;
      case 'navigation':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'errors':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>;
  }
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">翻译管理</CardTitle>
        <CardDescription className="text-gray-300">管理 {selectedLanguage} 语言的翻译内容</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="搜索翻译..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
          </div>
          <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="all">所有模块</option>
            <option value="common">通用</option>
            <option value="navigation">导航</option>
            <option value="errors">错误</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="all">所有状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="archived">已归档</option>
          </select>
        </div>

        {/* Translation List */}
        <div className="space-y-4">
          {filteredTranslations.map(translation => <div key={translation._id} className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getModuleIcon(translation.module)}
                  <div>
                    <div className="text-white font-medium">{translation.key}</div>
                    <div className="text-gray-400 text-sm">{translation.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(translation.status)}
                  {translation.isSystem && <Badge variant="outline" className="border-gray-600 text-gray-400">系统</Badge>}
                </div>
              </div>
              
              <div className="bg-gray-900 p-3 rounded mb-3">
                <div className="text-gray-400 text-sm mb-1">翻译值:</div>
                <div className="text-white">{translation.value}</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-gray-400 text-sm">
                  模块: {translation.module}
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEditTranslation(translation)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                    <Edit className="w-4 h-4" />
                  </Button>
                  {!translation.isSystem && <Button onClick={() => handleDeleteTranslation(translation._id)} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                      <Trash2 className="w-4 h-4" />
                    </Button>}
                </div>
              </div>
            </div>)}
        </div>

        {filteredTranslations.length === 0 && <div className="text-center py-8">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-white mb-2">暂无翻译</h3>
            <p className="text-gray-400">没有找到匹配的翻译内容</p>
          </div>}
      </CardContent>
    </Card>;
}