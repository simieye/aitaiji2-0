// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Check, X } from 'lucide-react';

export function PermissionMatrix({
  role,
  permissions,
  onPermissionToggle
}) {
  const permissionGroups = [{
    name: '用户管理',
    permissions: ['user_read', 'user_create', 'user_update', 'user_delete']
  }, {
    name: '角色管理',
    permissions: ['role_read', 'role_create', 'role_update', 'role_delete']
  }, {
    name: '内容管理',
    permissions: ['content_read', 'content_create', 'content_update', 'content_delete']
  }, {
    name: '系统管理',
    permissions: ['system_config', 'system_monitor', 'system_backup']
  }];
  const hasPermission = permission => {
    return role.permissions?.includes(permission) || false;
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">权限矩阵</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left text-gray-400 p-2">功能模块</th>
                <th className="text-center text-gray-400 p-2">查看</th>
                <th className="text-center text-gray-400 p-2">创建</th>
                <th className="text-center text-gray-400 p-2">编辑</th>
                <th className="text-center text-gray-400 p-2">删除</th>
              </tr>
            </thead>
            <tbody>
              {permissionGroups.map((group, groupIndex) => <tr key={groupIndex} className="border-b border-gray-700">
                  <td className="text-white p-2 font-medium">{group.name}</td>
                  {group.permissions.map((permission, permIndex) => <td key={permIndex} className="text-center p-2">
                      <button onClick={() => onPermissionToggle && onPermissionToggle(permission)} className={`w-6 h-6 rounded-full flex items-center justify-center ${hasPermission(permission) ? 'bg-green-500' : 'bg-gray-600'}`}>
                        {hasPermission(permission) ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-gray-400" />}
                      </button>
                    </td>)}
                </tr>)}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>;
}