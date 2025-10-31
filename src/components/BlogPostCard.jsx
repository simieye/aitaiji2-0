// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

export function BlogPostCard({
  post,
  onRead,
  featured = false
}) {
  return <Card className={`bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300 ${featured ? 'lg:col-span-2' : ''}`}>
      <CardHeader>
        {post.image && <div className={`aspect-video rounded-lg overflow-hidden mb-4 ${featured ? 'h-48 sm:h-64' : 'h-32 sm:h-40'}`}>
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>}
        <div className="flex items-start justify-between mb-2">
          <Badge className="bg-blue-500 text-white text-xs sm:text-sm">
            {post.category}
          </Badge>
          {post.featured && <Badge className="bg-red-500 text-white text-xs sm:text-sm">
            精选
          </Badge>}
        </div>
        <CardTitle className={`text-white mb-2 ${featured ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'}`}>
          {post.title}
        </CardTitle>
        <CardDescription className={`text-gray-300 ${featured ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
          {post.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-gray-400 text-xs sm:text-sm mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{post.publishDate.toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{post.readTime}</span>
          </div>
        </div>
        
        {post.tags && post.tags.length > 0 && <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
            {post.tags.map((tag, index) => <span key={index} className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs">
                {tag}
              </span>)}
          </div>}
        
        <Button onClick={() => onRead(post)} className="w-full bg-red-500 hover:bg-red-600 text-sm sm:text-base">
          阅读全文
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>;
}