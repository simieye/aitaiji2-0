// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Users, Target, Award, Globe, Mail, Phone, MapPin, Calendar, CheckCircle } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { TeamMemberCard } from '@/components/TeamMemberCard';
// @ts-ignore;
import { StatsCard } from '@/components/StatsCard';
function AboutContent(props) {
  const {
    $w,
    style
  } = props;
  const [teamMembers, setTeamMembers] = useState([]);
  const [companyStats, setCompanyStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalWorkflows: 0,
    yearsInBusiness: 5
  });
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('about_layout');
  const contentExperiment = useExperiment('content_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadAboutData, 30000);
  useEffect(() => {
    loadAboutData();
  }, []);
  const loadAboutData = async () => {
    try {
      setLoading(true);
      const [usersResult, agentsResult, workflowsResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_agent',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_workflow',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      }))]);
      setCompanyStats({
        totalUsers: usersResult.total || 0,
        totalAgents: agentsResult.total || 0,
        totalWorkflows: workflowsResult.total || 0,
        yearsInBusiness: 5
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
  const handleContactUs = () => {
    $w.utils.navigateTo({
      pageId: 'chat',
      params: {}
    });
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载公司信息...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-white mb-6">
            关于AI太极
            <span className="text-red-500">创新引领未来</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            我们致力于通过人工智能技术，为企业提供智能化的解决方案，助力数字化转型
          </p>
          <Button onClick={handleContactUs} className="bg-red-500 hover:bg-red-600">
            联系我们
          </Button>
        </div>

        {/* Company Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <StatsCard title="服务用户" value={companyStats.totalUsers.toLocaleString()} icon={<Users className="w-5 h-5" />} trend="+25%" />
          <StatsCard title="智能代理" value={companyStats.totalAgents.toLocaleString()} icon={<Target className="w-5 h-5" />} trend="+18%" />
          <StatsCard title="工作流" value={companyStats.totalWorkflows.toLocaleString()} icon={<Award className="w-5 h-5" />} trend="+32%" />
          <StatsCard title="行业经验" value={`${companyStats.yearsInBusiness}年`} icon={<Globe className="w-5 h-5" />} trend="稳定" />
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">我们的使命</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">
                通过创新的人工智能技术，为企业提供智能化解决方案，提升效率，创造价值。
                我们相信AI技术能够改变世界，让每个企业都能享受到智能化带来的便利。
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">我们的愿景</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">
                成为全球领先的企业AI解决方案提供商，让AI技术普及到每个企业，
                推动整个社会的数字化转型进程。
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">核心价值观</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">创新</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  持续创新，追求技术突破，为客户提供最先进的AI解决方案。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">品质</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  严格的质量控制，确保每个产品都达到最高标准。
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">服务</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  以客户为中心，提供全方位的技术支持和服务。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">核心团队</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[{
            name: '张三',
            position: 'CEO',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            bio: '10年AI行业经验，前Google工程师'
          }, {
            name: '李四',
            position: 'CTO',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            bio: '8年机器学习研究经验，博士学历'
          }, {
            name: '王五',
            position: '产品总监',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
            bio: '5年产品设计经验，专注用户体验'
          }].map((member, index) => <TeamMemberCard key={index} member={member} />)}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">发展历程</h2>
          <div className="max-w-4xl mx-auto">
            {[{
            year: '2019',
            title: '公司成立',
            description: 'AI太极正式成立，开始AI技术研发'
          }, {
            year: '2020',
            title: '产品发布',
            description: '发布第一代AI代理产品'
          }, {
            year: '2021',
            title: '市场扩张',
            description: '用户突破10万，获得A轮融资'
          }, {
            year: '2022',
            title: '技术突破',
            description: '推出企业级AI解决方案'
          }, {
            year: '2023',
            title: '全球化',
            description: '业务扩展到全球50多个国家'
          }].map((milestone, index) => <div key={index} className="flex items-center mb-8">
                <div className="flex-shrink-0 w-20 text-red-500 font-bold">
                  {milestone.year}
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-red-500 rounded-full mr-4"></div>
                <div className="flex-grow">
                  <h3 className="text-white font-semibold mb-1">{milestone.title}</h3>
                  <p className="text-gray-300">{milestone.description}</p>
                </div>
              </div>)}
          </div>
        </div>

        {/* Contact */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-white mb-8">联系我们</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <Mail className="w-8 h-8 text-red-500 mb-2" />
              <span className="text-gray-300">contact@aitaiji.com</span>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-8 h-8 text-red-500 mb-2" />
              <span className="text-gray-300">400-123-4567</span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-8 h-8 text-red-500 mb-2" />
              <span className="text-gray-300">北京市朝阳区</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
}
export default function AboutPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <AboutContent {...props} />
    </ExperimentProvider>;
}