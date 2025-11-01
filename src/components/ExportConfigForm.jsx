// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { FileSpreadsheet, FileText, Download, Save, X, Database, Filter } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function ExportConfigForm({
  $w,
  exportConfig,
  onSave,
  onCancel
}) {
  const [formData, setFormData] = useState({
    name: exportConfig?.name || '',
    dataSource: exportConfig?.dataSource || 'taiji_user',
    format: exportConfig?.format || 'excel',
    fields: exportConfig?.fields || [],
    filters: exportConfig?.filters || {},
    description: exportConfig?.description || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const {
    toast
  } = useToast();
  const dataSources = [{
    value: 'taiji_user',
    label: '用户数据',
    description: '系统用户信息'
  }, {
    value: 'taiji_agent',
    label: '智能代理',
    description: 'AI代理配置'
  }, {
    value: 'taiji_workflow',
    label: '工作流',
    description: '工作流配置'
  }, {
    value: 'taiji_subscription',
    label: '订阅数据',
    description: '用户订阅信息'
  }, {
    value: 'taiji_experiment_assignment',
    label: '实验数据',
    description: 'A/B测试数据'
  }];
  const exportFormats = [{
    value: 'excel',
    label: 'Excel',
    icon: <FileSpreadsheet className="w-4 h-4" />
  }, {
    value: 'pdf',
    label: 'PDF',
    icon: <FileText className="w-4 h-4" />
  }, {
    value: 'csv',
    label: 'CSV',
    icon: <FileSpreadsheet className="w-4 h-4" />
  }];
  const availableFields = {
    taiji_user: ['name', 'email', 'status', 'createdAt', 'lastLoginAt'],
    taiji_agent: ['name', 'type', 'status', 'createdAt', 'config'],
    taiji_workflow: ['name', 'description', 'status', 'createdAt', 'steps'],
    taiji_subscription: ['userId', 'planId', 'status', 'amount', 'createdAt'],
    taiji_experiment_assignment: ['userId', 'experimentId', 'variant', 'assignedAt']
  };
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleFieldToggle = field => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.includes(field) ? prev.fields.filter(f => f !== field) : [...prev.fields, field]
    }));
  };
  const handleSave = async () => {
    if (!formData.name || !formData.dataSource || formData.fields.length === 0) {
      toast({
        title: "信息不完整",
        description: "请填写导出名称、选择数据源和字段",
        variant: "destructive"
      });
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData);
      toast({
        title: "保存成功",
        description: "导出配置已保存",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  return <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
      <Card className="bg-gray-900 border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-white">
            {exportConfig ? '编辑导出配置' : '创建导出配置'}
          </CardTitle>
          <CardDescription className="text-gray-300">
            配置数据导出参数和格式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">导出名称</label>
              <Input value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="输入导出名称" className="bg-gray-800 border-gray-600 text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-300">导出格式</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {exportFormats.map(format => <Button key={format.value} onClick={() => handleInputChange('format', format.value)} variant={formData.format === format.value ? 'default' : 'outline'} className={`${formData.format === format.value ? 'bg-red-500 hover:bg-red-600' : 'border-gray-600 text-white hover:bg-gray-700'}`}>
                    {format.icon}
                    <span className="ml-1">{format.label}</span>
                  </Button>)}
              </div>
            </div>
          </div>
          
          <div>
            <label className="text-sm text-gray-300">数据源</label>
            <select value={formData.dataSource} onChange={e => handleInputChange('dataSource', e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
              {dataSources.map(source => <option key={source.value} value={source.value}>
                  {source.label} - {source.description}
                </option>)}
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-300">描述</label>
            <textarea value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="导出描述" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400" rows={2} />
          </div>
          
          {/* 字段选择 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Database className="w-5 h-5 text-blue-500" />
              <h3 className="text-white font-medium">选择导出字段</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(availableFields[formData.dataSource] || []).map(field => <div key={field} className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg">
                  <input type="checkbox" checked={formData.fields.includes(field)} onChange={() => handleFieldToggle(field)} className="w-4 h-4" />
                  <span className="text-gray-300 text-sm">{field}</span>
                </div>)}
            </div>
          </div>
          
          {/* 过滤条件 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="w-5 h-5 text-green-500" />
              <h3 className="text-white font-medium">过滤条件（可选）</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300">状态过滤</label>
                <select value={formData.filters.status || ''} onChange={e => handleInputChange('filters', {
                ...formData.filters,
                status: e.target.value
              })} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="">全部</option>
                  <option value="active">活跃</option>
                  <option value="inactive">未激活</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-300">时间范围</label>
                <select value={formData.filters.timeRange || ''} onChange={e => handleInputChange('filters', {
                ...formData.filters,
                timeRange: e.target.value
              })} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
                  <option value="">全部时间</option>
                  <option value="today">今天</option>
                  <option value="week">本周</option>
                  <option value="month">本月</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-red-500 hover:bg-red-600">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? '保存中...' : '保存配置'}
            </Button>
            <Button onClick={onCancel} variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-700">
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}