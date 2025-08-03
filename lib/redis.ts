import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

let isConnected = false;

export async function getRedisClient() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log('Redis connected');
  }
  return client;
}

export async function closeRedisConnection() {
  if (isConnected) {
    await client.quit();
    isConnected = false;
    console.log('Redis disconnected');
  }
}

// 生成8位随机字符串ID
export function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 将过期时间选项转换为秒数
export function getExpirySeconds(expiryTime: string): number {
  switch (expiryTime) {
    case '1day':
      return 24 * 60 * 60; // 1天
    case '7days':
      return 7 * 24 * 60 * 60; // 7天
    case '30days':
      return 30 * 24 * 60 * 60; // 30天
    default:
      return 24 * 60 * 60; // 默认1天
  }
}