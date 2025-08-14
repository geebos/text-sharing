import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, generateId, getExpirySeconds } from '@/lib/redis';
import { CreateTextSchema, firstError } from '@/service/schema';

export async function POST(request: NextRequest) {
  const { text, userName, expiryTime, displayType, deleteToken } = await request.json();
  try {
    CreateTextSchema.parse({ text, userName, expiryTime, displayType, deleteToken });
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
      expiresAt: new Date(Date.now() + getExpirySeconds(expiryTime) * 1000).toISOString(),
      deleteToken: deleteToken || null // 保存前端传来的deleteToken
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

export async function DELETE(request: NextRequest) {
  try {
    const { id, deleteToken } = await request.json();
    
    if (!id || !deleteToken) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const redis = await getRedisClient();
    
    // 获取存储的数据
    const storedData = await redis.get(`text:${id}`);
    if (!storedData) {
      return NextResponse.json({ error: '分享记录不存在或已过期' }, { status: 404 });
    }

    const data = JSON.parse(storedData);
    
    // 验证删除token
    if (data.deleteToken !== deleteToken) {
      return NextResponse.json({ error: '删除权限验证失败' }, { status: 403 });
    }

    // 删除记录
    await redis.del(`text:${id}`);
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('删除API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}