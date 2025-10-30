// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { Bot, User, Check, CheckCheck, Clock, FileText, Download, Play, Pause } from 'lucide-react';

export function ChatMessage({
  message,
  isUser,
  timestamp,
  status,
  onPlayAudio,
  isPlaying
}) {
  const [showFullContent, setShowFullContent] = useState(false);
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };
  const formatTime = timestamp => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const renderContent = () => {
    if (message.type === 'file') {
      return <div className="bg-gray-800/50 rounded-lg p-3 flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-500" />
          <div className="flex-1">
            <div className="text-white font-medium">{message.fileName}</div>
            <div className="text-gray-400 text-sm">{message.fileSize}</div>
          </div>
          <Download className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
        </div>;
    }
    if (message.type === 'audio') {
      return <div className="bg-gray-800/50 rounded-lg p-3 flex items-center space-x-3">
          <button onClick={() => onPlayAudio && onPlayAudio(message.audioUrl)} className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <div className="flex-1">
            <div className="bg-gray-700 h-1 rounded-full">
              <div className="bg-red-500 h-1 rounded-full" style={{
              width: '30%'
            }} />
            </div>
          </div>
          <div className="text-gray-400 text-sm">0:15</div>
        </div>;
    }
    const content = message.content || '';
    const shouldTruncate = content.length > 200 && !showFullContent;
    return <div>
        <p className="text-white whitespace-pre-wrap">
          {shouldTruncate ? content.substring(0, 200) + '...' : content}
        </p>
        {shouldTruncate && <button onClick={() => setShowFullContent(true)} className="text-blue-400 text-sm hover:text-blue-300 mt-1">
            显示更多
          </button>}
      </div>;
  };
  return <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-red-500' : 'bg-blue-500'}`}>
            {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
          </div>
          <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
            {!isUser && message.agent && <div className="text-blue-400 text-xs mb-1">{message.agent}</div>}
            <Card className={`inline-block ${isUser ? 'bg-red-500' : 'bg-gray-800'} border-none`}>
              <CardContent className="p-3">
                {renderContent()}
              </CardContent>
            </Card>
            <div className={`flex items-center space-x-2 mt-1 text-xs ${isUser ? 'justify-end' : ''}`}>
              <span className="text-gray-400">{formatTime(timestamp)}</span>
              {isUser && getStatusIcon()}
            </div>
          </div>
        </div>
      </div>
    </div>;
}