// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Send, Bot, User, Download, Settings, Trash2 } from 'lucide-react';

export default function ChatPage(props) {
  const {
    $w,
    style
  } = props;
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadChatData();
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const loadChatData = async () => {
    try {
      setLoading(true);

      // 加载用户的聊天会话
      const sessionsResult = await $w.cloud.callDataSource({
        dataSourceName: 'taiji_chat_session',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              user_id: {
                $eq: $w.auth.currentUser?.userId || 'anonymous'
              }
            }
          },
          orderBy: [{
            updatedAt: 'desc'
          }],
          pageSize: 20,
          pageNumber: 1
        }
      });
      setSessions(sessionsResult.records || []);

      // 如果有会话，加载最新消息
      if (sessionsResult.records && sessionsResult.records.length > 0) {
        const latestSession = sessionsResult.records[0];
        setCurrentSession(latestSession);
        setMessages(latestSession.messages || []);
      } else {
        // 创建新会话
        await createNewSession();
      }
      setLoading(false);
    } catch (error) {
      toast({
        title: "加载失败",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  const createNewSession = async () => {
    try {
      const newSession = {
        user_id: $w.auth.currentUser?.userId || 'anonymous',
        title: '新对话',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'taiji_chat_session',
        methodName: 'wedaCreateV2',
        params: {
          data: newSession
        }
      });
      const sessionWithId = {
        ...newSession,
        _id: result.id
      };
      setCurrentSession(sessionWithId);
      setSessions(prev => [sessionWithId, ...prev]);
      setMessages([]);
    } catch (error) {
      toast({
        title: "创建会话失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSession) return;
    try {
      setSending(true);

      // 添加用户消息
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: inputMessage,
        timestamp: new Date().toISOString()
      };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputMessage('');

      // 更新会话消息
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_chat_session',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            messages: updatedMessages,
            updatedAt: new Date().toISOString()
          },
          filter: {
            where: {
              _id: {
                $eq: currentSession._id
              }
            }
          }
        }
      });

      // 模拟 AI 回复
      setTimeout(async () => {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateAIResponse(inputMessage),
          timestamp: new Date().toISOString()
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);

        // 更新会话消息和标题
        const newTitle = inputMessage.length > 20 ? inputMessage.substring(0, 20) + '...' : inputMessage;
        await $w.cloud.callDataSource({
          dataSourceName: 'taiji_chat_session',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              messages: finalMessages,
              title: newTitle,
              updatedAt: new Date().toISOString()
            },
            filter: {
              where: {
                _id: {
                  $eq: currentSession._id
                }
              }
            }
          }
        });

        // 记录聊天事件
        await $w.cloud.callDataSource({
          dataSourceName: 'taiji_user_event',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              user_id: $w.auth.currentUser?.userId || 'anonymous',
              event: 'chat_message',
              event_category: 'engagement',
              event_action: 'send',
              event_label: 'user_message',
              page_url: window.location.href,
              page_title: '聊天页面',
              timestamp: new Date().toISOString()
            }
          }
        });
      }, 1000);
      setSending(false);
    } catch (error) {
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive"
      });
      setSending(false);
    }
  };
  const generateAIResponse = message => {
    const responses = ["基于太极哲学的分布式系统，我理解您的需求。让我为您分析一下...", "阴阳平衡的原则在这里体现得很明显。我们可以采用以下策略...", "考虑到您的业务场景，我建议使用我们的智能代理系统...", "从太极的角度来看，这个问题可以通过分布式工作流来解决...", "让我为您展示一个基于隐私联邦的解决方案..."];
    return responses[Math.floor(Math.random() * responses.length)];
  };
  const switchSession = async session => {
    setCurrentSession(session);
    setMessages(session.messages || []);

    // 记录会话切换事件
    await $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'chat_session_switch',
          event_category: 'engagement',
          event_action: 'switch',
          event_label: session.title,
          page_url: window.location.href,
          page_title: '聊天页面',
          timestamp: new Date().toISOString()
        }
      }
    });
  };
  const deleteSession = async sessionId => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_chat_session',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: sessionId
              }
            }
          }
        }
      });
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      if (currentSession?._id === sessionId) {
        if (sessions.length > 1) {
          const nextSession = sessions.find(s => s._id !== sessionId);
          switchSession(nextSession);
        } else {
          await createNewSession();
        }
      }
      toast({
        title: "会话已删除",
        description: "聊天会话已成功删除"
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const exportChat = async () => {
    if (!currentSession || messages.length === 0) return;
    try {
      const chatText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
      const blob = new Blob([chatText], {
        type: 'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${currentSession.title || 'conversation'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "导出成功",
        description: "聊天记录已导出为文本文件"
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4">正在加载聊天数据...</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-4 h-screen flex">
        {/* 左侧会话列表 */}
        <div className="w-80 bg-gray-900/50 backdrop-blur border-r border-gray-700 rounded-l-lg flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold">会话历史</h2>
              <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-800" onClick={createNewSession}>
                新建
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {sessions.map(session => <div key={session._id} className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${currentSession?._id === session._id ? 'bg-red-500/20 border border-red-500' : 'hover:bg-gray-800/50'}`} onClick={() => switchSession(session)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{session.title || '新对话'}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-red-400 ml-2" onClick={e => {
                e.stopPropagation();
                deleteSession(session._id);
              }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>)}
          </div>
        </div>

        {/* 右侧聊天区域 */}
        <div className="flex-1 bg-gray-900/50 backdrop-blur border border-gray-700 rounded-r-lg flex flex-col">
          {/* 聊天头部 */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-white font-semibold">
              {currentSession?.title || 'AI 太极助手'}
            </h2>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-800" onClick={exportChat}>
                <Download className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === 'user' ? 'bg-red-500 text-white' : 'bg-gray-700 text-white'}`}>
                  <div className="flex items-start">
                    {message.role === 'assistant' && <Bot className="w-5 h-5 mr-2 flex-shrink-0" />}
                    {message.role === 'user' && <User className="w-5 h-5 ml-2 flex-shrink-0 order-last" />}
                    <div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>)}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <Input type="text" placeholder="输入您的问题..." value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400" disabled={sending} />
              <Button onClick={sendMessage} disabled={!inputMessage.trim() || sending} className="bg-red-500 hover:bg-red-600">
                {sending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>;
}