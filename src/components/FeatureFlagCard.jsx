// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Switch, Badge, Button, Slider, useToast } from '@/components/ui';
// @ts-ignore;
import { Users, Target, Clock, Edit, Trash2, Eye, Play, Pause } from 'lucide-react';

export function FeatureFlagCard({
  flag,
  onUpdate,
  onDelete,
  onToggle
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [rolloutPercentage, setRolloutPercentage] = useState(flag.rolloutPercentage || 0);
  const [targetUsers, setTargetUsers] = useState(flag.targetUsers || []);
  const {
    toast
  } = useToast();
  const handleToggle = async enabled => {
    try {
      await onToggle(flag._id, enabled);
      toast({
        title: enabled ? "功能已启用" : "功能已禁用",
        description: `${flag.name} 已${enabled ? '启用' : '禁用'}`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const handleSave = async () => {
    try {
      await onUpdate(flag._id, {
        rolloutPercentage,
        targetUsers
      });
      setIsEditing(false);
      toast({
        title: "更新成功",
        description: "功能开关配置已更新",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "更新失败",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const getStatusColor = enabled => {
    return enabled ? 'bg-green-500' : 'bg-gray-500';
  };
  const getStatusText = enabled => {
    return enabled ? '已启用' : '已禁用';
  };
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 hover:border-red-500/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">{flag.name}</CardTitle>
            <CardDescription className="text-gray-300">{flag.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(flag.enabled)} text-white text-xs`}>
              {getStatusText(flag.enabled)}
            </Badge>
            <Switch checked={flag.enabled} onCheckedChange={handleToggle} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* 功能开关标识 */}
          <div className="flex items-center text-sm text-gray-400">
            <Target className="w-4 h-4 mr-2" />
            <span>标识: {flag.flagKey}</span>
          </div>

          {/* 灰度百分比 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">灰度百分比</span>
              <span className="text-sm text-white">{rolloutPercentage}%</span>
            </div>
            {isEditing ? <Slider value={[rolloutPercentage]} onValueChange={([value]) => setRolloutPercentage(value)} max={100} step={1} className="w-full" /> : <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{
              width: `${flag.rolloutPercentage || 0}%`
            }} />
              </div>}
          </div>

          {/* 目标用户 */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-400">
              <Users className="w-4 h-4 mr-2" />
              <span>目标用户 ({flag.targetUsers?.length || 0})</span>
            </div>
            {isEditing ? <div className="space-y-2">
                <input type="text" placeholder="输入用户ID，用逗号分隔" value={targetUsers.join(', ')} onChange={e => setTargetUsers(e.target.value.split(',').map(id => id.trim()).filter(id => id))} className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400" />
              </div> : <div className="flex flex-wrap gap-1">
                {flag.targetUsers?.slice(0, 3).map(user => <Badge key={user} variant="outline" className="text-xs border-gray-600 text-gray-400">
                    {user}
                  </Badge>)}
                {flag.targetUsers?.length > 3 && <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                    +{flag.targetUsers.length - 3}更多
                  </Badge>}
              </div>}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>更新于: {new Date(flag.updatedAt).toLocaleDateString('zh-CN')}</span>
            </div>
            <div className="flex space-x-2">
              {isEditing ? <>
                  <Button size="sm" onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                    保存
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    取消
                  </Button>
                </> : <>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onDelete(flag._id)} className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}