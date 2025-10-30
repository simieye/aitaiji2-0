// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Alert, AlertDescription, AlertTitle, Button } from '@/components/ui';
// @ts-ignore;
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true
    };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // 记录错误到数据库
    this.logErrorToDatabase(error, errorInfo);
  }

  // 修正：将类属性方法改为普通方法
  async logErrorToDatabase(error, errorInfo) {
    try {
      const {
        $w
      } = this.props;
      await $w.cloud.callDataSource({
        dataSourceName: 'taiji_user_event',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            user_id: $w.auth.currentUser?.userId || 'anonymous',
            event: 'frontend_error',
            event_category: 'error',
            event_action: 'error_boundary',
            event_label: error.message,
            event_value: 1,
            metadata: {
              error: error.toString(),
              stack: errorInfo.componentStack,
              url: window.location.href,
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            },
            timestamp: new Date()
          }
        }
      });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  }
  handleReset() {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }
  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-white flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive" className="bg-red-900/50 border-red-500">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-white">系统错误</AlertTitle>
              <AlertDescription className="text-gray-300">
                <p className="mb-4">很抱歉，系统遇到了一个错误。</p>
                <p className="text-sm mb-4">{this.state.error?.toString()}</p>
                <Button onClick={() => this.handleReset()} variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重新加载
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </div>;
    }
    return this.props.children;
  }
}