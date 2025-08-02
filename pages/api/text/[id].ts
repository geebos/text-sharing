import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient } from '../../../lib/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: '无效的ID' });
    }

    // 验证ID格式（8位字符）
    if (id.length !== 8 || !/^[A-Za-z0-9]+$/.test(id)) {
      return res.status(400).json({ error: '无效的ID格式' });
    }

    // 从Redis获取数据
    const redis = await getRedisClient();
    const textData = await redis.get(`text:${id}`);

    if (!textData) {
      return res.status(404).json({ error: '文本不存在或已过期' });
    }

    const data = JSON.parse(textData);
    
    // 检查是否已过期（双重检查）
    const expiresAt = new Date(data.expiresAt);
    if (expiresAt < new Date()) {
      // 如果已过期，删除数据
      await redis.del(`text:${id}`);
      return res.status(404).json({ error: '文本已过期' });
    }

    return res.status(200).json(data);
    
  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}