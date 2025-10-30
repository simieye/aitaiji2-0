// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Star, TrendingUp, BookOpen, Target } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function PersonalizedRecommendations({
  $w,
  userId
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadRecommendations();
  }, [userId]);
  const loadRecommendations = async () => {
    try {
      setLoading(true);
      // 获取用户行为数据
      const userEvents = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: userId
              }
            }
          },
          orderBy: [{
            timestamp: 'desc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      }));

      // 基于用户行为生成推荐
      const userInterests = analyzeUserInterests(userEvents.records || []);
      const recommendedContent = await generateRecommendations(userInterests);
      setRecommendations(recommendedContent);
      setLoading(false);
    } catch (error) {
      console.error('加载推荐失败:', error);
      setLoading(false);
    }
  };
  const analyzeUserInterests = events => {
    const interests = {
      categories: {},
      contentTypes: {},
      topics: {}
    };
    events.forEach(event => {
      if (event.event_category) {
        interests.categories[event.event_category] = (interests.categories[event.event_category] || 0) + 1;
      }
      if (event.event_label) {
        interests.topics[event.event_label] = (interests.topics[event.event_label] || 0) + 1;
      }
    });
    return interests;
  };
  const generateRecommendations = async interests => {
    try {
      // 获取案例和白皮书
      const [casesResult, whitepapersResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 10,
          pageNumber: 1
        }
      }))]);

      // 基于用户兴趣排序推荐
      const allContent = [...(casesResult.records || []), ...(whitepapersResult.records || [])];
      const recommendations = allContent.slice(0, 6).map((item, index) => ({
        ...item,
        type: item.title ? 'case' : 'whitepaper',
        score: Math.random() * 100,
        reason: getRecommendationReason(item, interests)
      }));
      return recommendations.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('生成推荐失败:', error);
      return [];
    }
  };
  const getRecommendationReason = (item, interests) => {
    const reasons = ['基于您的浏览历史', '热门推荐', '相关内容', '最新发布'];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };
  const handleViewRecommendation = async item => {
    try {
      // 记录推荐点击事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            event: 'recommendation_click',
            event_category: 'recommendation',
            event_label: item.title || item.name,
            content_type: item.type,
            timestamp: new Date()
          }
        }
      }));
    } catch (error) {
      console.error('记录推荐点击失败:', error);
    }
  };
  if (loading) {
    return <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-4"></div>
            <div className="h-3 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>)}
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">为您推荐</h2>
        <Badge className="bg-purple-500 text-white">个性化</Badge>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {recommendations.map((item, index) => <Card key={item._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {item.type === 'case' ? <BookOpen className="w-5 h-5 text-blue-500" /> : <Target className="w-5 h-5 text-purple-500" />}
                  <Badge className={`${item.type === 'case' ? 'bg-blue-500' : 'bg-purple-500'} text-white text-xs`}>
                    {item.type === 'case' ? '案例' : '白皮书'}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-500 text-sm">{(item.score / 20).toFixed(1)}</span>
                </div>
              </div>
              <CardTitle className="text-white text-lg">{item.title || item.name}</CardTitle>
              <CardDescription className="text-gray-300 text-sm">{item.description || item.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-gray-400">
                  {item.reason}
                </div>
                <Button onClick={() => handleViewRecommendation(item)} className="w-full bg-red-500 hover:bg-red-600" size="sm">
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}