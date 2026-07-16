import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Message {
  m: boolean // 是否为用户发送
  t: string  // 消息文本
}

export interface Conversation {
  chips: string[]
  msgs: Message[]
}

export interface WorkItem {
  id: string
  title: string
  color: string
  prompt: string
}

export interface LedgerItem {
  type: 'recharge' | 'gen'
  title: string
  amt: number
  time: string
}

// 格式化当前时间为: 今天 HH:MM
const getNowStr = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return `今天 ${p(d.getHours())}:${p(d.getMinutes())}`
}

export const useAppStateStore = defineStore(
  'appState',
  () => {
    // 全局充值弹窗状态
    const showRecharge = ref(false)
    const openRecharge = () => {
      showRecharge.value = true
    }
    const closeRecharge = () => {
      showRecharge.value = false
    }

    // 初始积分
    const points = ref(2860)

    // 账单流水
    const ledger = ref<LedgerItem[]>([])

    // 作品 ID 列表
    const myWorks = ref<string[]>([])
    const collected = ref<string[]>([])
    const downloads = ref<string[]>([])

    // 作品数据库（用于大图展示和以此生成）
    const workMap = ref<Record<string, WorkItem>>({
      p1: { id: 'p1', title: '插画', color: '#22D386', prompt: '梦幻森林插画，治愈绿色调' },
      p2: { id: 'p2', title: '海报', color: '#FF9F43', prompt: '夏日沙滩复古海报，暖橙阳光' },
      p3: { id: 'p3', title: '头像', color: '#2F86FF', prompt: '极简线条情侣头像，清爽蓝色' },
      p4: { id: 'p4', title: '壁纸', color: '#41E09A', prompt: '治愈系星空宇航员壁纸，夜空绿' },
    })

    // 对话列表
    const conversations = ref<Record<string, Conversation>>({
      '智能创作助手': {
        chips: ['再帮我写 3 个标题', '生成一张咖啡馆海报', '翻译成英文'],
        msgs: [
          { m: false, t: '你好！我是你的智能助手。今天想聊点什么，还是需要帮你生成内容？' },
        ],
      },
      '文案写作': {
        chips: ['再写一版更简短的', '换成口语风', '生成配图描述'],
        msgs: [
          { m: false, t: 'Hi，我是文案写作助手～' },
        ],
      },
      '智能翻译': {
        chips: ['再翻译一段', '导出文档', '换种语言'],
        msgs: [
          { m: false, t: '需要翻译什么内容呢？支持 30+ 种语言～' },
        ],
      },
      '绘画工坊': {
        chips: ['换种风格', '提高分辨率', '生成同系列'],
        msgs: [
          { m: false, t: '欢迎来到绘画工坊' },
        ],
      },
      '智能绘画助手': {
        chips: ['再生成 3 张', '换成插画风格', '生成高清图'],
        msgs: [
          { m: false, t: '我是智能绘画助手，描述一下你想要画面吧～' },
        ],
      },
      '旅行规划师': {
        chips: ['加美食推荐', '生成路线图', '换成预算版'],
        msgs: [
          { m: false, t: '想去哪儿玩？我帮你规划' },
        ],
      },
      '知识百科': {
        chips: ['举个例子', '再讲深入点', '推荐相关资料'],
        msgs: [
          { m: false, t: '有什么想了解的？' },
        ],
      },
      '策划脑暴': {
        chips: ['帮我给咖啡店起名', '写一份防晒霜营销方案', '新茶饮创意脑暴'],
        msgs: [
          { m: false, t: '你好！我是你的智能策划脑暴助手。我可以帮你进行品牌起名、撰写营销方案或进行创意脑暴。今天想创意脑暴点什么？' },
        ],
      },
      '周易八卦': {
        chips: ['占卜今日运势', '帮我测算姻缘', '推演事业发展'],
        msgs: [
          { m: false, t: '你好！我是你的智能周易八卦推演助手。太极生两仪，两仪生四象，四象生八卦。请问您今日想占卜何事（如事业、感情、运势），或输入您的生辰八字，我将为您起卦解惑。' },
        ],
      },
    })

    // 充值操作
    const recharge = (v: number) => {
      points.value += v
      ledger.value.push({
        type: 'recharge',
        title: '积分充值',
        amt: v,
        time: getNowStr(),
      })
    }

    // 消费/扣减积分
    const deductPoints = (v: number, title: string) => {
      if (points.value >= v) {
        points.value -= v
        ledger.value.push({
          type: 'gen',
          title,
          amt: -v,
          time: getNowStr(),
        })
        return true
      }
      return false
    }

    // 切换收藏
    const toggleCollect = (id: string) => {
      const idx = collected.value.indexOf(id)
      if (idx > -1) {
        collected.value.splice(idx, 1)
      } else {
        collected.value.push(id)
      }
    }

    // 保存/下载作品
    const downloadWork = (id: string) => {
      if (!downloads.value.includes(id)) {
        downloads.value.push(id)
      }
    }

    // 删除我生成的作品
    const deleteWork = (id: string) => {
      const idx = myWorks.value.indexOf(id)
      if (idx > -1) {
        myWorks.value.splice(idx, 1)
      }
      // 同时也从下载和收藏中清除
      const cIdx = collected.value.indexOf(id)
      if (cIdx > -1) collected.value.splice(cIdx, 1)
      const dIdx = downloads.value.indexOf(id)
      if (dIdx > -1) downloads.value.splice(dIdx, 1)
    }

    // 注册生成的新作品
    const addGeneratedWork = (id: string, title: string, color: string, prompt: string) => {
      workMap.value[id] = { id, title, color, prompt }
      myWorks.value.push(id)
    }

        // 发送聊天消息，模拟自动回复
    const sendMessage = (convName: string, text: string) => {
      if (!conversations.value[convName]) {
        conversations.value[convName] = {
          chips: [],
          msgs: [
            { m: false, t: '你好！我是你的智能助手。今天想聊点什么，还是需要帮你生成内容？' },
          ],
        }
      }

      const conv = conversations.value[convName]
      conv.msgs.push({ m: true, t: text })

      // 移除原有的快捷推荐框，防止重复显示
      conv.chips = []

      // 600ms后智能模拟回复
      setTimeout(() => {
        conv.msgs.push({
          m: false,
          t: '收到～正在为您处理中，请稍候 ✨',
        })
      }, 600)
    }

    // 初始化新会话
    const initConversation = (newName: string) => {
      if (!conversations.value[newName]) {
        conversations.value[newName] = {
          chips: ['随便聊聊', '帮我写文案', '生成一张图'],
          msgs: [
            { m: false, t: '你好！我是你的智能助手。今天想聊点什么，还是需要帮你生成内容？' },
          ],
        }
      }
    }

    return {
      showRecharge,
      openRecharge,
      closeRecharge,
      points,
      ledger,
      myWorks,
      collected,
      downloads,
      workMap,
      conversations,
      recharge,
      deductPoints,
      toggleCollect,
      downloadWork,
      deleteWork,
      addGeneratedWork,
      sendMessage,
      initConversation,
    }
  },
  {
    persist: {
      omit: ['showRecharge'], // 不持久化充值弹窗显隐状态
    },
  },
)
