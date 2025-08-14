'use client';

import { useEffect, useRef } from 'react';

interface CanvasTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  lineHeight?: number;
  fontWeight?: string | number;
}

export default function CanvasText({
  text,
  className = '',
  style = {},
  fontSize = 14,
  fontFamily = 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  color = '#1f2937',
  lineHeight = 1.5,
  fontWeight = 'normal'
}: CanvasTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !text) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 延迟渲染，确保父元素尺寸已确定
    const renderCanvas = () => {
      // 设置字体样式
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';

      // 计算文本尺寸
      const lines = text.split('\n');
      const lineHeightPx = lines.length === 1 ? fontSize : fontSize * lineHeight;

      // 计算 canvas 尺寸 - 完全根据文本内容
      const maxLineWidth = Math.max(...lines.map(line =>
        line ? ctx.measureText(line).width : 0
      ));
      const canvasWidth = maxLineWidth;
      const canvasHeight = lines.length * lineHeightPx;

      // 设置 canvas 尺寸
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;

      // 重新设置上下文，因为改变 canvas 尺寸会重置上下文
      ctx.scale(dpr, dpr);
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'top';

      // 启用抗锯齿和平滑渲染
      ctx.imageSmoothingEnabled = true;

      // 绘制文本
      lines.forEach((line, index) => {
        if (line) {
          ctx.fillText(line, 0, index * lineHeightPx);
        }
      });
    };

    // 使用 requestAnimationFrame 确保在下一帧渲染
    requestAnimationFrame(renderCanvas);
  }, [text, fontSize, fontFamily, color, lineHeight, fontWeight]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        ...style
      }}
    />
  );
}
