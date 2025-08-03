import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 分享历史数据结构
interface ShareHistory {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  expiresAt: string;
}

// 分享历史管理函数
const STORAGE_KEY = 'text-sharing-history';

const getShareHistory = (): ShareHistory[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const clearHistory = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('清空分享历史失败:', error);
  }
};

export default function HistoryPage() {
  const router = useRouter();
  const [shareHistory, setShareHistory] = useState<ShareHistory[]>([]);

  // 加载分享历史
  useEffect(() => {
    setShareHistory(getShareHistory());
  }, []);

  // 定时更新过期时间显示
  useEffect(() => {
    const interval = setInterval(() => {
      if (shareHistory.length > 0) {
        setShareHistory(getShareHistory());
      }
    }, 60000); // 每分钟更新一次

    return () => clearInterval(interval);
  }, [shareHistory.length]);

  // 格式化时间剩余显示
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      return '已过期';
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays}天后过期`;
    } else if (diffHours > 0) {
      return `${diffHours}小时后过期`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}分钟后过期`;
    }
  };

  // 清空所有历史记录
  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有分享历史吗？')) {
      clearHistory();
      setShareHistory([]);
    }
  };

  // 跳转到分享页面
  const handleViewShare = (id: string) => {
    window.open(`/t/${id}`, '_blank');
  };

  // 格式化创建时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 导航面包屑 */}
        <nav className="mb-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </button>
        </nav>

        {/* 头部 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">分享历史</h1>
            <p className="text-gray-600 mt-2">查看和管理您的所有分享记录</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            创建新分享
          </button>
        </div>

        {/* 统计信息 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{shareHistory.length}</div>
              <div className="text-sm text-gray-600">总分享数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {shareHistory.filter(item => new Date(item.expiresAt) > new Date()).length}
              </div>
              <div className="text-sm text-gray-600">有效分享</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {shareHistory.filter(item => new Date(item.expiresAt) <= new Date()).length}
              </div>
              <div className="text-sm text-gray-600">已过期</div>
            </div>
          </div>
        </div>

        {/* 历史记录列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800">历史记录</h2>
            {shareHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                清空所有记录
              </button>
            )}
          </div>

          {shareHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">暂无分享历史</h3>
              <p className="text-gray-600 mb-6">您还没有创建任何分享记录</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                创建第一个分享
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {shareHistory.map((item) => {
                const isExpired = new Date(item.expiresAt) <= new Date();
                return (
                  <div
                    key={item.id}
                    className={`p-6 transition-colors ${
                      isExpired ? 'bg-gray-50' : 'hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`text-lg font-medium truncate ${
                              isExpired ? 'text-gray-500' : 'text-gray-800'
                            }`}
                          >
                            {item.title}
                          </h3>
                          {item.userName && (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isExpired
                                  ? 'bg-gray-200 text-gray-600'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {item.userName}
                            </span>
                          )}
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isExpired
                                ? 'bg-red-100 text-red-600'
                                : 'bg-green-100 text-green-600'
                            }`}
                          >
                            {isExpired ? '已过期' : '有效'}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">创建时间:</span>
                            <span>{formatDate(item.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">状态:</span>
                            <span
                              className={
                                isExpired ? 'text-red-500' : 'text-orange-500'
                              }
                            >
                              {getTimeRemaining(item.expiresAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {!isExpired && (
                          <button
                            onClick={() => handleViewShare(item.id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            查看分享
                          </button>
                        )}
                        <button
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/t/${item.id}`)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          复制链接
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}