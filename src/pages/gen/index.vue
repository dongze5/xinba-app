<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/store/appState'
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

const appState = useAppStateStore()
const { points } = storeToRefs(appState)

// 表单状态
const prompt = ref('一只在星空下睡觉的橘猫，梦幻插画风')

onShow(() => {
  const pending = uni.getStorageSync('pendingPrompt')
  if (pending) {
    prompt.value = pending
    uni.removeStorageSync('pendingPrompt')
  }
})
const styleTags = ['写实', '动漫', '3D', '插画', '水墨', '像素']
const styleSelected = ref('写实')

const ratioTags = ['1:1', '3:4', '9:16', '16:9']
const ratioSelected = ref('1:1')

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

// 模拟生图状态
const isGenerating = ref(false)
const generatedIds = ref<string[]>([])



// 立即生成图片
const handleGenerate = () => {
  const query = prompt.value.trim()
  if (!query) {
    uni.showToast({ title: '请输入提示词', icon: 'none' })
    return
  }

  if (points.value < totalCost.value) {
    uni.showToast({ title: '积分不足，请先充值', icon: 'none' })
    appState.openRecharge()
    return
  }

  isGenerating.value = true

  // 模拟 1.2s 生成
  setTimeout(() => {
    isGenerating.value = false
    const newIds: string[] = []

    for (let i = 1; i <= quantity.value; i++) {
      const id = `m_${Date.now()}_${i}`
      // 动态计算纯色背景色 (HSL纯色, 不使用 linear-gradient)
      const hue = (appState.myWorks.length + i) * 67 % 360
      const color = `hsl(${hue}, 65%, 65%)`
      const title = `作品 ${appState.myWorks.length + 1}`

      appState.addGeneratedWork(id, title, color, query)
      newIds.push(id)
    }

    // 扣减积分
    appState.deductPoints(totalCost.value, 'AI 生图')
    generatedIds.value = newIds

    uni.showToast({
      title: '生成成功！',
      icon: 'success',
    })
  }, 1200)
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
    <view class="pb-4 pt-2">
      <view class="text-2xl font-extrabold text-[#1a1a1a]">AI 生图</view>
      <view class="mt-1 text-sm text-[#8c9199]">输入描述，一键生成</view>
    </view>

    <!-- 提示词卡片 -->
    <view class="mt-3 rounded-2xl bg-white p-5 shadow-sm">
      <view class="flex justify-between items-center mb-3">
        <label class="text-base font-bold text-[#1a1a1a]">提示词</label>
        <span class="text-xs text-[#8c9199]">（必填）</span>
      </view>
      <textarea
        v-model="prompt"
        placeholder="例如：一只橘猫坐在窗边晒太阳，暖色治愈插画风"
        class="w-full h-24 text-[15px] leading-relaxed text-[#1a1a1a] outline-none"
      />
    </view>

    <!-- 风格选择 (扁平单选) -->
    <view class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <view class="text-sm font-bold text-[#8c9199] mb-2.5">风格</view>
      <view class="flex flex-wrap gap-2">
        <view
          v-for="style in styleTags"
          :key="style"
          class="text-xs font-medium px-3 py-1.5 rounded-xl transition-all active:scale-95"
          :style="styleSelected === style ? 'background-color: rgba(34,211,134,0.12); color: #22D386;' : ''"
          :class="styleSelected !== style ? 'bg-[#f0f3f7] text-[#8c9199]' : ''"
          @click="styleSelected = style"
        >
          {{ style }}
        </view>
      </view>
    </view>

    <!-- 比例选择 (扁平单选) -->
    <view class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <view class="text-sm font-bold text-[#8c9199] mb-2.5">比例</view>
      <view class="flex flex-wrap gap-2">
        <view
          v-for="ratio in ratioTags"
          :key="ratio"
          class="text-xs font-medium px-3 py-1.5 rounded-xl transition-all active:scale-95"
          :style="ratioSelected === ratio ? 'background-color: rgba(34,211,134,0.12); color: #22D386;' : ''"
          :class="ratioSelected !== ratio ? 'bg-[#f0f3f7] text-[#8c9199]' : ''"
          @click="ratioSelected = ratio"
        >
          {{ ratio }}
        </view>
      </view>
    </view>

    <!-- 数量与价格 -->
    <view class="mt-4 rounded-2xl bg-white p-4 shadow-sm">
      <view class="flex justify-between items-center">
        <view>
          <view class="text-sm font-bold text-[#8c9199] mb-2.5">数量</view>
          <view class="flex items-center gap-3">
            <button
              class="h-8 w-8 flex items-center justify-center border border-solid border-[#e4e6eb] rounded-lg bg-white text-base font-medium active:bg-gray-100 m-0 p-0"
              @click="decreaseQty"
            >
              −
            </button>
            <span class="text-lg font-bold min-w-5 text-center">{{ quantity }}</span>
            <button
              class="h-8 w-8 flex items-center justify-center border border-solid border-[#e4e6eb] rounded-lg bg-white text-base font-medium active:bg-gray-100 m-0 p-0"
              @click="increaseQty"
            >
              +
            </button>
          </view>
        </view>
        <view class="text-right">
          <view class="text-base font-extrabold text-[#1a1a1a]">10 积分 / 张</view>
          <view class="mt-1 text-xs text-[#8c9199]">单次最多 4 张</view>
        </view>
      </view>
    </view>

    <!-- 触发生成 -->
    <view class="mt-5 text-center">
      <button
        class="w-full h-13 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#22D386] text-white text-base font-bold shadow-md transition-all active:scale-98"
        :disabled="isGenerating"
        @click="handleGenerate"
      >
        <view v-if="isGenerating" class="i-carbon-progress-bar-round animate-spin text-lg" />
        <view v-else class="i-carbon-star text-lg" />
        <span>{{ isGenerating ? '生成中…' : '立即生成' }}</span>
      </button>
      <view class="mt-2.5 text-xs text-[#8c9199]">
        本次消耗 <span class="text-[#22D386] font-bold">{{ totalCost }}</span> 积分
      </view>
    </view>

    <!-- 生成的作品结果展示 -->
    <view v-if="generatedIds.length" class="mt-5 grid grid-cols-2 gap-3">
      <view
        v-for="(id, idx) in generatedIds"
        :key="id"
        class="aspect-square flex items-center justify-center rounded-2xl text-white text-xs font-semibold overflow-hidden active:opacity-90"
        :style="{ backgroundColor: appState.workMap[id]?.color }"
        @click="viewDetail(id)"
      >
        <span class="bg-black/25 px-2.5 py-1 rounded-lg">作品 {{ idx + 1 }}</span>
      </view>
    </view>

  </view>
</template>

<style scoped>
</style>
