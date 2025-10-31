// @ts-ignore;
import React, { createContext, useContext, useState, useEffect } from 'react';

// 翻译数据
const translations = {
  zh: {
    // 导航
    'nav.home': '首页',
    'nav.product': '产品',
    'nav.solutions': '解决方案',
    'nav.blog': '博客',
    'nav.resources': '资源',
    'nav.about': '关于',
    'nav.chat': '智能助手',
    'nav.subscription': '订阅',
    'nav.dashboard': '仪表板',
    'nav.experiments': '实验',
    'nav.roles': '角色管理',
    'nav.export': '数据导出',
    // 通用
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.view': '查看',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.export': '导出',
    'common.import': '导入',
    'common.refresh': '刷新',
    'common.close': '关闭',
    'common.back': '返回',
    'common.next': '下一步',
    'common.previous': '上一步',
    'common.submit': '提交',
    'common.reset': '重置',
    // 首页
    'home.title': 'AI太极',
    'home.subtitle': '智能化解决方案',
    'home.description': '专业的AI解决方案提供商，助力企业数字化转型',
    'home.getStarted': '开始使用',
    'home.learnMore': '了解更多',
    // 产品
    'product.title': '产品',
    'product.subtitle': '智能产品',
    'product.description': '我们的AI产品系列',
    // 解决方案
    'solutions.title': '解决方案',
    'solutions.subtitle': '行业解决方案',
    'solutions.description': '为各行业提供定制化AI解决方案',
    // 博客
    'blog.title': '博客',
    'blog.subtitle': '技术分享',
    'blog.description': '最新的AI技术文章和行业洞察',
    // 资源
    'resources.title': '资源',
    'resources.subtitle': '学习资源',
    'resources.description': '文档、教程和最佳实践',
    // 关于
    'about.title': '关于我们',
    'about.subtitle': '公司介绍',
    'about.description': '了解AI太极的故事和使命',
    // 聊天
    'chat.title': 'AI助手',
    'chat.subtitle': '智能对话',
    'chat.description': '与AI助手进行智能对话',
    'chat.inputPlaceholder': '输入您的问题...',
    'chat.send': '发送',
    // 订阅
    'subscription.title': '订阅管理',
    'subscription.subtitle': '订阅服务',
    'subscription.description': '管理您的订阅服务',
    'subscription.plans': '订阅计划',
    'subscription.basic': '基础版',
    'subscription.pro': '专业版',
    'subscription.enterprise': '企业版',
    'subscription.price': '价格',
    'subscription.features': '功能',
    'subscription.subscribe': '订阅',
    // 仪表板
    'dashboard.title': '系统仪表板',
    'dashboard.subtitle': '数据监控',
    'dashboard.description': '实时监控系统状态和数据',
    'dashboard.overview': '概览',
    'dashboard.automation': '自动化控制',
    'dashboard.payments': '支付管理',
    'dashboard.health': '系统健康',
    // 实验
    'experiments.title': '实验中心',
    'experiments.subtitle': 'A/B测试',
    'experiments.description': '进行A/B测试和功能实验',
    // 角色管理
    'roles.title': '角色管理',
    'roles.subtitle': '权限管理',
    'roles.description': '管理系统角色和权限',
    'roles.create': '创建角色',
    'roles.edit': '编辑角色',
    'roles.delete': '删除角色',
    'roles.permissions': '权限',
    'roles.users': '用户',
    // 数据导出
    'export.title': '数据导出',
    'export.subtitle': '数据管理',
    'export.description': '导出系统数据为多种格式',
    'export.format': '格式',
    'export.excel': 'Excel',
    'export.pdf': 'PDF',
    'export.csv': 'CSV',
    'export.history': '导出历史',
    'export.download': '下载',
    // 错误信息
    'error.network': '网络错误',
    'error.server': '服务器错误',
    'error.permission': '权限不足',
    'error.notFound': '页面未找到',
    'error.unknown': '未知错误',
    // 成功信息
    'success.saved': '保存成功',
    'success.deleted': '删除成功',
    'success.updated': '更新成功',
    'success.created': '创建成功',
    'success.uploaded': '上传成功',
    'success.downloaded': '下载成功'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.product': 'Product',
    'nav.solutions': 'Solutions',
    'nav.blog': 'Blog',
    'nav.resources': 'Resources',
    'nav.about': 'About',
    'nav.chat': 'AI Assistant',
    'nav.subscription': 'Subscription',
    'nav.dashboard': 'Dashboard',
    'nav.experiments': 'Experiments',
    'nav.roles': 'Role Management',
    'nav.export': 'Data Export',
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.refresh': 'Refresh',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.reset': 'Reset',
    // Home
    'home.title': 'AI Taiji',
    'home.subtitle': 'Intelligent Solutions',
    'home.description': 'Professional AI solution provider, helping enterprises with digital transformation',
    'home.getStarted': 'Get Started',
    'home.learnMore': 'Learn More',
    // Product
    'product.title': 'Product',
    'product.subtitle': 'Smart Products',
    'product.description': 'Our AI product series',
    // Solutions
    'solutions.title': 'Solutions',
    'solutions.subtitle': 'Industry Solutions',
    'solutions.description': 'Customized AI solutions for various industries',
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Tech Sharing',
    'blog.description': 'Latest AI technology articles and industry insights',
    // Resources
    'resources.title': 'Resources',
    'resources.subtitle': 'Learning Resources',
    'resources.description': 'Documentation, tutorials, and best practices',
    // About
    'about.title': 'About Us',
    'about.subtitle': 'Company Introduction',
    'about.description': 'Learn about AI Taiji\'s story and mission',
    // Chat
    'chat.title': 'AI Assistant',
    'chat.subtitle': 'Intelligent Conversation',
    'chat.description': 'Have intelligent conversations with AI assistant',
    'chat.inputPlaceholder': 'Enter your question...',
    'chat.send': 'Send',
    // Subscription
    'subscription.title': 'Subscription Management',
    'subscription.subtitle': 'Subscription Service',
    'subscription.description': 'Manage your subscription services',
    'subscription.plans': 'Subscription Plans',
    'subscription.basic': 'Basic',
    'subscription.pro': 'Professional',
    'subscription.enterprise': 'Enterprise',
    'subscription.price': 'Price',
    'subscription.features': 'Features',
    'subscription.subscribe': 'Subscribe',
    // Dashboard
    'dashboard.title': 'System Dashboard',
    'dashboard.subtitle': 'Data Monitoring',
    'dashboard.description': 'Real-time monitoring of system status and data',
    'dashboard.overview': 'Overview',
    'dashboard.automation': 'Automation Control',
    'dashboard.payments': 'Payment Management',
    'dashboard.health': 'System Health',
    // Experiments
    'experiments.title': 'Experiment Center',
    'experiments.subtitle': 'A/B Testing',
    'experiments.description': 'Conduct A/B testing and feature experiments',
    // Roles
    'roles.title': 'Role Management',
    'roles.subtitle': 'Permission Management',
    'roles.description': 'Manage system roles and permissions',
    'roles.create': 'Create Role',
    'roles.edit': 'Edit Role',
    'roles.delete': 'Delete Role',
    'roles.permissions': 'Permissions',
    'roles.users': 'Users',
    // Export
    'export.title': 'Data Export',
    'export.subtitle': 'Data Management',
    'export.description': 'Export system data in multiple formats',
    'export.format': 'Format',
    'export.excel': 'Excel',
    'export.pdf': 'PDF',
    'export.csv': 'CSV',
    'export.history': 'Export History',
    'export.download': 'Download',
    // Error Messages
    'error.network': 'Network Error',
    'error.server': 'Server Error',
    'error.permission': 'Permission Denied',
    'error.notFound': 'Page Not Found',
    'error.unknown': 'Unknown Error',
    // Success Messages
    'success.saved': 'Saved Successfully',
    'success.deleted': 'Deleted Successfully',
    'success.updated': 'Updated Successfully',
    'success.created': 'Created Successfully',
    'success.uploaded': 'Uploaded Successfully',
    'success.downloaded': 'Downloaded Successfully'
  }
};
// 创建上下文
const I18nContext = createContext();
// I18n Provider组件
export function I18nProvider({
  children
}) {
  const [language, setLanguage] = useState('zh');
  const [translations, setTranslations] = useState({});
  useEffect(() => {
    // 从localStorage获取保存的语言设置
    const savedLanguage = localStorage.getItem('preferred-language') || 'zh';
    setLanguage(savedLanguage);
  }, []);
  useEffect(() => {
    // 加载对应语言的翻译
    loadTranslations(language);
  }, [language]);
  const loadTranslations = async lang => {
    try {
      // 这里可以从API加载翻译，现在使用本地数据
      setTranslations(translations[lang] || {});
    } catch (error) {
      console.error('Failed to load translations:', error);
      setTranslations(translations['zh'] || {});
    }
  };
  const t = (key, fallback = key) => {
    return translations[key] || fallback;
  };
  const changeLanguage = lang => {
    setLanguage(lang);
    localStorage.setItem('preferred-language', lang);
  };
  const value = {
    language,
    t,
    changeLanguage,
    availableLanguages: ['zh', 'en'],
    translations
  };
  return <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>;
}
// Hook for using translations
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
// Translation function
export function useTranslation() {
  const {
    t
  } = useI18n();
  return {
    t
  };
}