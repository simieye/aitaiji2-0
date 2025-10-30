// @ts-ignore;
import React, { createContext, useContext, useEffect, useState } from 'react';

// 实验上下文
const ExperimentContext = createContext();

// 实验配置
const EXPERIMENTS = {
  home_cta_text: {
    name: '首页CTA文案实验',
    variants: {
      A: '探索产品',
      B: '立即体验',
      C: '免费试用'
    },
    weights: [0.4, 0.3, 0.3] // 流量分配
  },
  payment_button_color: {
    name: '支付按钮颜色实验',
    variants: {
      red: 'from-red-500 to-pink-500',
      blue: 'from-blue-500 to-cyan-500',
      green: 'from-green-500 to-emerald-500'
    },
    weights: [0.5, 0.25, 0.25]
  },
  subscription_layout: {
    name: '订阅套餐布局实验',
    variants: {
      card: 'grid md:grid-cols-3 gap-8',
      list: 'space-y-4',
      comparison: 'grid md:grid-cols-1 gap-4'
    },
    weights: [0.6, 0.2, 0.2]
  },
  pricing_display: {
    name: '价格展示实验',
    variants: {
      monthly: '月付',
      yearly: '年付',
      both: '月付/年付'
    },
    weights: [0.4, 0.3, 0.3]
  }
};

// 哈希函数用于用户分组
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
}

// 获取实验分组
function getExperimentVariant(experimentName, userId) {
  const experiment = EXPERIMENTS[experimentName];
  if (!experiment) return null;
  const hash = hashString(`${experimentName}-${userId}`);
  const totalWeight = experiment.weights.reduce((a, b) => a + b, 0);
  const normalizedWeights = experiment.weights.map(w => w / totalWeight);
  let cumulativeWeight = 0;
  const randomValue = hash % 1000 / 1000;
  for (let i = 0; i < normalizedWeights.length; i++) {
    cumulativeWeight += normalizedWeights[i];
    if (randomValue <= cumulativeWeight) {
      const variantKey = Object.keys(experiment.variants)[i];
      return {
        variant: variantKey,
        value: experiment.variants[variantKey],
        experiment: experiment.name
      };
    }
  }

  // 默认返回第一个变体
  const firstKey = Object.keys(experiment.variants)[0];
  return {
    variant: firstKey,
    value: experiment.variants[firstKey],
    experiment: experiment.name
  };
}

// 实验提供者组件
export function ExperimentProvider({
  children,
  $w
}) {
  const [experiments, setExperiments] = useState({});
  const [userId, setUserId] = useState('anonymous');
  useEffect(() => {
    const uid = $w?.auth?.currentUser?.userId || 'anonymous';
    setUserId(uid);

    // 初始化实验分组
    const initialExperiments = {};
    Object.keys(EXPERIMENTS).forEach(expName => {
      initialExperiments[expName] = getExperimentVariant(expName, uid);
    });
    setExperiments(initialExperiments);

    // 记录实验分配
    if (uid !== 'anonymous') {
      recordExperimentAssignment(uid, initialExperiments);
    }
  }, [$w?.auth?.currentUser?.userId]);

  // 记录实验分配
  const recordExperimentAssignment = async (userId, assignments) => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_experiment_assignment',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            assignments: JSON.stringify(assignments),
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('记录实验分配失败:', error);
    }
  };

  // 记录实验事件
  const trackExperimentEvent = async (experimentName, variant, event, value = null) => {
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_experiment_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: userId,
            experiment: experimentName,
            variant: variant,
            event: event,
            event_value: value,
            timestamp: new Date().toISOString(),
            page_url: window.location.href
          }
        }
      });
    } catch (error) {
      console.error('记录实验事件失败:', error);
    }
  };
  const value = {
    experiments,
    getVariant: experimentName => experiments[experimentName],
    trackEvent: trackExperimentEvent,
    EXPERIMENTS
  };
  return <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>;
}

// 使用实验的 Hook
export function useExperiment(experimentName) {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiment must be used within ExperimentProvider');
  }
  return context.getVariant(experimentName);
}

// 实验追踪 Hook
export function useExperimentTracking(experimentName, variant) {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperimentTracking must be used within ExperimentProvider');
  }
  return {
    track: (event, value) => context.trackEvent(experimentName, variant, event, value)
  };
}