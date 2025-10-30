// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Menu, X, Home, Package, Lightbulb, Book, FileText, Users, MessageSquare, CreditCard, BarChart3, FlaskConical, ChevronDown } from 'lucide-react';

// @ts-ignore;
import { withRetry } from '@/components/RetryHandler';
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
    label: '首页',
    icon: <Home className="w-4 h-4" />
  }, {
    id: 'product',
    label: '产品',
    icon: <Package className="w-4 h-4" />
  }, {
    id: 'solutions',
    label: '解决方案',
    icon: <Lightbulb className="w-4 h-4" />
  }, {
    id: 'blog',
    label: '博客',
    icon: <Book className="w-4 h-4" />
  }, {
    id: 'resources',
    label: '资源',
    icon: <FileText className="w-4 h-4" />
  }, {
    id: 'about',
    label: '关于',
    icon: <Users className="w-4 h-4" />
  }];
  const secondaryItems = [{
    id: 'chat',
    label: '智能助手',
    icon: <MessageSquare className="w-4 h-4" />
  }, {
    id: 'subscription',
    label: '订阅',
    icon: <CreditCard className="w-4 h-4" />
  }, {
    id: 'dashboard',
    label: '仪表板',
    icon: <BarChart3 className="w-4 h-4" />
  }, {
    id: 'experiments',
    label: '实验',
    icon: <FlaskConical className="w-4 h-4" />
  }];
  return <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-md border-b border-gray-800' : 'bg-transparent'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Button onClick={() => handleNavigation('index')} variant="ghost" className="text-white hover:text-red-500 p-0">
                <span className="text-2xl font-bold">AI太极</span>
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map(item => <Button key={item.id} onClick={() => handleNavigation(item.id)} variant="ghost" className={`text-white hover:text-red-500 ${currentPage === item.id ? 'text-red-500' : ''}`}>
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>)}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.nickName ? user.nickName.charAt(0) : 'U'}
                    </span>
                  </div>
                  <span className="text-white text-sm">{user.nickName || '用户'}</span>
                </div> : <Button onClick={() => handleNavigation('subscription')} className="bg-red-500 hover:bg-red-600">
                  开始使用
                </Button>}
            </div>

            {/* Mobile Menu Button */}
            <Button onClick={() => setIsMenuOpen(!isMenuOpen)} variant="ghost" className="md:hidden text-white">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-gray-800">
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-2">
                {navigationItems.map(item => <Button key={item.id} onClick={() => handleNavigation(item.id)} variant="ghost" className={`w-full justify-start text-white hover:text-red-500 ${currentPage === item.id ? 'text-red-500' : ''}`}>
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Button>)}
                <div className="border-t border-gray-700 pt-2 mt-2">
                  {secondaryItems.map(item => <Button key={item.id} onClick={() => handleNavigation(item.id)} variant="ghost" className={`w-full justify-start text-white hover:text-red-500 ${currentPage === item.id ? 'text-red-500' : ''}`}>
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </Button>)}
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
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">AI太极</h3>
              <p className="text-gray-400">
                专业的AI解决方案提供商，助力企业数字化转型。
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">产品</h4>
              <ul className="space-y-2">
                <li>
                  <Button onClick={() => handleNavigation('product')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                    智能代理
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('solutions')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                    解决方案
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('subscription')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                    订阅服务
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">资源</h4>
              <ul className="space-y-2">
                <li>
                  <Button onClick={() => handleNavigation('blog')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                    博客
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('resources')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                    文档
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('about')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                    关于我们
                  </Button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">支持</h4>
              <ul className="space-y-2">
                <li>
                  <Button onClick={() => handleNavigation('chat')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                    智能助手
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('dashboard')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                    仪表板
                  </Button>
                </li>
                <li>
                  <Button onClick={() => handleNavigation('experiments')} variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                    实验室
                  </Button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 AI太极. 保留所有权利.
            </p>
          </div>
        </div>
      </footer>
    </div>;
}