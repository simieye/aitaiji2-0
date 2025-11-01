// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Menu, X, Home, Package, Lightbulb, Book, FileText, Users, MessageSquare, CreditCard, BarChart3, FlaskConical, ChevronDown, Globe } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
// @ts-ignore;
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
// @ts-ignore;
import { useLanguage } from '@/components/LanguageContext';
export function Layout({
  $w,
  children,
  currentPage
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const {
    toast
  } = useToast();
  const {
    t
  } = useLanguage();
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
  useEffect(() => {
    // 处理移动端菜单的滚动锁定
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);
  const loadUserInfo = async () => {
    try {
      if ($w.auth.currentUser) {
        setUser($w.auth.currentUser);
      }
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  };
  const handleNavigation = pageId => {
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
    setIsMenuOpen(false);
  };
  const navigationItems = [{
    id: 'index',
    label: t('nav.home', '首页'),
    icon: <Home className="w-5 h-5" />
  }, {
    id: 'product',
    label: t('nav.products', '产品'),
    icon: <Package className="w-5 h-5" />
  }, {
    id: 'solutions',
    label: t('nav.solutions', '解决方案'),
    icon: <Lightbulb className="w-5 h-5" />
  }, {
    id: 'blog',
    label: t('nav.blog', '博客'),
    icon: <Book className="w-5 h-5" />
  }, {
    id: 'resources',
    label: t('nav.resources', '资源'),
    icon: <FileText className="w-5 h-5" />
  }, {
    id: 'about',
    label: t('nav.about', '关于'),
    icon: <Users className="w-5 h-5" />
  }];
  const secondaryItems = [{
    id: 'chat',
    label: t('nav.chat', '智能助手'),
    icon: <MessageSquare className="w-5 h-5" />
  }, {
    id: 'subscription',
    label: t('nav.subscription', '订阅'),
    icon: <CreditCard className="w-5 h-5" />
  }, {
    id: 'dashboard',
    label: t('nav.dashboard', '仪表板'),
    icon: <BarChart3 className="w-5 h-5" />
  }, {
    id: 'experiments',
    label: t('nav.experiments', '实验'),
    icon: <FlaskConical className="w-5 h-5" />
  }, {
    id: 'permissions',
    label: t('nav.permissions', '权限管理'),
    icon: <Users className="w-5 h-5" />
  }, {
    id: 'integrations',
    label: t('nav.integrations', '第三方集成'),
    icon: <Package className="w-5 h-5" />
  }, {
    id: 'exports',
    label: t('nav.exports', '数据导出'),
    icon: <FileText className="w-5 h-5" />
  }, {
    id: 'languages',
    label: t('nav.languages', '语言管理'),
    icon: <Globe className="w-5 h-5" />
  }];
  return <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/95 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Button onClick={() => handleNavigation('index')} variant="ghost" className="text-white hover:text-red-500 p-0">
                <span className="text-xl sm:text-2xl font-bold">AI太极</span>
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navigationItems.map(item => <Button key={item.id} onClick={() => handleNavigation(item.id)} variant="ghost" className={`text-white hover:text-red-500 px-3 py-2 ${currentPage === item.id ? 'text-red-500' : ''}`}>
                  {item.icon}
                  <span className="ml-2 hidden xl:inline">{item.label}</span>
                </Button>)}
            </div>

            {/* User Menu & Language Switcher */}
            <div className="hidden md:flex items-center space-x-3">
              <LanguageSwitcher />
              {user ? <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.nickName ? user.nickName.charAt(0) : 'U'}
                    </span>
                  </div>
                  <span className="text-white text-sm hidden sm:inline">{user.nickName || '用户'}</span>
                </div> : <Button onClick={() => handleNavigation('subscription')} className="bg-red-500 hover:bg-red-600 px-4 py-2 text-sm">
                  {t('common.add', '开始使用')}
                </Button>}
            </div>

            {/* Mobile Menu Button */}
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" className="lg:hidden text-white p-2">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="lg:hidden bg-black/95 backdrop-blur-md border-b border-gray-800">
            <div className="container mx-auto px-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                {navigationItems.map(item => <Button key={item.id} onClick={() => handleNavigation(item.id)} variant="ghost" className={`w-full justify-start text-white hover:text-red-500 p-3 ${currentPage === item.id ? 'text-red-500 bg-red-900/20' : ''}`}>
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Button>)}
                <div className="border-t border-gray-700 pt-2 mt-2">
                  {secondaryItems.map(item => <Button key={item.id} onClick={() => handleNavigation(item.id)} variant="ghost" className={`w-full justify-start text-white hover:text-red-500 p-3 ${currentPage === item.id ? 'text-red-500 bg-red-900/20' : ''}`}>
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Button>)}
                </div>
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex items-center justify-center p-3">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>
          </div>}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black/90 backdrop-blur-md border-t border-gray-800">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">AI太极</h3>
              <p className="text-gray-400 text-sm">
                专业的AI解决方案提供商，助力企业数字化转型。
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('nav.products', '产品')}</h4>
              <ul className="space-y-2">
                <li>
                  <Button onClick={() => handleNavigation('product')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm">
                    智能代理
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('solutions')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm">
                    解决方案
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('subscription')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm">
                    订阅服务
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('nav.resources', '资源')}</h4>
              <ul className="space-y-2">
                <li>
                  <Button onClick={() => handleNavigation('blog')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm">
                    {t('nav.blog', '博客')}
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('resources')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm">
                    {t('common.documentation', '文档')}
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('about')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm">
                    {t('nav.about', '关于我们')}
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">{t('common.support', '支持')}</h4>
              <ul className="space-y-2">
                <li>
                  <Button onClick={() => handleNavigation('chat')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm">
                    {t('nav.chat', '智能助手')}
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('dashboard')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm">
                    {t('nav.dashboard', '仪表板')}
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('experiments')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto text-sm">
                    {t('nav.experiments', '实验室')}
                  </Button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 AI太极. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>
    </div>;
}