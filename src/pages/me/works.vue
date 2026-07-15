<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAppStateStore } from '@/store/appState'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'WorksPage',
})

definePage({
  style: {
    navigationBarTitleText: '作品列表',
  },
})

const appState = useAppStateStore()
const { workMap, myWorks, collected, downloads } = storeToRefs(appState)

const pageType = ref('myworks')

// 页面加载解析类型
onLoad((options: any) => {
  if (options && options.type) {
    pageType.value = options.type
    let title = '作品列表'
    if (pageType.value === 'myworks') title = '我的作品'
    else if (pageType.value === 'collected' || pageType.value === 'fav') title = '灵感收藏'
    else if (pageType.value === 'downloads') title = '已下载'
    else if (pageType.value === 'hot') title = '热门作品'

    uni.setNavigationBarTitle({ title })
  }
})

// 根据类型过滤出要显示的 ID 列表
const displayIds = computed(() => {
  if (pageType.value === 'myworks') return myWorks.value
  if (pageType.value === 'collected' || pageType.value === 'fav') return collected.value
  if (pageType.value === 'downloads') return downloads.value
  if (pageType.value === 'hot') return ['p1', 'p2', 'p3', 'p4']
  return []
})

// 空状态下的展示内容与操作
const emptyConfig = computed(() => {
  const cfg = {
    icon: 'i-carbon-image',
    title: '这里还什么都没有',
    sub: '快去创作或发现好图吧',
    btnText: '去生图',
    goTab: true,
    url: '/pages/gen/index',
  }

  if (pageType.value === 'collected' || pageType.value === 'fav') {
    cfg.title = '还没有收藏'
    cfg.sub = '去发现页看看，遇到喜欢的就收藏吧'
    cfg.btnText = '去发现好图'
    cfg.goTab = false
    cfg.url = '/pages/me/works?type=hot'
  } else if (pageType.value === 'downloads') {
    cfg.title = '还没有下载任何作品'
    cfg.sub = '在作品里点「下载」即可保存到相册'
    cfg.btnText = '去我的作品'
    cfg.goTab = false
    cfg.url = '/pages/me/works?type=myworks'
  }

  return cfg
})

// 按钮引导跳转
const handleEmptyAction = () => {
  const cfg = emptyConfig.value
  if (cfg.goTab) {
    let tabIdx = 0
    if (cfg.url.includes('/pages/gen/index')) {
      tabIdx = 2
    } else if (cfg.url.includes('/pages/chat/index')) {
      tabIdx = 1
    } else if (cfg.url.includes('/pages/me/me')) {
      tabIdx = 3
    }
    uni.reLaunch({
      url: `/pages/index/index?tab=${tabIdx}`,
    })
  } else {
    uni.navigateTo({ url: cfg.url })
  }
}

// 查看详情页
const viewDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/works/detail?id=${id}&from=${pageType.value}`,
  })
}

// 判断是否已被收藏
const isFaved = (id: string) => collected.value.includes(id)
</script>

<template>
  <view class="min-h-screen bg-[#f5f7f9] px-4 py-4">
    <!-- 空状态展示 (高保真扁平) -->
    <view v-if="!displayIds.length" class="flex flex-col items-center justify-center py-20 text-center">
      <view class="h-22 w-22 flex items-center justify-center rounded-[28px] bg-green-50 text-[#22D386] mb-6">
        <view :class="[emptyConfig.icon, 'inline-block text-4xl']" />
      </view>
      <view class="text-lg font-extrabold text-[#1a1a1a] mb-2">{{ emptyConfig.title }}</view>
      <view class="text-sm text-[#8c9199] mb-7 max-w-[220px] leading-relaxed">{{ emptyConfig.sub }}</view>
      <button
        class="h-11 px-7 rounded-[23px] bg-[#22D386] text-white text-[15px] font-bold shadow-sm inline-flex items-center gap-1.5 active:scale-95"
        @click="handleEmptyAction"
      >
        {{ emptyConfig.btnText }}
      </button>
    </view>

    <!-- 网格列表展示 -->
    <view v-else class="grid grid-cols-2 gap-3">
      <view
        v-for="id in displayIds"
        :key="id"
        class="relative aspect-square flex items-center justify-center rounded-2xl text-white text-xs font-semibold overflow-hidden active:opacity-90 shadow-sm"
        :style="{ backgroundColor: workMap[id]?.color }"
        @click="viewDetail(id)"
      >
        <span>{{ workMap[id]?.title }}</span>
        <!-- 收藏星星角标 -->
        <view
          v-if="isFaved(id)"
          class="absolute top-2 right-2 h-6 w-6 flex items-center justify-center rounded-full bg-black/35 text-[11px] text-yellow-400 font-bold"
        >
          ★
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
</style>
