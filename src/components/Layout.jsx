// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Menu, X, Home, Package, Lightbulb, BookOpen, Users } from 'lucide-react';

export function Layout({
  children,
  currentPage,
  onNavigate
}) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuItems = [{
    id: 'index',
    label: '首页',
    icon: Home
  }, {
    id: 'product',
    label: '产品',
    icon: Package
  }, {
    id: 'solutions',
    label: '解决方案',
    icon: Lightbulb
  }, {
    id: 'blog',
    label: '博客',
    icon: BookOpen
  }, {
    id: 'resources',
    label: '资源',
    icon: BookOpen
  }, {
    id: 'about',
    label: '关于',
    icon: Users
  }];
  return <div className="min-h-screen bg-black">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
              <span className="text-white font-bold text-xl">太极OS</span>
            </div>

            {/* 桌面菜单 */}
            <div className="hidden md:flex items-center space-x-8">
              {menuItems.map(item => <Button key={item.id} variant="ghost" className={`text-gray-300 hover:text-white hover:bg-gray-800 ${currentPage === item.id ? 'text-white' : ''}`} onClick={() => onNavigate(item.id)}>
                  {item.label}
                </Button>)}
            </div>

            {/* 移动端菜单按钮 */}
            <button className="md:hidden text-gray-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && <div className="md:hidden bg-gray-900 border-t border-gray-800">
            {menuItems.map(item => <button key={item.id} className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-800 hover:text-white flex items-center space-x-3" onClick={() => {
          onNavigate(item.id);
          setIsMenuOpen(false);
        }}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>)}
          </div>}
      </nav>

      {/* 主内容 */}
      <main className="pt-16">
        {children}
      </main>
    </div>;
}