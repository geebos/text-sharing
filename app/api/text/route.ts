import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient, generateId, getExpirySeconds } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { text, userName, expiryTime, displayType } = await request.json();

    // 验证输入
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: '文本内容不能为空' }, { status: 400 });
    }

    const maxLength = parseInt(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH || '200');
    if (text.length > maxLength) {
      return NextResponse.json({ error: `文本长度不能超过${maxLength}个字符` }, { status: 400 });
    }

    if (!expiryTime || !['1day', '7days', '30days'].includes(expiryTime)) {
      return NextResponse.json({ error: '无效的过期时间' }, { status: 400 });
    }

    if (!displayType || !['text', 'qrcode'].includes(displayType)) {
      return NextResponse.json({ error: '无效的展示类型' }, { status: 400 });
    }

    // 验证用户名称（可选）
    if (userName && (typeof userName !== 'string' || userName.length > 50)) {
      return NextResponse.json({ error: '用户名称长度不能超过50个字符' }, { status: 400 });
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