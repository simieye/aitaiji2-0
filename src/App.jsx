// @ts-ignore;
import React, { Suspense, lazy } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

// @ts-ignore;
import { ErrorBoundary } from '@/components/ErrorBoundary';
// @ts-ignore;
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
// @ts-ignore;
import { Layout } from '@/components/Layout';
// @ts-ignore;
import { ExperimentProvider } from '@/components/ExperimentProvider';
// @ts-ignore;
import { I18nProvider } from '@/components/I18nProvider';

// Lazy load pages for better performance
const IndexPage = lazy(() => import('./pages/index'));
const ProductPage = lazy(() => import('./pages/product'));
const SolutionsPage = lazy(() => import('./pages/solutions'));
const BlogPage = lazy(() => import('./pages/blog'));
const ResourcesPage = lazy(() => import('./pages/resources'));
const AboutPage = lazy(() => import('./pages/about'));
const ChatPage = lazy(() => import('./pages/chat'));
const SubscriptionPage = lazy(() => import('./pages/subscription'));
const DashboardPage = lazy(() => import('./pages/dashboard'));
const ExperimentsPage = lazy(() => import('./pages/experiments'));
const RolesPage = lazy(() => import('./pages/roles'));
const ExportPage = lazy(() => import('./pages/export'));
const I18nPage = lazy(() => import('./pages/i18n'));
// Page component mapping
const pageComponents = {
  index: IndexPage,
  product: ProductPage,
  solutions: SolutionsPage,
  blog: BlogPage,
  resources: ResourcesPage,
  about: AboutPage,
  chat: ChatPage,
  subscription: SubscriptionPage,
  dashboard: DashboardPage,
  experiments: ExperimentsPage,
  roles: RolesPage,
  export: ExportPage,
  i18n: I18nPage
};
// Loading component
const LoadingSpinner = () => <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
      <p className="text-white mt-4">Loading...</p>
    </div>
  </div>;
// Error fallback component
const ErrorFallback = ({
  error,
  resetError
}) => <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white flex items-center justify-center">
    <div className="text-center">
      <div className="text-red-500 text-6xl mb-4">⚠️</div>
      <h1 className="text-white text-2xl font-bold mb-4">出现了一些问题</h1>
      <p className="text-gray-300 mb-6">{error.message}</p>
      <button onClick={resetError} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg">
        重试
      </button>
    </div>
  </div>;
// Main App component
function AppContent(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  // Get current page from URL or default to index
  const getCurrentPage = () => {
    try {
      const path = window.location.pathname;
      const pageId = path.replace('/', '') || 'index';
      return pageComponents[pageId] ? pageId : 'index';
    } catch (error) {
      console.error('Error getting current page:', error);
      return 'index';
    }
  };
  const currentPage = getCurrentPage();
  const PageComponent = pageComponents[currentPage];
  // Handle global errors
  React.useEffect(() => {
    const handleError = (event, error) => {
      console.error('Global error:', error);
      toast({
        title: "系统错误",
        description: "发生了未知错误，请刷新页面重试",
        variant: "destructive"
      });
    };
    // Setup error handlers
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, [toast]);
  return <ErrorBoundary fallback={<ErrorFallback />}>
      <PerformanceMonitor>
        <I18nProvider>
          <ExperimentProvider $w={$w}>
            <Layout $w={$w} currentPage={currentPage}>
              <Suspense fallback={<LoadingSpinner />}>
                <PageComponent $w={$w} />
              </Suspense>
            </Layout>
          </ExperimentProvider>
        </I18nProvider>
      </PerformanceMonitor>
    </ErrorBoundary>;
}
// Export default App
export default function App(props) {
  return <AppContent {...props} />;
}