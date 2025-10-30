// @ts-ignore;
import React, { useEffect, useRef } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

export function useAutoRefresh(callback, interval = 30000) {
  const {
    toast
  } = useToast();
  const intervalRef = useRef(null);
  const startAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(async () => {
      try {
        await callback();
        toast({
          title: "数据已更新",
          description: "页面数据已自动刷新",
          variant: "default",
          duration: 2000
        });
      } catch (error) {
        console.error('Auto refresh failed:', error);
      }
    }, interval);
  };
  const stopAutoRefresh = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  useEffect(() => {
    startAutoRefresh();
    return stopAutoRefresh;
  }, [callback, interval]);
  return {
    startAutoRefresh,
    stopAutoRefresh
  };
}