<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useWalletStore } from '@/store/wallet'
import { useWorksStore } from '@/store/works'
import { storeToRefs } from 'pinia'
import { onShow } from '@dcloudio/uni-app'

defineOptions({
  name: 'GenPage',
})

definePage({
  style: {
    navigationStyle: 'custom',
  },
})

const walletStore = useWalletStore()
const worksStore = useWorksStore()
const { points } = storeToRefs(walletStore)

// 表单状态
const prompt = ref('')

onShow(() => {
  const pending = uni.getStorageSync('pendingPrompt')
  if (pending) {
    prompt.value = pending
    uni.removeStorageSync('pendingPrompt')
  }
})
const styleTags = ['小清新', '水彩', '插画', '写实', '二次元', '动漫', '3D', '水墨', '像素']
const styleSelected = ref('小清新')

const ratioTags = ['3:4', '1:1', '9:16', '16:9']
const ratioSelected = ref('3:4')

const quantity = ref(1)
const pricePerImage = 10

// 计算消费积分
const totalCost = computed(() => quantity.value * pricePerImage)

// 数量步进
const decreaseQty = () => {
  if (quantity.value > 1) quantity.value--
}
const increaseQty = () => {
  if (quantity.value < 4) quantity.value++
}

interface GenWorkItem {
  id: string
  status: 'pending' | 'success'
  prompt: string
  style: string
  ratio: string
  color: string
}

// 模拟生图状态与反应式历史列表
const isGenerating = ref(false)
const currentGeneratedList = ref<GenWorkItem[]>([])

// 立即生成图片
const handleGenerate = () => {
  const query = prompt.value.trim()
  if (!query) {
    uni.showToast({
      title: '请输入画面提示词内容哦',
      icon: 'none',
    })
    return
  }

  if (points.value < totalCost.value) {
    uni.showToast({ title: '积分不足，请先充值', icon: 'none' })
    walletStore.openRecharge()
    return
  }

  isGenerating.value = true

  // 1. 立刻向本地列表插入对应数量的“正在生成 (pending)”占位卡片，占据最新位置
  const tempItems: GenWorkItem[] = []
  for (let i = 0; i < quantity.value; i++) {
    tempItems.push({
      id: `temp_${Date.now()}_${i}`,
      status: 'pending',
      prompt: query,
      style: styleSelected.value,
      ratio: ratioSelected.value,
      color: '#f0f3f7',
    })
  }
  currentGeneratedList.value = [...tempItems, ...currentGeneratedList.value]

  // 扣减用户积分
  walletStore.deductPoints(totalCost.value, '智能生图')

  // 2. 模拟 1.8 秒绘制延迟，随后将对应的占位卡片转为“生成成功”状态
  setTimeout(() => {
    isGenerating.value = false

    tempItems.forEach((item, i) => {
      const finalId = `m_${Date.now()}_${i}`
      const hue = (worksStore.myWorks.length + i) * 73 % 360
      const finalColor = `hsl(${hue}, 65%, 70%)`

      // 写入持久化全局数据库中
      worksStore.addGeneratedWork(finalId, `${item.prompt} · ${item.style}`, finalColor, item.prompt, item.ratio)

      // 同步本地界面的临时项状态为成功
      const matchIndex = currentGeneratedList.value.findIndex(li => li.id === item.id)
      if (matchIndex !== -1) {
        currentGeneratedList.value[matchIndex].id = finalId
        currentGeneratedList.value[matchIndex].status = 'success'
        currentGeneratedList.value[matchIndex].color = finalColor
      }
    })

    uni.showToast({
      title: '生成成功！',
      icon: 'success',
    })
  }, 1800)
}

// 点击生成的图片跳转至大图
const viewDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/works/detail?id=${id}&from=gen`,
  })
}
</script>

<template>
  <view class="px-4 pt-12">
    <!-- 页头 -->
    <view class="pb-2 pt-2">
      <view class="text-2xl font-extrabold text-[#1a1a1a]">灵感生图</view>
      <view class="mt-1 text-sm text-[#8c9199]">一句话，画出你的小世界</view>
    </view>

    <!-- 选择风格 (支持横向滑动不换行) -->
    <view class="mt-4">
      <view class="text-sm font-bold text-[#1a1a1a] mb-2.5">选择风格</view>
      <scroll-view scroll-x class="w-full" :show-scrollbar="false">
        <view class="flex items-center gap-2.5 py-1">
          <view
            v-for="style in styleTags"
            :key="style"
            class="flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-full border border-solid transition-all active:scale-95 cursor-pointer"
            :class="styleSelected === style ? 'bg-white border-[#22D386] text-[#22D386]' : 'bg-white border-[#e4e6eb] text-[#8c9199]'"
            @click="styleSelected = style"
          >
            {{ style }}
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 提示词卡片 (大白卡片包裹) -->
    <view class="mt-4 rounded-2xl bg-white p-4.5 shadow-sm">
      <textarea
        v-model="prompt"
        placeholder="例如：清晨的咖啡馆，阳光透过窗户，绿植与点心，温柔的色调"
        placeholder-class="text-[#b2b8c2]"
        :maxlength="200"
        class="w-full h-28 text-[15px] leading-relaxed text-[#1a1a1a] outline-none"
      />
      <view class="flex justify-between items-center mt-2 text-[10px] text-[#b2b8c2]">
        <text>支持中文描述，越具体越好</text>
        <text>{{ prompt.length }}/200</text>
      </view>
    </view>

    <!-- 画面比例 (裸露标题，扁平四列并排，精致紧凑) -->
    <view class="mt-5">
      <view class="text-sm font-bold text-[#1a1a1a] mb-2.5">画面比例</view>
      <view class="grid grid-cols-4 gap-2.5">
        <view
          v-for="ratio in ratioTags"
          :key="ratio"
          class="flex items-center justify-center text-[13px] font-bold py-2 rounded-xl border border-solid transition-all active:scale-95 cursor-pointer bg-white"
          :class="ratioSelected === ratio ? 'border-[#22D386] text-[#22D386]' : 'border-[#e4e6eb] text-[#8c9199]'"
          @click="ratioSelected = ratio"
        >
          {{ ratio }}
        </view>
      </view>
    </view>

    <!-- 生成数量 (裸露标题，扁平四列并排，精致紧凑) -->
    <view class="mt-5">
      <view class="text-sm font-bold text-[#1a1a1a] mb-2.5">生成数量</view>
      <view class="grid grid-cols-4 gap-2.5">
        <view
          v-for="num in [1, 2, 3, 4]"
          :key="num"
          class="flex items-center justify-center text-[13px] font-bold py-2 rounded-xl border border-solid transition-all active:scale-95 cursor-pointer bg-white"
          :class="quantity === num ? 'border-[#22D386] text-[#22D386]' : 'border-[#e4e6eb] text-[#8c9199]'"
          @click="quantity = num"
        >
          {{ num }} 张
        </view>
      </view>
    </view>

    <!-- 触发生成按钮 (融合成单一大胶囊按钮) -->
    <view class="mt-6 text-center">
      <button
        class="w-full h-13 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22D386] text-white text-base font-bold shadow-md transition-all active:scale-98 border-none"
        :disabled="isGenerating"
        @click="handleGenerate"
      >
        <view v-if="isGenerating" class="i-carbon-progress-bar-round animate-spin text-lg" />
<!--        <view v-else class="i-carbon-star text-lg" />-->
        <span>{{ isGenerating ? '生成中…' : `✦ 开始生成 ${totalCost} 积分` }}</span>
      </button>
    </view>

    <!-- 我的生成板块 (包含空状态和双状态生成网格列表) -->
    <view class="mt-6">
      <view class="flex items-center justify-between mb-3.5">
        <span class="text-base font-extrabold text-[#1a1a1a]">我的生成</span>
        <span
          v-if="currentGeneratedList.length"
          class="text-xs text-[#b2b8c2] font-semibold active:opacity-70 cursor-pointer"
          @click="currentGeneratedList = []"
        >
          清空
        </span>
      </view>

      <!-- 双状态网格列表 (正在生成 & 渲染成功) -->
      <view v-if="currentGeneratedList.length" class="grid grid-cols-2 gap-3.5 pb-8">
        <view
          v-for="item in currentGeneratedList"
          :key="item.id"
          class="flex flex-col"
        >
          <!-- 1. 正在生成 (Pending) 状态卡片 -->
          <view
            v-if="item.status === 'pending'"
            class="w-full bg-[#f0f3f7] rounded-2xl animate-pulse flex items-center justify-center border border-solid border-[#e4e6eb]/30"
            :style="{ aspectRatio: item.ratio.replace(':', '/') }"
          >
            <view class="i-carbon-progress-bar-round animate-spin text-2xl text-[#b2b8c2]" />
          </view>

          <!-- 2. 生成成功 (Success) 状态卡片 (带大渐变模拟真实精美画作) -->
          <view
            v-else
            class="w-full rounded-2xl flex items-center justify-center text-white text-xs font-semibold overflow-hidden active:opacity-90 relative shadow-sm border border-solid border-[#e4e6eb]/40"
            :style="{
              background: `linear-gradient(135deg, ${item.color}, #ffe5db)`,
              aspectRatio: item.ratio.replace(':', '/')
            }"
            @click="viewDetail(item.id)"
          >
            <span class="bg-black/15 px-2.5 py-1 rounded-lg">查看详情 ➔</span>
          </view>

          <!-- 下方的提示信息文字排版 -->
          <view
            v-if="item.status === 'pending'"
            class="mt-2 text-xs text-[#8c9199] leading-snug line-clamp-2"
          >
            正在绘制 「{{ item.prompt }}」...
          </view>
          <view
            v-else
            class="mt-2 text-xs text-[#8c9199] leading-snug line-clamp-2 font-medium"
          >
            {{ item.prompt }} · {{ item.style }}
          </view>
        </view>
      </view>

      <!-- 极精美空状态 (完全还原设计图) -->
      <view v-else class="py-16 flex flex-col items-center justify-center">
        <view class="h-16 w-16 rounded-full bg-[#eef1f5] flex items-center justify-center text-[#b2b8c2] mb-3.5 shadow-inner">
          <view class="i-carbon-image text-3xl" />
        </view>
        <view class="text-xs text-[#b2b8c2] font-medium">还没有生成记录哦，去试试吧~</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
</style>
