// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Send, CheckCircle } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function TrialApplication({
  $w,
  productId
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    industry: '',
    useCase: '',
    teamSize: '',
    trialPeriod: '14'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {
    toast
  } = useToast();
  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company) {
      toast({
        title: "信息不完整",
        description: "请填写必要的信息",
        variant: "destructive"
      });
      return;
    }
    try {
      setLoading(true);
      // 提交试用申请
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'trial_application',
            event_category: 'conversion',
            event_label: productId,
            value: 0,
            timestamp: new Date(),
            metadata: formData
          }
        }
      }));
      setSubmitted(true);
      toast({
        title: "申请提交成功",
        description: "我们将在24小时内与您联系",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "提交失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  if (submitted) {
    return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">申请已提交</h3>
          <p className="text-gray-300 mb-6">感谢您的关注，我们将在24小时内与您联系</p>
          <Button onClick={() => setSubmitted(false)} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            提交新申请
          </Button>
        </CardContent>
      </Card>;
  }
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">申请试用</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">姓名 *</label>
              <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" placeholder="请输入您的姓名" required />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">邮箱 *</label>
              <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" placeholder="请输入您的邮箱" required />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">公司名称 *</label>
              <input type="text" value={formData.company} onChange={e => handleInputChange('company', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" placeholder="请输入公司名称" required />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">联系电话</label>
              <input type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" placeholder="请输入联系电话" />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">行业</label>
              <select value={formData.industry} onChange={e => handleInputChange('industry', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
                <option value="">请选择行业</option>
                <option value="technology">科技</option>
                <option value="finance">金融</option>
                <option value="healthcare">医疗</option>
                <option value="education">教育</option>
                <option value="retail">零售</option>
                <option value="manufacturing">制造业</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">团队规模</label>
              <select value={formData.teamSize} onChange={e => handleInputChange('teamSize', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
                <option value="">请选择团队规模</option>
                <option value="1-10">1-10人</option>
                <option value="11-50">11-50人</option>
                <option value="51-200">51-200人</option>
                <option value="201-500">201-500人</option>
                <option value="500+">500人以上</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">试用期限</label>
            <select value={formData.trialPeriod} onChange={e => handleInputChange('trialPeriod', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
              <option value="7">7天</option>
              <option value="14">14天</option>
              <option value="30">30天</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">使用场景</label>
            <textarea value={formData.useCase} onChange={e => handleInputChange('useCase', e.target.value)} rows={4} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" placeholder="请描述您的使用场景和需求"></textarea>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-red-500 hover:bg-red-600">
            {loading ? '提交中...' : '提交申请'}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>;
}