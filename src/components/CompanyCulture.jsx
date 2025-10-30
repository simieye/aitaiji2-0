// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Target, Heart, Lightbulb, Users, Award, Zap } from 'lucide-react';

export function CompanyCulture() {
  const values = [{
    icon: <Target className="w-8 h-8" />,
    title: '使命驱动',
    description: '以AI技术推动企业数字化转型，让每个企业都能享受AI带来的价值',
    color: 'text-red-500'
  }, {
    icon: <Lightbulb className="w-8 h-8" />,
    title: '创新精神',
    description: '持续创新，勇于突破，在AI技术前沿不断探索和突破',
    color: 'text-yellow-500'
  }, {
    icon: <Heart className="w-8 h-8" />,
    title: '客户至上',
    description: '以客户需求为导向，提供最优质的AI解决方案和服务',
    color: 'text-pink-500'
  }, {
    icon: <Users className="w-8 h-8" />,
    title: '团队协作',
    description: '相信团队的力量，通过协作实现共同的目标和愿景',
    color: 'text-blue-500'
  }, {
    icon: <Award className="w-8 h-8" />,
    title: '追求卓越',
    description: '追求卓越品质，在技术、产品和服务上不断精进',
    color: 'text-green-500'
  }, {
    icon: <Zap className="w-8 h-8" />,
    title: '快速响应',
    description: '快速响应市场变化，敏捷开发，及时满足客户需求',
    color: 'text-purple-500'
  }];
  const cultureHighlights = [{
    title: '技术分享会',
    description: '每周举办技术分享会，促进知识交流和技术创新',
    icon: <Lightbulb className="w-6 h-6" />
  }, {
    title: '团队建设',
    description: '定期组织团队建设活动，增强团队凝聚力和归属感',
    icon: <Users className="w-6 h-6" />
  }, {
    title: '创新奖励',
    description: '设立创新奖励机制，鼓励员工提出创新想法和方案',
    icon: <Award className="w-6 h-6" />
  }, {
    title: '学习成长',
    description: '提供丰富的学习资源和培训机会，支持员工职业发展',
    icon: <Target className="w-6 h-6" />
  }];
  return <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">企业文化</h2>
        <p className="text-gray-300">我们的价值观和工作方式</p>
      </div>

      {/* Core Values */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-6">核心价值观</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => <Card key={index} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className={`${value.color} mx-auto mb-4`}>
                  {value.icon}
                </div>
                <CardTitle className="text-white">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-center">{value.description}</p>
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* Culture Highlights */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-6">文化特色</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {cultureHighlights.map((highlight, index) => <Card key={index} className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-red-500 mt-1">
                    {highlight.icon}
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">{highlight.title}</h4>
                    <p className="text-gray-300 text-sm">{highlight.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* Work Environment */}
      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-center">工作环境</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-500 mb-2">灵活办公</div>
              <p className="text-gray-300">支持远程办公和弹性工作时间，让员工更好地平衡工作与生活</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500 mb-2">开放文化</div>
              <p className="text-gray-300">鼓励开放沟通，扁平化管理，让每个声音都能被听到</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">成长空间</div>
              <p className="text-gray-300">提供广阔的职业发展空间和学习机会，助力员工成长</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}