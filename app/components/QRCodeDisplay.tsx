'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  /** 要生成二维码的内容 */
  content: string;
  /** 二维码大小，可选值: 'small' | 'medium' | 'large' */
  size?: 'small' | 'medium' | 'large';
  /** 是否显示标题 */
  showTitle?: boolean;
  /** 自定义标题 */
  title?: string;
  /** 是否显示描述 */
  showDescription?: boolean;
  /** 自定义描述 */
  description?: string;
  /** 是否为预览模式 */
  isPreview?: boolean;
  /** 预览模式下显示的占位文本 */
  placeholderText?: string;
  /** 容器的额外样式类 */
  className?: string;
  /** 是否显示边框 */
  showBorder?: boolean;
  /** 边框样式 */
  borderStyle?: 'solid' | 'dashed';
}

export default function QRCodeDisplay({
  content,
  size = 'medium',
  showTitle = true,
  title = '分享二维码',
  showDescription = true,
  description = '扫描二维码快速访问',
  isPreview = false,
  placeholderText = '生成中...',
  className = '',
  showBorder = true,
  borderStyle = 'dashed'
}: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 根据size获取二维码尺寸
  const getQRCodeSize = () => {
    switch (size) {
      case 'small':
        return 'w-24 h-24';
      case 'large':
        return 'w-64 h-64';
      case 'medium':
      default:
        return 'w-48 h-48';
    }
  };

  // 根据size获取容器padding
  const getContainerPadding = () => {
    switch (size) {
      case 'small':
        return 'p-3';
      case 'large':
        return 'p-8';
      case 'medium':
      default:
        return 'p-6';
    }
  };

  useEffect(() => {
    const generateQRCode = async () => {
      if (!content || content.trim() === '') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        
        const qrCodeDataUrl = await QRCode.toDataURL(content, {
          width: size === 'small' ? 96 : size === 'large' ? 256 : 192,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeUrl(qrCodeDataUrl);
      } catch (err) {
        console.error('生成二维码失败:', err);
        setError('生成二维码失败');
      } finally {
        setLoading(false);
      }
    };

    generateQRCode();
  }, [content, size]);

  const isEmpty = !content || content.trim() === '';

  return (
    <div className={`text-center ${className}`}>
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      
      <div className={`inline-block ${getContainerPadding()} bg-white ${
        showBorder 
          ? `border-2 ${borderStyle === 'solid' ? 'border-gray-300' : 'border-dashed border-gray-300'} rounded-lg`
          : ''
      }`}>
        {loading ? (
          <div className={`${getQRCodeSize()} bg-gray-100 flex items-center justify-center rounded`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
              <span className="text-gray-500 text-xs">
                {placeholderText}
              </span>
            </div>
          </div>
        ) : error ? (
          <div className={`${getQRCodeSize()} bg-red-50 flex items-center justify-center rounded border border-red-200`}>
            <div className="text-center">
              <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-600 text-xs">
                {error}
              </span>
            </div>
          </div>
        ) : isEmpty ? (
          <div className={`${getQRCodeSize()} bg-gray-100 flex items-center justify-center rounded`}>
            <span className="text-gray-400 text-xs text-center px-2">
              {isPreview ? '输入内容后显示二维码' : '无内容可显示'}
            </span>
          </div>
        ) : qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt={title}
            className={`${getQRCodeSize()} mx-auto rounded`}
          />
        ) : null}
      </div>
      
      {showDescription && !loading && !error && !isEmpty && (
        <p className="text-sm text-gray-500 mt-3">
          {description}
        </p>
      )}
    </div>
  );
}
