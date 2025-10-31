// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Shield, Users, Settings } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { RoleCard } from '@/components/RoleCard';
// @ts-ignore;
import { PermissionMatrix } from '@/components/PermissionMatrix';
// @ts-ignore;
import { UserRoleAssignment } from '@/components/UserRoleAssignment';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
function RolesContent(props) {
  const {
    $w,
    style
  } = props;
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(false);
  const [showUserAssignment, setShowUserAssignment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    level: 'user',
    permissions: []
  });
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();

  // 获取实验变体
  const layoutExperiment = useExperiment('roles_layout');
  const managementExperiment = useExperiment('role_management');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadRolesData, 30000);
  useEffect(() => {
    loadRolesData();
  }, []);
  const loadRolesData = async () => {
    try {
      setLoading(true);
      const result = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role',
        methodName: 'wedaGetRecordsV2',
        params: {
          orderBy: [{
            level: 'asc'
          }],
          pageSize: 50,
          pageNumber: 1
        }
      }));
      const rolesWithCounts = await Promise.all((result.records || []).map(async role => {
        const userCount = await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_user',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                roles: {
                  $eq: role._id
                }
              }
            },
            getCount: true,
            pageSize: 1,
            pageNumber: 1
          }
        }));
        return {
          ...role,
          userCount: userCount.total || 0
        };
      }));
      setRoles(rolesWithCounts);
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
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            ...newRole,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }
      }));
      toast({
        title: "创建成功",
        description: `角色 ${newRole.name} 已创建`,
        variant: "default"
      });
      setShowCreateModal(false);
      setNewRole({
        name: '',
        description: '',
        level: 'user',
        permissions: []
      });
      loadRolesData();
    } catch (error) {
      toast({
        title: "创建失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleUpdateRole = async (roleId, updates) => {
    try {
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            ...updates,
            updatedAt: new Date()
          },
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
        title: "更新成功",
        description: "角色信息已更新",
        variant: "default"
      });
      loadRolesData();
    } catch (error) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleDeleteRole = async role => {
    if (role.name === 'admin') {
      toast({
        title: "无法删除",
        description: "管理员角色不能删除",
        variant: "destructive"
      });
      return;
    }
    try {
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: role._id
              }
            }
          }
        }
      }));
      toast({
        title: "删除成功",
        description: `角色 ${role.name} 已删除`,
        variant: "default"
      });
      loadRolesData();
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleViewRole = role => {
    setSelectedRole(role);
    setShowPermissionMatrix(true);
  };
  const handleEditRole = role => {
    setSelectedRole(role);
    setShowCreateModal(true);
    setNewRole({
      name: role.name,
      description: role.description,
      level: role.level,
      permissions: role.permissions || []
    });
  };
  const handlePermissionToggle = async permission => {
    if (!selectedRole) return;
    const currentPermissions = selectedRole.permissions || [];
    const updatedPermissions = currentPermissions.includes(permission) ? currentPermissions.filter(p => p !== permission) : [...currentPermissions, permission];
    await handleUpdateRole(selectedRole._id, {
      permissions: updatedPermissions
    });
    setSelectedRole({
      ...selectedRole,
      permissions: updatedPermissions
    });
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4 text-sm sm:text-base">{t('common.loading')}</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{t('roles.title', '角色管理')}</h1>
            <p className="text-gray-300 text-sm sm:text-base">{t('roles.description', '管理系统角色和权限分配')}</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            {t('roles.create', '创建角色')}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('roles.totalRoles', '总角色数')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{roles.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('roles.totalUsers', '总用户数')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">{roles.reduce((sum, role) => sum + (role.userCount || 0), 0)}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center text-sm sm:text-base">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t('roles.permissions', '权限项')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-white">15</div>
            </CardContent>
          </Card>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {roles.map(role => <RoleCard key={role._id} role={role} onEdit={handleEditRole} onDelete={handleDeleteRole} onView={handleViewRole} />)}
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
            <Card className="bg-gray-900 border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="text-white text-lg sm:text-xl">{selectedRole ? t('roles.edit', '编辑角色') : t('roles.create', '创建角色')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300">{t('roles.roleName', '角色名称')}</label>
                  <input type="text" value={newRole.name} onChange={e => setNewRole({
                ...newRole,
                name: e.target.value
              })} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm sm:text-base" />
                </div>
                <div>
                  <label className="text-sm text-gray-300">{t('roles.roleDescription', '角色描述')}</label>
                  <textarea value={newRole.description} onChange={e => setNewRole({
                ...newRole,
                description: e.target.value
              })} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm sm:text-base" rows={3} />
                </div>
                <div>
                  <label className="text-sm text-gray-300">{t('roles.roleLevel', '角色级别')}</label>
                  <select value={newRole.level} onChange={e => setNewRole({
                ...newRole,
                level: e.target.value
              })} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm sm:text-base">
                    <option value="user">{t('roles.user', '普通用户')}</option>
                    <option value="manager">{t('roles.manager', '管理员')}</option>
                    <option value="admin">{t('roles.admin', '超级管理员')}</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={handleCreateRole} className="flex-1 bg-red-500 hover:bg-red-600 text-sm sm:text-base">
                    {selectedRole ? t('common.update', '更新') : t('common.create', '创建')}
                  </Button>
                  <Button variant="outline" onClick={() => {
                setShowCreateModal(false);
                setSelectedRole(null);
                setNewRole({
                  name: '',
                  description: '',
                  level: 'user',
                  permissions: []
                });
              }} className="flex-1 text-sm sm:text-base">
                    {t('common.cancel', '取消')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>}

        {/* Permission Matrix Modal */}
        {showPermissionMatrix && selectedRole && <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedRole.name} - {t('roles.permissions', '权限管理')}</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={() => setShowUserAssignment(true)} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 text-sm sm:text-base">
                    {t('roles.userAssignment', '用户分配')}
                  </Button>
                  <Button onClick={() => {
                setShowPermissionMatrix(false);
                setSelectedRole(null);
              }} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 text-sm sm:text-base">
                    {t('common.close', '关闭')}
                  </Button>
                </div>
              </div>
              <PermissionMatrix role={selectedRole} permissions={[]} onPermissionToggle={handlePermissionToggle} />
            </div>
          </div>}

        {/* User Assignment Modal */}
        {showUserAssignment && selectedRole && <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border-gray-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">{selectedRole.name} - {t('roles.userAssignment', '用户分配')}</h2>
                <Button onClick={() => {
              setShowUserAssignment(false);
            }} variant="outline" className="border-gray-600 text-white hover:bg-gray-700 text-sm sm:text-base">
                  {t('common.close', '关闭')}
                </Button>
              </div>
              <UserRoleAssignment $w={$w} role={selectedRole} onAssignmentChange={loadRolesData} />
            </div>
          </div>}
      </div>
    </div>;
}
export default function RolesPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <RolesContent {...props} />
    </ExperimentProvider>;
}