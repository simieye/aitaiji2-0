// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, ExternalLink, FileText, BookOpen, Code, Video } from 'lucide-react';

export function ResourceItem({
  resource,
  onDownload,
  onViewExternal,
  featured = false
}) {
  const getTypeIcon = type => {
    switch (type) {
      case '文档':
        return <FileText className="w-5 h-5" />;
      case '教程':
        return <BookOpen className="w-5 h-5" />;
      case 'API文档':
        return <Code className="w-5 h-5" />;
      case '视频':
        return <Video className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };
  return <Card className={`bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300 ${featured ? 'lg:col-span-2' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <div className="text-red-500">
                {resource.icon || getTypeIcon(resource.type)}
              </div>
            </div>
            <div>
              <Badge className="bg-blue-500 text-white text-xs sm:text-sm mb-1">
                {resource.type}
              </Badge>
              {resource.featured && <Badge className="bg-red-500 text-white text-xs sm:text-sm ml-2">
                精选
              </Badge>}
            </div>
          </div>
        </div>
        <CardTitle className={`text-white mb-2 ${featured ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
          {resource.title}
        </CardTitle>
        <CardDescription className={`text-gray-300 ${featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
          {resource.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-gray-400 text-xs sm:text-sm mb-4">
          <div className="flex items-center space-x-4">
            <span>{resource.category}</span>
            <span>{resource.size}</span>
            <span>{resource.format}</span>
          </div>
        </div>
        
        {resource.tags && resource.tags.length > 0 && <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
            {resource.tags.map((tag, index) => <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                {tag}
              </span>)}
          </div>}
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={() => onDownload(resource)} className="flex-1 bg-red-500 hover:bg-red-600 text-sm sm:text-base">
            <Download className="w-4 h-4 mr-2" />
            下载
          </Button>
          {resource.externalUrl && <Button onClick={() => onViewExternal(resource)} variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-700 text-sm sm:text-base">
              <ExternalLink className="w-4 h-4 mr-2" />
            查看
          </Button>}
        </div>
      </CardContent>
    </Card>;
}