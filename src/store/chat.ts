import type { SSEController } from '@/utils/sse'
import type { IModelItem, ISendDTO, ISessionItem } from '@/api/chat'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createSession, getMessageList, getModelList, sendMessageSSE } from '@/api/chat'

export interface Message {
  m: boolean // true = 用户发送, false = AI 回复
  t: string  // 消息文本
  thinking?: string // AI 推理过程（深度思考）
  streaming?: boolean // 是否正在流式输出中
}

export interface Conversation {
  sessionId: string // 后端会话 ID
  name: string // 会话名称
  chips: string[]
  msgs: Message[]
}

export const useChatStore = defineStore(
  'chat',
  () => {
    // ========== 状态 ==========
    /** 会话列表（sessionId → Conversation） */
    const conversations = ref<Record<string, Conversation>>({})

    /** 可用模型列表 */
    const modelList = ref<IModelItem[]>([])

    /** 当前选中的模型名称（默认 dify） */
    const currentModel = ref('dify')

    /** 是否正在流式输出 */
    const isStreaming = ref(false)

    /** 当前活跃的 SSE 控制器（用于中止） */
    let activeSSE: SSEController | null = null

    // ========== 模型 ==========
    /** 加载模型列表，默认选中 dify */
    const loadModels = async () => {
      try {
        const list = await getModelList()
        if (list && list.length > 0) {
          modelList.value = list
          // 默认选中 dify，找不到则选第一个
          const difyModel = list.find(m => m.modelName === 'dify' || m.modelDescribe?.includes('dify'))
          if (difyModel) {
            currentModel.value = difyModel.modelName
          }
          else {
            currentModel.value = list[0].modelName
          }
        }
      }
      catch (err) {
        console.error('加载模型列表失败:', err)
      }
    }

    /** 切换模型 */
    const setModel = (modelName: string) => {
      currentModel.value = modelName
    }

    // ========== 会话管理 ==========
    /** 创建新会话并返回 sessionId */
    const startNewSession = async (name: string): Promise<string> => {
      try {
        const session = await createSession({ sessionName: name })
        const sessionId = session.id || String(session)
        conversations.value[sessionId] = {
          sessionId,
          name,
          chips: getDefaultChips(name),
          msgs: [
            { m: false, t: getDefaultGreeting(name) },
          ],
        }
        return sessionId
      }
      catch (err) {
        console.error('创建会话失败:', err)
        // 降级：本地生成临时 ID
        const tempId = `local_${Date.now()}`
        conversations.value[tempId] = {
          sessionId: tempId,
          name,
          chips: getDefaultChips(name),
          msgs: [
            { m: false, t: getDefaultGreeting(name) },
          ],
        }
        return tempId
      }
    }

    /** 加载会话历史消息 */
    const loadHistory = async (sessionId: string) => {
      if (sessionId.startsWith('local_')) return
      try {
        const msgs = await getMessageList(sessionId)
        if (msgs && msgs.length > 0 && conversations.value[sessionId]) {
          conversations.value[sessionId].msgs = msgs.map(item => ({
            m: item.role === 'user',
            t: item.content,
          }))
        }
      }
      catch (err) {
        console.error('加载历史消息失败:', err)
      }
    }

    // ========== 发送消息（SSE 流式） ==========
    const sendMessage = (sessionId: string, text: string) => {
      const conv = conversations.value[sessionId]
      if (!conv || isStreaming.value) return

      // 推入用户消息
      conv.msgs.push({ m: true, t: text })
      conv.chips = []

      // 创建 AI 占位消息（流式填充）
      const aiMsg: Message = { m: false, t: '', streaming: true, thinking: '' }
      conv.msgs.push(aiMsg)
      isStreaming.value = true

      const sendDTO: ISendDTO = {
        model: currentModel.value,
        content: text,
        sessionId: sessionId.startsWith('local_') ? undefined : sessionId,
        enableThinking: false,
      }

      activeSSE = sendMessageSSE(sendDTO, {
        onMessage: (event, data) => {
          if (event === 'content' || event === 'message') {
            // 兼容两种格式
            const content = data?.content
              ?? data?.choices?.[0]?.delta?.content
              ?? ''
            const reasoning = data?.reasoning_content
              ?? data?.choices?.[0]?.delta?.reasoning_content
              ?? ''

            if (content) aiMsg.t += content
            if (reasoning) aiMsg.thinking = (aiMsg.thinking || '') + reasoning
          }
          else if (event === 'reasoning') {
            const reasoning = data?.content ?? data?.reasoning_content ?? ''
            if (reasoning) aiMsg.thinking = (aiMsg.thinking || '') + reasoning
          }
          else if (event === 'done') {
            finishStream(aiMsg)
          }
          else if (event === 'error') {
            aiMsg.t = aiMsg.t || '抱歉，请求出错了，请重试'
            finishStream(aiMsg)
          }
        },
        onDone: () => {
          finishStream(aiMsg)
        },
        onError: (err) => {
          console.error('SSE 请求失败:', err)
          aiMsg.t = aiMsg.t || '网络异常，请稍后重试'
          finishStream(aiMsg)
        },
      })
    }

    /** 结束流式输出 */
    const finishStream = (aiMsg: Message) => {
      if (!aiMsg.streaming) return
      aiMsg.streaming = false
      if (!aiMsg.t) aiMsg.t = '（无回复内容）'
      isStreaming.value = false
      activeSSE = null
    }

    /** 中止当前流式输出 */
    const stopStreaming = () => {
      if (activeSSE) {
        activeSSE.abort()
        activeSSE = null
      }
      isStreaming.value = false
      // 标记所有 streaming 消息为完成
      Object.values(conversations.value).forEach((conv) => {
        conv.msgs.forEach((msg) => {
          if (msg.streaming) {
            msg.streaming = false
            if (!msg.t) msg.t = '（已停止）'
          }
        })
      })
    }

    /** 初始化会话（从推荐助手进入） */
    const initConversation = async (name: string): Promise<string> => {
      return await startNewSession(name)
    }

    // ========== 辅助函数 ==========
    const getDefaultGreeting = (name: string): string => {
      const greetings: Record<string, string> = {
        '智能创作助手': '你好！我是你的智能助手。今天想聊点什么，还是需要帮你生成内容？',
        '智能翻译': '需要翻译什么内容呢？支持 30+ 种语言～',
        '策划脑暴': '你好！我是你的智能策划脑暴助手。我可以帮你进行品牌起名、撰写营销方案或进行创意脑暴。今天想创意脑暴点什么？',
        '周易八卦': '你好！我是你的智能周易八卦推演助手。太极生两仪，两仪生四象，四象生八卦。请问您今日想占卜何事？',
      }
      return greetings[name] || '你好！我是你的智能助手。今天想聊点什么？'
    }

    const getDefaultChips = (name: string): string[] => {
      const chips: Record<string, string[]> = {
        '智能创作助手': ['再帮我写 3 个标题', '生成一张咖啡馆海报', '翻译成英文'],
        '智能翻译': ['再翻译一段', '导出文档', '换种语言'],
        '策划脑暴': ['帮我给咖啡店起名', '写一份防晒霜营销方案', '新茶饮创意脑暴'],
        '周易八卦': ['占卜今日运势', '帮我测算姻缘', '推演事业发展'],
      }
      return chips[name] || ['随便聊聊', '帮我写文案', '生成一张图']
    }

    return {
      conversations,
      modelList,
      currentModel,
      isStreaming,
      loadModels,
      setModel,
      startNewSession,
      loadHistory,
      sendMessage,
      stopStreaming,
      initConversation,
    }
  },
  {
    persist: {
      pick: ['conversations', 'currentModel'],
    },
  },
)
