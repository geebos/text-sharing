import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import { Handler } from '@/lib/middleware';

// 获取客户端真实IP地址
function getClientIP(request: NextRequest): string {
  // 尝试从多个可能的头部获取真实IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    // x-forwarded-for 可能包含多个IP，取第一个
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }
  
  // 回退到默认值（在生产环境中，通常会有代理设置正确的头部）
  return 'unknown';
}

// 计算到当天23:59:59的秒数
function getSecondsUntilEndOfDay(): number {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  
  return Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
}

// IP限流检查函数
async function checkIPRateLimit(name: string, ip: string, limit: number = 20): Promise<{ allowed: boolean; current: number; remaining: number }> {
  const redis = await getRedisClient();
  const key = `rl:${name}:${ip}`;
  
  try {
    // 尝试设置初始值，如果key不存在则设置为0，存在则跳过
    const wasSet = await redis.setNX(key, '0');
    
    if (wasSet) {
      // 首次请求，设置TTL为到当天结束的秒数
      const ttl = getSecondsUntilEndOfDay();
      await redis.expire(key, ttl);
    }
    
    // 递增计数器
    const current = await redis.incr(key);
    
    const allowed = current <= limit;
    const remaining = Math.max(0, limit - current);
    
    return {
      allowed,
      current,
      remaining
    };
  } catch (error) {
    console.error('IP限流检查错误:', error);
    // 出错时允许请求通过，避免影响正常服务
    return {
      allowed: true,
      current: 0,
      remaining: limit
    };
  }
}

// 限流高阶处理器
export function withRateLimit(name: string,handler: Handler, options: { limit?: number } = {}): Handler {
  const { limit = 20 } = options;
  
  return async (req: NextRequest) => {
    // 获取客户端IP并进行限流检查
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkIPRateLimit(name, clientIP, limit);
    
    // 创建响应
    let response: Response;
    
    if (!rateLimitResult.allowed) {
      // 超限时返回429错误
      response = NextResponse.json(
        { 
          error: `请求频率超限，每个IP每天最多可调用${limit}次`,
          current: rateLimitResult.current,
          limit: limit,
          remaining: rateLimitResult.remaining
        }, 
        { status: 429 }
      );
    } else {
      // 未超限时继续处理请求
      response = await handler(req);
    }
    
    // 设置限流相关的响应头
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Current', rateLimitResult.current.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    
    return response;
  };
}
