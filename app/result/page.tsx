'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QRCodeDisplay from '@/app/components/QRCodeDisplay';

interface ShareResult {
  id: string;
  shareUrl: string;
  displayType: 'text' | 'qrcode';
}

export default function ResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<ShareResult | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeResult = () => {
      const id = searchParams.get('id');
      const displayType = searchParams.get('displayType') as 'text' | 'qrcode' || 'text';
      
      if (!id) {
        router.push('/');
        return;
      }

      const shareUrl = `${window.location.origin}/t/${id}`;

      setResult({
        id,
        shareUrl,
        displayType
      });
      setLoading(false);
    };

    initializeResult();
  }, [searchParams, router]);

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

  const createNewShare = () => {
    router.push('/');
  };

  const viewHistory = () => {
    router.push('/history');
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="pt-8 pb-4 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                分享链接创建成功！
              </h1>
              <p className="text-lg text-gray-600">您的内容已安全分享，可以通过以下方式访问</p>
            </div>

            <div className="space-y-8">
              {/* Share URL Section */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">分享链接</h2>
                <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
                  <input
                    type="text"
                    value={result.shareUrl}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md bg-white text-sm md:text-base font-mono"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(result.shareUrl, '_blank')}
                      className="flex-1 md:flex-none px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      打开链接
                    </button>
                    <button
                      onClick={() => copyToClipboard(result.shareUrl, '链接')}
                      className="flex-1 md:flex-none px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      复制链接
                    </button>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              {result.displayType === 'qrcode' && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <QRCodeDisplay
                    content={result.shareUrl}
                    size="large"
                    showTitle={true}
                    title="分享二维码"
                    showDescription={true}
                    description="扫描二维码快速访问"
                    showBorder={true}
                    borderStyle="dashed"
                  />
                </div>
              )}

              {/* Success Message */}
              {copySuccess && (
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {copySuccess}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t pt-8">
                <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-4">
                  <button
                    onClick={createNewShare}
                    className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    创建新的分享
                  </button>
                  <button
                    onClick={viewHistory}
                    className="flex-1 py-3 px-6 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    查看分享历史
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">温馨提示：</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• 分享链接具有时效性，请在有效期内使用</li>
                      <li>• 链接仅对知道完整URL的用户可见</li>
                      <li>• 您可以在分享历史中管理和删除已创建的分享</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
