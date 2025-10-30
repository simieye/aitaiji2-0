// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Star, ThumbsUp, MessageSquare, Filter } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function UserReviews({
  $w,
  productId
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  useEffect(() => {
    loadReviews();
  }, [productId, filter, sortBy]);
  const loadReviews = async () => {
    try {
      setLoading(true);
      // 模拟用户评价数据
      const mockReviews = [{
        _id: '1',
        userId: 'user1',
        userName: '张三',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        title: '非常满意的产品体验',
        content: '这个产品完全超出了我的预期，功能强大且易于使用。客服团队也非常专业，解决问题很及时。',
        pros: ['功能丰富', '界面友好', '响应迅速'],
        cons: ['学习曲线稍陡'],
        helpful: 23,
        createdAt: new Date('2024-01-15')
      }, {
        _id: '2',
        userId: 'user2',
        userName: '李四',
        userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
        rating: 4,
        title: '性价比很高',
        content: '整体来说很不错，功能满足了我的需求。价格也比较合理，推荐给有需要的朋友。',
        pros: ['性价比高', '功能实用'],
        cons: ['某些功能需要优化'],
        helpful: 15,
        createdAt: new Date('2024-01-10')
      }, {
        _id: '3',
        userId: 'user3',
        userName: '王五',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        rating: 5,
        title: '企业级解决方案',
        content: '作为企业用户，我们对这个产品非常满意。安全性、稳定性都很好，技术支持也很到位。',
        pros: ['企业级安全', '稳定可靠', '技术支持好'],
        cons: [],
        helpful: 18,
        createdAt: new Date('2024-01-05')
      }];
      setReviews(mockReviews);
      setLoading(false);
    } catch (error) {
      console.error('加载评价失败:', error);
      setLoading(false);
    }
  };
  const handleHelpful = async reviewId => {
    try {
      // 记录有用评价
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'review_helpful',
            event_category: 'engagement',
            event_label: reviewId,
            timestamp: new Date()
          }
        }
      }));
      setReviews(reviews.map(review => review._id === reviewId ? {
        ...review,
        helpful: review.helpful + 1
      } : review));
    } catch (error) {
      console.error('记录有用评价失败:', error);
    }
  };
  const renderStars = rating => {
    return Array.from({
      length: 5
    }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} />);
  };
  const getFilteredReviews = () => {
    let filtered = reviews;
    if (filter !== 'all') {
      filtered = filtered.filter(review => {
        if (filter === '5star') return review.rating === 5;
        if (filter === '4star') return review.rating === 4;
        if (filter === '3star') return review.rating <= 3;
        return true;
      });
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'helpful') return b.helpful - a.helpful;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  };
  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };
  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution;
  };
  if (loading) {
    return <div className="space-y-6">
        {[1, 2, 3].map(i => <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-4"></div>
            <div className="h-3 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>)}
      </div>;
  }
  return <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">用户评价</h2>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="text-4xl font-bold text-white">{getAverageRating()}</div>
          <div>
            <div className="flex">{renderStars(Math.round(getAverageRating()))}</div>
            <div className="text-gray-400 text-sm">基于 {reviews.length} 条评价</div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="grid md:grid-cols-5 gap-4">
        {[5, 4, 3, 2, 1].map(rating => {
        const count = getRatingDistribution()[rating - 1];
        const percentage = reviews.length > 0 ? count / reviews.length * 100 : 0;
        return <div key={rating} className="text-center">
              <div className="text-white font-medium">{rating}星</div>
              <div className="text-gray-400 text-sm">{count}条</div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{
              width: `${percentage}%`
            }} />
              </div>
            </div>;
      })}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button onClick={() => setFilter('all')} variant={filter === 'all' ? 'default' : 'outline'} className={`${filter === 'all' ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
            全部
          </Button>
          <Button onClick={() => setFilter('5star')} variant={filter === '5star' ? 'default' : 'outline'} className={`${filter === '5star' ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
            5星
          </Button>
          <Button onClick={() => setFilter('4star')} variant={filter === '4star' ? 'default' : 'outline'} className={`${filter === '4star' ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
            4星
          </Button>
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-1">
          <option value="newest">最新</option>
          <option value="helpful">最有用</option>
          <option value="rating">评分最高</option>
        </select>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        {getFilteredReviews().map(review => <Card key={review._id} className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img src={review.userAvatar} alt={review.userName} className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="text-white font-medium">{review.userName}</div>
                    <div className="flex">{renderStars(review.rating)}</div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  {review.createdAt.toLocaleDateString('zh-CN')}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-2">{review.title}</h4>
                  <p className="text-gray-300">{review.content}</p>
                </div>
                {review.pros.length > 0 && <div>
                    <div className="text-green-500 text-sm font-medium mb-1">优点:</div>
                    <div className="flex flex-wrap gap-2">
                      {review.pros.map((pro, index) => <Badge key={index} className="bg-green-500/20 text-green-400 border-green-500/50">
                          {pro}
                        </Badge>)}
                    </div>
                  </div>}
                {review.cons.length > 0 && <div>
                    <div className="text-red-500 text-sm font-medium mb-1">缺点:</div>
                    <div className="flex flex-wrap gap-2">
                      {review.cons.map((con, index) => <Badge key={index} className="bg-red-500/20 text-red-400 border-red-500/50">
                          {con}
                        </Badge>)}
                    </div>
                  </div>}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <Button onClick={() => handleHelpful(review._id)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    有用 ({review.helpful})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}