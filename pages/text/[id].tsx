import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import QRCode from 'qrcode';

interface TextData {
  text: string;
  userName: string;
  displayType: 'text' | 'qrcode';
  createdAt: string;
  expiresAt: string;
}

export default function TextView() {
  const router = useRouter();
  const { id } = router.query;
  const [textData, setTextData] = useState<TextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      return;
    }

    fetchText(id);
  }, [id]);

  const fetchText = async (textId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/text/${textId}`);
      
      if (response.status === 404) {
        setError('文本不存在或已过期');
        return;
      }
      
      if (!response.ok) {
        throw new Error('获取文本失败');
      }

      const data = await response.json();
      setTextData(data);

      // 如果是二维码类型，生成二维码
      if (data.displayType === 'qrcode') {
        const qrCodeDataURL = await QRCode.toDataURL(data.text);
        setQrCode(qrCodeDataURL);
      }
      
    } catch (err) {
      console.error('获取文件失败:', err);
      setError('获取文本失败，请重试');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
  };

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
    } else {
      return `${diffHours}小时后过期`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">出错了</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* 头部信息 */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {textData?.userName ? `${textData.userName} 分享的文本` : '分享的文本'}
            </h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              创建新分享
            </button>
          </div>

          {/* 文本信息 */}
          {textData && (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    创建时间：{formatDate(textData.createdAt)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getTimeRemaining(textData.expiresAt)}
                  </span>
                </div>
              </div>

              {/* 文本内容 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    文本内容
                  </label>
                  <button
                    onClick={() => copyToClipboard(textData.text, '文本')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    复制文本
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 break-words">
                    {textData.text}
                  </pre>
                </div>
              </div>

              {/* 二维码 */}
              {textData.displayType === 'qrcode' && qrCode && (
                <div className="mb-6 text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    分享二维码
                  </label>
                  <div className="inline-block p-1 bg-white border border-gray-300 rounded-md">
                    <img 
                      src={qrCode} 
                      alt="分享二维码" 
                      className="w-48 h-48"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    扫描二维码获取文本内容
                  </p>
                </div>
              )}

              {/* 成功提示 */}
              {copySuccess && (
                <div className="text-center text-green-600 text-sm mb-4">
                  {copySuccess}
                </div>
              )}

              {/* 分享链接 */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    分享链接
                  </label>
                  <button
                    onClick={() => copyToClipboard(window.location.href, '链接')}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    复制链接
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded-md p-3">
                  <code className="text-sm text-gray-800 break-all">
                    {typeof window !== 'undefined' ? window.location.href : ''}
                  </code>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}