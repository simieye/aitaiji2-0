// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Filter } from 'lucide-react';

export function ResourceFilter({
  selectedType,
  onTypeChange,
  searchTerm,
  onSearchChange
}) {
  const resourceTypes = [{
    value: 'all',
    label: '全部资源'
  }, {
    value: 'case',
    label: '案例研究'
  }, {
    value: 'whitepaper',
    label: '技术白皮书'
  }, {
    value: 'guide',
    label: '最佳实践'
  }];
  return <div className="mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <input type="text" placeholder="搜索资源..." value={searchTerm} onChange={e => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>
        
        <div className="flex space-x-2">
          {resourceTypes.map(type => <Button key={type.value} onClick={() => onTypeChange(type.value)} variant={selectedType === type.value ? 'default' : 'outline'} className={`${selectedType === type.value ? 'bg-red-500 hover:bg-red-600' : 'border-gray-600 text-white hover:bg-gray-700'}`} size="sm">
              {type.label}
            </Button>)}
        </div>
      </div>
    </div>;
}