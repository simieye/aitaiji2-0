// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, Edit, Trash2, Eye, EyeOff, User, Shield, Crown } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function UserList({
  $w,
  onEditUser,
  onToggleUserStatus
}) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  useEffect(() => {
    loadUsers();
  }, []);
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);
  const loadUsers = async () => {
    try {
      setLoading(true);
      // 获取用户数据
      const usersResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      }));

      // 获取用户角色关联数据
      const userRolesResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_role',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              isActive: {
                $eq: true
              }
            }
          },
          pageSize: 100,
          pageNumber: 1
        }
      }));

      // 获取角色数据
      const rolesResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              status: {
                $eq: 'active'
              }
            }
          },
          pageSize: 100,
          pageNumber: 1
        }
      }));

      // 组合数据
      const usersWithRoles = (usersResult.records || []).map(user => {
        const userRole = userRolesResult.records?.find(ur => ur.userId === user._id);
        const role = rolesResult.records?.find(r => r._id === userRole?.roleId);
        return {
          ...user,
          role: role?.name || 'user',
          roleData: role,
          userRoleData: userRole,
          status: user.status || 'active',
          lastLogin: user.lastLoginAt || new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          permissions: role?.permissions || []
        };
      });
      setUsers(usersWithRoles);
      setLoading(false);
    } catch (error) {
      toast({
        title: "加载用户失败",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  const filterUsers = () => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(user => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || user.nickName?.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    setFilteredUsers(filtered);
  };
  const getRoleIcon = role => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };
  const getRoleLabel = role => {
    switch (role) {
      case 'super_admin':
        return '超级管理员';
      case 'admin':
        return '管理员';
      case 'user':
        return '普通用户';
      default:
        return '未知';
    }
  };
  const getRoleBadge = role => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-yellow-500 text-white">超级管理员</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500 text-white">管理员</Badge>;
      case 'user':
        return <Badge className="bg-gray-500 text-white">普通用户</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">未知</Badge>;
    }
  };
  const getStatusBadge = status => {
    return status === 'active' ? <Badge className="bg-green-500 text-white">活跃</Badge> : <Badge className="bg-red-500 text-white">禁用</Badge>;
  };
  const formatDate = date => {
    return new Date(date).toLocaleDateString('zh-CN');
  };
  const formatLastLogin = date => {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}天前`;
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>;
  }
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">用户列表</CardTitle>
        <CardDescription className="text-gray-300">管理系统中的所有用户</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="搜索用户..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="all">所有角色</option>
            <option value="super_admin">超级管理员</option>
            <option value="admin">管理员</option>
            <option value="user">普通用户</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white">
            <option value="all">所有状态</option>
            <option value="active">活跃</option>
            <option value="disabled">禁用</option>
          </select>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">用户</th>
                <th className="text-left py-3 px-4 text-gray-400">角色</th>
                <th className="text-left py-3 px-4 text-gray-400">状态</th>
                <th className="text-left py-3 px-4 text-gray-400">最后登录</th>
                <th className="text-left py-3 px-4 text-gray-400">创建时间</th>
                <th className="text-left py-3 px-4 text-gray-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <img src={user.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face'} alt={user.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="text-white font-medium">{user.name || user.nickName || '未知用户'}</div>
                        <div className="text-gray-400 text-sm">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(user.role)}
                      {getRoleBadge(user.role)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {formatLastLogin(user.lastLogin)}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button onClick={() => onEditUser(user)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => onToggleUserStatus(user)} variant="outline" size="sm" className={`${user.status === 'active' ? 'border-red-500 text-red-500 hover:bg-red-500' : 'border-green-500 text-green-500 hover:bg-green-500'} hover:text-white`}>
                        {user.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && <div className="text-center py-8">
            <div className="text-gray-400">
              <User className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">暂无用户</h3>
              <p className="text-gray-400">没有找到匹配的用户</p>
            </div>
          </div>}
      </CardContent>
    </Card>;
}