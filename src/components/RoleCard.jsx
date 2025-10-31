// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
// @ts-ignore;
import { Users, Shield, Edit, Trash2, Eye } from 'lucide-react';

export function RoleCard({
  role,
  onEdit,
  onDelete,
  onView
}) {
  const getRoleColor = role => {
    switch (role.name) {
      case 'admin':
        return 'bg-red-500';
      case 'manager':
        return 'bg-blue-500';
      case 'user':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <CardTitle className="text-white">{role.name}</CardTitle>
          </div>
          <Badge className={`${getRoleColor(role)} text-white`}>
            {role.level}
          </Badge>
        </div>
        <CardDescription className="text-gray-300">{role.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">用户数量</span>
            <span className="text-white">{role.userCount || 0}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">权限数量</span>
            <span className="text-white">{role.permissions?.length || 0}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">创建时间</span>
            <span className="text-white">{formatDate(role.createdAt)}</span>
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button onClick={() => onView(role)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
              <Eye className="w-4 h-4 mr-1" />
              查看
            </Button>
            <Button onClick={() => onEdit(role)} variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-700">
              <Edit className="w-4 h-4 mr-1" />
              编辑
            </Button>
            {role.name !== 'admin' && <Button onClick={() => onDelete(role)} variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                <Trash2 className="w-4 h-4" />
              </Button>}
          </div>
        </div>
      </CardContent>
    </Card>;
}