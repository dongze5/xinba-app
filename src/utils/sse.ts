/**
 * 微信小程序 SSE 流式请求工具
 * 基于 uni.request + enableChunked + onChunkReceived 实现
 */
import { useTokenStore } from '@/store/token'
import { getEnvBaseUrl } from '@/utils'

export interface SSEOptions {
  /** 请求路径（不含 baseUrl） */
  url: string
  /** 请求体 */
  data?: Record<string, any>
  /** 收到一条完整的 SSE 事件数据（JSON 已解析） */
  onMessage?: (event: string, data: any) => void
  /** 流结束 */
  onDone?: () => void
  /** 错误回调 */
  onError?: (err: any) => void
}

export interface SSEController {
  /** 中止请求 */
  abort: () => void
}

/**
 * 发起 SSE 流式请求
 * 微信小程序通过 enableChunked 开启分块传输，onChunkReceived 逐块接收数据
 */
export function sseRequest(options: SSEOptions): SSEController {
  const { url, data, onMessage, onDone, onError } = options

  const baseUrl = getEnvBaseUrl()
  const tokenStore = useTokenStore()
  const token = tokenStore.updateNowTime().validToken

  // 拼接完整 URL（含 clientid query）
  const fullUrl = `${baseUrl}${url}?clientid=445f3912cb13164713f05689d0c50def`

  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
  }
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  let buffer = '' // 用于拼接不完整的 chunk
  let finished = false

  const requestTask = uni.request({
    url: fullUrl,
    method: 'POST',
    data,
    header,
    enableChunked: true,
    timeout: 120000,
    success: () => {
      // 流正常结束（服务端关闭连接）
      if (!finished) {
        finished = true
        // 处理 buffer 中剩余数据
        flushBuffer()
        onDone?.()
      }
    },
    fail: (err) => {
      if (!finished) {
        finished = true
        onError?.(err)
      }
    },
  })

  /** 解析 buffer 中的完整 SSE 事件 */
  function flushBuffer() {
    // SSE 格式：event:xxx\ndata:xxx\n\n
    const parts = buffer.split('\n\n')
    // 最后一段可能不完整，留在 buffer
    buffer = parts.pop() || ''

    for (const part of parts) {
      if (!part.trim()) continue
      parseSSEEvent(part)
    }

    // 如果 buffer 中还有完整事件（以 \n\n 结尾的情况）
    if (buffer.endsWith('\n\n')) {
      const remaining = buffer.slice(0, -2)
      buffer = ''
      if (remaining.trim()) {
        parseSSEEvent(remaining)
      }
    }
  }

  /** 解析单条 SSE 事件 */
  function parseSSEEvent(raw: string) {
    let event = 'message'
    let dataStr = ''

    const lines = raw.split('\n')
    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim()
      }
      else if (line.startsWith('data:')) {
        dataStr += line.slice(5).trim()
      }
    }

    if (!dataStr) return

    try {
      const parsed = JSON.parse(dataStr)
      onMessage?.(event, parsed)
    }
    catch {
      // 非 JSON 数据，原样传递
      onMessage?.(event, dataStr)
    }
  }

  // 监听分块数据
  requestTask.onChunkReceived((res: { data: ArrayBuffer }) => {
    if (finished) return

    // ArrayBuffer → 字符串
    const text = arrayBufferToString(res.data)
    buffer += text
    flushBuffer()
  })

  return {
    abort: () => {
      finished = true
      requestTask.abort()
    },
  }
}

/** ArrayBuffer 转 UTF-8 字符串 */
function arrayBufferToString(buf: ArrayBuffer): string {
  // #ifdef MP-WEIXIN
  // 微信小程序环境没有 TextDecoder，手动解码 UTF-8
  const bytes = new Uint8Array(buf)
  let result = ''
  let i = 0
  while (i < bytes.length) {
    const byte = bytes[i]
    if (byte < 0x80) {
      result += String.fromCharCode(byte)
      i++
    }
    else if (byte < 0xE0) {
      result += String.fromCharCode(((byte & 0x1F) << 6) | (bytes[i + 1] & 0x3F))
      i += 2
    }
    else if (byte < 0xF0) {
      result += String.fromCharCode(
        ((byte & 0x0F) << 12) | ((bytes[i + 1] & 0x3F) << 6) | (bytes[i + 2] & 0x3F),
      )
      i += 3
    }
    else {
      // 4字节 UTF-8（emoji等），用代理对
      const codePoint
        = ((byte & 0x07) << 18)
        | ((bytes[i + 1] & 0x3F) << 12)
        | ((bytes[i + 2] & 0x3F) << 6)
        | (bytes[i + 3] & 0x3F)
      const offset = codePoint - 0x10000
      result += String.fromCharCode(0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF))
      i += 4
    }
  }
  return result
  // #endif

  // #ifndef MP-WEIXIN
  return new TextDecoder('utf-8').decode(buf)
  // #endif
}
