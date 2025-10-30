// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { BookOpen, FileText, TrendingUp, Calendar, Eye } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ContentShowcase({
  $w,
  userId
}) {
  const [latestCases, setLatestCases] = useState([]);
  const [latestWhitepapers, setLatestWhitepapers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadLatestContent();
  }, []);
  const loadLatestContent = async () => {
    try {
      setLoading(true);
      const [casesResult, whitepapersResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_case',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 6,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_whitepaper',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 6,
          pageNumber: 1
        }
      }))]);
      setLatestCases(casesResult.records || []);
      setLatestWhitepapers(whitepapersResult.records || []);
      setLoading(false);
    } catch (error) {
      console.error('加载内容失败:', error);
      setLoading(false);
    }
  };
  const handleViewContent = async (content, type) => {
    try {
      // 记录内容查看事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            event: 'content_view',
            event_category: 'engagement',
            event_label: content.title || content.name,
            content_type: type,
            timestamp: new Date()
          }
        }
      }));

      // 更新查看次数
      const modelName = type === 'case' ? 'taiji_case' : 'taiji_whitepaper';
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: modelName,
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            viewCount: (content.viewCount || 0) + 1,
            updatedAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: content._id
              }
            }
          }
        }
      }));
    } catch (error) {
      console.error('记录查看事件失败:', error);
    }
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  if (loading) {
    return <div className="space-y-8">
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-4"></div>
              <div className="h-3 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-3/4"></div>
            </div>)}
        </div>
      </div>;
  }
  return <div className="space-y-12">
      {/* Latest Cases */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">最新案例</h2>
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            查看全部
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {latestCases.map(caseItem => <Card key={caseItem._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                  <Badge className="bg-blue-500 text-white">案例研究</Badge>
                </div>
                <CardTitle className="text-white text-lg">{caseItem.title}</CardTitle>
                <CardDescription className="text-gray-300 text-sm">{caseItem.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(caseItem.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {caseItem.viewCount || 0}
                    </div>
                  </div>
                  <Button onClick={() => handleViewContent(caseItem, 'case')} className="w-full bg-red-500 hover:bg-red-600" size="sm">
                    查看详情
                  </Button>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* Latest Whitepapers */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">最新白皮书</h2>
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
            查看全部
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {latestWhitepapers.map(whitepaper => <Card key={whitepaper._id} className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <Badge className="bg-purple-500 text-white">技术白皮书</Badge>
                </div>
                <CardTitle className="text-white text-lg">{whitepaper.name}</CardTitle>
                <CardDescription className="text-gray-300 text-sm">{whitepaper.summary}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(whitepaper.createdAt)}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {whitepaper.viewCount || 0}
                    </div>
                  </div>
                  <Button onClick={() => handleViewContent(whitepaper, 'whitepaper')} className="w-full bg-red-500 hover:bg-red-600" size="sm">
                    下载阅读
                  </Button>
                </div>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </div>;
}