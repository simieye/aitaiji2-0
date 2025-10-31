// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Menu, X, Home, Package, Lightbulb, Book, FileText, Users, MessageSquare, CreditCard, BarChart3, FlaskConical, Shield, Download, Globe, ChevronDown } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
// @ts-ignore;
import { useI18n } from '@/components/I18nProvider';
export function Layout({
  $w,
  children,
  currentPage
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const {
    toast
  } = useToast();
  const {
    t
  } = useI18n();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    loadUserInfo();
  }, []);
  const loadUserInfo = async () => {
    try {
      if ($w.auth.currentUser) {
        setUser($w.auth.currentUser);
        // 加载用户权限
        await loadUserPermissions($w.auth.currentUser.userId);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };
  const loadUserPermissions = async userId => {
    try {
      const result = await withRetry(() => $w.cloud.callDataSource({
        dataSourceName: 'taiji_user',
        methodName: 'wedaGetItemV2',
        params: {
          filter: {
            where: {
              userId: {
                $eq: userId
              }
            }
          },
          select: {
            $master: true
          }
        }
      }));
      if (result && result.roles) {
        // 获取角色权限
        const permissions = await getUserRolePermissions(result.roles);
        setUserPermissions(permissions);
      }
    } catch (error) {
      console.error('加载用户权限失败:', error);
    }
  };
  const getUserRolePermissions = async roleIds => {
    try {
      const permissions = new Set();
      for (const roleId of roleIds) {
        const role = await withRetry(() => $w.cloud.callDataSource({
          dataSourceName: 'taiji_role',
          methodName: 'wedaGetItemV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: roleId
                }
              }
            },
            select: {
              $master: true
            }
          }
        }));
        if (role && role.permissions) {
          role.permissions.forEach(permission => permissions.add(permission));
        }
      }
      return Array.from(permissions);
    } catch (error) {
      console.error('获取角色权限失败:', error);
      return [];
    }
  };
  const hasPermission = permission => {
    return userPermissions.includes(permission);
  };
  const canAccessPage = pageId => {
    // 页面访问权限映射
    const pagePermissions = {
      dashboard: 'system_monitor',
      roles: 'role_read',
      experiments: 'system_config',
      subscription: 'user_read',
      export: 'data_export',
      i18n: 'i18n_manage'
    };
    const requiredPermission = pagePermissions[pageId];
    return !requiredPermission || hasPermission(requiredPermission);
  };
  const handleNavigation = pageId => {
    if (!canAccessPage(pageId)) {
      toast({
        title: t('error.permission', '访问被拒绝'),
        description: t('error.permissionDenied', '您没有权限访问此页面'),
        variant: "destructive"
      });
      return;
    }
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
    setIsMenuOpen(false);
  };
  const navigationItems = [{
    id: 'index',
    label: t('nav.home', '首页'),
    icon: <Home className="w-4 h-4" />
  }, {
    id: 'product',
    label: t('nav.product', '产品'),
    icon: <Package className="w-4 h-4" />
  }, {
    id: 'solutions',
    label: t('nav.solutions', '解决方案'),
    icon: <Lightbulb className="w-4 h-4" />
  }, {
    id: 'blog',
    label: t('nav.blog', '博客'),
    icon: <Book className="w-4 h-4" />
  }, {
    id: 'resources',
    label: t('nav.resources', '资源'),
    icon: <FileText className="w-4 h-4" />
  }, {
    id: 'about',
    label: t('nav.about', '关于'),
    icon: <Users className="w-4 h-4" />
  }];
  const secondaryItems = [{
    id: 'chat',
    label: t('nav.chat', '智能助手'),
    icon: <MessageSquare className="w-4 h-4" />
  }, {
    id: 'subscription',
    label: t('nav.subscription', '订阅'),
    icon: <CreditCard className="w-4 h-4" />
  }, {
    id: 'dashboard',
    label: t('nav.dashboard', '仪表板'),
    icon: <BarChart3 className="w-4 h-4" />
  }, {
    id: 'experiments',
    label: t('nav.experiments', '实验'),
    icon: <FlaskConical className="w-4 h-4" />
  }, {
    id: 'roles',
    label: t('nav.roles', '角色管理'),
    icon: <Shield className="w-4 h-4" />
  }, {
    id: 'export',
    label: t('nav.export', '数据导出'),
    icon: <Download className="w-4 h-4" />
  }, {
    id: 'i18n',
    label: t('nav.i18n', '国际化'),
    icon: <Globe className="w-4 h-4" />
  }];
  return <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Button onClick={() => handleNavigation('index')} variant="ghost" className="text-white hover:text-red-500 p-0">
                <span className="text-xl sm:text-2xl font-bold">{t('home.title', 'AI太极')}</span>
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navigationItems.map(item => <Button key={item.id} onClick={() => handleNavigation(item.id)} variant="ghost" className={`text-white hover:text-red-500 text-sm sm:text-base ${currentPage === item.id ? 'text-red-500' : ''}`}>
                  {item.icon}
                  <span className="ml-2 hidden xl:inline">{item.label}</span>
                </Button>)}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-2 sm:space-x-4">
              <LanguageSwitcher onLanguageChange={lang => console.log('Language changed to:', lang)} />
              {user ? <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {user.nickName ? user.nickName.charAt(0) : 'U'}
                    </span>
                  </div>
                  <span className="text-white text-xs sm:text-sm hidden sm:inline">{user.nickName || t('common.user', '用户')}</span>
                </div> : <Button onClick={() => handleNavigation('subscription')} className="bg-red-500 hover:bg-red-600 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2">
                  {t('home.getStarted', '开始使用')}
                </Button>}
            </div>

            {/* Mobile Menu Button */}
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" className="lg:hidden text-white p-2">
              {isMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="lg:hidden bg-black/95 backdrop-blur-md border-b border-gray-800">
            <div className="container mx-auto px-4 sm:px-6 py-4">
              <div className="space-y-1">
                {navigationItems.map(item => <Button key={item.id} onClick={() => handleNavigation(item.id)} variant="ghost" className={`w-full justify-start text-white hover:text-red-500 py-3 px-4 ${currentPage === item.id ? 'text-red-500' : ''}`}>
                    {item.icon}
                    <span className="ml-3 text-sm sm:text-base">{item.label}</span>
                  </Button>)}
                <div className="border-t border-gray-700 pt-2 mt-2">
                  {secondaryItems.filter(item => canAccessPage(item.id)).map(item => <Button key={item.id} onClick={() => handleNavigation(item.id)} variant="ghost" className={`w-full justify-start text-white hover:text-red-500 py-3 px-4 ${currentPage === item.id ? 'text-red-500' : ''}`}>
                      {item.icon}
                      <span className="ml-3 text-sm sm:text-base">{item.label}</span>
                    </Button>)}
                </div>
              </div>
            </div>
          </div>}
      </nav>

      {/* Main Content */}
      <main className="pt-14 sm:pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black/90 backdrop-blur-md border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">{t('home.title', 'AI太极')}</h3>
              <p className="text-gray-400 text-sm sm:text-base">
                {t('home.description', '专业的AI解决方案提供商，助力企业数字化转型')}
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.products', '产品')}</h4>
              <ul className="space-y-2">
                <li>
                  <Button onClick={() => handleNavigation('product')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm sm:text-base">
                    {t('nav.product', '智能代理')}
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('solutions')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm sm:text-base">
                    {t('nav.solutions', '解决方案')}
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('subscription')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm sm:text-base">
                    {t('nav.subscription', '订阅服务')}
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.resources', '资源')}</h4>
              <ul className="space-y-2">
                <li>
                  <Button onClick={() => handleNavigation('blog')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm sm:text-base">
                    {t('nav.blog', '博客')}
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('resources')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm sm:text-base">
                    {t('nav.resources', '文档')}
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('about')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm sm:text-base">
                    {t('nav.about', '关于我们')}
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.support', '支持')}</h4>
              <ul className="space-y-2">
                <li>
                  <Button onClick={() => handleNavigation('chat')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm sm:text-base">
                    {t('nav.chat', '智能助手')}
                  </Button>
                </li>
                <li>
                  {canAccessPage('dashboard') && <Button onClick={() => handleNavigation('dashboard')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm sm:text-base">
                      {t('nav.dashboard', '仪表板')}
                    </Button>}
                </li>
                <li>
                  {canAccessPage('experiments') && <Button onClick={() => handleNavigation('experiments')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm sm:text-base">
                      {t('nav.experiments', '实验室')}
                    </Button>}
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">
              © 2024 {t('home.title', 'AI太极')}. {t('footer.allRightsReserved', '保留所有权利')}.
            </p>
          </div>
        </div>
      </footer>
    </div>;
}