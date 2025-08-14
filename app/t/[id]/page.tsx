import { getText } from '@/service/text';
import { TextData } from '@/service/types';
import TextViewPage from '@/app/components/t/TextViewPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = await getText(id) as TextData;

  return <TextViewPage data={data} />;
}