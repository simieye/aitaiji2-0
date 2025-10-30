// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger, Input, Textarea } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, Filter, Play, Pause, RotateCcw, Target, Users, TrendingUp, Activity } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { FeatureFlagCard } from '@/components/FeatureFlagCard';
// @ts-ignore;
import { ExperimentMetrics } from '@/components/ExperimentMetrics';
function ExperimentsContent(props) {
  const {
    $w,
    style
  } = props;
  const [featureFlags, setFeatureFlags] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('flags');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFlag, setNewFlag] = useState({
    flagKey: '',
    name: '',
    description: '',
    enabled: false,
    rolloutPercentage: 0,
    targetUsers: [],
    targetGroups: []
  });
  const [metrics, setMetrics] = useState({
    totalExperiments: 0,
    enabledFeatures: 0,
    affectedUsers: 0,
    successRate: 0
  });
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('experiments_layout');
  const createExperiment = useExperiment('create_experiment_flow');
  useEffect(() => {
    loadExperimentsData();
  }, []);
  const loadExperimentsData = async () => {
    try {
      setLoading(true);
      const [flagsResult, experimentsResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'taiji_feature_flag',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            updatedAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_experiment_control',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      })]);
      setFeatureFlags(flagsResult.records || []);
      setExperiments(experimentsResult.records || []);

      // 计算指标
      const enabledCount = flagsResult.records?.filter(flag => flag.enabled).length || 0;
      const affectedUsers = flagsResult.records?.reduce((sum, flag) => sum + (flag.targetUsers?.length || 0), 0) || 0;
      setMetrics({
        totalExperiments: flagsResult.records?.length || 0,
        enabledFeatures: enabledCount,
        affectedUsers: affectedUsers,
        successRate: flagsResult.records?.length > 0 ? enabledCount / flagsResult.records.length * 100 : 0
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
  const handleCreateFeatureFlag = async () => {
    if (!newFlag.flagKey || !newFlag.name) {
      toast({
        title: "信息不完整",
        description: "请填写功能开关标识和名称",
        variant: "destructive"
      });
      return;
    }
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'taiji_feature_flag',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            ...newFlag,
            createdAt: new Date(),
            updatedAt: new Date(),
            environment: 'production',
            version: '1.0.0',
            status: 'active'
          }
        }
      });
      toast({
        title: "创建成功",
        description: `功能开关 ${newFlag.name} 已创建`,
        variant: "default"
      });
      setShowCreateModal(false);
      setNewFlag({
        flagKey: '',
        name: '',
        description: '',
        enabled: false,
        rolloutPercentage: 0,
        targetUsers: [],
        targetGroups: []
      });
      loadExperimentsData();
    } catch (error) {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleUpdateFeatureFlag = async (id, updates) => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_feature_flag',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            ...updates,
            updatedAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: id
              }
            }
          }
        }
      });
      loadExperimentsData();
    } catch (error) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleDeleteFeatureFlag = async id => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_feature_flag',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: id
              }
            }
          }
        }
      });
      toast({
        title: "删除成功",
        description: "功能开关已删除",
        variant: "default"
      });
      loadExperimentsData();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleToggleFeatureFlag = async (id, enabled) => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_feature_flag',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            enabled,
            updatedAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: id
              }
            }
          }
        }
      });
      loadExperimentsData();
    } catch (error) {
      toast({
        title: "切换失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const filteredFlags = featureFlags.filter(flag => flag.name.toLowerCase().includes(searchTerm.toLowerCase()) || flag.description.toLowerCase().includes(searchTerm.toLowerCase()) || flag.flagKey.toLowerCase().includes(searchTerm.toLowerCase()));
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载实验数据...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">实验管理</h1>
            <p className="text-gray-300">管理功能开关和A/B测试实验</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-red-500 hover:bg-red-600">
            <Plus className="w-4 h-4 mr-2" />
            创建功能开关
          </Button>
        </div>

        {/* Metrics */}
        <ExperimentMetrics metrics={metrics} />

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="搜索功能开关..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadExperimentsData}>
                <RotateCcw className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="flags" className="space-y-8">
          <TabsList className="bg-gray-800 border-gray-600">
            <TabsTrigger value="flags" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              功能开关
            </TabsTrigger>
            <TabsTrigger value="experiments" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              A/B测试
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flags">
            <div className="grid gap-6">
              {filteredFlags.map(flag => <FeatureFlagCard key={flag._id} flag={flag} onUpdate={handleUpdateFeatureFlag} onDelete={handleDeleteFeatureFlag} onToggle={handleToggleFeatureFlag} />)}
              {filteredFlags.length === 0 && <div className="text-center py-12">
                  <div className="text-gray-400">
                    <Target className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">暂无功能开关</h3>
                    <p className="text-gray-400">创建您的第一个功能开关来开始实验</p>
                  </div>
                </div>}
            </div>
          </TabsContent>

          <TabsContent value="experiments">
            <div className="grid gap-6">
              {experiments.map(experiment => <Card key={experiment._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-white">{experiment.name}</CardTitle>
                        <CardDescription className="text-gray-300">{experiment.description}</CardDescription>
                      </div>
                      <Badge className="bg-blue-500 text-white">
                        {experiment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">变体A</div>
                        <div className="text-white font-medium">{experiment.variantA}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">变体B</div>
                        <div className="text-white font-medium">{experiment.variantB}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">参与用户</div>
                        <div className="text-white font-medium">{experiment.participants || 0}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}
              {experiments.length === 0 && <div className="text-center py-12">
                  <div className="text-gray-400">
                    <Activity className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">暂无A/B测试</h3>
                    <p className="text-gray-400">创建您的第一个A/B测试实验</p>
                  </div>
                </div>}
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Modal */}
        {showCreateModal && <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
            <Card className="bg-gray-900 border-gray-700 w-full max-w-md">
              <CardHeader>
                <CardTitle className="text-white">创建功能开关</CardTitle>
                <CardDescription className="text-gray-300">配置新的功能开关和灰度发布</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300">功能标识</label>
                  <Input value={newFlag.flagKey} onChange={e => setNewFlag({
                ...newFlag,
                flagKey: e.target.value
              })} placeholder="例如: new_feature_v1" className="bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-300">功能名称</label>
                  <Input value={newFlag.name} onChange={e => setNewFlag({
                ...newFlag,
                name: e.target.value
              })} placeholder="例如: 新功能开关" className="bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-300">功能描述</label>
                  <Textarea value={newFlag.description} onChange={e => setNewFlag({
                ...newFlag,
                description: e.target.value
              })} placeholder="详细描述这个功能开关的用途" className="bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <label className="text-sm text-gray-300">灰度百分比</label>
                  <div className="flex items-center space-x-2">
                    <input type="range" min="0" max="100" value={newFlag.rolloutPercentage} onChange={e => setNewFlag({
                  ...newFlag,
                  rolloutPercentage: parseInt(e.target.value)
                })} className="flex-1" />
                    <span className="text-white w-12">{newFlag.rolloutPercentage}%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-300">目标用户ID（可选）</label>
                  <Textarea value={newFlag.targetUsers.join(', ')} onChange={e => setNewFlag({
                ...newFlag,
                targetUsers: e.target.value.split(',').map(id => id.trim()).filter(id => id)
              })} placeholder="输入用户ID，用逗号分隔" className="bg-gray-800 border-gray-600 text-white" />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateFeatureFlag} className="flex-1 bg-red-500 hover:bg-red-600">
                    创建
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>}
      </div>
    </div>;
}
export default function ExperimentsPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ExperimentsContent {...props} />
    </ExperimentProvider>;
}