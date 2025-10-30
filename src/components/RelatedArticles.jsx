// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, ArrowRight } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function RelatedArticles({
  currentArticle,
  $w,
  userId,
  allArticles
}) {
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadRelatedArticles();
  }, [currentArticle, allArticles]);
  const loadRelatedArticles = async () => {
    try {
      setLoading(true);

      // 基于当前文章生成相关推荐
      const related = generateRelatedArticles(currentArticle, allArticles);
      setRelatedArticles(related);
      setLoading(false);
    } catch (error) {
      console.error('加载相关文章失败:', error);
      setLoading(false);
    }
  };
  const generateRelatedArticles = (current, allArticles) => {
    if (!current || !allArticles || allArticles.length === 0) return [];

    // 计算相关度分数
    const scored = allArticles.filter(article => article._id !== current._id).map(article => {
      let score = 0;

      // 基于分类的相关性
      if (current.category && article.category === current.category) {
        score += 30;
      }

      // 基于标签的相关性
      if (current.tags && article.tags) {
        const commonTags = current.tags.filter(tag => article.tags.includes(tag));
        score += commonTags.length * 10;
      }

      // 基于标题和摘要的相似性（简单实现）
      if (current.name && article.name) {
        const currentWords = current.name.toLowerCase().split(' ');
        const articleWords = article.name.toLowerCase().split(' ');
        const commonWords = currentWords.filter(word => articleWords.includes(word));
        score += commonWords.length * 5;
      }

      // 添加随机因素确保多样性
      score += Math.random() * 10;
      return {
        ...article,
        relevanceScore: score
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 4);
    return scored;
  };
  const handleViewArticle = async articleId => {
    try {
      // 记录查看相关文章事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            event: 'related_article_click',
            event_category: 'engagement',
            event_label: articleId,
            timestamp: new Date(),
            metadata: {
              sourceArticle: currentArticle._id
            }
          }
        }
      }));
    } catch (error) {
      console.error('记录查看相关文章失败:', error);
    }
  };
  const formatDate = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000) return '今天';
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    return date.toLocaleDateString('zh-CN');
  };
  if (loading) {
    return <div className="space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </div>)}
      </div>;
  }
  if (relatedArticles.length === 0) {
    return <div className="text-center py-8">
        <div className="text-gray-400">
          <TrendingUp className="w-12 h-12 mx-auto mb-4" />
          <p>暂无相关文章</p>
        </div>
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex items-center">
        <TrendingUp className="w-5 h-5 text-red-500 mr-2" />
        <h3 className="text-xl font-bold text-white">相关文章</h3>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {relatedArticles.map(article => <Card key={article._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white text-lg line-clamp-2">
                {article.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-300 text-sm line-clamp-3">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    {formatDate(article.createdAt)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {article.viewCount || 0} 阅读
                  </div>
                </div>
                <Button onClick={() => handleViewArticle(article._id)} className="w-full bg-red-500 hover:bg-red-600" size="sm">
                  阅读全文 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}