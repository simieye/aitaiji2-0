// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { FileSpreadsheet, FileText, Download, Calendar, Filter } from 'lucide-react';

export function ExportConfig({
  config,
  onConfigChange,
  onExport
}) {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [selectedFields, setSelectedFields] = useState([]);
  const exportFormats = [{
    value: 'excel',
    label: 'Excel',
    icon: <FileSpreadsheet className="w-4 h-4" />,
    description: 'Microsoft Excel 格式'
  }, {
    value: 'pdf',
    label: 'PDF',
    icon: <FileText className="w-4 h-4" />,
    description: 'PDF 文档格式'
  }, {
    value: 'csv',
    label: 'CSV',
    icon: <FileText className="w-4 h-4" />,
    description: '逗号分隔值格式'
  }];
  const availableFields = config?.fields || [];
  const handleFieldToggle = field => {
    setSelectedFields(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };
  const handleExport = () => {
    const exportConfig = {
      ...config,
      format: selectedFormat,
      dateRange,
      fields: selectedFields.length > 0 ? selectedFields : availableFields
    };
    onExport(exportConfig);
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">导出配置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 数据源信息 */}
        <div>
          <h3 className="text-white font-semibold mb-2">数据源</h3>
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-500 text-white">{config?.dataSource}</Badge>
            <span className="text-gray-300">{config?.description}</span>
          </div>
        </div>

        {/* 导出格式选择 */}
        <div>
          <h3 className="text-white font-semibold mb-3">导出格式</h3>
          <div className="grid grid-cols-3 gap-3">
            {exportFormats.map(format => <button key={format.value} onClick={() => setSelectedFormat(format.value)} className={`p-3 rounded-lg border transition-all ${selectedFormat === format.value ? 'border-red-500 bg-red-500/10' : 'border-gray-600 bg-gray-800'}`}>
                <div className="flex flex-col items-center space-y-2">
                  {format.icon}
                  <span className="text-white text-sm">{format.label}</span>
                  <span className="text-gray-400 text-xs">{format.description}</span>
                </div>
              </button>)}
          </div>
        </div>

        {/* 时间范围选择 */}
        <div>
          <h3 className="text-white font-semibold mb-3">时间范围</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400">开始时间</label>
              <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({
              ...prev,
              start: e.target.value
            }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="text-sm text-gray-400">结束时间</label>
              <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({
              ...prev,
              end: e.target.value
            }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white" />
            </div>
          </div>
        </div>

        {/* 字段选择 */}
        <div>
          <h3 className="text-white font-semibold mb-3">导出字段</h3>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {availableFields.map(field => <label key={field} className="flex items-center space-x-2 text-gray-300">
                <input type="checkbox" checked={selectedFields.includes(field) || selectedFields.length === 0} onChange={() => handleFieldToggle(field)} className="rounded" />
                <span className="text-sm">{field}</span>
              </label>)}
          </div>
        </div>

        {/* 导出按钮 */}
        <Button onClick={handleExport} className="w-full bg-red-500 hover:bg-red-600">
          <Download className="w-4 h-4 mr-2" />
          开始导出
        </Button>
      </CardContent>
    </Card>;
}