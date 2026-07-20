import { defineStore } from 'pinia'
import { ref } from 'vue'

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

export const useWalletStore = defineStore(
  'wallet',
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

    return {
      showRecharge,
      openRecharge,
      closeRecharge,
      points,
      ledger,
      recharge,
      deductPoints,
    }
  },
  {
    persist: {
      paths: ['points', 'ledger'],
    },
  },
)
