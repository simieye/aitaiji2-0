// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Building2, Globe, Award, Users } from 'lucide-react';

export function Partners() {
  const partners = [{
    category: '战略合作伙伴',
    icon: <Building2 className="w-6 h-6" />,
    companies: [{
      name: '腾讯云',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: '阿里云',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: '华为云',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: '百度智能云',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }]
  }, {
    category: '技术合作伙伴',
    icon: <Globe className="w-6 h-6" />,
    companies: [{
      name: 'OpenAI',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: 'Google AI',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: 'Microsoft Azure',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: 'AWS',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }]
  }, {
    category: '行业合作伙伴',
    icon: <Award className="w-6 h-6" />,
    companies: [{
      name: '中国银行',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: '中国移动',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: '国家电网',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: '中石油',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }]
  }, {
    category: '生态合作伙伴',
    icon: <Users className="w-6 h-6" />,
    companies: [{
      name: '清华大学',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: '北京大学',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: '中科院',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }, {
      name: '斯坦福大学',
      logo: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=120&h=60&fit=crop'
    }]
  }];
  return <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">合作伙伴</h2>
        <p className="text-gray-300">携手共建AI生态，共创美好未来</p>
      </div>

      {/* Partner Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500 mb-2">100+</div>
          <div className="text-gray-400">合作伙伴</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-500 mb-2">20+</div>
          <div className="text-gray-400">行业覆盖</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-500 mb-2">50+</div>
          <div className="text-gray-400">联合项目</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-500 mb-2">10+</div>
          <div className="text-gray-400">战略合作</div>
        </div>
      </div>

      {/* Partner Categories */}
      {partners.map((category, index) => <div key={index} className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="text-red-500">
              {category.icon}
            </div>
            <h3 className="text-xl font-bold text-white">{category.category}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {category.companies.map((company, companyIndex) => <Card key={companyIndex} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-center">
                    <img src={company.logo} alt={company.name} className="w-full h-12 object-contain mb-3" />
                    <div className="text-white font-medium">{company.name}</div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>)}

      {/* Partnership Benefits */}
      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-center">合作优势</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500 mb-2">技术领先</div>
              <p className="text-gray-300 text-sm">与全球领先的技术公司合作，确保技术先进性</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500 mb-2">资源共享</div>
              <p className="text-gray-300 text-sm">共享合作伙伴资源，为客户提供更全面的服务</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500 mb-2">生态共建</div>
              <p className="text-gray-300 text-sm">共同建设AI生态系统，推动行业发展</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500 mb-2">互利共赢</div>
              <p className="text-gray-300 text-sm">建立长期合作关系，实现互利共赢</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
}