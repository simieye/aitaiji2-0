// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Download, Trash2, Eye, Calendar, FileSpreadsheet, FileText } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ExportHistory({
  $w,
  onHistoryUpdate
}) {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(false);
  const loadExportHistory = async () => {
    try {
      setLoading(true);
      const result = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_export_history',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 20,
          pageNumber: 1
        }
      }));
      setExports(result.records || []);
      setLoading(false);
    } catch (error) {
      console.error('加载导出历史失败:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    loadExportHistory();
  }, []);
  const handleDownload = async exportItem => {
    try {
      // 模拟文件下载
      const link = document.createElement('a');
      link.href = exportItem.downloadUrl || '#';
      link.download = exportItem.fileName;
      link.click();
    } catch (error) {
      console.error('下载失败:', error);
    }
  };
  const handleDelete = async exportId => {
    try {
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_export_history',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: exportId
              }
            }
          }
        }
      }));
      loadExportHistory();
      if (onHistoryUpdate) {
        onHistoryUpdate();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };
  const getFormatIcon = format => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">已完成</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white">失败</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 text-white">处理中</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">未知</Badge>;
    }
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleString('zh-CN');
  };
  const formatFileSize = bytes => {
    if (!bytes) return '未知';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">导出历史</CardTitle>
          <Button onClick={loadExportHistory} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">加载中...</p>
          </div> : <div className="space-y-3">
            {exports.map(exportItem => <div key={exportItem._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getFormatIcon(exportItem.format)}
                  <div>
                    <div className="text-white font-medium">{exportItem.fileName}</div>
                    <div className="text-gray-400 text-sm">
                      {formatDate(exportItem.createdAt)} • {formatFileSize(exportItem.fileSize)} • {exportItem.recordCount} 条记录
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(exportItem.status)}
                  {exportItem.status === 'completed' && <Button onClick={() => handleDownload(exportItem)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                      <Download className="w-4 h-4" />
                    </Button>}
                  <Button onClick={() => handleDelete(exportItem._id)} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>)}
            {exports.length === 0 && <div className="text-center py-8 text-gray-400">
              暂无导出历史
            </div>}
          </div>}
      </CardContent>
    </Card>;
}