<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStateStore } from '@/store/appState'
import { storeToRefs } from 'pinia'
import { tabbarStore } from '@/tabbar/store'

defineOptions({
  name: 'ChatList',
})

definePage({
  style: {
    navigationStyle: 'custom',
  },
})

const appState = useAppStateStore()
const { conversations } = storeToRefs(appState)

// 动态从 Pinia store 的 conversations 映射出最近的聊天记录列表
const chatList = computed(() => {
  return Object.keys(conversations.value)
    .map(name => {
      const chat = conversations.value[name]
      const lastMsg = chat.msgs && chat.msgs.length > 0 ? chat.msgs[chat.msgs.length - 1] : null
      
      // 必须有用户主动发送的消息才算聊过 (m === true)
      const hasInteractive = chat.msgs && chat.msgs.some(msg => msg.m === true)
      
      // 会话图标底色预设（规避紫色，保持高阶扁平调性）
      const colorMap: Record<string, string> = {
        'AI 创作助手': '#22D386',
        '文案写作': '#FF9F43',
        '智能翻译': '#2F86FF',
        '旅行规划师': '#FF6B6B',
        '绘画工坊': '#41E09A',
        '知识百科': '#18C97A',
      }

      // 根据会话名字哈希出固定色，或使用预设色
      const color = colorMap[name] || `hsl(${Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 360}, 75%, 60%)`

      return {
        name,
        color,
        intro: lastMsg ? lastMsg.t : '暂无对话内容',
        time: '刚刚', // 最近对话时间
        unread: 0,   // 清零未读状态
        hasInteractive,
      }
    })
    .filter(chat => chat.hasInteractive) // 只有真正有过互动的会话才显示在聊天列表中
})

// 跳转到聊天详情
const goDetail = (name: string) => {
  uni.navigateTo({
    url: `/pages/chat/detail?name=${encodeURIComponent(name)}`,
  })
}
</script>

<template>
  <view class="px-4 pt-12">
    <!-- 顶部操作栏 -->
    <view class="flex items-center justify-between py-3">
      <view class="text-2xl font-extrabold text-[#1a1a1a]">AI 聊天</view>
      <!-- 临时隐藏新对话按钮 -->
      <!-- <button
        class="inline-flex items-center gap-1 border border-[#22d386]/25 rounded-2xl bg-white px-3 py-1.5 text-xs font-semibold text-[#22D386] shadow-sm active:bg-gray-100"
        @click="startNewChat"
      >
        <view class="i-carbon-edit text-sm" />
        新对话
      </button> -->
    </view>

    <!-- 会话列表 (动态从 store 加载最近聊天历史) -->
    <view class="mt-3 flex flex-col gap-3">
      <template v-if="chatList.length > 0">
        <view
          v-for="chat in chatList"
          :key="chat.name"
          class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm active:bg-gray-50"
          @click="goDetail(chat.name)"
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
            <view
              v-if="chat.unread"
              class="h-4.5 w-4.5 flex items-center justify-center rounded-full bg-[#ff4757] text-[10px] font-bold text-white"
            >
              {{ chat.unread }}
            </view>
          </view>
        </view>
      </template>
      <!-- 极致扁平高端空状态 (与项目内 points.vue 完美保持视觉系统统一) -->
      <view v-else class="flex flex-col items-center justify-center py-20 text-center">
        <view class="h-20 w-20 flex items-center justify-center rounded-[26px] bg-green-50 text-[#22D386] mb-5">
          <view class="i-carbon-chat inline-block text-3xl" />
        </view>
        <view class="text-base font-bold text-[#1a1a1a] mb-1.5">还没有聊天记录</view>
        <view class="text-xs text-[#8c9199] mb-6 max-w-[220px]">
          从首页点击对应的 AI 助手，即可开启全新的智能对话
        </view>
        <button
          class="h-9 px-6 rounded-2xl bg-[#22D386] text-white text-xs font-bold shadow-sm active:scale-95 flex items-center justify-center border-none m-0"
          @click="tabbarStore.setCurIdx(0)"
        >
          去开启对话
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
/* 扁平按钮点击缩放 */
button:active {
  transform: scale(0.98);
}
</style>
