import type { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient, generateId, getExpirySeconds } from '../../lib/redis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允许' });
  }

  try {
    const { text, expiryTime, displayType } = req.body;

    // 验证输入
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: '文本内容不能为空' });
    }

    if (text.length > 10000) {
      return res.status(400).json({ error: '文本长度不能超过10000个字符' });
    }

    if (!expiryTime || !['1day', '7days', '30days'].includes(expiryTime)) {
      return res.status(400).json({ error: '无效的过期时间' });
    }

    if (!displayType || !['text', 'qrcode'].includes(displayType)) {
      return res.status(400).json({ error: '无效的展示类型' });
    }

    // 生成唯一ID
    const redis = await getRedisClient();
    let id = generateId();
    
    // 确保ID唯一
    while (await redis.exists(`text:${id}`)) {
      id = generateId();
    }

    // 准备存储的数据
    const data = {
      text,
      displayType,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + getExpirySeconds(expiryTime) * 1000).toISOString()
    };

    // 存储到Redis，设置过期时间
    await redis.setEx(
      `text:${id}`,
      getExpirySeconds(expiryTime),
      JSON.stringify(data)
    );

    return res.status(200).json({ id });
    
  } catch (error) {
    console.error('API错误:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}