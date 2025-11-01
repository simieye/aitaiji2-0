// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Mail, MessageSquare, CheckCircle, AlertCircle, Settings, Edit, Trash2, TestTube } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ServiceConfigCard({
  $w,
  service,
  onEdit,
  onDelete,
  onTest
}) {
  const [isTesting, setIsTesting] = useState(false);
  const {
    toast
  } = useToast();
  const getServiceIcon = type => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      default:
        return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">活跃</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 text-white">未激活</Badge>;
      case 'error':
        return <Badge className="bg-red-500 text-white">错误</Badge>;
      default:
        return <Badge className="bg-yellow-500 text-white">未知</Badge>;
    }
  };
  const getStatusIcon = status => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };
  const handleTest = async () => {
    setIsTesting(true);
    try {
      // 模拟测试服务
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "测试成功",
        description: `${service.name} 服务测试通过`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "测试失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getServiceIcon(service.type)}
            <div>
              <CardTitle className="text-white">{service.name}</CardTitle>
              <CardDescription className="text-gray-300">{service.description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(service.status)}
            {getStatusBadge(service.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-gray-400 text-sm">提供商</div>
              <div className="text-white font-medium">{service.provider}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">最后检查</div>
              <div className="text-white font-medium">{new Date(service.lastCheck).toLocaleString('zh-CN')}</div>
            </div>
          </div>
          
          {service.config && <div>
              <div className="text-gray-400 text-sm mb-2">配置信息</div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <div className="text-gray-300 text-sm space-y-1">
                  {Object.entries(service.config).slice(0, 3).map(([key, value]) => <div key={key}>
                      <span className="text-gray-500">{key}:</span> {typeof value === 'string' && value.includes('***') ? value : '***'}
                    </div>)}
                </div>
              </div>
            </div>}
          
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              使用次数: {service.usageCount || 0}
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleTest} disabled={isTesting} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                <TestTube className="w-4 h-4 mr-1" />
                {isTesting ? '测试中...' : '测试'}
              </Button>
              <Button onClick={() => onEdit(service)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                <Edit className="w-4 h-4" />
              </Button>
              <Button onClick={() => onDelete(service)} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}