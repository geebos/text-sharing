import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

// 分享历史数据结构（用于统计显示）
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

const addToHistory = (item: ShareHistory) => {
  if (typeof window === 'undefined') return;
  try {
    const history = getShareHistory();
    const newHistory = [item, ...history.filter(h => h.id !== item.id)].slice(0, 10); // 最多保存10条
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('保存分享历史失败:', error);
  }
};

export default function Home() {
  const [text, setText] = useState('');
  const [userName, setUserName] = useState('');
  const [expiryTime, setExpiryTime] = useState('1day');
  const [displayType, setDisplayType] = useState('text');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    id: string;
    shareUrl: string;
    qrCode?: string;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [shareHistory, setShareHistory] = useState<ShareHistory[]>([]);

  const maxLength = parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH || '200'); // 最大文本长度

  // 加载分享历史（仅用于统计显示）
  useEffect(() => {
    setShareHistory(getShareHistory());
  }, []);

  const expiryOptions = [
    { value: '1day', label: '1天', hours: 24 },
    { value: '7days', label: '7天', hours: 24 * 7 },
    { value: '30days', label: '30天', hours: 24 * 30 }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      alert('请输入文本内容');
      return;
    }

    if (text.length > maxLength) {
      alert(`文本长度不能超过${maxLength}个字符`);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          userName: userName.trim(),
          expiryTime,
          displayType
        }),
      });

      console.log(response);
      if (!response.ok) {
        throw new Error('提交失败');
      }

      const data = await response.json();
      const shareUrl = `${window.location.origin}/t/${data.id}`;

      let qrCode = '';
      if (displayType === 'qrcode') {
        qrCode = await QRCode.toDataURL(shareUrl);
      }

      setResult({
        id: data.id,
        shareUrl,
        qrCode
      });

      // 添加到分享历史
      const historyItem: ShareHistory = {
        id: data.id,
        title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        userName: userName.trim(),
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiryOptions.find(opt => opt.value === expiryTime)!.hours * 60 * 60 * 1000).toISOString()
      };
      addToHistory(historyItem);
      setShareHistory(getShareHistory()); // 更新计数

    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(`${type}已复制到剪贴板`);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      setCopySuccess('复制失败');
    }
  };

  const reset = () => {
    setText('');
    setUserName('');
    setResult(null);
    setCopySuccess('');
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="pt-16 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            TextSharing
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            安全、私密、便捷的文本分享平台
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-4 md:p-8">
            
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                {/* 用户名称输入 */}
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                    用户名称 (可选)
                  </label>
                  <input
                    id="userName"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="输入名称（用于标识分享者）"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={50}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {userName.length}/50
                  </div>
                </div>

                {/* 文本输入区域 */}
                <div>
                  <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                    文本内容 *
                  </label>
                  <textarea
                    id="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="请输入要分享的文本内容..."
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    maxLength={maxLength}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {text.length}/{maxLength}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-6 md:flex-row md:space-y-0 md:space-x-8">
                {/* 过期时间选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    过期时间 *
                  </label>
                  <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:gap-4">
                    {expiryOptions.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          name="expiryTime"
                          value={option.value}
                          checked={expiryTime === option.value}
                          onChange={(e) => setExpiryTime(e.target.value)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 展示类型选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分享类型
                  </label>
                  <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="displayType"
                        value="text"
                        checked={displayType === 'text'}
                        onChange={(e) => setDisplayType(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">文本</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="displayType"
                        value="qrcode"
                        checked={displayType === 'qrcode'}
                        onChange={(e) => setDisplayType(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">二维码</span>
                    </label>
                  </div>
                </div>
              </div>

               {/* 提交按钮 */}
               <button
                  type="submit"
                  disabled={isSubmitting || !text.trim()}
                  className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '创建中...' : '创建分享链接'}
                </button>
            </form>
            ) : (
            /* 结果展示区域 */
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  分享链接创建成功！
                </h2>
                <p className="text-gray-600">您的内容已安全分享，可以通过以下方式访问</p>
              </div>

              {/* 分享链接 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分享链接
                </label>
                <div className="flex flex-col space-y-2 md:flex-row md:space-y-0">
                  <input
                    type="text"
                    value={result.shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md md:rounded-l-md md:rounded-r-none bg-gray-50 text-sm md:text-base"
                  />
                  <button
                    onClick={() => window.open(result.shareUrl, '_blank')}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md md:rounded-none hover:bg-green-700 transition-colors whitespace-nowrap"
                  >
                    打开链接
                  </button>
                  <button
                    onClick={() => copyToClipboard(result.shareUrl, '链接')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md md:rounded-l-none md:rounded-r-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    复制链接
                  </button>
                </div>
              </div>

              {/* 二维码 */}
              {result.qrCode && (
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分享二维码
                  </label>
                  <div className="inline-block p-4 bg-white border border-gray-300 rounded-md">
                    <img
                      src={result.qrCode}
                      alt="分享二维码"
                      className="w-32 h-32 md:w-48 md:h-48"
                    />
                  </div>
                </div>
              )}

              {/* 成功提示 */}
              {copySuccess && (
                <div className="text-center text-green-600 text-sm">
                  {copySuccess}
                </div>
              )}

              {/* 重新创建按钮 */}
              <button
                onClick={reset}
                className="w-full py-3 px-4 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
              >
                创建新的分享
              </button>
            </div>
            )}
            
            {/* 历史记录入口 */}
            {!result && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <button
                    onClick={() => window.location.href = '/history'}
                    className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    查看分享历史
                    {shareHistory.length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                        {shareHistory.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
          )}
          </div>
        </div>
      </div>

      <div className="pt-16 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-blue-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">隐私安全</h3>
              <p className="text-gray-600 text-sm">
                防搜索引擎索引、设置有效期限、随机 URL 生成，确保您的内容安全私密
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-green-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">历史记录管理</h3>
              <p className="text-gray-600 text-sm">
                自动保存分享历史，方便管理和查看之前的分享内容
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-purple-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">支持二维码</h3>
              <p className="text-gray-600 text-sm">
                自动生成二维码，方便移动设备扫码访问和分享
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
