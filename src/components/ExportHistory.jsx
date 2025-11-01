// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, Search, RefreshCw, FileSpreadsheet, FileText, Calendar, User } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ExportHistory({
  $w
}) {
  const [exports, setExports] = useState([]);
  const [filteredExports, setFilteredExports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadExportHistory();
  }, []);
  useEffect(() => {
    filterExports();
  }, [exports, searchTerm, statusFilter, formatFilter]);
  const loadExportHistory = async () => {
    try {
      setLoading(true);
      // 模拟导出历史数据
      const mockExports = [{
        _id: '1',
        name: '用户数据导出',
        dataSource: 'taiji_user',
        format: 'excel',
        status: 'completed',
        fileSize: '2.5MB',
        recordCount: 1250,
        createdAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3000000),
        createdBy: 'admin',
        downloadUrl: '/exports/users_20231201.xlsx'
      }, {
        _id: '2',
        name: '订阅数据报表',
        dataSource: 'taiji_subscription',
        format: 'pdf',
        status: 'completed',
        fileSize: '1.8MB',
        recordCount: 856,
        createdAt: new Date(Date.now() - 7200000),
        completedAt: new Date(Date.now() - 6000000),
        createdBy: 'admin',
        downloadUrl: '/exports/subscriptions_20231201.pdf'
      }, {
        _id: '3',
        name: '工作流配置备份',
        dataSource: 'taiji_workflow',
        format: 'csv',
        status: 'processing',
        fileSize: '-',
        recordCount: 0,
        createdAt: new Date(Date.now() - 1800000),
        completedAt: null,
        createdBy: 'admin',
        downloadUrl: null
      }, {
        _id: '4',
        name: '实验数据分析',
        dataSource: 'taiji_experiment_assignment',
        format: 'excel',
        status: 'failed',
        fileSize: '-',
        recordCount: 0,
        createdAt: new Date(Date.now() - 86400000),
        completedAt: new Date(Date.now() - 86000000),
        createdBy: 'admin',
        downloadUrl: null,
        error: '数据源连接超时'
      }];
      setExports(mockExports);
      setLoading(false);
    } catch (error) {
      toast({
        title: "加载导出历史失败",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  const filterExports = () => {
    let filtered = exports;
    if (searchTerm) {
      filtered = filtered.filter(exp => exp.name.toLowerCase().includes(searchTerm.toLowerCase()) || exp.dataSource.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(exp => exp.status === statusFilter);
    }
    if (formatFilter !== 'all') {
      filtered = filtered.filter(exp => exp.format === formatFilter);
    }
    setFilteredExports(filtered);
  };
  const handleDownload = async exportItem => {
    try {
      if (exportItem.downloadUrl) {
        // 模拟文件下载
        const link = document.createElement('a');
        link.href = exportItem.downloadUrl;
        link.download = exportItem.name + '.' + exportItem.format;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "下载开始",
          description: `正在下载 ${exportItem.name}`,
          variant: "default"
        });
      } else {
        toast({
          title: "无法下载",
          description: "文件不可用",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "下载失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const getStatusBadge = status => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white">已完成</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 text-white">处理中</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white">失败</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">未知</Badge>;
    }
  };
  const getFormatIcon = format => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };
  const formatDate = date => {
    return new Date(date).toLocaleString('zh-CN');
  };
  if (loading) {
    return <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>;
  }
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">导出历史</CardTitle>
        <CardDescription className="text-gray-300">查看和管理数据导出记录</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="搜索导出记录..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="all">所有状态</option>
            <option value="completed">已完成</option>
            <option value="processing">处理中</option>
            <option value="failed">失败</option>
          </select>
          <select value={formatFilter} onChange={e => setFormatFilter(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="all">所有格式</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        {/* Export List */}
        <div className="space-y-4">
          {filteredExports.map(exportItem => <div key={exportItem._id} className="bg-gray-800/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {getFormatIcon(exportItem.format)}
                  <div>
                    <div className="text-white font-medium">{exportItem.name}</div>
                    <div className="text-gray-400 text-sm">{exportItem.dataSource}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(exportItem.status)}
                  {exportItem.status === 'completed' && <Button onClick={() => handleDownload(exportItem)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                      <Download className="w-4 h-4 mr-1" />
                      下载
                    </Button>}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">文件大小</div>
                  <div className="text-white">{exportItem.fileSize}</div>
                </div>
                <div>
                  <div className="text-gray-400">记录数量</div>
                  <div className="text-white">{exportItem.recordCount.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">创建时间</div>
                  <div className="text-white">{formatDate(exportItem.createdAt)}</div>
                </div>
                <div>
                  <div className="text-gray-400">创建者</div>
                  <div className="text-white">{exportItem.createdBy}</div>
                </div>
              </div>
              
              {exportItem.error && <div className="mt-3 p-2 bg-red-900/30 border border-red-500 rounded text-red-400 text-sm">
                  错误: {exportItem.error}
                </div>}
            </div>)}
        </div>

        {filteredExports.length === 0 && <div className="text-center py-8">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-white mb-2">暂无导出记录</h3>
            <p className="text-gray-400">还没有数据导出记录</p>
          </div>}
      </CardContent>
    </Card>;
}