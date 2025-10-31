// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Users, Target, Lightbulb, Award, MapPin, Mail, Phone, Globe, ArrowRight, Star } from 'lucide-react';

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
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function AboutContent(props) {
  const {
    $w,
    style
  } = props;
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();

  // 获取实验变体
  const aboutExperiment = useExperiment('about_layout');
  const teamExperiment = useExperiment('team_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadTeamMembers, 30000);
  useEffect(() => {
    loadTeamMembers();
  }, []);
  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      // 模拟团队成员数据
      const mockTeamMembers = [{
        _id: '1',
        name: '张三',
        position: 'CEO & 创始人',
        bio: '拥有10年AI领域经验，致力于推动企业数字化转型',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500',
        email: 'zhangsan@aitaiji.com',
        linkedin: '#',
        twitter: '#'
      }, {
        _id: '2',
        name: '李四',
        position: 'CTO & 联合创始人',
        bio: '资深技术专家，专注于机器学习和深度学习研究',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
        email: 'lisi@aitaiji.com',
        linkedin: '#',
        twitter: '#'
      }, {
        _id: '3',
        name: '王五',
        position: '产品总监',
        bio: '负责产品战略规划，确保产品满足客户需求',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c1ca?w=500',
        email: 'wangwu@aitaiji.com',
        linkedin: '#',
        twitter: '#'
      }, {
        _id: '4',
        name: '赵六',
        position: '技术总监',
        bio: '领导技术团队，确保技术架构的稳定性和可扩展性',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
        email: 'zhaoliu@aitaiji.com',
        linkedin: '#',
        twitter: '#'
      }];
      setTeamMembers(mockTeamMembers);
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
  const values = [{
    icon: <Target className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: '使命',
    description: '通过AI技术赋能企业，推动数字化转型，创造更大价值'
  }, {
    icon: <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: '愿景',
    description: '成为全球领先的AI解决方案提供商，让AI触手可及'
  }, {
    icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />,
    title: '价值观',
    description: '创新、专业、诚信、合作，以客户为中心持续创造价值'
  }];
  const stats = [{
    number: '500+',
    label: '服务企业'
  }, {
    number: '98%',
    label: '客户满意度'
  }, {
    number: '50+',
    label: '技术专家'
  }, {
    number: '24/7',
    label: '技术支持'
  }];
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4 text-sm sm:text-base">{t('common.loading')}</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            {t('about.title', '关于我们')}
            <span className="text-red-500 block mt-2">{t('about.subtitle', '公司介绍')}</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            {t('about.description', '了解AI太极的故事和使命')}
          </p>
        </div>

        {/* Company Story */}
        <div className="mb-12 sm:mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">我们的故事</h2>
              <p className="text-gray-300 text-sm sm:text-base mb-4">
                AI太极成立于2020年，由一群热爱AI技术的专家创立。我们深知企业在数字化转型过程中面临的挑战，
                致力于通过先进的AI技术为企业提供智能化解决方案。
              </p>
              <p className="text-gray-300 text-sm sm:text-base mb-4">
                经过多年的发展，我们已经服务了超过500家企业，涵盖了制造业、金融、零售、教育等多个行业。
                我们的解决方案帮助企业提升了效率，降低了成本，实现了可持续发展。
              </p>
              <p className="text-gray-300 text-sm sm:text-base">
                展望未来，我们将继续深耕AI技术，不断创新，为更多企业带来价值，
                推动整个社会的数字化进程。
              </p>
            </div>
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-red-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Star className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">AI太极</h3>
                  <p className="text-sm sm:text-base">智能化解决方案提供商</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">使命愿景价值观</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {values.map((value, index) => <Card key={index} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-red-500">
                      {value.icon}
                    </div>
                  </div>
                  <CardTitle className="text-white text-lg sm:text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300 text-sm sm:text-base text-center">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>)}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-12 sm:mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, index) => <StatsCard key={index} number={stat.number} label={stat.label} />)}
          </div>
        </div>

        {/* Team */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 sm:mb-12">核心团队</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {teamMembers.map(member => <TeamMemberCard key={member._id} member={member} />)}
          </div>
        </div>

        {/* Contact */}
        <div className="mb-12 sm:mb-16">
          <div className="bg-gradient-to-r from-red-500 to-blue-500 rounded-2xl p-8 sm:p-12">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">联系我们</h2>
              <p className="text-gray-100 text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
                有任何问题或合作意向？我们很乐意与您交流
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8">
                <div className="flex items-center justify-center space-x-3 text-white">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">contact@aitaiji.com</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-white">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">400-123-4567</span>
                </div>
                <div className="flex items-center justify-center space-x-3 text-white">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-sm sm:text-base">北京市朝阳区</span>
                </div>
              </div>
              <Button className="bg-white text-red-500 hover:bg-gray-100 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
                立即联系
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">准备开始您的AI之旅？</h2>
          <p className="text-gray-300 text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
            立即体验AI太极的强大功能，让AI为您的业务赋能
          </p>
          <Button className="bg-red-500 hover:bg-red-600 text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg">
            开始使用
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>;
}
export default function AboutPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <AboutContent {...props} />
    </ExperimentProvider>;
}