/**
 * 会话图标底色预设（规避紫色，保持高阶扁平调性）
 * 未命中预设的会话将根据名称哈希生成固定色
 */
export const CHAT_COLOR_MAP: Record<string, string> = {
  '智能创作助手': '#22D386',
  '文案写作': '#FF9F43',
  '智能翻译': '#2F86FF',
  '旅行规划师': '#FF6B6B',
  '绘画工坊': '#41E09A',
  '知识百科': '#18C97A',
  '策划脑暴': '#FF6B6B',
  '周易八卦': '#E5B26E',
}

/**
 * 根据会话名称获取对应颜色
 * 优先使用预设色，未命中则根据名称哈希生成固定色
 */
export function getChatColor(name: string, fallback = '#aab0b8'): string {
  if (CHAT_COLOR_MAP[name])
    return CHAT_COLOR_MAP[name]
  const hash = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0))
  return fallback === '#aab0b8' ? `hsl(${hash % 360}, 75%, 60%)` : fallback
}
