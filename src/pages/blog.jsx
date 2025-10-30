// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, Calendar, Tag, TrendingUp, MessageCircle, Eye } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { BlogSearchFilter } from '@/components/BlogSearchFilter';
// @ts-ignore;
import { ArticleCard } from '@/components/ArticleCard';
// @ts-ignore;
import { CommentSection } from '@/components/CommentSection';
// @ts-ignore;
import { RelatedArticles } from '@/components/RelatedArticles';
// @ts-ignore;
import { ReadingProgressBar } from '@/components/ReadingProgressBar';
// @ts-ignore;
import { MetricCard } from '@/components/MetricCard';
function BlogContent(props) {
  const {
    $w,
    style
  } = props;
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [showComments, setShowComments] = useState(false);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('blog_layout');
  const contentExperiment = useExperiment('content_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadArticlesData, 30000);
  useEffect(() => {
    loadArticlesData();
  }, []);
  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory, selectedTags, selectedDateRange, sortBy]);
  const loadArticlesData = async () => {
    try {
      setLoading(true);
      const whitepapersResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      }));

      // 转换白皮书数据为博客文章格式
      const blogData = (whitepapersResult.records || []).map(item => ({
        _id: item._id,
        name: item.name || '未命名文章',
        summary: item.summary || '暂无摘要',
        content: item.content || '暂无内容',
        category: item.category || ['技术', '产品', '行业', '教程', '新闻'][Math.floor(Math.random() * 5)],
        tags: item.tags || ['AI', '机器学习', '深度学习', '自然语言处理', '计算机视觉'].slice(0, Math.floor(Math.random() * 4) + 1),
        featured: Math.random() > 0.8,
        author: item.author || 'AI太极团队',
        viewCount: Math.floor(Math.random() * 10000) + 100,
        likes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 100) + 1,
        readingTime: Math.floor(Math.random() * 20) + 5,
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date()
      }));
      setArticles(blogData);
      setLoading(false);
    } catch (error) {
      toast({
        title: "数据加载失败",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  const filterArticles = () => {
    let filtered = [...articles];

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(article => article.name?.toLowerCase().includes(term) || article.summary?.toLowerCase().includes(term) || article.content?.toLowerCase().includes(term) || article.author?.toLowerCase().includes(term));
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // 标签过滤
    if (selectedTags.length > 0) {
      filtered = filtered.filter(article => selectedTags.some(tag => article.tags?.includes(tag)));
    }

    // 日期范围过滤
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      switch (selectedDateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      if (selectedDateRange !== 'all') {
        filtered = filtered.filter(article => new Date(article.createdAt) >= filterDate);
      }
    }

    // 排序
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      case 'liked':
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'commented':
        filtered.sort((a, b) => (b.comments || 0) - (a.comments || 0));
        break;
    }
    setFilteredArticles(filtered);
  };
  const handleArticleClick = async article => {
    try {
      // 记录文章查看事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'article_view',
            event_category: 'engagement',
            event_label: article._id,
            timestamp: new Date(),
            metadata: {
              articleTitle: article.name,
              category: article.category
            }
          }
        }
      }));

      // 更新查看次数
      setArticles(articles.map(a => a._id === article._id ? {
        ...a,
        viewCount: (a.viewCount || 0) + 1
      } : a));
      setSelectedArticle(article);
      setShowComments(false);
    } catch (error) {
      console.error('记录文章查看失败:', error);
    }
  };
  const handleBackToList = () => {
    setSelectedArticle(null);
    setShowComments(false);
  };
  const handleComment = articleId => {
    setSelectedArticle(articles.find(a => a._id === articleId));
    setShowComments(true);
  };
  const handleShare = article => {
    // 模拟分享功能
    if (navigator.share) {
      navigator.share({
        title: article.name,
        text: article.summary,
        url: window.location.href
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "链接已复制",
        description: "文章链接已复制到剪贴板",
        variant: "default"
      });
    }
  };
  // 获取分类和标签
  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];
  const popularTags = [...new Set(articles.flatMap(a => a.tags || []).filter(Boolean))];
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载博客文章...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      {/* Reading Progress Bar */}
      <ReadingProgressBar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-white mb-6">
            AI太极博客
            <span className="text-red-500">技术分享</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            探索AI技术前沿，分享实践经验，助力您的数字化转型之旅
          </p>
        </div>

        {/* Blog Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          <MetricCard title="文章总数" value={articles.length.toLocaleString()} icon={<MessageCircle className="w-5 h-5" />} trend="+12%" />
          <MetricCard title="总阅读量" value={articles.reduce((sum, a) => sum + (a.viewCount || 0), 0).toLocaleString()} icon={<Eye className="w-5 h-5" />} trend="+25%" />
          <MetricCard title="总点赞数" value={articles.reduce((sum, a) => sum + (a.likes || 0), 0).toLocaleString()} icon={<TrendingUp className="w-5 h-5" />} trend="+18%" />
          <MetricCard title="评论总数" value={articles.reduce((sum, a) => sum + (a.comments || 0), 0).toLocaleString()} icon={<MessageCircle className="w-5 h-5" />} trend="+30%" />
        </div>

        {/* Article View */}
        {selectedArticle ? <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Button onClick={handleBackToList} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
                ← 返回文章列表
              </Button>
            </div>
            
            <Card className="bg-gray-900/50 backdrop-blur border-gray-700 mb-8">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-4">
                  {selectedArticle.category && <Badge className="bg-blue-500 text-white">
                      {selectedArticle.category}
                    </Badge>}
                  {selectedArticle.featured && <Badge className="bg-red-500 text-white">
                      精选
                    </Badge>}
                </div>
                <CardTitle className="text-white text-3xl mb-4">
                  {selectedArticle.name}
                </CardTitle>
                <div className="flex items-center justify-between text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>作者: {selectedArticle.author}</span>
                    <span>发布时间: {new Date(selectedArticle.createdAt).toLocaleDateString('zh-CN')}</span>
                    <span>阅读时间: {selectedArticle.readingTime}分钟</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>{selectedArticle.viewCount} 阅读</span>
                    <span>{selectedArticle.likes} 点赞</span>
                    <span>{selectedArticle.comments} 评论</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <div className="text-gray-300 leading-relaxed">
                    {selectedArticle.content}
                  </div>
                </div>
                
                {/* Tags */}
                {selectedArticle.tags && selectedArticle.tags.length > 0 && <div className="mt-8 pt-8 border-t border-gray-700">
                    <div className="flex flex-wrap gap-2">
                      {selectedArticle.tags.map((tag, index) => <span key={index} className="bg-gray-800 text-gray-300 text-sm px-3 py-1 rounded">
                          #{tag}
                        </span>)}
                    </div>
                  </div>}
              </CardContent>
            </Card>
            
            {/* Related Articles */}
            <div className="mb-8">
              <RelatedArticles currentArticle={selectedArticle} $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} allArticles={articles} />
            </div>
            
            {/* Comments Section */}
            {showComments && <CommentSection articleId={selectedArticle._id} $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} />}
          </div> : <div className="space-y-8">
            {/* Search and Filter */}
            <BlogSearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} selectedTags={selectedTags} onTagsChange={setSelectedTags} selectedDateRange={selectedDateRange} onDateRangeChange={setSelectedDateRange} sortBy={sortBy} onSortByChange={setSortBy} categories={categories} popularTags={popularTags} />

            {/* Featured Articles */}
            {searchTerm === '' && selectedCategory === 'all' && selectedTags.length === 0 && <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-white mb-4">精选文章</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {filteredArticles.filter(article => article.featured).slice(0, 2).map(article => <ArticleCard key={article._id} article={article} $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} onLike={handleArticleClick} onComment={handleComment} onShare={handleShare} />)}
                </div>
              </div>}

            {/* Articles Grid */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">
                  {searchTerm || selectedCategory !== 'all' || selectedTags.length > 0 ? '搜索结果' : '最新文章'}
                </h2>
                <div className="text-gray-400 text-sm">
                  共 {filteredArticles.length} 篇文章
                </div>
              </div>
              <div className={`grid gap-8 ${layoutExperiment === 'compact' ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                {filteredArticles.map(article => <ArticleCard key={article._id} article={article} $w={$w} userId={$w.auth.currentUser?.userId || 'anonymous'} onLike={handleArticleClick} onComment={handleComment} onShare={handleShare} />)}
              </div>
            </div>

            {filteredArticles.length === 0 && <div className="text-center py-12">
                <div className="text-gray-400">
                  <Search className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">暂无匹配的文章</h3>
                  <p className="text-gray-400">请调整搜索条件或筛选器</p>
                </div>
              </div>}
          </div>}
      </div>
    </div>;
}
export default function BlogPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <BlogContent {...props} />
    </ExperimentProvider>;
}