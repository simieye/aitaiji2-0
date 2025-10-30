// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, Star, Eye, MessageCircle, Calendar, FileText, Tool } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ResourceCard({
  resource,
  $w,
  userId,
  onDownload,
  onRate,
  onComment
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [downloadCount, setDownloadCount] = useState(resource.downloadCount || 0);
  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // 记录下载事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            event: 'resource_download',
            event_category: 'engagement',
            event_label: resource._id,
            timestamp: new Date(),
            metadata: {
              resourceTitle: resource.name,
              resourceType: resource.type
            }
          }
        }
      }));

      // 更新下载次数
      setDownloadCount(prev => prev + 1);
      setIsDownloading(false);

      // 模拟下载
      const link = document.createElement('a');
      link.href = '#';
      link.download = resource.name || 'resource';
      link.click();
      if (onDownload) {
        onDownload(resource._id);
      }
    } catch (error) {
      console.error('下载失败:', error);
      setIsDownloading(false);
    }
  };
  const handleRating = async rating => {
    try {
      setUserRating(rating);

      // 记录评分事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            event: 'resource_rating',
            event_category: 'engagement',
            event_label: resource._id,
            value: rating,
            timestamp: new Date(),
            metadata: {
              resourceTitle: resource.name
            }
          }
        }
      }));
      if (onRate) {
        onRate(resource._id, rating);
      }
    } catch (error) {
      console.error('评分失败:', error);
    }
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };
  const getFileIcon = type => {
    switch (type) {
      case 'whitepaper':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'tool':
        return <Tool className="w-5 h-5 text-blue-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };
  const getTypeLabel = type => {
    switch (type) {
      case 'whitepaper':
        return '白皮书';
      case 'tool':
        return '工具';
      default:
        return '资源';
    }
  };
  const renderStars = rating => {
    return Array.from({
      length: 5
    }, (_, i) => <button key={i} onClick={() => handleRating(i + 1)} className="text-gray-400 hover:text-yellow-500 transition-colors">
        <Star className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : ''}`} />
      </button>);
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getFileIcon(resource.type)}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={`${resource.type === 'whitepaper' ? 'bg-purple-500' : 'bg-blue-500'} text-white text-xs`}>
                  {getTypeLabel(resource.type)}
                </Badge>
                {resource.category && <Badge className="bg-green-500 text-white text-xs">
                    {resource.category}
                  </Badge>}
                {resource.featured && <Badge className="bg-red-500 text-white text-xs">
                    精选
                  </Badge>}
              </div>
              <CardTitle className="text-white text-lg mb-2">{resource.name || resource.title}</CardTitle>
              <p className="text-gray-300 text-sm line-clamp-2">{resource.summary || resource.description}</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && <div className="flex flex-wrap gap-2">
              {resource.tags.slice(0, 3).map((tag, index) => <span key={index} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                  {tag}
                </span>)}
              {resource.tags.length > 3 && <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                  +{resource.tags.length - 3}
                </span>}
            </div>}
          
          {/* Resource Meta */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(resource.createdAt)}
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {resource.viewCount || 0}
              </div>
              <div className="flex items-center">
                <Download className="w-4 h-4 mr-1" />
                {downloadCount}
              </div>
            </div>
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-1 text-yellow-500" />
              <span>{(resource.rating || 0).toFixed(1)}</span>
            </div>
          </div>
          
          {/* Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">评分:</span>
              <div className="flex">
                {renderStars(userRating || resource.rating || 0)}
              </div>
            </div>
            <span className="text-gray-400 text-xs">
              {resource.ratingCount || 0} 人评价
            </span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button onClick={handleDownload} disabled={isDownloading} className="flex-1 bg-red-500 hover:bg-red-600">
              {isDownloading ? '下载中...' : '下载'}
              <Download className="w-4 h-4 ml-2" />
            </Button>
            <Button onClick={() => onComment && onComment(resource._id)} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}