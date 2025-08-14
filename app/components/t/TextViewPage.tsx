'use client';

import { useRouter } from "next/navigation";
import { TextData } from "@/service/types";
import TextView from "@/app/components/t/TextView";

interface TextViewPageProps {
  data: TextData | null;
}

export default function TextViewPage({ data }: TextViewPageProps) {
  const router = useRouter();

  const handleCreateNew = () => {
    router.push('/');
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">出错了</h1>
            <p className="text-gray-600 mb-6">文本不存在或已过期</p>
            <button
              onClick={handleCreateNew}
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
        <TextView data={data} onCreateNew={handleCreateNew} />
      </div>
    </div>
  );
}
