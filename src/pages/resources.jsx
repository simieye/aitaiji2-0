// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Eye, Calendar, User, Tag, FileText, TrendingUp } from 'lucide-react';

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
function ResourcesContent(props) {
  const {
    $w,
    style
  } = props;
  const [resources, setResources] = useState([]);
  const [whitepapers, setWhitepapers] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [stats, setStats] = useState({
    totalDownloads: 0,
    totalViews: 0,
    popularResources: []
  });
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('resources_layout');
  const downloadExperiment = useExperiment('download_flow');

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
  }, [resources, whitepapers, searchTerm, selectedType]);
  const loadResourcesData = async () => {
    try {
      setLoading(true);
      const [resourcesResult, whitepapersResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 30,
          pageNumber: 1
        }
      }))]);
      const allResources = [...(resourcesResult.records || []).map(r => ({
        ...r,
        type: 'case'
      })), ...(whitepapersResult.records || []).map(r => ({
        ...r,
        type: 'whitepaper'
      }))];
      setResources(allResources);

      // 计算统计数据
      const totalDownloads = allResources.reduce((sum, r) => sum + (r.downloadCount || 0), 0);
      const totalViews = allResources.reduce((sum, r) => sum + (r.viewCount || 0), 0);
      const popularResources = allResources.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 3);
      setStats({
        totalDownloads,
        totalViews,
        popularResources
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
  const filterResources = () => {
    let filtered = [...resources];
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => resource.title?.toLowerCase().includes(term) || resource.name?.toLowerCase().includes(term) || resource.description?.toLowerCase().includes(term) || resource.summary?.toLowerCase().includes(term) || resource.category?.toLowerCase().includes(term));
    }
    setFilteredResources(filtered);
  };
  const handleDownload = async resource => {
    try {
      // 记录下载事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'resource_download',
            event_category: 'engagement',
            event_label: resource.title || resource.name,
            resource_type: resource.type,
            timestamp: new Date()
          }
        }
      }));

      // 更新下载计数
      const modelName = resource.type === 'case' ? 'taiji_case' : 'taiji_whitepaper';
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: modelName,
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            downloadCount: (resource.downloadCount || 0) + 1,
            updatedAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: resource._id
              }
            }
          }
        }
      }));
      toast({
        title: "下载成功",
        description: `${resource.title || resource.name} 已开始下载`,
        variant: "default"
      });

      // 重新加载数据以更新计数
      loadResourcesData();
    } catch (error) {
      toast({
        title: "下载失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleView = async resource => {
    try {
      // 记录查看事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'resource_view',
            event_category: 'engagement',
            event_label: resource.title || resource.name,
            resource_type: resource.type,
            timestamp: new Date()
          }
        }
      }));

      // 更新查看计数
      const modelName = resource.type === 'case' ? 'taiji_case' : 'taiji_whitepaper';
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: modelName,
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            viewCount: (resource.viewCount || 0) + 1,
            updatedAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: resource._id
              }
            }
          }
        }
      }));
      toast({
        title: "正在预览",
        description: `正在打开 ${resource.title || resource.name}`,
        variant: "default"
      });
      loadResourcesData();
    } catch (error) {
      toast({
        title: "预览失败",
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
            <span className="text-red-500">知识宝库</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            获取最新的技术文档、案例研究和最佳实践
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                总下载量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalDownloads.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-500" />
                总浏览量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-500" />
                资源总数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{resources.length.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Resources */}
        {stats.popularResources.length > 0 && <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">热门资源</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {stats.popularResources.map(resource => <ResourceItem key={resource._id} resource={resource} type={resource.type} onDownload={handleDownload} onView={handleView} />)}
            </div>
          </div>}

        {/* Filter */}
        <ResourceFilter selectedType={selectedType} onTypeChange={setSelectedType} searchTerm={searchTerm} onSearchChange={setSearchTerm} />

        {/* Resources Grid */}
        <div className={`grid gap-8 ${layoutExperiment === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'}`}>
          {filteredResources.map(resource => <ResourceItem key={resource._id} resource={resource} type={resource.type} onDownload={handleDownload} onView={handleView} />)}
        </div>

        {filteredResources.length === 0 && <div className="text-center py-12">
            <div className="text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">暂无资源</h3>
              <p className="text-gray-400">没有找到匹配的资源</p>
            </div>
          </div>}
      </div>
    </div>;
}
export default function ResourcesPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ResourcesContent {...props} />
    </ExperimentProvider>;
}