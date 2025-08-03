import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, generateId, getExpirySeconds } from '@/lib/redis';
import { CreateTextSchema, firstError } from '@/service/schema';

export async function POST(request: NextRequest) {
  const { text, userName, expiryTime, displayType } = await request.json();
  try {
    CreateTextSchema.parse({ text, userName, expiryTime, displayType });
  } catch (error) {
    return NextResponse.json({ error: firstError(error) }, { status: 400 });
  }

  try {
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
      userName: userName?.trim() || '',
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

    return NextResponse.json({ id });

  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}