// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Check, X, ArrowRight } from 'lucide-react';

export function ProductComparison({
  products,
  onGetStarted
}) {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const handleProductSelect = productId => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else if (selectedProducts.length < 3) {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };
  const getSelectedProducts = () => {
    return products.filter(product => selectedProducts.includes(product._id));
  };
  const getComparisonFeatures = () => {
    const features = new Set();
    products.forEach(product => {
      if (product.features) {
        product.features.forEach(feature => features.add(feature));
      }
    });
    return Array.from(features);
  };
  const hasFeature = (product, feature) => {
    return product.features?.includes(feature) || false;
  };
  if (products.length === 0) {
    return <div className="text-center py-12">
        <div className="text-gray-400">
          <p>暂无产品可供对比</p>
        </div>
      </div>;
  }
  return <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">产品对比</h2>
        <p className="text-gray-300 mb-6">选择最多3个产品进行功能对比</p>
      </div>

      {/* Product Selection */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {products.map(product => <Card key={product._id} className={`bg-gray-900/50 backdrop-blur border-gray-700 cursor-pointer transition-all duration-300 ${selectedProducts.includes(product._id) ? 'border-red-500 ring-2 ring-red-500/50' : 'hover:border-gray-600'}`} onClick={() => handleProductSelect(product._id)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{product.name || '未命名产品'}</CardTitle>
                {selectedProducts.includes(product._id) && <Badge className="bg-red-500 text-white">已选择</Badge>}
              </div>
              <div className="text-gray-300 text-sm">{product.description || '暂无描述'}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-2">
                ¥{product.price || 0}
                <span className="text-sm text-gray-400">/月</span>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {/* Comparison Table */}
      {selectedProducts.length >= 2 && <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">功能对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-300">功能特性</th>
                    {getSelectedProducts().map(product => <th key={product._id} className="text-center p-4 text-white">
                        {product.name}
                      </th>)}
                  </tr>
                </thead>
                <tbody>
                  {getComparisonFeatures().map((feature, index) => <tr key={index} className="border-b border-gray-700">
                      <td className="p-4 text-gray-300">{feature}</td>
                      {getSelectedProducts().map(product => <td key={product._id} className="text-center p-4">
                          {hasFeature(product, feature) ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                        </td>)}
                    </tr>)}
                </tbody>
              </table>
            </div>
            <div className="flex justify-center mt-6">
              <Button onClick={() => onGetStarted()} className="bg-red-500 hover:bg-red-600">
                选择产品 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>}
    </div>;
}