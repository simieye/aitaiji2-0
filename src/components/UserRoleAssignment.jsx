// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Search, UserPlus, UserMinus } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function UserRoleAssignment({
  $w,
  role,
  onAssignmentChange
}) {
  const [users, setUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await withRetry(() => $w.cloud.callDataSource({
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
      const allUsers = result.records || [];
      const assigned = allUsers.filter(user => user.roles?.includes(role._id));
      const unassigned = allUsers.filter(user => !user.roles?.includes(role._id));
      setAssignedUsers(assigned);
      setUsers(unassigned);
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
  const handleAssignUser = async user => {
    try {
      const updatedRoles = [...(user.roles || []), role._id];
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            roles: updatedRoles,
            updatedAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: user._id
              }
            }
          }
        }
      }));
      toast({
        title: "分配成功",
        description: `已将 ${user.name} 分配到角色 ${role.name}`,
        variant: "default"
      });
      loadUsers();
      if (onAssignmentChange) {
        onAssignmentChange();
      }
    } catch (error) {
      toast({
        title: "分配失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleUnassignUser = async user => {
    try {
      const updatedRoles = user.roles?.filter(roleId => roleId !== role._id) || [];
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            roles: updatedRoles,
            updatedAt: new Date()
          },
          filter: {
            where: {
              _id: {
                $eq: user._id
              }
            }
          }
        }
      }));
      toast({
        title: "移除成功",
        description: `已将 ${user.name} 从角色 ${role.name} 移除`,
        variant: "default"
      });
      loadUsers();
      if (onAssignmentChange) {
        onAssignmentChange();
      }
    } catch (error) {
      toast({
        title: "移除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const filteredUsers = users.filter(user => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredAssignedUsers = assignedUsers.filter(user => user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">用户角色分配</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="搜索用户..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 未分配用户 */}
          <div>
            <h3 className="text-white font-semibold mb-4">可分配用户</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredUsers.map(user => <div key={user._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                  <Button onClick={() => handleAssignUser(user)} size="sm" className="bg-green-500 hover:bg-green-600">
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>)}
              {filteredUsers.length === 0 && <div className="text-center py-8 text-gray-400">
                  没有可分配的用户
                </div>}
            </div>
          </div>

          {/* 已分配用户 */}
          <div>
            <h3 className="text-white font-semibold mb-4">已分配用户</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredAssignedUsers.map(user => <div key={user._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-gray-400 text-sm">{user.email}</div>
                  </div>
                  <Button onClick={() => handleUnassignUser(user)} size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>)}
              {filteredAssignedUsers.length === 0 && <div className="text-center py-8 text-gray-400">
                  没有已分配的用户
                </div>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}