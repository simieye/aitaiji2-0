// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { Play, RotateCcw, Send, AlertCircle, CheckCircle } from 'lucide-react';

export function StripeWebhookSimulator({
  $w,
  onEventProcessed
}) {
  const [selectedEvent, setSelectedEvent] = useState('invoice.payment_succeeded');
  const [processing, setProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const {
    toast
  } = useToast();
  const webhookEvents = [{
    value: 'invoice.payment_succeeded',
    label: '支付成功'
  }, {
    value: 'invoice.payment_failed',
    label: '支付失败'
  }, {
    value: 'customer.subscription.created',
    label: '订阅创建'
  }, {
    value: 'customer.subscription.updated',
    label: '订阅更新'
  }, {
    value: 'customer.subscription.deleted',
    label: '订阅删除'
  }];
  const mockEventData = {
    'invoice.payment_succeeded': {
      id: 'in_1234567890',
      customer: 'cus_1234567890',
      subscription: 'sub_1234567890',
      amount_paid: 9900,
      currency: 'usd',
      status: 'paid',
      created: Date.now() / 1000
    },
    'invoice.payment_failed': {
      id: 'in_1234567890',
      customer: 'cus_1234567890',
      subscription: 'sub_1234567890',
      amount_due: 9900,
      currency: 'usd',
      status: 'open',
      created: Date.now() / 1000
    },
    'customer.subscription.created': {
      id: 'sub_1234567890',
      customer: 'cus_1234567890',
      status: 'active',
      current_period_start: Date.now() / 1000,
      current_period_end: (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000,
      cancel_at_period_end: false,
      items: {
        data: [{
          plan: {
            id: 'price_1234567890',
            nickname: '专业版',
            amount: 9900,
            currency: 'usd',
            interval: 'month'
          }
        }]
      }
    },
    'customer.subscription.updated': {
      id: 'sub_1234567890',
      customer: 'cus_1234567890',
      status: 'active',
      current_period_start: Date.now() / 1000,
      current_period_end: (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000,
      cancel_at_period_end: true,
      items: {
        data: [{
          plan: {
            id: 'price_1234567890',
            nickname: '专业版',
            amount: 9900,
            currency: 'usd',
            interval: 'month'
          }
        }]
      }
    },
    'customer.subscription.deleted': {
      id: 'sub_1234567890',
      customer: 'cus_1234567890',
      status: 'canceled',
      current_period_start: Date.now() / 1000,
      current_period_end: (Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000,
      cancel_at_period_end: false,
      items: {
        data: [{
          plan: {
            id: 'price_1234567890',
            nickname: '专业版',
            amount: 9900,
            currency: 'usd',
            interval: 'month'
          }
        }]
      }
    }
  };
  const simulateWebhook = async () => {
    setProcessing(true);
    try {
      const eventData = mockEventData[selectedEvent];

      // 调用云函数处理 Webhook
      const result = await $w.cloud.callFunction({
        name: 'stripe-webhook',
        data: {
          eventType: selectedEvent,
          data: eventData
        }
      });
      setLastResult(result);
      if (result.code === 0) {
        toast({
          title: "Webhook 模拟成功",
          description: `${selectedEvent} 事件已处理`,
          variant: "default"
        });

        // 触发回调
        if (onEventProcessed) {
          onEventProcessed(selectedEvent, eventData);
        }
      } else {
        toast({
          title: "Webhook 处理失败",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "模拟失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  const resetSimulation = () => {
    setLastResult(null);
    setSelectedEvent('invoice.payment_succeeded');
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Stripe Webhook 模拟器</CardTitle>
        <CardDescription className="text-gray-300">
          模拟 Stripe Webhook 事件处理
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-2 block">选择事件类型</label>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {webhookEvents.map(event => <SelectItem key={event.value} value={event.value}>
                  {event.label}
                </SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={simulateWebhook} disabled={processing} className="bg-blue-500 hover:bg-blue-600">
            {processing ? <>
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                处理中...
              </> : <>
                <Play className="w-4 h-4 mr-2" />
                模拟事件
              </>}
          </Button>
          
          <Button onClick={resetSimulation} variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
            <RotateCcw className="w-4 h-4 mr-2" />
            重置
          </Button>
        </div>

        {lastResult && <div className={`p-4 rounded-lg ${lastResult.code === 0 ? 'bg-green-900/50 border-green-500' : 'bg-red-900/50 border-red-500'} border`}>
            <div className="flex items-center gap-2">
              {lastResult.code === 0 ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
              <span className={`font-semibold ${lastResult.code === 0 ? 'text-green-400' : 'text-red-400'}`}>
                {lastResult.message}
              </span>
            </div>
            {lastResult.data && <pre className="text-xs text-gray-300 mt-2 overflow-auto">
                {JSON.stringify(lastResult.data, null, 2)}
              </pre>}
          </div>}
      </CardContent>
    </Card>;
}