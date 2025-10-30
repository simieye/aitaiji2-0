// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Search, Filter, Star, TrendingUp, Eye, MessageCircle } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { ResourceCard } from '@/components/ResourceCard';
// @ts-ignore;
import { ResourceFilter } from '@/components/ResourceFilter';
// @ts-ignore;
import { ResourceStats } from '@/components/ResourceStats';
// @ts-ignore;
import { ResourceRecommendations } from '@/components/ResourceRecommendations';
// @ts-ignore;
import { MetricCard } from '@/components/MetricCard';
function ResourcesContent(props) {
  const {
    $w,
    style
  } = props;
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedSort, setSelectedSort] = useState('latest');
  const [activeTab, setActiveTab] = useState('all');
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('resources_layout');
  const contentExperiment = useExperiment('content_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadResourcesData, 30000);
  useEffect(() => {
    loadResourcesData();
  }, []);
  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedType, selectedCategory, selectedTags, selectedSort]);
  const loadResourcesData = async () => {
    try {
      setLoading(true);
      const [whitepapersResult, toolsResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_tool',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      }))]);

      // 转换白皮书数据为资源格式
      const whitepaperResources = (whitepapersResult.records || []).map(item => ({
        _id: item._id,
        name: item.name,
        title: item.name,
        description: item.summary,
        summary: item.summary,
        type: 'whitepaper',
        category: item.category || ['技术', '产品', '行业', '教程'][Math.floor(Math.random() * 4)],
        tags: item.tags || ['AI', '机器学习', '深度学习', '技术文档'].slice(0, Math.floor(Math.random() * 3) + 1),
        featured: Math.random() > 0.8,
        downloadCount: Math.floor(Math.random() * 1000) + 50,
        viewCount: Math.floor(Math.random() * 5000) + 100,
        rating: 3.5 + Math.random() * 1.5,
        ratingCount: Math.floor(Math.random() * 100) + 10,
        fileSize: Math.floor(Math.random() * 10) + 1 + 'MB',
        format: 'PDF',
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date()
      }));

      // 转换工具数据为资源格式
      const toolResources = (toolsResult.records || []).map(item => ({
        _id: item._id,
        name: item.name,
        title: item.name,
        description: item.description,
        summary: item.description,
        type: 'tool',
        category: item.category || ['开发工具', '分析工具', '管理工具', '测试工具'][Math.floor(Math.random() * 4)],
        tags: item.tags || ['工具', '效率', '自动化', '开发'].slice(0, Math.floor(Math.random() * 3) + 1),
        featured: Math.random() > 0.8,
        downloadCount: Math.floor(Math.random() * 2000) + 100,
        viewCount: Math.floor(Math.random() * 8000) + 200,
        rating: 3.5 + Math.random() * 1.5,
        ratingCount: Math.floor(Math.random() * 150) + 20,
        fileSize: Math.floor(Math.random() * 50) + 5 + 'MB',
        format: 'ZIP',
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date()
      }));
      const allResources = [...whitepaperResources, ...toolResources];
      setResources(allResources);
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
  const filterResources = () => {
    let filtered = [...resources];

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => resource.name?.toLowerCase().includes(term) || resource.description?.toLowerCase().includes(term) || resource.summary?.toLowerCase().includes(term));
    }

    // 类型过滤
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(resource => selectedTags.some(tag => resource.tags?.includes(tag)));
    }

    // 排序
    switch (selectedSort) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
        break;
      case 'rated':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'viewed':
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
    }
    setFilteredResources(filtered);
  };
  const handleResourceDownload = async resourceId => {
    try {
      // 记录资源下载事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'resource_download',
            event_category: 'engagement',
            event_label: resourceId,
            timestamp: new Date()
          }
        }
      }));

      // 更新资源下载次数
      setResources(resources.map(resource => resource._id === resourceId ? {
        ...resource,
        downloadCount: (resource.downloadCount || 0) + 1
      } : resource));
    } catch (error) {
      console.error('记录下载事件失败:', error);
    }
  };
  const handleResourceRating = async (resourceId, rating) => {
    try {
      // 记录评分事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'resource_rating',
            event_category: 'engagement',
            event_label: resourceId,
            value: rating,
            timestamp: new Date()
          }
        }
      }));
    } catch (error) {
      console.error('记录评分事件失败:', error);
    }
  };
  const handleResourceComment = resourceId => {
    // 可以在这里实现评论功能
    toast({
      title: "评论功能",
      description: "评论功能正在开发中",
      variant: "default"
    });
  };
  // 获取筛选选项
  const types = [...new Set(resources.map(r => r.type).filter(Boolean))];
  const categories = [...new Set(resources.map(r => r.category).filter(Boolean))];
  const popularTags = [...new Set(resources.flatMap(r => r.tags || []).filter(Boolean))];
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载资源...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-white mb-6">
            资源中心
            <span className="text-red-500">下载专区</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            丰富的技术白皮书和实用工具，助力您的AI项目开发
          </p>
        </div>

        {/* Resource Stats */}
        <ResourceStats $w={$w} resources={resources} />

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            <Button onClick={() => setActiveTab('all')} variant={activeTab === 'all' ? 'default' : 'ghost'} className={`${activeTab === 'all' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              全部资源
            </Button>
            <Button onClick={() => setActiveTab('whitepapers')} variant={activeTab === 'whitepapers' ? 'default' : 'ghost'} className={`${activeTab === 'whitepapers' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              技术白皮书
            </Button>
            <Button onClick={() => setActiveTab('tools')} variant={activeTab === 'tools' ? 'default' : 'ghost'} className={`${activeTab === 'tools' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              开发工具
            </Button>
            <Button onClick={() => setActiveTab('recommendations')} variant={activeTab === 'recommendations' ? 'default' : 'ghost'} className={`${activeTab === 'recommendations' ? 'bg-red-500 text-white' : 'text-gray-300'}`}>
              为您推荐
            </Button>
          </div>
        </div>

        {/* All Resources Tab */}
        {activeTab === 'all' && <div className="space-y-8">
            {/* Filter */}
            <ResourceFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedType={selectedType} onTypeChange={setSelectedType} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} selectedTags={selectedTags} onTagsChange={setSelectedTags} selectedSort={selectedSort} onSortChange={setSelectedSort} types={types} categories={categories} popularTags={popularTags} />

            {/* Resources Grid */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">
                  {searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || selectedTags.length > 0 ? '搜索结果' : '全部资源'}
                </h2>
                <div className="text-gray-400 text-sm">
                  共 {filteredResources.length} 个资源
                </div>
              </div>
              <div className={`grid gap-8 ${layoutExperiment === 'compact' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                {filteredResources.map(resource => <ResourceCard key={resource._id} resource={resource} $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} onDownload={handleResourceDownload} onRate={handleResourceRating} onComment={handleResourceComment} />)}
              </div>
            </div>

            {filteredResources.length === 0 && <div className="text-center py-12">
                <div className="text-gray-400">
                  <Search className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">暂无匹配的资源</h3>
                  <p className="text-gray-400">请调整搜索条件或筛选器</p>
                </div>
              </div>}
          </div>}

        {/* Whitepapers Tab */}
        {activeTab === 'whitepapers' && <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">技术白皮书</h2>
              <p className="text-gray-300">深入了解AI技术架构和最佳实践</p>
            </div>
            <div className={`grid gap-8 ${layoutExperiment === 'compact' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {filteredResources.filter(resource => resource.type === 'whitepaper').map(resource => <ResourceCard key={resource._id} resource={resource} $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} onDownload={handleResourceDownload} onRate={handleResourceRating} onComment={handleResourceComment} />)}
            </div>
          </div>}

        {/* Tools Tab */}
        {activeTab === 'tools' && <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">开发工具</h2>
              <p className="text-gray-300">提升开发效率的实用工具集合</p>
            </div>
            <div className={`grid gap-8 ${layoutExperiment === 'compact' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
              {filteredResources.filter(resource => resource.type === 'tool').map(resource => <ResourceCard key={resource._id} resource={resource} $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} onDownload={handleResourceDownload} onRate={handleResourceRating} onComment={handleResourceComment} />)}
            </div>
          </div>}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && <div className="space-y-8">
            <ResourceRecommendations $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} resources={resources} />
          </div>}
      </div>
    </div>;
}
export default function ResourcesPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ResourcesContent {...props} />
    </ExperimentProvider>;
}