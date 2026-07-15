<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStateStore } from '@/store/appState'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'HomeContent',
})

const appState = useAppStateStore()
const { workMap, conversations } = storeToRefs(appState)

// 热门作品 ID
const hotWorkIds = ['p1', 'p2', 'p3', 'p4']

// 跳转方法
const goPage = (url: string) => {
  uni.navigateTo({ url })
}

// 切换Tab
import { tabbarStore } from '@/tabbar/store'
const switchTabIdx = (idx: number) => {
  tabbarStore.setCurIdx(idx)
}

// 进入特定聊天
const goChat = (name: string) => {
  uni.navigateTo({
    url: `/pages/chat/detail?name=${encodeURIComponent(name)}`,
  })
}

// 查看热门作品详情
const viewWork = (id: string) => {
  uni.navigateTo({
    url: `/pages/works/detail?id=${id}&from=hot`,
  })
}

// 动态获取真正互动过的最近会话列表 (至多3条)
const recentChats = computed(() => {
  return Object.keys(conversations.value)
    .map(name => {
      const chat = conversations.value[name]
      const lastMsg = chat.msgs && chat.msgs.length > 0 ? chat.msgs[chat.msgs.length - 1] : null
      
      // 必须有用户主动发送的消息才算聊过 (m === true)
      const hasInteractive = chat.msgs && chat.msgs.some(msg => msg.m === true)

      const colorMap: Record<string, string> = {
        'AI 创作助手': '#22D386',
        '文案写作': '#FF9F43',
        '智能翻译': '#2F86FF',
        '旅行规划师': '#FF6B6B',
        '绘画工坊': '#41E09A',
        '知识百科': '#18C97A',
        '策划脑暴': '#FF6B6B',
      }
      const color = colorMap[name] || '#aab0b8'

      return {
        name,
        color,
        intro: lastMsg ? lastMsg.t : '',
        time: '刚刚',
        hasInteractive,
      }
    })
    .filter(chat => chat.hasInteractive)
    .slice(0, 3)
})
</script>

<template>
  <view class="px-4 pt-12">
    <!-- 顶部问候栏 -->
    <view class="flex items-center justify-between pb-4 pt-2">
      <view>
        <view class="text-2xl font-extrabold text-[#1a1a1a] tracking-tight">嗨，探索者</view>
        <view class="mt-1 text-sm text-[#8c9199]">今天想创作点什么？</view>
      </view>

    </view>

    <!-- Hero 卡片 (高对比扁平纯色) -->
    <view class="rounded-2xl bg-[#22D386] p-6 text-white">
      <view class="text-2xl font-extrabold">AI 生图</view>
      <view class="mt-2 text-sm opacity-90">一句话，生成你的专属美图</view>
      <view
        class="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#22D386]"
        @click="switchTabIdx(2)"
      >
        立即体验 →
      </view>
    </view>

    <!-- 四宫格功能 -->
    <view class="mt-4 grid grid-cols-4 gap-3">
      <view
        class="flex flex-col items-center gap-2 rounded-2xl bg-white py-4 shadow-sm active:bg-gray-100"
        @click="goChat('AI 创作助手')"
      >
        <view class="i-carbon-chat text-xl text-[#22D386]" />
        <span class="text-xs font-medium text-[#333333]">智能聊天</span>
      </view>
      <view
        class="flex flex-col items-center gap-2 rounded-2xl bg-white py-4 shadow-sm active:bg-gray-100"
        @click="switchTabIdx(2)"
      >
        <view class="i-carbon-star text-xl text-[#22D386]" />
        <span class="text-xs font-medium text-[#333333]">AI 生图</span>
      </view>
      <view
        class="flex flex-col items-center gap-2 rounded-2xl bg-white py-4 shadow-sm active:bg-gray-100"
        @click="goChat('智能翻译')"
      >
        <view class="i-carbon-globe text-xl text-[#22D386]" />
        <span class="text-xs font-medium text-[#333333]">智能翻译</span>
      </view>
      <view
        class="flex flex-col items-center gap-2 rounded-2xl bg-white py-4 shadow-sm active:bg-gray-100"
        @click="goChat('策划脑暴')"
      >
        <view class="i-carbon-idea text-xl text-[#22D386]" />
        <span class="text-xs font-medium text-[#333333]">策划脑暴</span>
      </view>
    </view>

    <!-- 最近对话 -->
    <view class="mt-6 flex items-baseline justify-between">
      <span class="text-lg font-extrabold text-[#1a1a1a]">最近对话</span>
      <span class="text-xs font-normal text-[#8c9199]" @click="switchTabIdx(1)">
        更多 ›
      </span>
    </view>

    <!-- 动态展示真实最近对话 -->
    <view class="mt-3 flex flex-col gap-3">
      <template v-if="recentChats.length > 0">
        <view
          v-for="chat in recentChats"
          :key="chat.name"
          class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm active:bg-gray-50"
          @click="goChat(chat.name)"
        >
          <view
            class="h-12 w-12 flex items-center justify-center rounded-full text-lg font-bold text-white flex-shrink-0"
            :style="{ backgroundColor: chat.color }"
          >
            {{ chat.name[0] }}
          </view>
          <view class="flex-1 min-w-0">
            <view class="text-base font-bold text-[#1a1a1a]">{{ chat.name }}</view>
            <view class="mt-1 truncate text-xs text-[#8c9199]">{{ chat.intro }}</view>
          </view>
          <view class="flex flex-col items-end gap-1 flex-shrink-0">
            <span class="text-xs text-[#8c9199]">{{ chat.time }}</span>
          </view>
        </view>
      </template>
      <!-- 保留原来的半透明背景卡片，但彻底去掉丑陋的虚线边框，视觉更通透高级 -->
      <view v-else class="rounded-2xl bg-white/50 p-6 text-center">
        <view class="text-sm font-bold text-[#8c9199] mb-1">暂无最近对话</view>
        <view class="text-xs text-[#aab0b8]">点击上方的“智能聊天”开始体验吧</view>
      </view>
    </view>

    <!-- 热门作品 -->
    <view class="mt-6 flex items-baseline justify-between">
      <span class="text-lg font-extrabold text-[#1a1a1a]">热门作品</span>
      <span class="text-xs font-normal text-[#8c9199]" @click="goPage('/pages/me/works?type=hot')">
        更多 ›
      </span>
    </view>

    <scroll-view class="mt-3 w-full whitespace-nowrap" scroll-x :show-scrollbar="false">
      <view class="inline-flex gap-3 pb-2">
        <view
          v-for="id in hotWorkIds"
          :key="id"
          class="relative h-44 w-32 flex flex-col justify-end overflow-hidden rounded-2xl p-3 shadow-sm active:opacity-90"
          :style="{ backgroundColor: workMap[id]?.color }"
          @click="viewWork(id)"
        >
          <span class="inline-block self-start rounded-lg bg-black/35 px-2 py-0.5 text-3 font-semibold text-white">
            {{ workMap[id]?.title }}
          </span>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
/* 隐藏 scroll-view 滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
