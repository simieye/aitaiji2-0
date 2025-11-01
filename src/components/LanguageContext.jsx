// @ts-ignore;
import React, { createContext, useContext, useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

const LanguageContext = createContext();
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
export const LanguageProvider = ({
  children,
  $w
}) => {
  const [currentLanguage, setCurrentLanguage] = useState('zh-CN');
  const [languages, setLanguages] = useState([]);
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  // 默认翻译数据
  const defaultTranslations = {
    'zh-CN': {
      'common.loading': '加载中...',
      'common.save': '保存',
      'common.cancel': '取消',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.add': '添加',
      'common.search': '搜索',
      'common.filter': '筛选',
      'common.export': '导出',
      'common.import': '导入',
      'common.settings': '设置',
      'common.dashboard': '仪表板',
      'common.users': '用户',
      'common.roles': '角色',
      'common.permissions': '权限',
      'common.integrations': '集成',
      'common.exports': '导出',
      'common.languages': '语言',
      'nav.home': '首页',
      'nav.products': '产品',
      'nav.solutions': '解决方案',
      'nav.blog': '博客',
      'nav.resources': '资源',
      'nav.about': '关于',
      'nav.chat': '智能助手',
      'nav.subscription': '订阅',
      'nav.experiments': '实验',
      'nav.permissions': '权限管理',
      'nav.integrations': '第三方集成',
      'nav.exports': '数据导出',
      'nav.languages': '语言管理',
      'user.profile': '个人资料',
      'user.logout': '退出登录',
      'user.settings': '用户设置',
      'error.network': '网络错误',
      'error.server': '服务器错误',
      'error.unauthorized': '未授权访问',
      'error.notFound': '页面未找到',
      'success.saved': '保存成功',
      'success.deleted': '删除成功',
      'success.updated': '更新成功',
      'success.created': '创建成功'
    },
    'en-US': {
      'common.loading': 'Loading...',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.import': 'Import',
      'common.settings': 'Settings',
      'common.dashboard': 'Dashboard',
      'common.users': 'Users',
      'common.roles': 'Roles',
      'common.permissions': 'Permissions',
      'common.integrations': 'Integrations',
      'common.exports': 'Exports',
      'common.languages': 'Languages',
      'nav.home': 'Home',
      'nav.products': 'Products',
      'nav.solutions': 'Solutions',
      'nav.blog': 'Blog',
      'nav.resources': 'Resources',
      'nav.about': 'About',
      'nav.chat': 'AI Assistant',
      'nav.subscription': 'Subscription',
      'nav.experiments': 'Experiments',
      'nav.permissions': 'Permissions',
      'nav.integrations': 'Integrations',
      'nav.exports': 'Data Export',
      'nav.languages': 'Language Management',
      'user.profile': 'Profile',
      'user.logout': 'Logout',
      'user.settings': 'User Settings',
      'error.network': 'Network Error',
      'error.server': 'Server Error',
      'error.unauthorized': 'Unauthorized',
      'error.notFound': 'Page Not Found',
      'success.saved': 'Saved Successfully',
      'success.deleted': 'Deleted Successfully',
      'success.updated': 'Updated Successfully',
      'success.created': 'Created Successfully'
    }
  };
  useEffect(() => {
    loadLanguages();
    loadTranslations();
    // 从本地存储加载用户语言偏好
    const savedLanguage = localStorage.getItem('userLanguage') || 'zh-CN';
    setCurrentLanguage(savedLanguage);
  }, []);
  const loadLanguages = async () => {
    try {
      // 模拟语言数据
      const mockLanguages = [{
        _id: '1',
        code: 'zh-CN',
        name: 'Chinese',
        displayName: '简体中文',
        flag: '🇨🇳',
        isDefault: true,
        isActive: true,
        sortOrder: 1,
        rtl: false
      }, {
        _id: '2',
        code: 'en-US',
        name: 'English',
        displayName: 'English',
        flag: '🇺🇸',
        isDefault: false,
        isActive: true,
        sortOrder: 2,
        rtl: false
      }, {
        _id: '3',
        code: 'ja-JP',
        name: 'Japanese',
        displayName: '日本語',
        flag: '🇯🇵',
        isDefault: false,
        isActive: false,
        sortOrder: 3,
        rtl: false
      }];
      setLanguages(mockLanguages);
    } catch (error) {
      console.error('加载语言列表失败:', error);
    }
  };
  const loadTranslations = async () => {
    try {
      // 使用默认翻译数据
      setTranslations(defaultTranslations);
      setLoading(false);
    } catch (error) {
      console.error('加载翻译数据失败:', error);
      setLoading(false);
    }
  };
  const changeLanguage = languageCode => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('userLanguage', languageCode);
    toast({
      title: "语言切换成功",
      description: `已切换到 ${languages.find(l => l.code === languageCode)?.displayName || languageCode}`,
      variant: "default"
    });
  };
  const t = (key, fallback = key) => {
    const langTranslations = translations[currentLanguage] || translations['zh-CN'] || {};
    return langTranslations[key] || fallback;
  };
  const value = {
    currentLanguage,
    languages,
    translations,
    loading,
    changeLanguage,
    t
  };
  return <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>;
};