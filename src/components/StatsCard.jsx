// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';

export function StatsCard({
  number,
  label
}) {
  return <Card className="bg-gray-900/50 backdrop-blur border-gray-700 text-center">
      <CardContent className="p-4 sm:p-6">
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{number}</div>
        <div className="text-gray-400 text-sm sm:text-base">{label}</div>
      </CardContent>
    </Card>;
}