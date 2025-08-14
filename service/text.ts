import { getRedisClient } from "@/lib/redis";

export const getText = async (id: string) => {
  // 从Redis获取数据
  const redis = await getRedisClient();
  const textData = await redis.get(`text:${id}`);

  if (!textData) {
    return null;
  }

  const data = JSON.parse(textData);
  data && data.deleteToken ? delete data.deleteToken : null;

  // 检查是否已过期（双重检查）
  const expiresAt = new Date(data.expiresAt);
  if (expiresAt < new Date()) {
    // 如果已过期，删除数据
    await redis.del(`text:${id}`);
    return null;
  }

  return data;
};