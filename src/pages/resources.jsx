// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { FileText, Download, BookOpen, Video, Code, ExternalLink, Search, Filter } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { ResourceItem } from '@/components/ResourceItem';
// @ts-ignore;
import { ResourceFilter } from '@/components/ResourceFilter';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function ResourcesContent(props) {
  const {
    $w,
    style
  } = props;
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();

  // 获取实验变体
  const resourceExperiment = useExperiment('resource_display');
  const filterExperiment = useExperiment('resource_filter');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadResources, 30000);
  useEffect(() => {
    loadResources();
  }, []);
  const loadResources = async () => {
    try {
      setLoading(true);
      // 模拟资源数据
      const mockResources = [{
        _id: '1',
        title: 'AI太极快速入门指南',
        description: '详细介绍如何快速上手AI太极平台',
        type: '文档',
        category: '入门指南',
        size: '2.5MB',
        format: 'PDF',
        downloadUrl: '#',
        externalUrl: '#',
        tags: ['入门', '基础', '快速开始'],
        featured: true,
        icon: <FileText className="w-5 h-5" />
      }, {
        _id: '2',
        title: '机器学习算法详解',
        description: '深入理解各种机器学习算法的原理和应用',
        type: '教程',
        category: '技术文档',
        size: '15MB',
        format: 'PDF',
        downloadUrl: '#',
        externalUrl: '#',
        tags: ['机器学习', '算法', 'AI'],
        featured: false,
        icon: <BookOpen className="w-5 h-5" />
      }, {
        _id: '3',
        title: 'API接口文档',
        description: '完整的API接口说明和示例代码',
        type: 'API文档',
        category: '开发文档',
        size: '1.8MB',
        format: 'HTML',
        downloadUrl: '#',
        externalUrl: '#',
        tags: ['API', '开发', '接口'],
        featured: false,
        icon: <Code className="w-5 h-5" />
      }, {
        _id: '4',
        title: '产品演示视频',
        description: '观看AI太极产品的完整功能演示',
        type: '视频',
        category: '产品介绍',
        size: '120MB',
        format: 'MP4',
        downloadUrl: '#',
        externalUrl: '#',
        tags: ['演示', '视频', '产品'],
        featured: true,
        icon: <Video className="w-5 h-5" />
      }];
      setResources(mockResources);
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
  const types = [{
    id: 'all',
    name: '全部类型',
    icon: <FileText className="w-4 h-4" />
  }, {
    id: '文档',
    name: '文档',
    icon: <FileText className="w-4 h-4" />
  }, {
    id: '教程',
    name: '教程',
    icon: <BookOpen className="w-4 h-4" />
  }, {
    id: 'API文档',
    name: 'API文档',
    icon: <Code className="w-4 h-4" />
  }, {
    id: '视频',
    name: '视频',
    icon: <Video className="w-4 h-4" />
  }];
  const categories = [{
    id: 'all',
    name: '全部分类'
  }, {
    id: '入门指南',
    name: '入门指南'
  }, {
    id: '技术文档',
    name: '技术文档'
  }, {
    id: '开发文档',
    name: '开发文档'
  }, {
    id: '产品介绍',
    name: '产品介绍'
  }];
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });
  const featuredResources = filteredResources.filter(resource => resource.featured);
  const regularResources = filteredResources.filter(resource => !resource.featured);
  const handleDownload = resource => {
    toast({
      title: "开始下载",
      description: `正在下载 ${resource.title}...`,
      variant: "default"
    });
  };
  const handleViewExternal = resource => {
    toast({
      title: "打开链接",
      description: `正在打开 ${resource.title}...`,
      variant: "default"
    });
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
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            {t('resources.title', '资源')}
            <span className="text-red-500 block mt-2">{t('resources.subtitle', '学习资源')}</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            {t('resources.description', '文档、教程和最佳实践')}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input type="text" placeholder="搜索资源..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm sm:text-base placeholder-gray-400" />
            </div>
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 lg:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>
          
          {showFilters && <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">资源类型</label>
                  <div className="flex flex-wrap gap-2">
                    {types.map(type => <button key={type.id} onClick={() => setSelectedType(type.id)} className={`px-3 py-2 rounded-lg border transition-all text-sm ${selectedType === type.id ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-gray-600 text-gray-300 hover:border-gray-500'}`}>
                        {type.name}
                      </button>)}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">资源分类</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-3 py-2 rounded-lg border transition-all text-sm ${selectedCategory === category.id ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-gray-600 text-gray-300 hover:border-gray-500'}`}>
                        {category.name}
                      </button>)}
                  </div>
                </div>
              </div>
            </div>}
        </div>

        {/* Featured Resources */}
        {featuredResources.length > 0 && <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">精选资源</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {featuredResources.map(resource => <ResourceItem key={resource._id} resource={resource} onDownload={handleDownload} onViewExternal={handleViewExternal} featured />)}
            </div>
          </div>}

        {/* Regular Resources */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">全部资源</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {regularResources.map(resource => <ResourceItem key={resource._id} resource={resource} onDownload={handleDownload} onViewExternal={handleViewExternal} />)}
          </div>
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">没有找到相关资源</h3>
            <p className="text-gray-400">尝试调整搜索条件或筛选器</p>
          </div>}
      </div>
    </div>;
}
export default function ResourcesPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ResourcesContent {...props} />
    </ExperimentProvider>;
}