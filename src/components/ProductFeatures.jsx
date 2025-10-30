// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Zap, Shield, Users, TrendingUp, Play, Pause } from 'lucide-react';

export function ProductFeatures({
  features
}) {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPlaying, features.length]);
  const defaultFeatures = [{
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
    title: '极速处理',
    description: '毫秒级响应速度，处理海量数据',
    details: '采用最新的AI技术，实现毫秒级响应，能够处理海量数据请求，确保系统高效运行。'
  }, {
    icon: <Shield className="w-8 h-8 text-green-500" />,
    title: '安全可靠',
    description: '企业级安全保障，数据加密存储',
    details: '采用银行级加密技术，多重安全防护措施，确保您的数据安全可靠，符合国际安全标准。'
  }, {
    icon: <Users className="w-8 h-8 text-blue-500" />,
    title: '团队协作',
    description: '多人协作，权限管理，实时同步',
    details: '支持多人实时协作，细粒度权限管理，数据实时同步，提高团队工作效率。'
  }, {
    icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
    title: '智能分析',
    description: 'AI驱动的数据分析和洞察',
    details: '基于先进的AI算法，提供深度数据分析和智能洞察，帮助您做出更好的决策。'
  }];
  const displayFeatures = features.length > 0 ? features : defaultFeatures;
  return <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">产品特性</h2>
        <p className="text-gray-300">探索AI太极的强大功能</p>
      </div>

      {/* Feature Navigation */}
      <div className="flex justify-center space-x-2">
        {displayFeatures.map((_, index) => <button key={index} onClick={() => setActiveFeature(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${activeFeature === index ? 'bg-red-500 w-8' : 'bg-gray-600'}`} />)}
      </div>

      {/* Active Feature Display */}
      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {displayFeatures[activeFeature].icon}
              <div>
                <h3 className="text-2xl font-bold text-white">{displayFeatures[activeFeature].title}</h3>
                <p className="text-gray-300">{displayFeatures[activeFeature].description}</p>
              </div>
            </div>
            <Button onClick={() => setIsPlaying(!isPlaying)} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-gray-300 leading-relaxed">{displayFeatures[activeFeature].details}</p>
        </CardContent>
      </Card>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayFeatures.map((feature, index) => <Card key={index} className={`bg-gray-900/50 backdrop-blur border-gray-700 cursor-pointer transition-all duration-300 ${activeFeature === index ? 'border-red-500 ring-2 ring-red-500/50' : 'hover:border-gray-600'}`} onClick={() => setActiveFeature(index)}>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <CardTitle className="text-white">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm text-center">{feature.description}</p>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}