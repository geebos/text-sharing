'use client';

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { TextData } from "@/service/types";

export default function TextView({ data }: { data: TextData | null }) {
  const router = useRouter();
  const [qrCode, setQrCode] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [href, setHref] = useState('');

  useEffect(() => {
    if (data?.displayType === 'qrcode') {
      QRCode.toDataURL(data.text).then(setQrCode);
    }
    setHref(window.location.href);
  }, [data]);

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

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">出错了</h1>
            <p className="text-gray-600 mb-6">文本不存在或已过期</p>
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
              {data?.userName ? `${data.userName} 分享的文本` : '分享的文本'}
            </h1>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              创建新分享
            </button>
          </div>

          {/* 文本信息 */}
          {data && (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    创建时间：{formatDate(data.createdAt)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {getTimeRemaining(data.expiresAt)}
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
                    onClick={() => copyToClipboard(data.text, '文本')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    复制文本
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 break-words">
                    {data.text}
                  </pre>
                </div>
              </div>

              {/* 二维码 */}
              {data.displayType === 'qrcode' && qrCode && (
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
              <div className="border-t border-gray-300 pt-6">
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
                    {href}
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