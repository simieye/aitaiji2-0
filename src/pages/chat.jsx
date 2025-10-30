// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Send, Bot, User, Mic, MicOff, Paperclip, Smile } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
function ChatContent(props) {
  const {
    $w,
    style
  } = props;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const {
    toast
  } = useToast();

  // 获取实验变体
  const chatExperiment = useExperiment('chat_interface');
  const aiExperiment = useExperiment('ai_response');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadChatData, 30000);
  useEffect(() => {
    loadChatData();
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const loadChatData = async () => {
    try {
      setLoading(true);
      const [sessionsResult, messagesResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_chat_session',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'anonymous'
              }
            }
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 20,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_chat_session',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: $w.auth.currentUser?.userId || 'anonymous'
              },
              status: {
                $eq: 'active'
              }
            }
          },
          pageSize: 1,
          pageNumber: 1
        }
      }))]);
      setSessions(sessionsResult.records || []);
      if (messagesResult.records && messagesResult.records.length > 0) {
        setCurrentSession(messagesResult.records[0]);
        // 加载该会话的消息
        await loadSessionMessages(messagesResult.records[0]._id);
      } else {
        // 创建新会话
        await createNewSession();
      }
      setLoading(false);
    } catch (error) {
      toast({
        title: "数据加载失败",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  const loadSessionMessages = async sessionId => {
    try {
      // 这里应该从消息表加载消息，暂时使用模拟数据
      const mockMessages = [{
        id: '1',
        type: 'user',
        content: '你好，我想了解AI太极的功能',
        timestamp: Date.now() - 60000
      }, {
        id: '2',
        type: 'bot',
        content: '您好！我是AI太极的智能助手。我可以帮您了解我们的产品功能，包括智能代理、工作流自动化等。请问您想了解哪个方面？',
        timestamp: Date.now() - 50000
      }];
      setMessages(mockMessages);
    } catch (error) {
      console.error('加载消息失败:', error);
    }
  };
  const createNewSession = async () => {
    try {
      const session = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_chat_session',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            userId: $w.auth.currentUser?.userId || 'anonymous',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      }));
      setCurrentSession(session);
      setMessages([]);
    } catch (error) {
      toast({
        title: "创建会话失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: Date.now()
    };
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    try {
      // 模拟AI响应
      setTimeout(() => {
        const botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: generateAIResponse(inputMessage),
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 2000);
    } catch (error) {
      setIsTyping(false);
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const generateAIResponse = userMessage => {
    const responses = ['这是一个很好的问题！让我为您详细解答...', '根据您的需求，我推荐您了解我们的智能代理功能。', '我可以帮您了解更多关于AI太极的信息。请问您具体想了解什么？', '感谢您的咨询！我们的产品确实具有这些功能。'];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "录音开始",
        description: "正在录音...",
        variant: "default"
      });
    } else {
      toast({
        title: "录音结束",
        description: "正在转换语音为文字...",
        variant: "default"
      });
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载聊天界面...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center py-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              AI太极助手
              <span className="text-red-500">智能对话</span>
            </h1>
            <p className="text-gray-300">随时为您提供专业的AI咨询服务</p>
          </div>

          {/* Chat Container */}
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                智能对话
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Messages */}
              <div className="h-96 overflow-y-auto mb-4 space-y-4">
                {messages.map(message => <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2 max-w-xs ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-blue-500' : 'bg-red-500'}`}>
                        {message.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`p-3 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-300'}`}>
                        {message.content}
                      </div>
                    </div>
                  </div>)}
                {isTyping && <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="p-3 rounded-lg bg-gray-800 text-gray-300">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                        animationDelay: '0.1s'
                      }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                        animationDelay: '0.2s'
                      }}></div>
                        </div>
                      </div>
                    </div>
                  </div>}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="输入您的问题..." className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
                <Button variant="outline" size="sm" onClick={toggleRecording} className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'border-gray-600 text-white hover:bg-gray-700'}`}>
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button onClick={handleSendMessage} className="bg-red-500 hover:bg-red-600">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Button onClick={() => setInputMessage('介绍一下AI太极的功能')} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
              了解功能
            </Button>
            <Button onClick={() => setInputMessage('如何开始使用？')} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
              使用指南
            </Button>
            <Button onClick={() => setInputMessage('联系客服')} variant="outline" className="border-gray-600 text-white hover:bg-gray-700">
              联系客服
            </Button>
          </div>
        </div>
      </div>
    </div>;
}
export default function ChatPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <ChatContent {...props} />
    </ExperimentProvider>;
}