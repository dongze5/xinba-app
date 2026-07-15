<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/store/appState'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'WorkDetail',
})

definePage({
  style: {
    navigationBarTitleText: '作品详情',
  },
})

const appState = useAppStateStore()
const { workMap, collected } = storeToRefs(appState)

const workId = ref('')
const fromSource = ref('hot')

// 读取路由参数
onLoad((options: any) => {
  if (options && options.id) {
    workId.value = options.id
    fromSource.value = options.from || 'hot'
  }
})

// 获取作品数据
const workInfo = computed(() => {
  return workMap.value[workId.value]
})

// 判断是否已收藏
const isFaved = computed(() => {
  return collected.value.includes(workId.value)
})

// 来源文案展示
const subText = computed(() => {
  const src = fromSource.value
  if (src === 'myworks' || src === 'gen') return '我生成的作品'
  if (src === 'collected' || src === 'fav') return '我的收藏'
  return '热门作品'
})

// 收藏按钮状态
const favBtnText = computed(() => {
  return isFaved.value ? '已收藏' : '收藏'
})

// 收藏/下载/以此生成 (右侧主按钮操作)
const handlePrimaryAction = () => {
  const src = fromSource.value
  const id = workId.value
  const work = workInfo.value
  if (!work) return

  if (src === 'myworks' || src === 'gen') {
    // 动作：下载
    appState.downloadWork(id)
    uni.showToast({
      title: '已保存到相册',
      icon: 'success',
    })
  } else if (src === 'collected' || src === 'fav') {
    // 动作：以此生成
    generateFromWork(work.prompt || work.title)
  } else {
    // 动作：hot 切换收藏
    appState.toggleCollect(id)
    uni.showToast({
      title: isFaved.value ? '收藏成功' : '取消收藏',
      icon: 'none',
    })
  }
}

// 删除/取消收藏/以此生成 (左侧次级按钮操作)
const handleSecondaryAction = () => {
  const src = fromSource.value
  const id = workId.value
  const work = workInfo.value
  if (!work) return

  if (src === 'myworks' || src === 'gen') {
    // 动作：删除
    uni.showModal({
      title: '提示',
      content: '确认要删除这件作品吗？',
      success: (res) => {
        if (res.confirm) {
          appState.deleteWork(id)
          uni.showToast({
            title: '已删除',
            icon: 'success',
          })
          setTimeout(() => {
            uni.navigateBack()
          }, 1000)
        }
      },
    })
  } else if (src === 'collected' || src === 'fav') {
    // 动作：取消收藏
    appState.toggleCollect(id)
    uni.showToast({
      title: '已取消收藏',
      icon: 'success',
    })
    setTimeout(() => {
      uni.navigateBack()
    }, 1000)
  } else {
    // 动作：hot 以此生成
    generateFromWork(work.prompt || work.title)
  }
}

// 携带提示词跳转到生图
const generateFromWork = (promptText: string) => {
  // 使用 Storage 跨页面传值，简单至上
  uni.setStorageSync('pendingPrompt', promptText)
  uni.reLaunch({
    url: '/pages/index/index?tab=2',
  })
}
</script>

<template>
  <view v-if="workInfo" class="min-h-screen bg-[#f5f7f9] px-4 pt-4 pb-28">
    <!-- 主体区域 -->
    <view>
      <!-- 大图展示 (高保真纯色色块) -->
      <view
        class="w-full aspect-square rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-sm"
        :style="{ backgroundColor: workInfo.color }"
      >
        <span class="bg-black/35 px-4 py-1.5 rounded-2xl">{{ workInfo.title }}</span>
      </view>

      <!-- 作品详情介绍 -->
      <view class="mt-4 rounded-2xl bg-white p-5 shadow-sm">
        <view class="text-lg font-extrabold text-[#1a1a1a]">{{ workInfo.title }}</view>
        <view class="mt-1 text-xs text-[#8c9199]">{{ subText }}</view>
      </view>

      <!-- 提示词展示 -->
      <view class="mt-3 rounded-2xl bg-white p-5 shadow-sm">
        <view class="text-sm font-bold text-[#8c9199] mb-2">生成提示词</view>
        <view class="text-sm text-[#1a1a1a] leading-relaxed">{{ workInfo.prompt || '暂无描述' }}</view>
      </view>
    </view>

    <!-- 底部操作按钮 (固定悬浮，纯色扁平) -->
    <view 
      class="fixed bottom-0 left-0 right-0 z-50 flex gap-3 bg-white border-t border-solid border-[#f0f2f5] px-4 pt-3"
      style="padding-bottom: calc(12px + env(safe-area-inset-bottom));"
    >
      <!-- 次级操作按钮 -->
      <button
        class="flex-1 h-12 inline-flex items-center justify-center border border-solid border-[#e4e6eb] rounded-2xl bg-white text-[15px] font-bold text-[#333] active:bg-gray-100 m-0"
        @click="handleSecondaryAction"
      >
        <template v-if="fromSource === 'myworks' || fromSource === 'gen'">删除</template>
        <template v-else-if="fromSource === 'collected' || fromSource === 'fav'">取消收藏</template>
        <template v-else>以此生成</template>
      </button>

      <!-- 主级操作按钮 -->
      <button
        class="flex-1 h-12 inline-flex items-center justify-center rounded-2xl bg-[#22D386] text-white text-[15px] font-bold active:opacity-90 shadow-sm border-none m-0"
        @click="handlePrimaryAction"
      >
        <template v-if="fromSource === 'myworks' || fromSource === 'gen'">下载</template>
        <template v-else-if="fromSource === 'collected' || fromSource === 'fav'">以此生成</template>
        <template v-else>{{ favBtnText }}</template>
      </button>
    </view>
  </view>

  <view v-else class="min-h-screen flex items-center justify-center bg-[#f5f7f9]">
    <view class="text-center text-sm text-[#8c9199]">作品未找到</view>
  </view>
</template>

<style scoped>
</style>
