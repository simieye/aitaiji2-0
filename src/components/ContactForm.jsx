// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ContactForm({
  $w
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: ''
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
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "信息不完整",
        description: "请填写必要的信息",
        variant: "destructive"
      });
      return;
    }
    try {
      setLoading(true);
      // 记录联系表单提交
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'contact_form_submit',
            event_category: 'engagement',
            event_label: 'about_page',
            timestamp: new Date(),
            metadata: formData
          }
        }
      }));
      setSubmitted(true);
      toast({
        title: "提交成功",
        description: "我们会尽快与您联系",
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
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">提交成功</h3>
          <p className="text-gray-300 mb-6">感谢您的联系，我们会在24小时内回复您</p>
          <Button onClick={() => setSubmitted(false)} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            提交新消息
          </Button>
        </CardContent>
      </Card>;
  }
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">联系我们</CardTitle>
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
              <label className="block text-gray-300 text-sm font-medium mb-2">电话</label>
              <input type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" placeholder="请输入您的电话" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">公司</label>
              <input type="text" value={formData.company} onChange={e => handleInputChange('company', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" placeholder="请输入您的公司名称" />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">主题</label>
            <input type="text" value={formData.subject} onChange={e => handleInputChange('subject', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" placeholder="请输入咨询主题" />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">留言 *</label>
            <textarea value={formData.message} onChange={e => handleInputChange('message', e.target.value)} rows={4} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" placeholder="请输入您的留言内容" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-red-500 hover:bg-red-600">
            {loading ? '提交中...' : '发送消息'}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </CardContent>
    </Card>;
}