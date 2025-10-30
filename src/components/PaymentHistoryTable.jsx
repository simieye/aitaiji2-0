// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { ExternalLink, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function PaymentHistoryTable({
  payments,
  onViewDetails
}) {
  const getStatusBadge = status => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-500 text-white">成功</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">处理中</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white">失败</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">未知</Badge>;
    }
  };
  const getProviderBadge = provider => {
    switch (provider) {
      case 'stripe':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Stripe</Badge>;
      case 'paypal':
        return <Badge variant="outline" className="border-blue-500 text-blue-500">PayPal</Badge>;
      case 'alipay':
        return <Badge variant="outline" className="border-blue-600 text-blue-600">支付宝</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-500 text-gray-500">{provider}</Badge>;
    }
  };
  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency || 'CNY'
    }).format(amount / 100);
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (payments.length === 0) {
    return <div className="text-center py-12">
        <div className="text-gray-400">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">暂无支付记录</h3>
          <p className="text-gray-400">您还没有任何支付记录</p>
        </div>
      </div>;
  }
  return <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-white">支付时间</TableHead>
            <TableHead className="text-white">支付提供商</TableHead>
            <TableHead className="text-white">金额</TableHead>
            <TableHead className="text-white">状态</TableHead>
            <TableHead className="text-white">订阅计划</TableHead>
            <TableHead className="text-white">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map(payment => <TableRow key={payment._id} className="border-gray-700">
              <TableCell className="text-gray-300">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatDate(payment.createdAt)}
                </div>
              </TableCell>
              <TableCell>{getProviderBadge(payment.provider)}</TableCell>
              <TableCell className="text-white font-medium">{formatCurrency(payment.amount, payment.currency)}</TableCell>
              <TableCell>{getStatusBadge(payment.status)}</TableCell>
              <TableCell className="text-gray-300">{payment.subscriptionName || '未知计划'}</TableCell>
              <TableCell>
                <Button onClick={() => onViewDetails(payment._id)} variant="ghost" className="text-blue-400 hover:text-blue-300">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  详情
                </Button>
              </TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </div>;
}