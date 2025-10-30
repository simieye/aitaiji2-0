// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Users, Target, Award, Globe, TrendingUp, Mail, Phone, MapPin, Clock } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { TeamMemberCard } from '@/components/TeamMemberCard';
// @ts-ignore;
import { StatsCard } from '@/components/StatsCard';
function AboutContent(props) {
  const {
    $w,
    style
  } = props;
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalWorkflows: 0,
    totalCases: 0
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('about_layout');
  const ctaExperiment = useExperiment('about_cta');
  useEffect(() => {
    loadAboutData();
  }, []);
  const loadAboutData = async () => {
    try {
      setLoading(true);

      // 并行加载关于页面数据
      const [usersResult, agentsResult, workflowsResult, casesResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_agent',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_workflow',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      })]);
      setStats({
        totalUsers: usersResult.total || 0,
        totalAgents: agentsResult.total || 0,
        totalWorkflows: workflowsResult.total || 0,
        totalCases: casesResult.total || 0
      });

      // 团队成员数据
      setTeamMembers([{
        id: '1',
        name: '张明',
        role: '创始人 & CEO',
        bio: 'AI太极创始人，专注于AI代理系统的设计与实现，拥有10年AI领域经验',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        linkedin: 'https://linkedin.com/in/zhangming',
        twitter: 'https://twitter.com/zhangming',
        github: 'https://github.com/zhangming',
        email: 'zhangming@taiji-ai.com'
      }, {
        id: '2',
        name: '李华',
        role: 'CTO',
        bio: '技术架构专家，负责AI太极的技术战略和产品架构，前Google AI研究员',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
        linkedin: 'https://linkedin.com/in/lihua',
        twitter: 'https://twitter.com/lihua',
        github: 'https://github.com/lihua',
        email: 'lihua@taiji-ai.com'
      }, {
        id: '3',
        name: '王芳',
        role: '产品总监',
        bio: '产品策略专家，专注于用户体验和产品创新，曾主导多个成功的AI产品',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop',
        linkedin: 'https://linkedin.com/in/wangfang',
        twitter: 'https://twitter.com/wangfang',
        github: 'https://github.com/wangfang',
        email: 'wangfang@taiji-ai.com'
      }, {
        id: '4',
        name: '陈强',
        role: '技术总监',
        bio: 'AI算法专家，负责核心算法研发和性能优化，在隐私计算领域有深入研究',
        avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop',
        linkedin: 'https://linkedin.com/in/chenqiang',
        twitter: 'https://twitter.com/chenqiang',
        github: 'https://github.com/chenqiang',
        email: 'chenqiang@taiji-ai.com'
      }]);
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
  const handleContact = () => {
    // 记录联系事件
    $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'contact_click',
          event_category: 'engagement',
          event_action: 'click',
          event_label: 'contact_button',
          timestamp: new Date()
        }
      }
    });
    toast({
      title: "联系我们",
      description: "正在跳转到联系页面...",
      variant: "default"
    });
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载关于我们...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-black/50 to-white/10"></div>
        <div className="relative container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-white">
                关于 AI太极
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              我们致力于将太极哲学的智慧与现代AI技术相结合，打造刚柔并济的智能代理系统
            </p>
            <Button onClick={handleContact} className={`bg-gradient-to-r ${ctaExperiment?.value || 'from-red-500 to-red-600'} hover:from-red-600 hover:to-red-700 text-white px-8 py-4 text-lg rounded-full shadow-lg`}>
              联系我们
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-8">我们的使命</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Target className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">智能代理</h3>
                <p className="text-gray-300">构建灵活而强大的AI代理系统，让AI像太极一样刚柔并济</p>
              </div>
              <div className="text-center">
                <Award className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">隐私保护</h3>
                <p className="text-gray-300">在提供智能服务的同时，确保用户数据的隐私和安全</p>
              </div>
              <div className="text-center">
                <Globe className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">普惠AI</h3>
                <p className="text-gray-300">让每个人都能轻松使用AI技术，推动AI的普及和应用</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">平台数据</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <StatsCard icon={Users} title="注册用户" value={stats.totalUsers.toLocaleString()} description="活跃的企业和个人用户" color="text-red-500" />
              <StatsCard icon={TrendingUp} title="智能代理" value={stats.totalAgents.toLocaleString()} description="已部署的AI代理" color="text-blue-500" />
              <StatsCard icon={Clock} title="工作流" value={stats.totalWorkflows.toLocaleString()} description="自动化工作流" color="text-green-500" />
              <StatsCard icon={Award} title="成功案例" value={stats.totalCases.toLocaleString()} description="客户成功案例" color="text-purple-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">核心团队</h2>
            <p className="text-xl text-gray-300">由AI领域的顶尖专家组成</p>
          </div>
          <div className={`grid ${layoutExperiment?.variant === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'} gap-8`}>
            {teamMembers.map(member => <TeamMemberCard key={member.id} member={member} />)}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-12">联系我们</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Mail className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">邮箱</h3>
                <p className="text-gray-300">contact@taiji-ai.com</p>
              </div>
              <div className="text-center">
                <Phone className="w-8 h-8 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">电话</h3>
                <p className="text-gray-300">+86 400-123-4567</p>
              </div>
              <div className="text-center">
                <MapPin className="w-8 h-8 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">地址</h3>
                <p className="text-gray-300">北京市海淀区中关村</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>;
}
export default function AboutPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <AboutContent {...props} />
    </ExperimentProvider>;
}