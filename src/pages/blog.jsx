// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Calendar, User, Tag, Search } from 'lucide-react';

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
function BlogContent(props) {
  const {
    $w,
    style
  } = props;
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('blog_layout');
  const infiniteScrollExperiment = useExperiment('infinite_scroll');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadBlogData, 30000);
  useEffect(() => {
    loadBlogData();
  }, []);
  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, selectedCategory]);
  const loadBlogData = async () => {
    try {
      setLoading(true);
      const postsResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 20,
          pageNumber: 1
        }
      }));
      const posts = postsResult.records || [];
      setPosts(posts);

      // 提取分类
      const cats = [...new Set(posts.map(post => post.category || '未分类'))];
      setCategories(cats);
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
  const filterPosts = () => {
    let filtered = posts;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(post => post.title?.toLowerCase().includes(searchTerm.toLowerCase()) || post.description?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    setFilteredPosts(filtered);
  };
  const handleReadMore = postId => {
    $w.utils.navigateTo({
      pageId: 'resources',
      params: {
        id: postId,
        type: 'blog'
      }
    });
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载博客内容...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center py-20">
          <h1 className="text-5xl font-bold text-white mb-6">
            AI太极博客
            <span className="text-red-500">技术前沿</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            分享AI技术、产品更新和行业洞察
          </p>
        </div>

        {/* Search and Filter */}
        <BlogSearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} categories={categories} />

        {/* Blog Posts */}
        <div className={`grid gap-8 ${layoutExperiment === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'}`}>
          {filteredPosts.map(post => <BlogPostCard key={post._id} post={post} onReadMore={handleReadMore} layout={layoutExperiment} />)}
        </div>

        {filteredPosts.length === 0 && <div className="text-center py-12">
            <div className="text-gray-400">
              <Search className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">暂无内容</h3>
              <p className="text-gray-400">没有找到匹配的博客文章</p>
            </div>
          </div>}
      </div>
    </div>;
}
export default function BlogPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <BlogContent {...props} />
    </ExperimentProvider>;
}