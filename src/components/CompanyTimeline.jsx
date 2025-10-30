// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { Calendar, Award, TrendingUp, Users, Zap } from 'lucide-react';

export function CompanyTimeline() {
  const [activeMilestone, setActiveMilestone] = useState(0);
  const milestones = [{
    year: '2018',
    title: '公司成立',
    description: 'AI太极正式成立，开始探索AI技术在企业数字化转型中的应用',
    icon: <Zap className="w-6 h-6" />,
    achievements: ['团队组建完成', '获得天使轮融资', '首个产品原型开发']
  }, {
    year: '2019',
    title: '产品发布',
    description: '推出首个智能代理平台，获得市场认可',
    icon: <TrendingUp className="w-6 h-6" />,
    achievements: ['产品正式上线', '获得首批企业客户', '团队扩展至20人']
  }, {
    year: '2020',
    title: '快速发展',
    description: '疫情期间助力企业数字化转型，业务快速增长',
    icon: <Users className="w-6 h-6" />,
    achievements: ['服务企业客户超过100家', '获得A轮融资', '产品功能全面升级']
  }, {
    year: '2021',
    title: '技术突破',
    description: '在AI算法和自然语言处理方面取得重大突破',
    icon: <Award className="w-6 h-6" />,
    achievements: ['获得多项技术专利', '推出企业级解决方案', '建立研发中心']
  }, {
    year: '2022',
    title: '市场扩张',
    description: '业务扩展至全国，建立完善的销售和服务网络',
    icon: <TrendingUp className="w-6 h-6" />,
    achievements: ['服务客户超过500家', '获得B轮融资', '推出SaaS产品线']
  }, {
    year: '2023',
    title: '行业领先',
    description: '成为AI代理领域的领导者，获得行业认可',
    icon: <Award className="w-6 h-6" />,
    achievements: ['获得行业最佳产品奖', '客户满意度达到98%', '团队规模超过100人']
  }, {
    year: '2024',
    title: '全球化布局',
    description: '开始全球化布局，拓展海外市场',
    icon: <Zap className="w-6 h-6" />,
    achievements: ['推出国际化产品', '建立海外办事处', '获得C轮融资']
  }];
  return <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">发展历程</h2>
        <p className="text-gray-300">见证AI太极的成长与蜕变</p>
      </div>

      {/* Timeline Navigation */}
      <div className="flex justify-center space-x-2 mb-8">
        {milestones.map((milestone, index) => <button key={index} onClick={() => setActiveMilestone(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${activeMilestone === index ? 'bg-red-500 w-8' : 'bg-gray-600'}`} />)}
      </div>

      {/* Active Milestone */}
      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardContent className="p-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white">
                {milestones[activeMilestone].icon}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl font-bold text-red-500">{milestones[activeMilestone].year}</span>
                <h3 className="text-2xl font-bold text-white">{milestones[activeMilestone].title}</h3>
              </div>
              <p className="text-gray-300 text-lg mb-6">{milestones[activeMilestone].description}</p>
              <div className="grid md:grid-cols-3 gap-4">
                {milestones[activeMilestone].achievements.map((achievement, index) => <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">{achievement}</span>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {milestones.map((milestone, index) => <Card key={index} className={`bg-gray-900/50 backdrop-blur border-gray-700 cursor-pointer transition-all duration-300 ${activeMilestone === index ? 'border-red-500 ring-2 ring-red-500/50' : 'hover:border-gray-600'}`} onClick={() => setActiveMilestone(index)}>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500 mb-2">{milestone.year}</div>
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                  {milestone.icon}
                </div>
                <h4 className="text-white font-medium mb-2">{milestone.title}</h4>
                <p className="text-gray-400 text-sm line-clamp-2">{milestone.description}</p>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}