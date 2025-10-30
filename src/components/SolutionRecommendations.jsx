// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, CardDescription } from '@/components/ui';
// @ts-ignore;
import { Target, TrendingUp, BookOpen, Star } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function SolutionRecommendations({
  $w,
  userId,
  solutions
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadRecommendations();
  }, [userId, solutions]);
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

      // 基于用户行为和解决方案特征生成推荐
      const userInterests = analyzeUserInterests(userEvents.records || []);
      const recommendedSolutions = generateRecommendations(solutions, userInterests);
      setRecommendations(recommendedSolutions);
      setLoading(false);
    } catch (error) {
      console.error('加载推荐失败:', error);
      setLoading(false);
    }
  };
  const analyzeUserInterests = events => {
    const interests = {
      industries: {},
      difficulties: {},
      tags: {},
      viewCount: {}
    };
    events.forEach(event => {
      if (event.event_category === 'engagement') {
        if (event.metadata?.industry) {
          interests.industries[event.metadata.industry] = (interests.industries[event.metadata.industry] || 0) + 1;
        }
        if (event.metadata?.difficulty) {
          interests.difficulties[event.metadata.difficulty] = (interests.difficulties[event.metadata.difficulty] || 0) + 1;
        }
        if (event.metadata?.tags) {
          event.metadata.tags.forEach(tag => {
            interests.tags[tag] = (interests.tags[tag] || 0) + 1;
          });
        }
        if (event.event_label) {
          interests.viewCount[event.event_label] = (interests.viewCount[event.event_label] || 0) + 1;
        }
      }
    });
    return interests;
  };
  const generateRecommendations = (allSolutions, userInterests) => {
    if (!allSolutions || allSolutions.length === 0) return [];

    // 计算每个解决方案的推荐分数
    const scoredSolutions = allSolutions.map(solution => {
      let score = Math.random() * 50; // 基础分数

      // 基于用户兴趣调整分数
      if (solution.industry && userInterests.industries[solution.industry]) {
        score += userInterests.industries[solution.industry] * 10;
      }
      if (solution.difficulty && userInterests.difficulties[solution.difficulty]) {
        score += userInterests.difficulties[solution.difficulty] * 5;
      }
      if (solution.tags) {
        solution.tags.forEach(tag => {
          if (userInterests.tags[tag]) {
            score += userInterests.tags[tag] * 3;
          }
        });
      }
      if (solution.title && userInterests.viewCount[solution.title]) {
        score += userInterests.viewCount[solution.title] * 2;
      }
      return {
        ...solution,
        recommendationScore: score,
        recommendationReason: getRecommendationReason(solution, userInterests)
      };
    });

    // 排序并返回前6个推荐
    return scoredSolutions.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 6);
  };
  const getRecommendationReason = (solution, userInterests) => {
    const reasons = [];
    if (solution.industry && userInterests.industries[solution.industry]) {
      reasons.push('基于您的行业偏好');
    }
    if (solution.difficulty && userInterests.difficulties[solution.difficulty]) {
      reasons.push('适合您的技能水平');
    }
    if (solution.tags) {
      const matchingTags = solution.tags.filter(tag => userInterests.tags[tag]);
      if (matchingTags.length > 0) {
        reasons.push('匹配您的兴趣标签');
      }
    }
    if (solution.popularity) {
      reasons.push('热门推荐');
    }
    return reasons.length > 0 ? reasons.join('、') : '为您推荐';
  };
  const handleViewRecommendation = async solution => {
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
            event_label: solution.title,
            content_type: 'solution',
            timestamp: new Date(),
            metadata: {
              recommendationScore: solution.recommendationScore,
              recommendationReason: solution.recommendationReason
            }
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
  if (recommendations.length === 0) {
    return <div className="text-center py-12">
        <div className="text-gray-400">
          <Target className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">暂无推荐</h3>
          <p className="text-gray-400">浏览更多解决方案以获得个性化推荐</p>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">为您推荐</h2>
        <Badge className="bg-purple-500 text-white">基于AI算法</Badge>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {recommendations.map((solution, index) => <Card key={solution._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <Badge className="bg-blue-500 text-white text-xs">
                    {solution.industry || '通用'}
                  </Badge>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-500 text-sm">{(solution.recommendationScore / 20).toFixed(1)}</span>
                </div>
              </div>
              <CardTitle className="text-white text-lg">{solution.title}</CardTitle>
              <CardDescription className="text-gray-300 text-sm">{solution.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-gray-400">
                  推荐理由: {solution.recommendationReason}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>难度: {solution.difficulty || '中级'}</span>
                  <span>热度: {solution.popularity || '高'}</span>
                </div>
                <Button onClick={() => handleViewRecommendation(solution)} className="w-full bg-red-500 hover:bg-red-600" size="sm">
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}