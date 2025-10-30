// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Search, Filter, Calendar, Tag } from 'lucide-react';

export function BlogSearchFilter({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedTag,
  onTagChange,
  categories = [],
  tags = [],
  layout,
  onLayoutChange
}) {
  return <div className="bg-gray-900/50 backdrop-blur border border-gray-700 rounded-lg p-4 mb-8">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="搜索文章标题或内容..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select value={selectedCategory} onChange={e => onCategoryChange(e.target.value)} className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
            <option value="all">所有类别</option>
            {categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}
          </select>

          <select value={selectedTag} onChange={e => onTagChange(e.target.value)} className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500">
            <option value="all">所有标签</option>
            {tags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
          </select>

          <button onClick={() => onLayoutChange('grid')} className={`px-3 py-2 rounded-lg ${layout === 'grid' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            <Calendar className="w-4 h-4" />
          </button>
          <button onClick={() => onLayoutChange('list')} className={`px-3 py-2 rounded-lg ${layout === 'list' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>;
}