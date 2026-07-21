import type { SSEController, SSEOptions } from '@/utils/sse'
import { http } from '@/http/http'
import { sseRequest } from '@/utils/sse'

/** 模型信息 */
export interface IModelItem {
  id: number | string
  modelName: string
  modelDescribe: string
  modelPrice?: number
  modelType?: string
  modelShow?: boolean
  systemPrompt?: string
  remark?: string
}

/** 会话信息 */
export interface ISessionItem {
  id: string
  sessionName?: string
  createTime?: string
  updateTime?: string
}

/** 消息记录 */
export interface IMessageItem {
  id?: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  createTime?: string
}

/** 发送消息请求体 */
export interface ISendDTO {
  model: string
  content: string
  sessionId?: string
  knowledgeId?: string
  enableThinking?: boolean
  enableInternet?: boolean
}

/**
 * 获取可用模型列表
 */
export function getModelList() {
  return http.get<IModelItem[]>('/system/model/modelList')
}

/**
 * 获取会话列表
 */
export function getSessionList(params?: { pageNum?: number, pageSize?: number }) {
  return http.get<{ rows: ISessionItem[], total: number }>('/system/session/list', params)
}

/**
 * 创建会话
 */
export function createSession(data: { sessionName?: string }) {
  return http.post<ISessionItem>('/system/session', data)
}

/**
 * 删除会话
 */
export function deleteSession(ids: string) {
  return http.delete<void>(`/system/session/${ids}`)
}

/**
 * 获取会话消息历史
 */
export function getMessageList(sessionId: string) {
  return http.get<IMessageItem[]>('/system/message/list', { sessionId })
}

/**
 * 发送消息（SSE 流式）
 * 返回 SSEController 用于中止请求
 */
export function sendMessageSSE(
  data: ISendDTO,
  callbacks: {
    onMessage?: SSEOptions['onMessage']
    onDone?: () => void
    onError?: (err: any) => void
  },
): SSEController {
  return sseRequest({
    url: '/chat/send',
    data: data as unknown as Record<string, any>,
    ...callbacks,
  })
}
