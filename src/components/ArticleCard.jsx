// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Heart, MessageCircle, Eye, Clock, Share2, Bookmark } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ArticleCard({
  article,
  $w,
  userId,
  onLike,
  onComment,
  onShare,
  onBookmark
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likes || 0);
  const handleLike = async () => {
    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

      // 记录点赞事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            event: 'article_like',
            event_category: 'engagement',
            event_label: article._id,
            timestamp: new Date(),
            metadata: {
              articleTitle: article.name,
              action: newLikedState ? 'like' : 'unlike'
            }
          }
        }
      }));
      if (onLike) {
        onLike(article._id, newLikedState);
      }
    } catch (error) {
      console.error('点赞失败:', error);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    }
  };
  const handleBookmark = async () => {
    try {
      const newBookmarkedState = !isBookmarked;
      setIsBookmarked(newBookmarkedState);

      // 记录收藏事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            event: 'article_bookmark',
            event_category: 'engagement',
            event_label: article._id,
            timestamp: new Date(),
            metadata: {
              articleTitle: article.name,
              action: newBookmarkedState ? 'bookmark' : 'unbookmark'
            }
          }
        }
      }));
      if (onBookmark) {
        onBookmark(article._id, newBookmarkedState);
      }
    } catch (error) {
      console.error('收藏失败:', error);
      setIsBookmarked(!isBookmarked);
    }
  };
  const formatDate = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000) return '今天';
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    if (diff < 2592000000) return `${Math.floor(diff / 604800000)}周前`;
    return date.toLocaleDateString('zh-CN');
  };
  const getReadingTime = content => {
    const wordsPerMinute = 200;
    const wordCount = (content || '').length;
    return Math.ceil(wordCount / wordsPerMinute);
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {article.category && <Badge className="bg-blue-500 text-white text-xs">
                  {article.category}
                </Badge>}
              {article.featured && <Badge className="bg-red-500 text-white text-xs">
                  精选
                </Badge>}
            </div>
            <CardTitle className="text-white text-lg mb-2 line-clamp-2">
              {article.name}
            </CardTitle>
            <p className="text-gray-300 text-sm line-clamp-3">
              {article.summary}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tags */}
          {article.tags && article.tags.length > 0 && <div className="flex flex-wrap gap-2">
              {article.tags.slice(0, 3).map((tag, index) => <span key={index} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                  {tag}
                </span>)}
              {article.tags.length > 3 && <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded">
                  +{article.tags.length - 3}
                </span>}
            </div>}
          
          {/* Article Meta */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatDate(article.createdAt)}
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {article.viewCount || 0}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {getReadingTime(article.content)}分钟阅读
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-4">
              <Button onClick={handleLike} variant="ghost" size="sm" className={`text-gray-400 hover:text-white ${isLiked ? 'text-red-500' : ''}`}>
                <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {likeCount}
              </Button>
              <Button onClick={() => onComment && onComment(article._id)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <MessageCircle className="w-4 h-4 mr-1" />
                {article.comments || 0}
              </Button>
              <Button onClick={() => onShare && onShare(article)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={handleBookmark} variant="ghost" size="sm" className={`text-gray-400 hover:text-white ${isBookmarked ? 'text-yellow-500' : ''}`}>
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>;
}