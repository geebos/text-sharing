import { z } from "zod";

const maxTextLength = Number(process.env.NEXT_PUBLIC_MAX_TEXT_LENGTH) || 200;

export const CreateTextSchema = z.object({
  text: z.string().min(1, '文本不能为空').max(maxTextLength, `文本长度不能超过${maxTextLength}个字符`),
  userName: z.string().max(50, '用户名称长度不能超过50个字符').optional(),
  displayType: z.enum(['text', 'qrcode'], '无效的展示类型'),
  expiryTime: z.enum(['1day', '7days', '30days'], '无效的过期时间'),
  deleteToken: z.string().length(8, 'deleteToken 必须为8位').regex(/^[a-zA-Z0-9]+$/, 'deleteToken 只能包含字母和数字').optional(),
});
export type CreateTextInput = z.infer<typeof CreateTextSchema>;

export const firstError = (error: unknown) => {
  if (error instanceof z.ZodError) {
    const issue = error.issues[0];
    return `${issue.path.join('.')}: ${issue.message}`;
  }
  return error?.toString() || '服务器内部错误';
};