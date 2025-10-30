// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, FileText, Code, BookOpen } from 'lucide-react';

export function ResourceCard({
  resource,
  onDownload
}) {
  const getIcon = format => {
    const iconMap = {
      'PDF': <FileText className="w-6 h-6" />,
      'HTML/PDF': <Code className="w-6 h-6" />,
      'ZIP': <Download className="w-6 h-6" />,
      'DOC': <BookOpen className="w-6 h-6" />
    };
    return iconMap[format] || <FileText className="w-6 h-6" />;
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-gray-500 transition-all duration-300 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 p-3 mr-4">
              {getIcon(resource.format)}
            </div>
            <div>
              <CardTitle className="text-white text-xl">{resource.title}</CardTitle>
              <Badge variant="secondary" className="bg-red-500/20 text-red-400 mt-1">
                {resource.format}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <CardDescription className="text-gray-300 mb-4 flex-1">
          {resource.description}
        </CardDescription>
        
        <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
          <span>{resource.size}</span>
          <span>{resource.downloads} 次下载</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">{resource.date}</span>
          <Button size="sm" className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" onClick={() => onDownload(resource)}>
            <Download className="w-4 h-4 mr-1" />
            下载
          </Button>
        </div>
      </CardContent>
    </Card>;
}