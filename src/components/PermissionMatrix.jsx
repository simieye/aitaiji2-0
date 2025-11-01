// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Shield, Check, X, Settings } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
export function PermissionMatrix({
  $w,
  roles,
  onPermissionChange
}) {
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadPermissions();
  }, [roles]);
  const loadPermissions = async () => {
    try {
      setLoading(true);
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

      // 获取角色权限关联数据
      const rolePermissionsResult = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_role_permission',
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

      // 组织权限数据
      const permissionCategories = {};
      (permissionsResult.records || []).forEach(permission => {
        if (!permissionCategories[permission.category]) {
          permissionCategories[permission.category] = [];
        }
        permissionCategories[permission.category].push(permission);
      });

      // 组织角色权限数据
      const rolePerms = {};
      (rolePermissionsResult.records || []).forEach(rp => {
        if (!rolePerms[rp.roleId]) {
          rolePerms[rp.roleId] = [];
        }
        rolePerms[rp.roleId].push(rp.permissionId);
      });
      setPermissions(permissionCategories);
      setRolePermissions(rolePerms);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  const getPermissionIcon = (roleId, permissionId) => {
    const hasPermission = rolePermissions[roleId]?.includes(permissionId);
    if (hasPermission) {
      return <Check className="w-4 h-4 text-green-500" />;
    } else {
      return <X className="w-4 h-4 text-red-500" />;
    }
  };
  const togglePermission = async (role, permission) => {
    try {
      const hasPermission = rolePermissions[role._id]?.includes(permission._id);
      if (hasPermission) {
        // 删除权限
        await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_role_permission',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                $and: [{
                  roleId: {
                    $eq: role._id
                  }
                }, {
                  permissionId: {
                    $eq: permission._id
                  }
                }]
              }
            }
          }
        }));
      } else {
        // 添加权限
        await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_role_permission',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              roleId: role._id,
              permissionId: permission._id,
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
      // 重新加载数据
      await loadPermissions();
      onPermissionChange(role._id, rolePermissions[role._id] || []);
    } catch (error) {
      console.error('切换权限失败:', error);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>;
  }
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">权限矩阵</CardTitle>
        <CardDescription className="text-gray-300">查看和管理各角色的权限配置</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">权限类别</th>
                <th className="text-left py-3 px-4 text-gray-400">权限</th>
                {roles.map(role => <th key={role._id} className="text-center py-3 px-4 text-gray-400">
                    <div className="flex flex-col items-center">
                      {getRoleIcon(role.name)}
                      <span className="text-sm">{role.displayName || role.name}</span>
                    </div>
                  </th>)}
              </tr>
            </thead>
            <tbody>
              {Object.entries(permissions).map(([category, categoryPermissions]) => categoryPermissions.map((permission, index) => <tr key={permission._id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  {index === 0 && <td rowSpan={categoryPermissions.length} className="py-3 px-4 text-gray-300 font-medium">
                      {category}
                    </td>}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{permission.name}</span>
                    </div>
                  </td>
                  {roles.map(role => <td key={role._id} className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getPermissionIcon(role._id, permission._id)}
                        <Button onClick={() => togglePermission(role, permission)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
                          切换
                        </Button>
                      </div>
                    </td>)}
                </tr>))}
            </tbody>
          </table>
        </div>

        {/* Permission Summary */}
        <div className="mt-8">
          <h3 className="text-white font-semibold mb-4">权限统计</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {roles.map(role => <Card key={role._id} className="bg-gray-800/50 border-gray-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(role.name)}
                      <span className="text-white font-medium">{role.displayName || role.name}</span>
                    </div>
                    <Badge className="bg-blue-500 text-white">{rolePermissions[role._id]?.length || 0}</Badge>
                  </div>
                  <div className="text-gray-400 text-sm">
                    总权限数: {rolePermissions[role._id]?.length || 0}
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </CardContent>
    </Card>;
}
const getRoleIcon = roleName => {
  switch (roleName) {
    case 'super_admin':
      return <Shield className="w-5 h-5 text-yellow-500" />;
    case 'admin':
      return <Shield className="w-5 h-5 text-blue-500" />;
    case 'user':
      return <Shield className="w-5 h-5 text-gray-500" />;
    default:
      return <Shield className="w-5 h-5 text-purple-500" />;
  }
};