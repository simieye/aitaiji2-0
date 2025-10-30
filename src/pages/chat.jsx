// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Input, useToast, Badge } from '@/components/ui';
// @ts-ignore;
import { Send, Bot, User, Download, Settings, Trash2, Plus, History, Mic } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { ChatMessage } from '@/components/ChatMessage';
// @ts-ignore;
import { FileUpload } from '@/components/FileUpload';
// @ts-ignore;
import { QuickReplies } from '@/components/QuickReplies';
// @ts-ignore;
import { VoiceInput } from '@/components/VoiceInput';
// @ts-ignore;
import { AgentSelector } from '@/components/AgentSelector';
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
  const [isRecording, setIsRecording] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showAgentSelector, setShowAgentSelector] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [messageStatuses, setMessageStatuses] = useState({});
  const [playingAudio, setPlayingAudio] = useState(null);
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
      const sessionsResult = await withRetry(() => $w.cloud.callDataSource({
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
      }));
      setSessions(sessionsResult.records || []);

      // 如果有会话，加载最新消息
      if (sessionsResult.records && sessionsResult.records.length > 0) {
        const latestSession = sessionsResult.records[0];
        setCurrentSession(latestSession);
        setMessages(latestSession.messages || []);

        // 加载会话相关的代理
        if (latestSession.agent_ids && latestSession.agent_ids.length > 0) {
          await loadSessionAgents(latestSession.agent_ids);
        }
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
  const loadSessionAgents = async agentIds => {
    try {
      const agentsResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_agent',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              _id: {
                $in: agentIds
              }
            }
          },
          pageSize: 10,
          pageNumber: 1
        }
      }));
      setSelectedAgents(agentsResult.records || []);
    } catch (error) {
      console.error('加载会话代理失败:', error);
    }
  };
  const createNewSession = async () => {
    try {
      const newSession = {
        user_id: $w.auth.currentUser?.userId || 'anonymous',
        session_name: '新对话',
        agent_ids: [],
        messages: [],
        status: 'active',
        metadata: {},
        tags: []
      };
      const result = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_chat_session',
        methodName: 'wedaCreateV2',
        params: {
          data: newSession
        }
      }));
      const sessionWithId = {
        ...newSession,
        _id: result.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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
  const sendMessage = async (messageContent = inputMessage, messageType = 'text') => {
    if (!messageContent.trim() && messageType === 'text' || !currentSession) return;
    try {
      setSending(true);
      const messageId = Date.now().toString();

      // 添加用户消息
      const userMessage = {
        id: messageId,
        type: messageType,
        content: messageContent,
        timestamp: new Date().toISOString(),
        status: 'sending'
      };

      // 如果有文件，添加文件信息
      if (messageType === 'file' && uploadedFiles.length > 0) {
        userMessage.files = uploadedFiles;
      }
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setMessageStatuses(prev => ({
        ...prev,
        [messageId]: 'sending'
      }));
      if (messageType === 'text') {
        setInputMessage('');
      }

      // 更新会话消息
      await withRetry(() => $w.cloud.callDataSource({
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
      }));

      // 更新消息状态为已发送
      setMessageStatuses(prev => ({
        ...prev,
        [messageId]: 'sent'
      }));

      // 模拟 AI 回复
      setTimeout(async () => {
        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage = {
          id: aiMessageId,
          type: 'ai',
          content: generateAIResponse(messageContent, selectedAgents),
          timestamp: new Date().toISOString(),
          agent: selectedAgents.length > 0 ? selectedAgents[0].name : 'AI助手'
        };
        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);

        // 更新会话消息和标题
        const newTitle = messageContent.length > 20 ? messageContent.substring(0, 20) + '...' : messageContent;
        await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_chat_session',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              messages: finalMessages,
              session_name: newTitle,
              agent_ids: selectedAgents.map(a => a._id),
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
        }));

        // 记录聊天事件
        await withRetry(() => $w.cloud.callDataSource({
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
        }));
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
  const generateAIResponse = (message, agents) => {
    if (agents.length === 0) {
      const responses = ["基于太极哲学的分布式系统，我理解您的需求。让我为您分析一下...", "阴阳平衡的原则在这里体现得很明显。我们可以采用以下策略...", "考虑到您的业务场景，我建议使用我们的智能代理系统...", "从太极的角度来看，这个问题可以通过分布式工作流来解决...", "让我为您展示一个基于隐私联邦的解决方案..."];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // 根据选择的代理生成不同的回复
    const agentResponses = {
      'Interface': "从用户界面的角度来看，我建议采用响应式设计，确保在各种设备上都能提供良好的用户体验。",
      'Agent': "作为智能代理，我可以帮您协调多个任务，实现自动化的工作流程。",
      'Matrix': "从矩阵计算的角度，我们可以利用分布式计算来处理大规模数据。",
      'Kernel': "基于核心引擎的阴阳平衡算法，我们可以为您提供最优的解决方案。"
    };
    const primaryAgent = agents[0];
    return agentResponses[primaryAgent.name] || `${primaryAgent.name}: 我理解您的需求，让我为您提供专业的建议。`;
  };
  const switchSession = async session => {
    setCurrentSession(session);
    setMessages(session.messages || []);

    // 加载会话相关的代理
    if (session.agent_ids && session.agent_ids.length > 0) {
      await loadSessionAgents(session.agent_ids);
    } else {
      setSelectedAgents([]);
    }

    // 记录会话切换事件
    await withRetry(() => $w.cloud.callDataSource({
      dataSourceName: 'taiji_user_event',
      methodName: 'wedaCreateV2',
      params: {
        data: {
          user_id: $w.auth.currentUser?.userId || 'anonymous',
          event: 'chat_session_switch',
          event_category: 'engagement',
          event_action: 'switch',
          event_label: session.session_name,
          page_url: window.location.href,
          page_title: '聊天页面',
          timestamp: new Date().toISOString()
        }
      }
    }));
  };
  const deleteSession = async sessionId => {
    try {
      await withRetry(() => $w.cloud.callDataSource({
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
      }));
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
      const chatText = messages.map(msg => `${msg.type}: ${msg.content}`).join('\n\n');
      const blob = new Blob([chatText], {
        type: 'text/plain'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-${currentSession.session_name || 'conversation'}.txt`;
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
  const handleFileUpload = async fileData => {
    setUploadedFiles(prev => [...prev, fileData]);
    toast({
      title: "文件上传成功",
      description: `${fileData.name} 已添加到消息`
    });
  };
  const handleQuickReply = replyText => {
    setInputMessage(replyText);
    setShowQuickReplies(false);
  };
  const handleVoiceTranscript = transcript => {
    setInputMessage(transcript);
  };
  const handlePlayAudio = audioUrl => {
    if (playingAudio === audioUrl) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(audioUrl);
      // 这里可以添加音频播放逻辑
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
                <Plus className="w-4 h-4 mr-1" />
                新建
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {sessions.map(session => <div key={session._id} className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${currentSession?._id === session._id ? 'bg-red-500/20 border border-red-500' : 'hover:bg-gray-800/50'}`} onClick={() => switchSession(session)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{session.session_name || '新对话'}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-400 text-xs">
                        {new Date(session.updatedAt).toLocaleDateString()}
                      </p>
                      {session.agent_ids && session.agent_ids.length > 0 && <Badge className="bg-blue-500 text-white text-xs">
                          {session.agent_ids.length} 代理
                        </Badge>}
                    </div>
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
            <div className="flex items-center space-x-3">
              <h2 className="text-white font-semibold">
                {currentSession?.session_name || 'AI 太极助手'}
              </h2>
              {selectedAgents.length > 0 && <div className="flex items-center space-x-1">
                  {selectedAgents.slice(0, 3).map(agent => <Badge key={agent._id} className="bg-blue-500 text-white text-xs">
                      {agent.name}
                    </Badge>)}
                  {selectedAgents.length > 3 && <Badge className="bg-gray-500 text-white text-xs">
                      +{selectedAgents.length - 3}
                    </Badge>}
                </div>}
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-800" onClick={() => setShowAgentSelector(!showAgentSelector)}>
                <Bot className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-800" onClick={exportChat}>
                <Download className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 代理选择器 */}
          {showAgentSelector && <div className="p-4 border-b border-gray-700 bg-gray-800/50">
              <AgentSelector $w={$w} selectedAgents={selectedAgents} onAgentSelect={setSelectedAgents} currentSession={currentSession} />
            </div>}

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => <ChatMessage key={message.id} message={message} isUser={message.type === 'user'} timestamp={message.timestamp} status={messageStatuses[message.id]} onPlayAudio={handlePlayAudio} isPlaying={playingAudio === message.audioUrl} />)}
            <div ref={messagesEndRef} />
          </div>

          {/* 快捷回复 */}
          {showQuickReplies && <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <QuickReplies onReply={handleQuickReply} />
            </div>}

          {/* 文件上传 */}
          {showFileUpload && <div className="p-4 border-t border-gray-700 bg-gray-800/50">
              <FileUpload onFileUpload={handleFileUpload} />
            </div>}

          {/* 输入区域 */}
          <div className="p-4 border-t border-gray-700">
            <div className="space-y-3">
              {/* 工具栏 */}
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-800" onClick={() => setShowFileUpload(!showFileUpload)}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-gray-600 text-white hover:bg-gray-800" onClick={() => setShowQuickReplies(!showQuickReplies)}>
                  <History className="w-4 h-4" />
                </Button>
                <VoiceInput onTranscript={handleVoiceTranscript} isRecording={isRecording} setIsRecording={setIsRecording} />
              </div>
              
              {/* 输入框 */}
              <div className="flex items-center space-x-2">
                <Input type="text" placeholder="输入您的问题..." value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMessage()} className="flex-1 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400" disabled={sending} />
                <Button onClick={() => sendMessage()} disabled={!inputMessage.trim() || sending} className="bg-red-500 hover:bg-red-600">
                  {sending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Send className="w-4 h-4" />}
                </Button>
              </div>
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