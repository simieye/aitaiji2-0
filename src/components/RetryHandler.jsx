// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

export async function withRetry(fn, maxRetries = 3, delay = 1000) {
  const {
    toast
  } = useToast();
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) {
        toast({
          title: "操作失败",
          description: `重试${maxRetries}次后仍失败: ${error.message}`,
          variant: "destructive"
        });
        throw error;
      }
      toast({
        title: `重试中 (${attempt}/${maxRetries})`,
        description: `操作失败，${delay}ms后重试...`,
        variant: "default"
      });
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // 指数退避
    }
  }
}