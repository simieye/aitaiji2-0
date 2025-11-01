// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Mail, MessageSquare, Save, X } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ServiceConfigForm({
  $w,
  service,
  onSave,
  onCancel
}) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    type: service?.type || 'email',
    provider: service?.provider || '',
    description: service?.description || '',
    config: service?.config || {}
  });
  const [isSaving, setIsSaving] = useState(false);
  const {
    toast
  } = useToast();
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleConfigChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };
  const handleSave = async () => {
    if (!formData.name || !formData.provider) {
      toast({
        title: "信息不完整",
        description: "请填写服务名称和提供商",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData);
      toast({
        title: "保存成功",
        description: "服务配置已保存",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const renderConfigFields = () => {
    switch (formData.type) {
      case 'email':
        return <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300">SMTP服务器</label>
              <Input value={formData.config.smtpHost || ''} onChange={e => handleConfigChange('smtpHost', e.target.value)} placeholder="smtp.example.com" className="bg-gray-800 border-gray-600 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-300">端口</label>
              <Input value={formData.config.smtpPort || ''} onChange={e => handleConfigChange('smtpPort', e.target.value)} placeholder="587" className="bg-gray-800 border-gray-600 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-300">用户名</label>
              <Input value={formData.config.username || ''} onChange={e => handleConfigChange('username', e.target.value)} placeholder="user@example.com" className="bg-gray-800 border-gray-600 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-300">密码</label>
              <Input type="password" value={formData.config.password || ''} onChange={e => handleConfigChange('password', e.target.value)} placeholder="••••••••" className="bg-gray-800 border-gray-600 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-300">发件人邮箱</label>
              <Input value={formData.config.fromEmail || ''} onChange={e => handleConfigChange('fromEmail', e.target.value)} placeholder="noreply@example.com" className="bg-gray-800 border-gray-600 text-white" />
            </div>
          </div>;
      case 'sms':
        return <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300">API Key</label>
              <Input value={formData.config.apiKey || ''} onChange={e => handleConfigChange('apiKey', e.target.value)} placeholder="your-api-key" className="bg-gray-800 border-gray-600 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-300">API Secret</label>
              <Input type="password" value={formData.config.apiSecret || ''} onChange={e => handleConfigChange('apiSecret', e.target.value)} placeholder="your-api-secret" className="bg-gray-800 border-gray-600 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-300">API端点</label>
              <Input value={formData.config.apiEndpoint || ''} onChange={e => handleConfigChange('apiEndpoint', e.target.value)} placeholder="https://api.sms-provider.com" className="bg-gray-800 border-gray-600 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-300">签名</label>
              <Input value={formData.config.signature || ''} onChange={e => handleConfigChange('signature', e.target.value)} placeholder="【公司名】" className="bg-gray-800 border-gray-600 text-white" />
            </div>
          </div>;
      default:
        return <div className="text-gray-400">请选择服务类型</div>;
    }
  };
  return <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-white">
            {service ? '编辑服务配置' : '新增服务配置'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            配置第三方服务参数
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">服务名称</label>
              <Input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="输入服务名称" className="bg-gray-800 border-gray-600 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-300">服务类型</label>
              <select value={formData.type} onChange={e => handleInputChange('type', e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                <option value="email">邮件服务</option>
                <option value="sms">短信服务</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-300">提供商</label>
            <Input value={formData.provider} onChange={e => handleInputChange('provider', e.target.value)} placeholder="如：阿里云、腾讯云等" className="bg-gray-800 border-gray-600 text-white" />
          </div>
          
          <div>
            <label className="text-sm text-gray-300">描述</label>
            <textarea value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="服务描述" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400" rows={3} />
          </div>
          
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {formData.type === 'email' ? <Mail className="w-5 h-5 text-blue-500" /> : <MessageSquare className="w-5 h-5 text-green-500" />}
              <h3 className="text-white font-medium">配置参数</h3>
            </div>
            {renderConfigFields()}
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-red-500 hover:bg-red-600">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '保存中...' : '保存'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-700">
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}