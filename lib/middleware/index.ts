import { NextRequest } from 'next/server';

export type Handler = (req: NextRequest) => Promise<Response> | Response;


// 组合多个高阶处理器的工具函数
export function compose<T extends Handler>(...handlers: ((handler: T) => T)[]): (handler: T) => T {
  return (handler: T) => handlers.reduceRight((acc, hof) => hof(acc), handler);
}
