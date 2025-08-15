'use client';

import { useState, useTransition, useEffect } from 'react';
import { useLocale } from 'next-intl';

const languages = [
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) {
      setIsOpen(false);
      return;
    }

    startTransition(() => {
      // 设置语言偏好到 cookie，使用更可靠的方式
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1); // 1 year from now
      document.cookie = `locale=${newLocale}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
      
      // 使用 window.location.href 而不是 reload() 来确保完全重新加载
      window.location.href = window.location.href;
    });
    
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="absolute top-4 right-4 z-50">
      <div className="relative">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 hover:bg-white disabled:opacity-50 cursor-pointer"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <span className="text-sm font-medium text-gray-700">
            {currentLanguage.name}
          </span>
          <svg 
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden z-50">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  switchLanguage(language.code);
                }}
                disabled={isPending}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer ${
                  language.code === locale 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                    : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="text-sm font-medium">{language.name}</span>
                {language.code === locale && (
                  <svg className="w-4 h-4 ml-auto text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
