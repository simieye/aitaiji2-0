// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { MessageSquare, Zap, HelpCircle, Lightbulb } from 'lucide-react';

export function QuickReplies({
  onReply,
  templates = []
}) {
  const defaultTemplates = [{
    id: 'greeting',
    text: '你好，我想了解一下AI太极的功能',
    icon: <MessageSquare className="w-4 h-4" />,
    category: '常用'
  }, {
    id: 'capabilities',
    text: 'AI太极有哪些核心能力？',
    icon: <Zap className="w-4 h-4" />,
    category: '功能'
  }, {
    id: 'help',
    text: '如何开始使用AI太极？',
    icon: <HelpCircle className="w-4 h-4" />,
    category: '帮助'
  }, {
    id: 'suggestion',
    text: '给我一些建议和最佳实践',
    icon: <Lightbulb className="w-4 h-4" />,
    category: '建议'
  }];
  const quickReplies = templates.length > 0 ? templates : defaultTemplates;
  const categories = [...new Set(quickReplies.map(reply => reply.category))];
  return <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <MessageSquare className="w-5 h-5 text-red-500" />
        <h3 className="text-white font-medium">快捷回复</h3>
      </div>
      
      {categories.map(category => <div key={category} className="space-y-2">
          <div className="text-gray-400 text-sm font-medium">{category}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickReplies.filter(reply => reply.category === category).map(reply => <Button key={reply.id} onClick={() => onReply && onReply(reply.text)} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 justify-start text-left">
                <div className="flex items-center space-x-2">
                  {reply.icon}
                  <span className="text-sm">{reply.text}</span>
                </div>
              </Button>)}
          </div>
        </div>)}
    </div>;
}