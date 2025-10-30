// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { Calculator, TrendingUp, DollarSign, Clock } from 'lucide-react';

export function ROICalculator() {
  const [inputs, setInputs] = useState({
    currentCost: 10000,
    timeSpent: 40,
    teamSize: 5,
    hourlyRate: 200,
    implementationCost: 50000,
    expectedEfficiency: 30
  });
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const handleInputChange = (field, value) => {
    setInputs({
      ...inputs,
      [field]: parseFloat(value) || 0
    });
  };
  const calculateROI = () => {
    // 计算当前月成本
    const currentMonthlyCost = inputs.currentCost;

    // 计算时间节省成本
    const monthlyHoursSaved = inputs.timeSpent * inputs.teamSize * (inputs.expectedEfficiency / 100);
    const monthlyCostSaved = monthlyHoursSaved * inputs.hourlyRate;

    // 计算年节省
    const annualSavings = (monthlyCostSaved + currentMonthlyCost) * 12;

    // 计算ROI
    const roi = (annualSavings - inputs.implementationCost) / inputs.implementationCost * 100;

    // 计算回收期
    const paybackPeriod = inputs.implementationCost / (monthlyCostSaved + currentMonthlyCost);
    setResults({
      currentMonthlyCost,
      monthlyHoursSaved,
      monthlyCostSaved,
      annualSavings,
      roi,
      paybackPeriod
    });
    setShowResults(true);
  };
  const formatCurrency = amount => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          ROI 计算器
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Input Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">当前月成本 (¥)</label>
              <input type="number" value={inputs.currentCost} onChange={e => handleInputChange('currentCost', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">每月工作时间 (小时)</label>
              <input type="number" value={inputs.timeSpent} onChange={e => handleInputChange('timeSpent', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">团队规模 (人)</label>
              <input type="number" value={inputs.teamSize} onChange={e => handleInputChange('teamSize', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">时薪 (¥)</label>
              <input type="number" value={inputs.hourlyRate} onChange={e => handleInputChange('hourlyRate', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">实施成本 (¥)</label>
              <input type="number" value={inputs.implementationCost} onChange={e => handleInputChange('implementationCost', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">预期效率提升 (%)</label>
              <input type="number" value={inputs.expectedEfficiency} onChange={e => handleInputChange('expectedEfficiency', e.target.value)} className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            </div>
          </div>

          {/* Calculate Button */}
          <Button onClick={calculateROI} className="w-full bg-red-500 hover:bg-red-600">
            <Calculator className="w-4 h-4 mr-2" />
            计算 ROI
          </Button>

          {/* Results */}
          {showResults && results && <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white">计算结果</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center text-gray-400 text-sm mb-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    月节省成本
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(results.monthlyCostSaved)}
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center text-gray-400 text-sm mb-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    年节省成本
                  </div>
                  <div className="text-2xl font-bold text-green-500">
                    {formatCurrency(results.annualSavings)}
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center text-gray-400 text-sm mb-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    投资回报率
                  </div>
                  <div className="text-2xl font-bold text-blue-500">
                    {results.roi.toFixed(1)}%
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center text-gray-400 text-sm mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    回收期
                  </div>
                  <div className="text-2xl font-bold text-purple-500">
                    {results.paybackPeriod.toFixed(1)} 个月
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center text-gray-400 text-sm mb-1">
                  <Clock className="w-4 h-4 mr-1" />
                  每月节省时间
                </div>
                <div className="text-xl font-bold text-yellow-500">
                  {results.monthlyHoursSaved.toFixed(1)} 小时
                </div>
              </div>
            </div>}
        </div>
      </CardContent>
    </Card>;
}