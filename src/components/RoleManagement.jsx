// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, Shield, Crown, Users, Settings } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function RoleManagement({
  $w,
  onEditRole
}) {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: []
  });
  const {
    toast
  } = useToast();
  const loadRoles = async () => {
    try {
      // 获取角色数据
      const rolesResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            level: 'asc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      }));

      // 获取权限数据
      const permissionsResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_permission',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            category: 'asc'
          }, {
            level: 'asc'
          }],
          pageSize: 100,
          pageNumber: 1
        }
      }));

      // 获取用户角色关联数据以计算用户数量
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

      // 组合数据
      const rolesWithUserCount = (rolesResult.records || []).map(role => {
        const userCount = userRolesResult.records?.filter(ur => ur.roleId === role._id).length || 0;
        return {
          ...role,
          userCount,
          icon: getRoleIcon(role.name),
          displayName: role.displayName || role.name
        };
      });
      setRoles(rolesWithUserCount);
      setPermissions(permissionsResult.records || []);
    } catch (error) {
      toast({
        title: "加载角色失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    loadRoles();
  }, []);
  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.description) {
      toast({
        title: "信息不完整",
        description: "请填写角色名称和描述",
        variant: "destructive"
      });
      return;
    }
    try {
      // 创建角色
      const roleResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            name: newRole.name,
            displayName: newRole.displayName || newRole.name,
            description: newRole.description,
            permissions: newRole.permissions,
            userCount: 0,
            icon: 'settings',
            color: 'purple',
            level: roles.length + 1,
            isSystem: false,
            status: 'active',
            tags: []
          }
        }
      }));

      // 创建角色权限关联
      for (const permissionId of newRole.permissions) {
        await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_role_permission',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              roleId: roleResult.id,
              permissionId,
              grantedBy: $w.auth.currentUser?.userId || 'system',
              grantedAt: new Date(),
              isActive: true,
              conditions: {},
              scope: 'all',
              metadata: {}
            }
          }
        }));
      }
      setNewRole({
        name: '',
        displayName: '',
        description: '',
        permissions: []
      });
      setShowCreateModal(false);
      toast({
        title: "角色创建成功",
        description: `角色 ${newRole.name} 已创建`,
        variant: "default"
      });
      loadRoles();
    } catch (error) {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleDeleteRole = async roleId => {
    try {
      // 检查是否为系统角色
      const role = roles.find(r => r._id === roleId);
      if (role?.isSystem) {
        toast({
          title: "删除失败",
          description: "系统角色不能删除",
          variant: "destructive"
        });
        return;
      }

      // 删除角色权限关联
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role_permission',
        methodName: 'wedaBatchDeleteV2',
        params: {
          filter: {
            where: {
              roleId: {
                $eq: roleId
              }
            }
          }
        }
      }));

      // 删除用户角色关联
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_role',
        methodName: 'wedaBatchDeleteV2',
        params: {
          filter: {
            where: {
              roleId: {
                $eq: roleId
              }
            }
          }
        }
      }));

      // 删除角色
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: roleId
              }
            }
          }
        }
      }));
      toast({
        title: "角色删除成功",
        description: "角色已删除",
        variant: "default"
      });
      loadRoles();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const getRoleIcon = roleName => {
    switch (roleName) {
      case 'super_admin':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'user':
        return <Users className="w-5 h-5 text-gray-500" />;
      default:
        return <Settings className="w-5 h-5 text-purple-500" />;
    }
  };
  const togglePermission = permissionId => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId) ? prev.permissions.filter(p => p !== permissionId) : [...prev.permissions, permissionId]
    }));
  };
  return <div className="space-y-6">
      <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">角色管理</CardTitle>
              <CardDescription className="text-gray-300">管理系统角色和权限</CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              创建角色
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => <Card key={role._id} className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {role.icon}
                      <CardTitle className="text-white">{role.displayName}</CardTitle>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => onEditRole(role)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!role.isSystem && <Button onClick={() => handleDeleteRole(role._id)} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                          <Trash2 className="w-4 h-4" />
                        </Button>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4">{role.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">权限数量</span>
                      <Badge className="bg-blue-500 text-white">{role.permissions?.length || 0}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">用户数量</span>
                      <Badge className="bg-green-500 text-white">{role.userCount}</Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-gray-400 text-sm mb-2">主要权限:</div>
                    <div className="flex flex-wrap gap-1">
                      {(role.permissions || []).slice(0, 3).map(permission => <Badge key={permission} variant="outline" className="text-xs border-gray-600 text-gray-400">
                          {permissions.find(p => p.code === permission)?.name || permission}
                        </Badge>)}
                      {(role.permissions || []).length > 3 && <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                          +{(role.permissions || []).length - 3}
                        </Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </CardContent>
      </Card>

      {/* Create Role Modal */}
      {showCreateModal && <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">创建新角色</CardTitle>
              <CardDescription className="text-gray-300">配置角色名称和权限</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm text-gray-300">角色名称</label>
                <Input value={newRole.name} onChange={e => setNewRole({
              ...newRole,
              name: e.target.value
            })} placeholder="输入角色名称" className="bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-300">显示名称</label>
                <Input value={newRole.displayName} onChange={e => setNewRole({
              ...newRole,
              displayName: e.target.value
            })} placeholder="输入显示名称" className="bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <label className="text-sm text-gray-300">角色描述</label>
                <textarea value={newRole.description} onChange={e => setNewRole({
              ...newRole,
              description: e.target.value
            })} placeholder="输入角色描述" className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400" rows={3} />
              </div>
              <div>
                <label className="text-sm text-gray-300">权限配置</label>
                <div className="space-y-4 mt-2">
                  {permissions.map(permission => <div key={permission._id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{permission.name}</div>
                        <div className="text-gray-400 text-sm">{permission.category} - {permission.description}</div>
                      </div>
                      <input type="checkbox" checked={newRole.permissions.includes(permission.code)} onChange={() => togglePermission(permission.code)} className="w-4 h-4" />
                    </div>)}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateRole} className="flex-1 bg-red-500 hover:bg-red-600">
                  创建角色
                </Button>
                <Button onClick={() => setShowCreateModal(false)} variant="outline" className="flex-1 border-gray-600 text-white hover:bg-gray-700">
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>}
    </div>;
}