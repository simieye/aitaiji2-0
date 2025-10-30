// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [layout, setLayout] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const postsPerPage = 12;
  const {
    toast
  } = useToast();

  // 获取实验变体
  const layoutExperiment = useExperiment('blog_layout');
  const paginationExperiment = useExperiment('blog_pagination');
  useEffect(() => {
    loadBlogData();
  }, [currentPage]);
  const loadBlogData = async () => {
    try {
      setLoading(true);

      // 并行加载博客内容数据
      const [casesResult, whitepapersResult] = await Promise.all([$w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      }), $w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      })]);

      // 合并和格式化数据
      const blogPosts = [...(casesResult.records || []).map(caseItem => ({
        id: caseItem._id,
        title: caseItem.title,
        excerpt: caseItem.description || caseItem.content?.substring(0, 200) + '...' || '暂无描述',
        content: caseItem.content || caseItem.description,
        author: caseItem.author || 'AI太极团队',
        date: caseItem.createdAt,
        category: 'case_study',
        tags: [caseItem.industry || '案例研究', 'success_story', ...(caseItem.tags || [])],
        readTime: Math.ceil((caseItem.content?.length || caseItem.description?.length || 500) / 200),
        image: caseItem.image_url || `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=200&fit=crop`,
        views: caseItem.view_count || Math.floor(Math.random() * 1000) + 100,
        likes: caseItem.like_count || Math.floor(Math.random() * 100) + 10,
        company: caseItem.company_name || '匿名企业',
        industry: caseItem.industry || '通用'
      })), ...(whitepapersResult.records || []).map(whitepaper => ({
        id: whitepaper._id,
        title: whitepaper.title,
        excerpt: whitepaper.description || whitepaper.content?.substring(0, 200) + '...' || '暂无描述',
        content: whitepaper.content || whitepaper.description,
        author: whitepaper.author || 'AI太极研究团队',
        date: whitepaper.createdAt,
        category: 'whitepaper',
        tags: [whitepaper.category || '研究', 'whitepaper', ...(whitepaper.tags || [])],
        readTime: whitepaper.page_count || 5,
        image: whitepaper.cover_image || `https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=200&fit=crop`,
        views: whitepaper.view_count || Math.floor(Math.random() * 500) + 50,
        likes: whitepaper.like_count || Math.floor(Math.random() * 50) + 5,
        company: 'AI太极研究院',
        industry: whitepaper.category || '研究'
      }))];
      setPosts(blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setTotalPages(Math.ceil(blogPosts.length / postsPerPage));
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
  const handleReadPost = postId => {
    // 记录阅读事件
    $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'blog_read',
          event_category: 'engagement',
          event_action: 'read',
          event_label: postId,
          timestamp: new Date()
        }
      }
    });
    toast({
      title: "正在跳转",
      description: "正在打开文章详情...",
      variant: "default"
    });
  };
  const handlePageChange = page => {
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  // 过滤和分页
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesTag = selectedTag === 'all' || post.tags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);
  const totalFilteredPages = Math.ceil(filteredPosts.length / postsPerPage);

  // 获取所有分类和标签
  const categories = [{
    value: 'all',
    label: '所有类别'
  }, {
    value: 'case_study',
    label: '案例研究'
  }, {
    value: 'whitepaper',
    label: '白皮书'
  }];
  const allTags = [...new Set(posts.flatMap(post => post.tags))].slice(0, 10);
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">AI太极博客</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            探索AI太极在不同行业的应用案例、技术白皮书和最新研究成果
          </p>
        </div>

        {/* Search and Filter */}
        <BlogSearchFilter searchTerm={searchTerm} onSearchChange={setSearchTerm} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} selectedTag={selectedTag} onTagChange={setSelectedTag} categories={categories} tags={allTags} layout={layout} onLayoutChange={setLayout} />

        {/* Results Count */}
        <div className="mb-6 text-gray-300">
          找到 {filteredPosts.length} 篇文章，当前显示第 {startIndex + 1}-{Math.min(startIndex + postsPerPage, filteredPosts.length)} 篇
        </div>

        {/* Posts Grid/List */}
        <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {paginatedPosts.map(post => <BlogPostCard key={post.id} post={post} onRead={handleReadPost} layout={layout} />)}
        </div>

        {/* Pagination */}
        {totalFilteredPages > 1 && <div className="mt-12 flex justify-center">
            <div className="flex gap-2">
              {Array.from({
            length: Math.min(totalFilteredPages, 5)
          }, (_, i) => {
            const pageNum = i + 1;
            return <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`px-4 py-2 rounded-lg ${currentPage === pageNum ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                    {pageNum}
                  </button>;
          })}
              {totalFilteredPages > 5 && <span className="px-4 py-2 text-gray-400">...</span>}
            </div>
          </div>}

        {/* Empty State */}
        {paginatedPosts.length === 0 && <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">暂无文章</h3>
              <p className="text-gray-400">没有找到匹配的文章，请尝试其他搜索条件</p>
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