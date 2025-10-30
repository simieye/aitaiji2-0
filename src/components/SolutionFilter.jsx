// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Filter, Search, X } from 'lucide-react';

export function SolutionFilter({
  searchTerm,
  onSearchChange,
  selectedIndustry,
  onIndustryChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedTags,
  onTagsChange,
  industries,
  difficulties,
  tags
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
    onIndustryChange('all');
    onDifficultyChange('all');
    onTagsChange([]);
  };
  const hasActiveFilters = searchTerm || selectedIndustry !== 'all' || selectedDifficulty !== 'all' || selectedTags.length > 0;
  return <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input type="text" placeholder="搜索解决方案..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
        {hasActiveFilters && <Button onClick={clearFilters} variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </Button>}
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button onClick={() => setShowFilters(!showFilters)} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
          <Filter className="w-4 h-4 mr-2" />
          筛选条件
          {hasActiveFilters && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {selectedTags.length + (selectedIndustry !== 'all' ? 1 : 0) + (selectedDifficulty !== 'all' ? 1 : 0)}
            </span>}
        </Button>
        <div className="text-gray-400 text-sm">
          {hasActiveFilters ? '已应用筛选条件' : '显示全部解决方案'}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 space-y-6">
          {/* Industry Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">行业</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button onClick={() => onIndustryChange('all')} variant={selectedIndustry === 'all' ? 'default' : 'outline'} className={`${selectedIndustry === 'all' ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
                全部
              </Button>
              {industries.map(industry => <Button key={industry} onClick={() => onIndustryChange(industry)} variant={selectedIndustry === industry ? 'default' : 'outline'} className={`${selectedIndustry === industry ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
                  {industry}
                </Button>)}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">难度</label>
            <div className="flex space-x-2">
              <Button onClick={() => onDifficultyChange('all')} variant={selectedDifficulty === 'all' ? 'default' : 'outline'} className={`${selectedDifficulty === 'all' ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
                全部
              </Button>
              {difficulties.map(difficulty => <Button key={difficulty} onClick={() => onDifficultyChange(difficulty)} variant={selectedDifficulty === difficulty ? 'default' : 'outline'} className={`${selectedDifficulty === difficulty ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
                  {difficulty}
                </Button>)}
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-3">标签</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => <Button key={tag} onClick={() => handleTagToggle(tag)} variant={selectedTags.includes(tag) ? 'default' : 'outline'} className={`${selectedTags.includes(tag) ? 'bg-red-500' : 'border-gray-600 text-white'}`} size="sm">
                  {tag}
                </Button>)}
            </div>
          </div>
        </div>}
    </div>;
}