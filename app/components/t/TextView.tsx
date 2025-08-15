'use client';

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { TextData } from "@/service/types";
import QRCodeDisplay from "@/app/components/QRCodeDisplay";
import CanvasText from "@/app/components/CanvasText";

interface TextViewProps {
  data: TextData;
  href: string;
  isPreview?: boolean;
  onCreateNew?: () => void;
}

export default function TextView({ data, href, isPreview = false, onCreateNew }: TextViewProps) {
  const t = useTranslations();
  const [copySuccess, setCopySuccess] = useState('');

  const copyToClipboard = async (content: string, type: 'text' | 'url') => {
    try {
      await navigator.clipboard.writeText(content);
      const message = type === 'text' ? t('textView.copySuccess.text') : t('textView.copySuccess.url');
      setCopySuccess(message);
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      console.error('复制失败:', err);
      setCopySuccess(t('textView.copyError'));
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
      return t('textView.expiry.expired');
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return t('textView.expiry.daysLeft', { days: diffDays });
    } else {
      return t('textView.expiry.hoursLeft', { hours: diffHours });
    }
  };

  const isEmptyText = !data.text || data.text === t('home.preview.placeholder');

  return (
    <div className={`bg-white rounded-lg shadow-sm p-${isPreview ? '4' : '6'}`}>
      {/* 头部信息 */}
      <div className="flex justify-between items-center mb-6">
        <div className={`${isPreview ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          {data?.userName ? (
            <CanvasText 
              text={t('textView.title.withUser', { userName: data.userName })}
              fontSize={isPreview ? 20 : 24}
              fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif"
              color="#1f2937"
              fontWeight="bold"
              className="inline-block"
            />
          ) : (
            <CanvasText 
              text={t('textView.title.withoutUser')}
              fontSize={isPreview ? 20 : 24}
              fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif"
              color="#1f2937"
              fontWeight="bold"
              className="inline-block"
            />
          )}
        </div>
        {isPreview ? (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {t('home.preview.mode')}
          </span>
        ) : (
          onCreateNew && (
            <button
              onClick={onCreateNew}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              {t('textView.createNew')}
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
                {t('textView.createdAt', { date: formatDate(data.createdAt) })}
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
                {t('textView.content.label')}
              </label>
              <button
                onClick={() => copyToClipboard(data.text, 'text')}
                disabled={isEmptyText}
                className={`px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isPreview ? 'text-xs px-2' : ''}`}
              >
                {t('textView.content.copy')}
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
              <div className={`${isPreview ? 'min-h-[60px]' : ''} flex items-start`}>
                {isEmptyText ? (
                  <span className="text-gray-400 italic text-sm">{t('textView.content.placeholder')}</span>
                ) : (
                  <CanvasText 
                    text={data.text}
                    fontSize={14}
                    fontFamily="ui-monospace, SFMono-Regular, 'SF Mono', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
                    color="#1f2937"
                    lineHeight={1.5}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 二维码 */}
          {data.displayType === 'qrcode' && (
            <div className="mb-6">
              <QRCodeDisplay
                content={data.text}
                size={isPreview ? 'small' : 'medium'}
                showTitle={true}
                title={t('textView.qrcode.title')}
                showDescription={true}
                description={t('textView.qrcode.description')}
                isPreview={isPreview}
                placeholderText={isEmptyText ? t('textView.qrcode.placeholder') : t('textView.qrcode.generating')}
                showBorder={true}
                borderStyle="solid"
              />
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
                {isPreview ? t('textView.shareUrl.labelPreview') : t('textView.shareUrl.label')}
              </label>
              <button
                onClick={() => copyToClipboard(href, 'url')}
                className={`px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${isPreview ? 'text-xs px-2' : ''}`}
              >
                {t('textView.shareUrl.copy')}
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-300 rounded-md p-3">
              <code className={`text-sm text-gray-800 break-all ${isPreview ? 'text-xs text-gray-600' : ''}`}>
                {href}
              </code>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
