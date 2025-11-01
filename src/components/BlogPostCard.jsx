// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, User, Tag, ExternalLink } from 'lucide-react';

export function BlogPostCard({
  post,
  onRead,
  layout = 'grid'
}) {
  const getCategoryColor = category => {
    const colors = {
      case_study: 'bg-blue-500',
      whitepaper: 'bg-purple-500',
      tutorial: 'bg-green-500',
      news: 'bg-red-500'
    };
    return colors[category] || 'bg-gray-500';
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  if (layout === 'list') {
    return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3">
            <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-t-lg md:rounded-l-lg md:rounded-r-none" />
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getCategoryColor(post.category)} text-white text-xs`}>
                {post.category === 'case_study' ? '案例研究' : post.category === 'whitepaper' ? '白皮书' : post.category === 'tutorial' ? '教程' : '新闻'}
              </Badge>
              <div className="flex items-center text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {post.readTime} 分钟阅读
              </div>
            </div>
            <CardTitle className="text-white mb-2 line-clamp-2">{post.title}</CardTitle>
            <CardDescription className="text-gray-300 mb-3 line-clamp-3">{post.excerpt}</CardDescription>
            <div className="flex items-center text-sm text-gray-400 mb-3">
              <User className="w-4 h-4 mr-1" />
              <span>{post.author}</span>
              <Calendar className="w-4 h-4 ml-4 mr-1" />
              <span>{formatDate(post.date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {post.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                    {tag}
                  </Badge>)}
              </div>
              <Button onClick={() => onRead(post.id)} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                <ExternalLink className="w-4 h-4 mr-2" />
                阅读全文
              </Button>
            </div>
          </div>
        </div>
      </Card>;
  }
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300 h-full flex flex-col">
      <div className="relative">
        <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-t-lg" />
        <div className="absolute top-2 left-2 flex gap-2">
          <Badge className={`${getCategoryColor(post.category)} text-white text-xs`}>
            {post.category === 'case_study' ? '案例研究' : post.category === 'whitepaper' ? '白皮书' : post.category === 'tutorial' ? '教程' : '新闻'}
          </Badge>
          <Badge variant="secondary" className="bg-black/50 text-white text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {post.readTime} 分钟
          </Badge>
        </div>
      </div>
      <CardHeader className="flex-1">
        <CardTitle className="text-white mb-2 line-clamp-2">{post.title}</CardTitle>
        <CardDescription className="text-gray-300 line-clamp-3">{post.excerpt}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center text-sm text-gray-400 mb-3">
          <User className="w-4 h-4 mr-1" />
          <span>{post.author}</span>
        </div>
        <div className="flex items-center text-sm text-gray-400 mb-3">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{formatDate(post.date)}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {post.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>)}
        </div>
        <Button onClick={() => onRead(post.id)} variant="outline" className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
          <ExternalLink className="w-4 h-4 mr-2" />
          阅读全文
        </Button>
      </CardContent>
    </Card>;
}