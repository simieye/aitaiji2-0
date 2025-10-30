// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Download, Eye, Star, BarChart3 } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ResourceStats({
  $w,
  resources
}) {
  const [stats, setStats] = useState({
    totalDownloads: 0,
    totalViews: 0,
    averageRating: 0,
    topResources: []
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    calculateStats();
  }, [resources]);
  const calculateStats = () => {
    try {
      setLoading(true);
      const totalDownloads = resources.reduce((sum, resource) => sum + (resource.downloadCount || 0), 0);
      const totalViews = resources.reduce((sum, resource) => sum + (resource.viewCount || 0), 0);
      const ratedResources = resources.filter(resource => resource.rating > 0);
      const averageRating = ratedResources.length > 0 ? ratedResources.reduce((sum, resource) => sum + resource.rating, 0) / ratedResources.length : 0;
      const topResources = resources.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 5);
      setStats({
        totalDownloads,
        totalViews,
        averageRating,
        topResources
      });
      setLoading(false);
    } catch (error) {
      console.error('计算统计数据失败:', error);
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-700 rounded mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          </div>)}
      </div>;
  }
  return <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center text-gray-400 text-sm">
              <Download className="w-4 h-4 mr-1" />
              总下载量
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalDownloads.toLocaleString()}</div>
            <div className="text-green-500 text-sm">+12% 本月</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center text-gray-400 text-sm">
              <Eye className="w-4 h-4 mr-1" />
              总浏览量
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
            <div className="text-blue-500 text-sm">+8% 本月</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center text-gray-400 text-sm">
              <Star className="w-4 h-4 mr-1" />
              平均评分
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</div>
            <div className="text-yellow-500 text-sm">4.5/5.0</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader className="pb-2">
            <div className="flex items-center text-gray-400 text-sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              资源总数
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{resources.length}</div>
            <div className="text-purple-500 text-sm">+3 本周</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Resources */}
      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            热门资源
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topResources.map((resource, index) => <div key={resource._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-white font-medium text-sm w-6">#{index + 1}</div>
                  <div>
                    <div className="text-white text-sm font-medium">{resource.name || resource.title}</div>
                    <div className="text-gray-400 text-xs">{resource.type === 'whitepaper' ? '白皮书' : '工具'}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Download className="w-3 h-3 mr-1" />
                    {resource.downloadCount || 0}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 mr-1 text-yellow-500" />
                    {(resource.rating || 0).toFixed(1)}
                  </div>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>
    </div>;
}