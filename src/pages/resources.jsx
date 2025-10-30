// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Download, ExternalLink, BookOpen, FileText, Video, Code, Search, Filter } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
function ResourcesContent(props) {
  const {
    $w,
    style
  } = props;
  const [whitepapers, setWhitepapers] = useState([]);
  const [tools, setTools] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('resources_layout');
  const downloadExperiment = useExperiment('download_flow');
  useEffect(() => {
    loadResourcesData();
  }, []);
  const loadResourcesData = async () => {
    try {
      setLoading(true);

      // 并行加载所有资源数据
      const [whitepapersResult, toolsResult, casesResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            downloads: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_tool',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            usage_count: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              has_resources: {
                $eq: true
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      })]);
      setWhitepapers(whitepapersResult.records || []);
      setTools(toolsResult.records || []);
      setCases(casesResult.records || []);
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
  const handleDownload = async (resourceType, resourceId, resourceName) => {
    try {
      // 记录下载事件
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'resource_download',
            event_category: 'engagement',
            event_action: 'download',
            event_label: `${resourceType}_${resourceName}`,
            metadata: {
              resource_type: resourceType,
              resource_id: resourceId,
              resource_name: resourceName
            },
            timestamp: new Date()
          }
        }
      });

      // 更新下载计数
      if (resourceType === 'whitepaper') {
        await $w.cloud.callDataSource({
          dataSourceName: 'taiji_whitepaper',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              downloads: {
                $inc: 1
              }
            },
            filter: {
              where: {
                _id: {
                  $eq: resourceId
                }
              }
            }
          }
        });
      }
      toast({
        title: "下载成功",
        description: `${resourceName} 已开始下载`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "下载失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleViewResource = (resourceType, resourceId) => {
    // 记录查看事件
    $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'resource_view',
          event_category: 'engagement',
          event_action: 'view',
          event_label: `${resourceType}_${resourceId}`,
          timestamp: new Date()
        }
      }
    });
  };
  const filteredResources = [...whitepapers, ...tools, ...cases].filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) || resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || selectedType === 'whitepaper' && resource.category === 'whitepaper' || selectedType === 'tool' && resource.type === 'tool' || selectedType === 'case' && resource.has_resources;
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });
  const getResourceIcon = type => {
    switch (type) {
      case 'whitepaper':
        return <BookOpen className="w-5 h-5" />;
      case 'tool':
        return <Code className="w-5 h-5" />;
      case 'case':
        return <FileText className="w-5 h-5" />;
      default:
        return <Download className="w-5 h-5" />;
    }
  };
  const getResourceTypeLabel = type => {
    switch (type) {
      case 'whitepaper':
        return '白皮书';
      case 'tool':
        return '工具';
      case 'case':
        return '案例资源';
      default:
        return '资源';
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">资源中心</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            获取AI太极的技术白皮书、开发工具、案例研究等丰富资源
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="搜索资源..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            </div>
            <div className="flex gap-2">
              <select value={selectedType} onChange={e => setSelectedType(e.target.value)} className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
                <option value="all">所有类型</option>
                <option value="whitepaper">白皮书</option>
                <option value="tool">开发工具</option>
                <option value="case">案例资源</option>
              </select>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
                <option value="all">所有类别</option>
                <option value="ai">人工智能</option>
                <option value="automation">自动化</option>
                <option value="privacy">隐私保护</option>
                <option value="analytics">数据分析</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resource Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{whitepapers.length}</div>
            <div className="text-gray-400">白皮书</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-center">
            <Code className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{tools.length}</div>
            <div className="text-gray-400">开发工具</div>
          </div>
          <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-lg p-6 text-center">
            <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{cases.length}</div>
            <div className="text-gray-400">案例资源</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          {/* Whitepapers */}
          {selectedType === 'all' || selectedType === 'whitepaper' ? <div>
              <h2 className="text-2xl font-bold text-white mb-6">技术白皮书</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {whitepapers.filter(w => selectedType === 'all' || selectedType === 'whitepaper').map(whitepaper => <Card key={whitepaper._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        <Badge variant="outline" className="border-blue-500 text-blue-500">
                          白皮书
                        </Badge>
                      </div>
                      <CardTitle className="text-white">{whitepaper.title}</CardTitle>
                      <CardDescription className="text-gray-300">{whitepaper.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <span>作者: {whitepaper.author || 'AI太极研究团队'}</span>
                        </div>
                        <div className="flex items-center">
                          <span>页数: {whitepaper.page_count || '15页'}</span>
                        </div>
                        <div className="flex items-center">
                          <span>下载: {whitepaper.downloads || 0}次</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleDownload('whitepaper', whitepaper._id, whitepaper.title)} className="flex-1 bg-blue-500 hover:bg-blue-600">
                          <Download className="w-4 h-4 mr-2" />
                          下载
                        </Button>
                        <Button onClick={() => handleViewResource('whitepaper', whitepaper._id)} variant="outline" className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          预览
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div> : null}

          {/* Tools */}
          {selectedType === 'all' || selectedType === 'tool' ? <div>
              <h2 className="text-2xl font-bold text-white mb-6">开发工具</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.filter(t => selectedType === 'all' || selectedType === 'tool').map(tool => <Card key={tool._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Code className="w-5 h-5 text-green-400" />
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          工具
                        </Badge>
                      </div>
                      <CardTitle className="text-white">{tool.name}</CardTitle>
                      <CardDescription className="text-gray-300">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <span>使用: {tool.usage_count || 0}次</span>
                        </div>
                        <div className="flex items-center">
                          <span>权限: {tool.required_permissions?.join(', ') || '基础'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleDownload('tool', tool._id, tool.name)} className="flex-1 bg-green-500 hover:bg-green-600">
                          <Download className="w-4 h-4 mr-2" />
                          获取
                        </Button>
                        <Button onClick={() => handleViewResource('tool', tool._id)} variant="outline" className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          文档
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div> : null}

          {/* Case Resources */}
          {selectedType === 'all' || selectedType === 'case' ? <div>
              <h2 className="text-2xl font-bold text-white mb-6">案例资源</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cases.filter(c => selectedType === 'all' || selectedType === 'case').map(caseItem => <Card key={caseItem._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        <Badge variant="outline" className="border-purple-500 text-purple-500">
                          案例
                        </Badge>
                      </div>
                      <CardTitle className="text-white">{caseItem.title}</CardTitle>
                      <CardDescription className="text-gray-300">{caseItem.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center">
                          <span>行业: {caseItem.industry || '通用'}</span>
                        </div>
                        <div className="flex items-center">
                          <span>效率提升: {caseItem.efficiency_improvement || '30%'}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleDownload('case', caseItem._id, caseItem.title)} className="flex-1 bg-purple-500 hover:bg-purple-600">
                          <Download className="w-4 h-4 mr-2" />
                          下载
                        </Button>
                        <Button onClick={() => handleViewResource('case', caseItem._id)} variant="outline" className="flex-1 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          查看
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div> : null}
        </div>
      </div>
    </div>;
}
export default function ResourcesPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ResourcesContent {...props} />
    </ExperimentProvider>;
}