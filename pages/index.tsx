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
      const shareUrl = `${window.location.origin}/text/${data.id}`;

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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          文本分享工具
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
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
                    placeholder="输入您的名称（用于标识分享者）"
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
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    maxLength={maxLength}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {text.length}/{maxLength}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* 过期时间选择 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    过期时间 *
                  </label>
                  <div className="flex gap-4">
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
                    展示类型
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="displayType"
                        value="text"
                        checked={displayType === 'text'}
                        onChange={(e) => setDisplayType(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">仅文本</span>
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
                      <span className="ml-2 text-sm text-gray-700">文本 + 二维码</span>
                    </label>
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
              </div>
            </form>
            ) : (
            /* 结果展示区域 */
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  分享链接创建成功！
                </h2>
              </div>

              {/* 分享链接 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  分享链接
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={result.shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
                  />
                  <button
                    onClick={() => copyToClipboard(result.shareUrl, '链接')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-r-md hover:bg-blue-700 transition-colors"
                  >
                    复制
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
                      className="w-48 h-48"
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
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <button
                    onClick={() => window.location.href = '/history'}
                    className="inline-flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    查看分享历史
                    {shareHistory.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
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
  );
}
