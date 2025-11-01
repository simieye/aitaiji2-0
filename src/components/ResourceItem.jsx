// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, Eye, Calendar, User, Tag, FileText } from 'lucide-react';

export function ResourceItem({
  resource,
  type,
  onDownload,
  onView
}) {
  const getIcon = () => {
    switch (type) {
      case 'case':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'whitepaper':
        return <FileText className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };
  const getTypeLabel = () => {
    switch (type) {
      case 'case':
        return '案例研究';
      case 'whitepaper':
        return '技术白皮书';
      case 'guide':
        return '最佳实践';
      default:
        return '资源';
    }
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getIcon()}
              <Badge className={`${type === 'case' ? 'bg-blue-500' : type === 'whitepaper' ? 'bg-purple-500' : 'bg-gray-500'} text-white`}>
                {getTypeLabel()}
              </Badge>
            </div>
            <CardTitle className="text-white text-lg mb-2">
              {resource.title || resource.name}
            </CardTitle>
            <CardDescription className="text-gray-300 text-sm">
              {resource.description || resource.summary}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(resource.createdAt)}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {resource.author || 'AI太极团队'}
            </div>
            {resource.category && <div className="flex items-center">
                <Tag className="w-4 h-4 mr-1" />
                <Badge variant="outline" className="border-gray-600 text-gray-400">
                  {resource.category}
                </Badge>
              </div>}
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => onDownload(resource)} className="flex-1 bg-red-500 hover:bg-red-600" size="sm">
              <Download className="w-4 h-4 mr-2" />
              下载
            </Button>
            <Button onClick={() => onView(resource)} variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-700" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              预览
            </Button>
          </div>

          {resource.downloadCount && <div className="text-xs text-gray-400">
              下载次数: {resource.downloadCount}
            </div>}
        </div>
      </CardContent>
    </Card>;
}