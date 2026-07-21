<script lang="ts" setup>
import { computed } from 'vue'
import { useChatStore } from '@/store/chat'
import { getChatColor } from '@/constants/chat'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'ChatList',
})

definePage({
  style: {
    navigationStyle: 'custom',
  },
})

const chatStore = useChatStore()
const { conversations } = storeToRefs(chatStore)

// 动态从 store 的 conversations 映射出最近的聊天记录列表
const chatList = computed(() => {
  return Object.values(conversations.value)
    .map((conv) => {
      const lastMsg = conv.msgs && conv.msgs.length > 0 ? conv.msgs[conv.msgs.length - 1] : null
      // 必须有用户主动发送的消息才算聊过
      const hasInteractive = conv.msgs && conv.msgs.some(msg => msg.m === true)
      const color = getChatColor(conv.name)

      return {
        sessionId: conv.sessionId,
        name: conv.name,
        color,
        intro: lastMsg ? lastMsg.t : '暂无对话内容',
        time: '刚刚',
        unread: 0,
        hasInteractive,
      }
    })
    .filter(chat => chat.hasInteractive)
    .reverse() // 最新的在前面
})

// 跳转到聊天详情
const goDetail = (sessionId: string, name: string) => {
  uni.navigateTo({
    url: `/pages/chat/detail?sessionId=${encodeURIComponent(sessionId)}&name=${encodeURIComponent(name)}`,
  })
}

// 推荐助手列表
const recommendAssistants = [
  { name: '智能创作助手', icon: 'i-carbon-chat', color: '#22D386', desc: '撰写文章、灵感写作' },
  { name: '智能翻译', icon: 'i-carbon-globe', color: '#2F86FF', desc: '30+语言一键互译' },
  { name: '策划脑暴', icon: 'i-carbon-idea', color: '#FF6B6B', desc: '品牌起名、营销方案' },
  { name: '周易八卦', icon: 'i-carbon-compass', color: '#E5B26E', desc: '起卦占卜，推演乾坤运势' },
]

// 一键创建并开启推荐的聊天会话
const startRecommendedChat = async (name: string) => {
  const sessionId = await chatStore.initConversation(name)
  uni.navigateTo({
    url: `/pages/chat/detail?sessionId=${encodeURIComponent(sessionId)}&name=${encodeURIComponent(name)}`,
  })
}
</script>

<template>
  <view class="px-4 pt-12">
    <!-- 顶部操作栏 -->
    <view class="flex items-center justify-between py-3">
      <view class="text-2xl font-extrabold text-[#1a1a1a]">智能聊天</view>
    </view>

    <!-- 会话列表 -->
    <view class="mt-3 flex flex-col gap-3">
      <template v-if="chatList.length > 0">
        <view
          v-for="chat in chatList"
          :key="chat.sessionId"
          class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm active:bg-gray-50"
          @click="goDetail(chat.sessionId, chat.name)"
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

      <!-- 空状态 -->
      <view v-else class="flex flex-col items-center justify-center pt-20 pb-8 text-center">
        <view class="relative h-24 w-24 flex items-center justify-center mb-5 flex-shrink-0">
          <view class="absolute inset-0 rounded-full bg-white border border-solid border-[#e4e6eb]/60 shadow-sm animate-pulse" />
          <view class="h-16 w-16 flex items-center justify-center rounded-full bg-[#22D386]/8 text-[#22D386] z-10">
            <view class="i-carbon-chat text-3xl" />
          </view>
        </view>

        <view class="text-base font-extrabold text-[#1a1a1a] mb-1.5">还没有聊天记录</view>
        <view class="text-xs text-[#8c9199] mb-8 max-w-[240px] leading-relaxed">
          选择下方推荐的智能助手，即可一键直接开启全新的对话之旅
        </view>

        <!-- 推荐助手快捷磁贴 -->
        <view class="w-full text-left">
          <view class="grid grid-cols-2 gap-3 pb-4">
            <view
              v-for="item in recommendAssistants"
              :key="item.name"
              class="flex items-center gap-2.5 rounded-2xl bg-white border border-solid border-[#e4e6eb]/65 p-3 shadow-sm active:bg-gray-100/60 cursor-pointer transition-all active:scale-97"
              @click="startRecommendedChat(item.name)"
            >
              <view
                class="h-8.5 w-8.5 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                :style="{ backgroundColor: item.color }"
              >
                <view :class="[item.icon, 'text-base']" />
              </view>
              <view class="min-w-0 flex-1">
                <view class="text-[13px] font-extrabold text-[#1a1a1a] truncate">{{ item.name }}</view>
                <view class="text-[10px] text-[#8c9199] truncate mt-0.5">{{ item.desc }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
button:active {
  transform: scale(0.98);
}
</style>
