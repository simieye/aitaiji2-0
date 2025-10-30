// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, Star, Clock, Users, Zap, Shield, TrendingUp, Play, BookOpen, MessageSquare, Plus, Settings, Eye } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
function ProductContent(props) {
  const {
    $w,
    style
  } = props;
  const [agents, setAgents] = useState([]);
  const [tools, setTools] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userSubscription, setUserSubscription] = useState(null);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('product_layout');
  const filterExperiment = useExperiment('filter_visibility');
  useEffect(() => {
    loadProductData();
    loadUserSubscription();
  }, []);
  const loadProductData = async () => {
    try {
      setLoading(true);

      // 并行加载产品数据
      const [agentsResult, toolsResult, workflowsResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'taiji_agent',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_tool',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_workflow',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      })]);
      setAgents(agentsResult.records || []);
      setTools(toolsResult.records || []);
      setWorkflows(workflowsResult.records || []);
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
  const loadUserSubscription = async () => {
    try {
      const subscriptionResult = await $w.cloud.callDataSource({
        dataSourceName: 'taiji_subscription',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: $w.auth.currentUser?.userId || 'anonymous'
              },
              status: {
                $in: ['active', 'trialing']
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 1,
          pageNumber: 1
        }
      });
      if (subscriptionResult.records && subscriptionResult.records.length > 0) {
        setUserSubscription(subscriptionResult.records[0]);
      }
    } catch (error) {
      console.error('加载用户订阅失败:', error);
    }
  };
  const handleCreateAgent = () => {
    $w.utils.navigateTo({
      pageId: 'product',
      params: {
        action: 'create'
      }
    });
  };
  const handleViewAgent = agentId => {
    $w.utils.navigateTo({
      pageId: 'product',
      params: {
        agentId
      }
    });
  };
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });
  const getAgentStatus = agent => {
    if (agent.status === 'active') return {
      color: 'bg-green-500',
      text: '运行中'
    };
    if (agent.status === 'paused') return {
      color: 'bg-yellow-500',
      text: '已暂停'
    };
    return {
      color: 'bg-gray-500',
      text: '未启动'
    };
  };
  const getUserPermission = () => {
    if (!userSubscription) return 'free';
    const plan = userSubscription.plan?.id || 'basic';
    return plan;
  };
  const canCreateAgent = () => {
    const permission = getUserPermission();
    const agentCount = agents.filter(a => a.user_id === ($w.auth.currentUser?.userId || 'anonymous')).length;
    switch (permission) {
      case 'basic':
        return agentCount < 5;
      case 'professional':
        return agentCount < 50;
      case 'enterprise':
        return true;
      default:
        return agentCount < 3;
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载产品数据...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">AI太极产品中心</h1>
            <p className="text-gray-300">探索智能代理、工具和自动化工作流</p>
          </div>
          <div className="flex items-center space-x-4">
            {canCreateAgent() && <Button onClick={handleCreateAgent} className="bg-red-500 hover:bg-red-600">
                <Plus className="w-4 h-4 mr-2" />
                创建代理
              </Button>}
            {!canCreateAgent() && <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                已达创建上限
              </Badge>}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="搜索代理、工具或工作流..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            </div>
            {filterExperiment?.variant !== 'hidden' && <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
                <option value="all">所有类别</option>
                <option value="marketing">营销</option>
                <option value="sales">销售</option>
                <option value="support">客服</option>
                <option value="analytics">分析</option>
              </select>}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="agents" className="space-y-8">
          <TabsList className="bg-gray-800 border-gray-600">
            <TabsTrigger value="agents" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">智能代理</TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">工具</TabsTrigger>
            <TabsTrigger value="workflows" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">工作流</TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <div className={`grid ${layoutExperiment?.variant === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
              {filteredAgents.map(agent => {
              const status = getAgentStatus(agent);
              return <Card key={agent._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">{agent.name}</CardTitle>
                        <Badge className={`${status.color} text-white text-xs`}>{status.text}</Badge>
                      </div>
                      <CardDescription className="text-gray-300">{agent.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-400">
                          <Zap className="w-4 h-4 mr-2" />
                          <span>类型: {agent.type || '通用'}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Users className="w-4 h-4 mr-2" />
                          <span>用户: {agent.user_count || 0}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Star className="w-4 h-4 mr-2" />
                          <span>评分: {agent.rating || 4.5}/5</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleViewAgent(agent._id)} variant="outline" className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                          <Eye className="w-4 h-4 mr-2" />
                          查看
                        </Button>
                        <Button variant="outline" className="flex-1 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">
                          <Settings className="w-4 h-4 mr-2" />
                          配置
                        </Button>
                      </div>
                    </CardContent>
                  </Card>;
            })}
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map(tool => <Card key={tool._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">{tool.name}</CardTitle>
                    <CardDescription className="text-gray-300">{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-400">
                        <Shield className="w-4 h-4 mr-2" />
                        <span>权限: {tool.required_permissions?.join(', ') || '基础'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>更新时间: {new Date(tool.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                      使用工具
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </TabsContent>

          <TabsContent value="workflows">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredWorkflows.map(workflow => <Card key={workflow._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">{workflow.name}</CardTitle>
                    <CardDescription className="text-gray-300">{workflow.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>步骤: {workflow.steps?.length || 0}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Users className="w-4 h-4 mr-2" />
                        <span>使用次数: {workflow.usage_count || 0}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white">
                      <Play className="w-4 h-4 mr-2" />
                      运行工作流
                    </Button>
                  </CardContent>
                </Card>)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}
export default function ProductPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ProductContent {...props} />
    </ExperimentProvider>;
}