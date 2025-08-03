import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { getText } from '@/service/text';
import { TextData } from '@/service/types';
import dynamic from 'next/dynamic';

const TextView = dynamic(() => import("@/components/t/TextView"), { ssr: false });

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { id } = context.query;
  const data = await getText(id as string);
  return { props: { data: data as TextData } };
};

export default function Page({ data }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return <TextView data={data} />;
}