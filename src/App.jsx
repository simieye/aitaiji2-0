// @ts-ignore;
import React, { useState } from 'react';

import { Layout } from '@/components/Layout';
import HomePage from '@/pages/index';
import ProductPage from '@/pages/product';
import SolutionsPage from '@/pages/solutions';
import BlogPage from '@/pages/blog';
import ResourcesPage from '@/pages/resources';
import AboutPage from '@/pages/about';
import ChatPage from '@/pages/chat';
export default function App(props) {
  const {
    $w
  } = props;
  const [currentPage, setCurrentPage] = useState('index');
  const handleNavigate = pageId => {
    setCurrentPage(pageId);
    $w.utils.navigateTo({
      pageId,
      params: {}
    });
  };
  const renderPage = () => {
    switch (currentPage) {
      case 'index':
        return <HomePage {...props} />;
      case 'product':
        return <ProductPage {...props} />;
      case 'solutions':
        return <SolutionsPage {...props} />;
      case 'blog':
        return <BlogPage {...props} />;
      case 'resources':
        return <ResourcesPage {...props} />;
      case 'about':
        return <AboutPage {...props} />;
      case 'chat':
        return <ChatPage {...props} />;
      default:
        return <HomePage {...props} />;
    }
  };
  return <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </Layout>;
}