'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { TextData } from "@/service/types";
import TextView from "@/app/components/t/TextView";

interface TextViewPageProps {
  data: TextData | null;
}

export default function TextViewPage({ data }: TextViewPageProps) {
  const router = useRouter();
  const t = useTranslations();
  const [href, setHref] = useState('');

  useEffect(() => {
    setHref(window.location.href);
  }, []);

  const handleCreateNew = () => {
    router.push('/');
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('textView.error.title')}</h1>
            <p className="text-gray-600 mb-6">{t('textView.error.message')}</p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('textView.error.backHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <TextView data={data} href={href} onCreateNew={handleCreateNew} />
      </div>
    </div>
  );
}
