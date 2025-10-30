// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, useToast } from '@/components/ui';
// @ts-ignore;
import { MessageCircle, Send, ThumbsUp, User } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function CommentSection({
  articleId,
  $w,
  userId
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadComments();
  }, [articleId]);
  const loadComments = async () => {
    try {
      setLoading(true);
      // 模拟评论数据
      const mockComments = [{
        _id: '1',
        userId: 'user1',
        userName: '张三',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        content: '这篇文章写得很好，对我很有帮助！',
        createdAt: new Date('2024-01-15T10:30:00'),
        likes: 12,
        replies: [{
          _id: '1-1',
          userId: 'user2',
          userName: '李四',
          userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
          content: '同感，特别是关于AI应用的部分。',
          createdAt: new Date('2024-01-15T11:00:00'),
          likes: 5
        }]
      }, {
        _id: '2',
        userId: 'user3',
        userName: '王五',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
        content: '期待更多这样的技术分享文章。',
        createdAt: new Date('2024-01-14T15:20:00'),
        likes: 8,
        replies: []
      }];
      setComments(mockComments);
      setLoading(false);
    } catch (error) {
      console.error('加载评论失败:', error);
      setLoading(false);
    }
  };
  const handleSubmitComment = async e => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast({
        title: "评论内容不能为空",
        variant: "destructive"
      });
      return;
    }
    try {
      setSubmitting(true);

      // 记录评论事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            event: 'article_comment',
            event_category: 'engagement',
            event_label: articleId,
            timestamp: new Date(),
            metadata: {
              comment: newComment.trim()
            }
          }
        }
      }));

      // 添加新评论到列表
      const comment = {
        _id: Date.now().toString(),
        userId: userId,
        userName: $w.auth.currentUser?.nickName || '匿名用户',
        userAvatar: $w.auth.currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        content: newComment.trim(),
        createdAt: new Date(),
        likes: 0,
        replies: []
      };
      setComments([comment, ...comments]);
      setNewComment('');
      toast({
        title: "评论发布成功",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "评论发布失败",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleLikeComment = async commentId => {
    try {
      // 记录点赞评论事件
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            event: 'comment_like',
            event_category: 'engagement',
            event_label: commentId,
            timestamp: new Date()
          }
        }
      }));
      setComments(comments.map(comment => {
        if (comment._id === commentId) {
          return {
            ...comment,
            likes: comment.likes + 1
          };
        }
        return comment;
      }));
    } catch (error) {
      console.error('点赞评论失败:', error);
    }
  };
  const formatDate = dateString => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString('zh-CN');
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          评论 ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="写下你的评论..." rows={3} className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
            <Button type="submit" disabled={submitting} className="bg-red-500 hover:bg-red-600">
              {submitting ? '发布中...' : '发布评论'}
              <Send className="w-4 h-4 ml-2" />
            </Button>
          </form>
          
          {/* Comments List */}
          <div className="space-y-4">
            {loading ? <div className="text-center py-8">
                <div className="text-gray-400">加载评论中...</div>
              </div> : comments.length === 0 ? <div className="text-center py-8">
                <div className="text-gray-400">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>暂无评论，快来发表第一条评论吧！</p>
                </div>
              </div> : comments.map(comment => <div key={comment._id} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <img src={comment.userAvatar} alt={comment.userName} className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="text-white font-medium">{comment.userName}</div>
                          <div className="text-gray-400 text-xs">{formatDate(comment.createdAt)}</div>
                        </div>
                        <Button onClick={() => handleLikeComment(comment._id)} variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {comment.likes}
                        </Button>
                      </div>
                      <p className="text-gray-300">{comment.content}</p>
                      
                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && <div className="mt-4 space-y-3">
                          {comment.replies.map(reply => <div key={reply._id} className="flex items-start space-x-3 pl-4 border-l-2 border-gray-700">
                              <img src={reply.userAvatar} alt={reply.userName} className="w-8 h-8 rounded-full" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <div>
                                    <div className="text-white text-sm font-medium">{reply.userName}</div>
                                    <div className="text-gray-400 text-xs">{formatDate(reply.createdAt)}</div>
                                  </div>
                                </div>
                                <p className="text-gray-300 text-sm">{reply.content}</p>
                              </div>
                            </div>)}
                        </div>}
                    </div>
                  </div>
                </div>)}
          </div>
        </div>
      </CardContent>
    </Card>;
}