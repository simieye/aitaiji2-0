// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Bot, Check, Plus } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function AgentSelector({
  $w,
  selectedAgents,
  onAgentSelect,
  currentSession
}) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadAgents();
  }, []);
  const loadAgents = async () => {
    try {
      setLoading(true);
      const result = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_agent',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              }
            }
          },
          orderBy: [{
            createdAt: 'asc'
          }],
          pageSize: 20,
          pageNumber: 1
        }
      }));
      setAgents(result.records || []);
      setLoading(false);
    } catch (error) {
      console.error('加载代理失败:', error);
      setLoading(false);
    }
  };
  const handleAgentToggle = agent => {
    if (selectedAgents.find(a => a._id === agent._id)) {
      onAgentSelect(selectedAgents.filter(a => a._id !== agent._id));
    } else {
      onAgentSelect([...selectedAgents, agent]);
    }
  };
  const getLayerColor = layer => {
    switch (layer) {
      case 'Interface':
        return 'bg-blue-500';
      case 'Agent':
        return 'bg-green-500';
      case 'Matrix':
        return 'bg-purple-500';
      case 'Kernel':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  if (loading) {
    return <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
        <p className="text-gray-400 mt-2">加载智能代理中...</p>
      </div>;
  }
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium">选择智能代理</h3>
        <Badge className="bg-blue-500 text-white">
          {selectedAgents.length} 个已选择
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {agents.map(agent => {
        const isSelected = selectedAgents.find(a => a._id === agent._id);
        return <Card key={agent._id} className={`bg-gray-800/50 border-gray-700 cursor-pointer transition-all ${isSelected ? 'border-red-500 ring-2 ring-red-500/50' : 'hover:border-gray-600'}`} onClick={() => handleAgentToggle(agent)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getLayerColor(agent.layer)}`}>
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{agent.name}</h4>
                    <p className="text-gray-400 text-sm">{agent.type}</p>
                  </div>
                </div>
                {isSelected ? <Check className="w-5 h-5 text-red-500" /> : <Plus className="w-5 h-5 text-gray-400" />}
              </div>
              <p className="text-gray-300 text-sm mt-2 line-clamp-2">{agent.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {agent.features?.slice(0, 2).map((feature, index) => <Badge key={index} className="bg-gray-700 text-gray-300 text-xs">
                    {feature}
                  </Badge>)}
              </div>
            </CardContent>
          </Card>;
      })}
      </div>
    </div>;
}