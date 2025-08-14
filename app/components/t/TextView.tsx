'use client';

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { TextData } from "@/service/types";

interface TextViewProps {
  data: TextData;
  isPreview?: boolean;
  onCreateNew?: () => void;
}

export default function TextView({ data, isPreview = false, onCreateNew }: TextViewProps) {
  const [qrCode, setQrCode] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [href, setHref] = useState('');

  useEffect(() => {
    if (data?.displayType === 'qrcode') {
      if (isPreview) {
        // 预览模式：生成预览用的二维码
        if (typeof window !== 'undefined' && data.text !== '请输入文本内容...') {
          const previewUrl = `${window.location.origin}/t/preview-${Date.now()}`;
          QRCode.toDataURL(previewUrl).then(setQrCode);
        }
      } else {
        // 正常模式：使用实际文本内容生成二维码
        QRCode.toDataURL(data.text).then(setQrCode);
      }
    }
    
    if (typeof window !== 'undefined' && !isPreview) {
      setHref(window.location.href);
    }
  }, [data, isPreview]);

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

  const isEmptyText = !data.text || data.text === '请输入文本内容...';

  return (
    <div className={`bg-white rounded-lg shadow-sm p-${isPreview ? '4' : '6'}`}>
          {/* 头部信息 */}
          <div className="flex justify-between items-center mb-6">
            <h1 className={`${isPreview ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
              {data?.userName ? `${data.userName} 分享的文本` : '分享的文本'}
            </h1>
            {isPreview ? (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                预览模式
              </span>
            ) : (
              onCreateNew && (
                <button
                  onClick={onCreateNew}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  创建新分享
                </button>
              )
            )}
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
                    disabled={isEmptyText}
                    className={`px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isPreview ? 'text-xs px-2' : ''}`}
                  >
                    复制文本
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
                  <pre className={`whitespace-pre-wrap font-mono text-sm text-gray-800 break-words ${isPreview ? 'min-h-[60px]' : ''}`}>
                    {isEmptyText ? (
                      <span className="text-gray-400 italic">请输入文本内容...</span>
                    ) : (
                      data.text
                    )}
                  </pre>
                </div>
              </div>

              {/* 二维码 */}
              {data.displayType === 'qrcode' && (
                <div className="mb-6 text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    分享二维码
                  </label>
                  {qrCode ? (
                    <div className="inline-block p-1 bg-white border border-gray-300 rounded-md">
                      <img
                        src={qrCode}
                        alt="分享二维码"
                        className={`${isPreview ? 'w-32 h-32' : 'w-48 h-48'}`}
                      />
                    </div>
                  ) : (
                    isPreview && (
                      <div className="inline-block p-1 bg-white border border-gray-300 rounded-md">
                        <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400 text-xs text-center">
                            {isEmptyText ? '输入内容后显示二维码' : '生成中...'}
                          </span>
                        </div>
                      </div>
                    )
                  )}
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
                    {isPreview ? '分享链接（预览）' : '分享链接'}
                  </label>
                  <button
                    onClick={() => copyToClipboard(
                      isPreview 
                        ? (typeof window !== 'undefined' 
                            ? `${window.location.origin}/t/preview-example`
                            : '/t/preview-example')
                        : href, 
                      '链接'
                    )}
                    className={`px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${isPreview ? 'text-xs px-2' : ''}`}
                  >
                    复制链接
                  </button>
                </div>
                <div className="bg-gray-50 border border-gray-300 rounded-md p-3">
                  <code className={`text-sm text-gray-800 break-all ${isPreview ? 'text-xs text-gray-600' : ''}`}>
                    {isPreview 
                      ? (typeof window !== 'undefined' 
                          ? `${window.location.origin}/t/preview-example`
                          : '/t/preview-example')
                      : href
                    }
                  </code>
                </div>
              </div>
            </>
          )}
    </div>
  );
}
