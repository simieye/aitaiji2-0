// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Users, Shield, Settings, RefreshCw, AlertTriangle } from 'lucide-react';

// @ts-ignore;
import { ExperimentProvider, useExperiment } from '@/components/ExperimentProvider';
// @ts-ignore;
import { useAutoRefresh } from '@/components/AutoRefresh';
// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { UserList } from '@/components/UserList';
// @ts-ignore;
import { RoleManagement } from '@/components/RoleManagement';
// @ts-ignore;
import { PermissionMatrix } from '@/components/PermissionMatrix';
// @ts-ignore;
import { useLanguage } from '@/components/LanguageContext';
function PermissionsContent(props) {
  const {
    $w,
    style
  } = props;
  const [activeTab, setActiveTab] = useState('users');
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    permissionChanges: 0
  });
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();

  // 获取实验变体
  const layoutExperiment = useExperiment('permissions_layout');
  const permissionExperiment = useExperiment('permission_display');

  // 自动刷新
  const {
    startAutoRefresh,
    stopAutoRefresh
  } = useAutoRefresh(loadPermissionsData, 30000);
  useEffect(() => {
    loadPermissionsData();
  }, []);
  const loadPermissionsData = async () => {
    try {
      setLoading(true);
      // 并行获取所有数据
      const [usersResult, rolesResult, userRolesResult, rolePermissionsResult] = await Promise.all([withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_role',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      })), withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role_permission',
        methodName: 'wedaGetRecordsV2',
        params: {
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      }))]);

      // 计算统计数据
      const activeUsers = (usersResult.records || []).filter(user => user.status === 'active').length;
      const totalRoles = rolesResult.total || 0;
      const permissionChanges = (rolePermissionsResult.records || []).filter(rp => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return new Date(rp.grantedAt) >= today;
      }).length;

      // 组合用户数据
      const usersWithRoles = (usersResult.records || []).map(user => {
        const userRole = userRolesResult.records?.find(ur => ur.userId === user._id && ur.isActive);
        const role = rolesResult.records?.find(r => r._id === userRole?.roleId);
        return {
          ...user,
          role: role?.name || 'user',
          roleData: role,
          userRoleData: userRole,
          status: user.status || 'active'
        };
      });

      // 组合角色数据
      const rolesWithUserCount = (rolesResult.records || []).map(role => {
        const userCount = userRolesResult.records?.filter(ur => ur.roleId === role._id && ur.isActive).length || 0;
        return {
          ...role,
          userCount,
          displayName: role.displayName || role.name,
          icon: getRoleIcon(role.name)
        };
      });
      setUsers(usersWithRoles);
      setRoles(rolesWithUserCount);
      setStats({
        totalUsers: usersResult.total || 0,
        activeUsers,
        totalRoles,
        permissionChanges
      });
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
  const handleEditUser = user => {
    toast({
      title: "编辑用户",
      description: `正在编辑用户: ${user.name || user.nickName}`,
      variant: "default"
    });
  };
  const handleToggleUserStatus = async user => {
    try {
      const newStatus = user.status === 'active' ? 'disabled' : 'active';
      await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            status: newStatus,
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
      setUsers(users.map(u => u._id === user._id ? {
        ...u,
        status: newStatus
      } : u));
      toast({
        title: "状态更新成功",
        description: `用户 ${user.name || user.nickName} 已${newStatus === 'active' ? '启用' : '禁用'}`,
        variant: "default"
      });
      loadPermissionsData();
    } catch (error) {
      toast({
        title: "状态更新失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleEditRole = role => {
    toast({
      title: "编辑角色",
      description: `正在编辑角色: ${role.displayName || role.name}`,
      variant: "default"
    });
  };
  const handlePermissionChange = (roleId, permissions) => {
    toast({
      title: "权限更新成功",
      description: "角色权限已更新",
      variant: "default"
    });
    loadPermissionsData();
  };
  const getRoleIcon = roleName => {
    switch (roleName) {
      case 'super_admin':
        return <Shield className="w-5 h-5 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'user':
        return <Users className="w-5 h-5 text-gray-500" />;
      default:
        return <Settings className="w-5 h-5 text-purple-500" />;
    }
  };
  if (loading) {
    return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-b-2 border-red-500 mx-auto"></div>
            <p className="text-white mt-4 text-sm sm:text-base">{t('common.loading', '加载中...')}</p>
          </div>
        </div>
      </div>;
  }
  return <div style={style} className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{t('nav.permissions', '权限管理')}</h1>
            <p className="text-gray-300 text-sm sm:text-base">管理系统用户、角色和权限配置</p>
          </div>
          <Button onClick={loadPermissionsData} className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新数据
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">总用户数</CardTitle>
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalUsers}</div>
              <p className="text-xs text-gray-500">注册用户</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">活跃用户</CardTitle>
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.activeUsers}</div>
              <p className="text-xs text-gray-500">当前活跃</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">角色数量</CardTitle>
              <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalRoles}</div>
              <p className="text-xs text-gray-500">系统角色</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-400">权限变更</CardTitle>
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">{stats.permissionChanges}</div>
              <p className="text-xs text-gray-500">今日变更</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6 sm:space-y-8">
          <TabsList className="bg-gray-800 border-gray-600 w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="users" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 py-2">
              用户管理
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 py-2">
              角色管理
            </TabsTrigger>
            <TabsTrigger value="permissions" className="data-[state=active]:bg-red-500 data-[state=active]:text-white text-xs sm:text-sm px-3 sm:px-4 py-2">
              权限矩阵
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserList $w={$w} onEditUser={handleEditUser} onToggleUserStatus={handleToggleUserStatus} />
          </TabsContent>

          <TabsContent value="roles">
            <RoleManagement $w={$w} onEditRole={handleEditRole} />
          </TabsContent>

          <TabsContent value="permissions">
            <PermissionMatrix $w={$w} roles={roles} onPermissionChange={handlePermissionChange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}
export default function PermissionsPage(props) {
  return <ExperimentProvider $w={props.$w}>
      <PermissionsContent {...props} />
    </ExperimentProvider>;
}