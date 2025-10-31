// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Book, Calendar, Clock, User, ArrowRight, Search, Filter } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { BlogPostCard } from '@/components/BlogPostCard';
// @ts-ignore;
import { BlogSearchFilter } from '@/components/BlogSearchFilter';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function BlogContent(props) {
  const {
    $w,
    style
  } = props;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();

  // 获取实验变体
  const blogExperiment = useExperiment('blog_layout');
  const filterExperiment = useExperiment('blog_filter');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadPosts, 30000);
  useEffect(() => {
    loadPosts();
  }, []);
  const loadPosts = async () => {
    try {
      setLoading(true);
      // 模拟博客文章数据
      const mockPosts = [{
        _id: '1',
        title: 'AI技术在制造业的应用前景',
        description: '探讨人工智能如何改变传统制造业的生产模式',
        category: '技术',
        author: '张三',
        publishDate: new Date('2024-01-15'),
        readTime: '5分钟',
        tags: ['AI', '制造业', '技术趋势'],
        featured: true,
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500'
      }, {
        _id: '2',
        title: '企业数字化转型的关键步骤',
        description: '分析企业数字化转型过程中的挑战和解决方案',
        category: '行业洞察',
        author: '李四',
        publishDate: new Date('2024-01-10'),
        readTime: '8分钟',
        tags: ['数字化转型', '企业管理', '创新'],
        featured: false,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500'
      }, {
        _id: '3',
        title: '机器学习在金融风控中的应用',
        description: '详细介绍机器学习技术如何提升金融风控效率',
        category: '技术',
        author: '王五',
        publishDate: new Date('2024-01-05'),
        readTime: '6分钟',
        tags: ['机器学习', '金融', '风控'],
        featured: true,
        image: 'https://images.unsplash.com/photo-1563986768494-4dee0e3fae95?w=500'
      }];
      setPosts(mockPosts);
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
  const categories = [{
    id: 'all',
    name: '全部',
    count: posts.length
  }, {
    id: '技术',
    name: '技术',
    count: posts.filter(p => p.category === '技术').length
  }, {
    id: '行业洞察',
    name: '行业洞察',
    count: posts.filter(p => p.category === '行业洞察').length
  }, {
    id: '案例研究',
    name: '案例研究',
    count: posts.filter(p => p.category === '案例研究').length
  }];
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);
  const handleReadPost = post => {
    toast({
      title: "打开文章",
      description: `正在加载 ${post.title}...`,
      variant: "default"
    });
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4 text-sm sm:text-base">{t('common.loading')}</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center py-12 sm:py-16 lg:py-20">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            {t('blog.title', '博客')}
            <span className="text-red-500 block mt-2">{t('blog.subtitle', '技术分享')}</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            {t('blog.description', '最新的AI技术文章和行业洞察')}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input type="text" placeholder="搜索文章..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm sm:text-base placeholder-gray-400" />
            </div>
            <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 lg:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>
          
          {showFilters && <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => {
              const buttonClass = `px-3 sm:px-4 py-2 rounded-lg border transition-all text-sm sm:text-base ${selectedCategory === category.id ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-gray-600 text-gray-300 hover:border-gray-500'}`;
              return <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={buttonClass}>
                    {category.name} ({category.count})
                  </button>;
            })}
              </div>
            </div>}
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && <div className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">精选文章</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {featuredPosts.map(post => <BlogPostCard key={post._id} post={post} onRead={handleReadPost} featured />)}
            </div>
          </div>}

        {/* Regular Posts */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">最新文章</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {regularPosts.map(post => <BlogPostCard key={post._id} post={post} onRead={handleReadPost} />)}
          </div>
        </div>

        {/* Load More */}
        {filteredPosts.length > 0 && <div className="text-center">
            <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
              加载更多文章
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>}

        {/* No Results */}
        {filteredPosts.length === 0 && <div className="text-center py-12">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">没有找到相关文章</h3>
            <p className="text-gray-400">尝试调整搜索条件或筛选器</p>
          </div>}
      </div>
    </div>;
}
export default function BlogPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <BlogContent {...props} />
    </ExperimentProvider>;
}