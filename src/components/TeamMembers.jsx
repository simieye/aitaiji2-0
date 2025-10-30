// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Linkedin, Twitter, Mail, Award, Users } from 'lucide-react';

export function TeamMembers() {
  const [selectedMember, setSelectedMember] = useState(null);
  const teamMembers = [{
    id: 1,
    name: '张明',
    position: '创始人 & CEO',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    bio: '拥有15年AI和机器学习经验，曾在多家知名科技公司担任技术总监。致力于推动AI技术在企业数字化转型中的应用。',
    expertise: ['AI战略', '产品管理', '商业发展'],
    achievements: ['获得AI领域专利10项', '发表学术论文20余篇', '被评为行业领军人物'],
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'zhang.ming@ai-taiji.com'
    }
  }, {
    id: 2,
    name: '李华',
    position: '联合创始人 & CTO',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    bio: '深度学习和自然语言处理专家，曾在Google和Microsoft担任高级工程师。负责公司技术架构和产品研发。',
    expertise: ['深度学习', 'NLP', '系统架构'],
    achievements: ['主导开发核心AI引擎', '获得技术专利15项', '建立研发团队'],
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'li.hua@ai-taiji.com'
    }
  }, {
    id: 3,
    name: '王芳',
    position: 'COO',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
    bio: '拥有12年企业运营管理经验，曾在多家独角兽公司担任运营总监。负责公司日常运营和客户服务。',
    expertise: ['运营管理', '客户服务', '团队建设'],
    achievements: ['建立完善的运营体系', '客户满意度达到98%', '团队规模扩展至100人'],
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'wang.fang@ai-taiji.com'
    }
  }, {
    id: 4,
    name: '陈强',
    position: 'CPO',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    bio: '产品设计和用户体验专家，曾在Apple和Adobe担任产品经理。负责公司产品战略和用户体验设计。',
    expertise: ['产品设计', '用户体验', '产品战略'],
    achievements: ['设计获奖产品3个', '用户满意度95%', '建立产品团队'],
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'chen.qiang@ai-taiji.com'
    }
  }, {
    id: 5,
    name: '刘敏',
    position: 'CMO',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    bio: '市场营销和品牌建设专家，曾在多家知名企业担任市场总监。负责公司品牌建设和市场推广。',
    expertise: ['市场营销', '品牌建设', '商务拓展'],
    achievements: ['品牌知名度提升300%', '获得行业营销大奖', '建立销售团队'],
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'liu.min@ai-taiji.com'
    }
  }, {
    id: 6,
    name: '赵磊',
    position: 'CFO',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    bio: '财务管理和投资专家，曾在多家投资机构担任投资总监。负责公司财务管理和投融资。',
    expertise: ['财务管理', '投资分析', '风险控制'],
    achievements: ['成功融资3轮', '建立财务体系', '实现盈利增长'],
    social: {
      linkedin: '#',
      twitter: '#',
      email: 'zhao.lei@ai-taiji.com'
    }
  }];
  return <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">核心团队</h2>
        <p className="text-gray-300">汇聚行业精英，共创AI未来</p>
      </div>

      {/* Team Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500 mb-2">100+</div>
          <div className="text-gray-400">团队成员</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-500 mb-2">50+</div>
          <div className="text-gray-400">技术专家</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-500 mb-2">15+</div>
          <div className="text-gray-400">行业经验</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-500 mb-2">30+</div>
          <div className="text-gray-400">博士学位</div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teamMembers.map(member => <Card key={member.id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300 cursor-pointer" onClick={() => setSelectedMember(member)}>
            <CardHeader className="text-center">
              <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4" />
              <CardTitle className="text-white">{member.name}</CardTitle>
              <div className="text-red-500 font-medium">{member.position}</div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">{member.bio}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {member.expertise.slice(0, 2).map((skill, index) => <span key={index} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                    {skill}
                  </span>)}
              </div>
              <div className="flex justify-center space-x-3">
                <a href={member.social.linkedin} className="text-gray-400 hover:text-white">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href={member.social.twitter} className="text-gray-400 hover:text-white">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href={`mailto:${member.social.email}`} className="text-gray-400 hover:text-white">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Selected Member Detail */}
      {selectedMember && <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <img src={selectedMember.avatar} alt={selectedMember.name} className="w-32 h-32 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedMember.name}</h3>
                    <div className="text-red-500 text-lg">{selectedMember.position}</div>
                  </div>
                  <button onClick={() => setSelectedMember(null)} className="text-gray-400 hover:text-white">
                    ×
                  </button>
                </div>
                <p className="text-gray-300 mb-6">{selectedMember.bio}</p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-white font-medium mb-3">专业领域</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.expertise.map((skill, index) => <span key={index} className="bg-blue-500/20 text-blue-400 border border-blue-500/50 px-3 py-1 rounded">
                          {skill}
                        </span>)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-3">主要成就</h4>
                    <div className="space-y-2">
                      {selectedMember.achievements.map((achievement, index) => <div key={index} className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-gray-300 text-sm">{achievement}</span>
                        </div>)}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <a href={selectedMember.social.linkedin} className="flex items-center space-x-2 text-gray-400 hover:text-white">
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                  <a href={selectedMember.social.twitter} className="flex items-center space-x-2 text-gray-400 hover:text-white">
                    <Twitter className="w-4 h-4" />
                    <span>Twitter</span>
                  </a>
                  <a href={`mailto:${selectedMember.social.email}`} className="flex items-center space-x-2 text-gray-400 hover:text-white">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>}
    </div>;
}