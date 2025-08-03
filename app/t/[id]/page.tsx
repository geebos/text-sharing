import { getText } from '@/service/text';
import { TextData } from '@/service/types';
import TextView from '@/app/components/t/TextView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const data = await getText(id) as TextData;

  return <TextView data={data} />;
}