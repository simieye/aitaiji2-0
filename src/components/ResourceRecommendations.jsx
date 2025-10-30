// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Target, TrendingUp, Star, Download } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ResourceRecommendations({
  $w,
  userId,
  resources
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadRecommendations();
  }, [userId, resources]);
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
              },
              event_category: {
                $eq: 'engagement'
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
      const recommendedResources = generateRecommendations(resources, userInterests);
      setRecommendations(recommendedResources);
      setLoading(false);
    } catch (error) {
      console.error('加载推荐失败:', error);
      setLoading(false);
    }
  };
  const analyzeUserInterests = events => {
    const interests = {
      types: {},
      categories: {},
      tags: {},
      downloadCount: {}
    };
    events.forEach(event => {
      if (event.event === 'resource_download') {
        if (event.metadata?.resourceType) {
          interests.types[event.metadata.resourceType] = (interests.types[event.metadata.resourceType] || 0) + 1;
        }
      }
      if (event.metadata?.category) {
        interests.categories[event.metadata.category] = (interests.categories[event.metadata.category] || 0) + 1;
      }
      if (event.metadata?.tags) {
        event.metadata.tags.forEach(tag => {
          interests.tags[tag] = (interests.tags[tag] || 0) + 1;
        });
      }
      if (event.event_label) {
        interests.downloadCount[event.event_label] = (interests.downloadCount[event.event_label] || 0) + 1;
      }
    });
    return interests;
  };
  const generateRecommendations = (allResources, userInterests) => {
    if (!allResources || allResources.length === 0) return [];

    // 计算每个资源的推荐分数
    const scoredResources = allResources.map(resource => {
      let score = Math.random() * 30; // 基础分数

      // 基于用户兴趣调整分数
      if (resource.type && userInterests.types[resource.type]) {
        score += userInterests.types[resource.type] * 15;
      }
      if (resource.category && userInterests.categories[resource.category]) {
        score += userInterests.categories[resource.category] * 10;
      }
      if (resource.tags) {
        resource.tags.forEach(tag => {
          if (userInterests.tags[tag]) {
            score += userInterests.tags[tag] * 5;
          }
        });
      }
      if (resource.downloadCount > 0) {
        score += Math.log(resource.downloadCount) * 2; // 基于下载量
      }
      if (resource.rating > 0) {
        score += resource.rating * 3; // 基于评分
      }
      return {
        ...resource,
        recommendationScore: score,
        recommendationReason: getRecommendationReason(resource, userInterests)
      };
    });

    // 排序并返回前6个推荐
    return scoredResources.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 6);
  };
  const getRecommendationReason = (resource, userInterests) => {
    const reasons = [];
    if (resource.type && userInterests.types[resource.type]) {
      reasons.push('基于您的下载偏好');
    }
    if (resource.category && userInterests.categories[resource.category]) {
      reasons.push('匹配您的兴趣分类');
    }
    if (resource.tags) {
      const matchingTags = resource.tags.filter(tag => userInterests.tags[tag]);
      if (matchingTags.length > 0) {
        reasons.push('包含您感兴趣的标签');
      }
    }
    if (resource.downloadCount > 100) {
      reasons.push('热门下载');
    }
    if (resource.rating > 4.0) {
      reasons.push('高评分推荐');
    }
    return reasons.length > 0 ? reasons.join('、') : '为您推荐';
  };
  const handleViewResource = async resourceId => {
    try {
      // 记录查看推荐资源事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            event: 'recommendation_click',
            event_category: 'recommendation',
            event_label: resourceId,
            content_type: 'resource',
            timestamp: new Date()
          }
        }
      }));
    } catch (error) {
      console.error('记录查看推荐资源失败:', error);
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
          <p className="text-gray-400">下载更多资源以获得个性化推荐</p>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">为您推荐</h2>
        <Badge className="bg-purple-500 text-white">基于AI算法</Badge>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {recommendations.map((resource, index) => <Card key={resource._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={`${resource.type === 'whitepaper' ? 'bg-purple-500' : 'bg-blue-500'} text-white text-xs`}>
                    {resource.type === 'whitepaper' ? '白皮书' : '工具'}
                  </Badge>
                  {resource.category && <Badge className="bg-green-500 text-white text-xs">
                      {resource.category}
                    </Badge>}
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-500 text-sm">{(resource.rating || 0).toFixed(1)}</span>
                </div>
              </div>
              <CardTitle className="text-white text-lg">{resource.name || resource.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm line-clamp-2">{resource.summary || resource.description}</p>
                <div className="text-xs text-gray-400">
                  推荐理由: {resource.recommendationReason}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {resource.downloadCount || 0}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {(resource.rating || 0).toFixed(1)}
                  </div>
                </div>
                <Button onClick={() => handleViewResource(resource._id)} className="w-full bg-red-500 hover:bg-red-600" size="sm">
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}