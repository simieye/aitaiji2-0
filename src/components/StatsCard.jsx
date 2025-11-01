// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export function StatsCard({
  icon: Icon,
  title,
  value,
  description,
  color = 'text-red-500'
}) {
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <Icon className={`w-4 h-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </CardContent>
    </Card>;
}