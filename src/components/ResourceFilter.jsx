// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Filter, Search, X, Tag, Calendar, TrendingUp } from 'lucide-react';

export function ResourceFilter({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedCategory,
  onCategoryChange,
  selectedTags,
  onTagsChange,
  selectedSort,
  onSortChange,
  types,
  categories,
  popularTags
}) {
  const [showFilters, setShowFilters] = useState(false);
  const handleTagToggle = tag => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };
  const clearFilters = () => {
    onSearchChange('');
    onTypeChange('all');
    onCategoryChange('all');
    onTagsChange([]);
    onSortChange('latest');
  };
  const hasActiveFilters = searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || selectedTags.length > 0;
  return <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input type="text" placeholder="搜索资源名称、描述或标签..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
        {hasActiveFilters && <Button onClick={clearFilters} variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>}
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            <Filter className="w-4 h-4 mr-2" />
            筛选
            {hasActiveFilters && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {selectedTags.length + (selectedType !== 'all' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0)}
              </span>}
          </Button>
          
          <select value={selectedSort} onChange={e => onSortChange(e.target.value)} className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-2">
            <option value="latest">最新发布</option>
            <option value="popular">最多下载</option>
            <option value="rated">评分最高</option>
            <option value="viewed">最多查看</option>
          </select>
        </div>
        <div className="text-gray-400 text-sm">
          {hasActiveFilters ? '已应用筛选条件' : '显示全部资源'}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-6">
          {/* Type Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              <Tag className="w-4 h-4 inline mr-1" />
              资源类型
            </label>
            <div className="flex space-x-2">
              <Button onClick={() => onTypeChange('all')} variant={selectedType === 'all' ? 'default' : 'outline'} className={`${selectedType === 'all' ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
                全部
              </Button>
              {types.map(type => <Button key={type} onClick={() => onTypeChange(type)} variant={selectedType === type ? 'default' : 'outline'} className={`${selectedType === type ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
                  {type === 'whitepaper' ? '白皮书' : '工具'}
                </Button>)}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              <Tag className="w-4 h-4 inline mr-1" />
              分类
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button onClick={() => onCategoryChange('all')} variant={selectedCategory === 'all' ? 'default' : 'outline'} className={`${selectedCategory === 'all' ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
                全部
              </Button>
              {categories.map(category => <Button key={category} onClick={() => onCategoryChange(category)} variant={selectedCategory === category ? 'default' : 'outline'} className={`${selectedCategory === category ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
                  {category}
                </Button>)}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">
              <Tag className="w-4 h-4 inline mr-1" />
              标签
            </label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(tag => <Button key={tag} onClick={() => handleTagToggle(tag)} variant={selectedTags.includes(tag) ? 'default' : 'outline'} className={`${selectedTags.includes(tag) ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
                  {tag}
                </Button>)}
            </div>
          </div>
        </div>}
    </div>;
}