<script lang="ts" setup>
import { computed } from 'vue'
import { useChatStore } from '@/store/chat'
import { getChatColor } from '@/constants/chat'
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

const chatStore = useChatStore()
const { conversations } = storeToRefs(chatStore)

// 动态从 Pinia store 的 conversations 映射出最近的聊天记录列表
const chatList = computed(() => {
  return Object.keys(conversations.value)
    .map(name => {
      const chat = conversations.value[name]
      const lastMsg = chat.msgs && chat.msgs.length > 0 ? chat.msgs[chat.msgs.length - 1] : null

      // 必须有用户主动发送的消息才算聊过 (m === true)
      const hasInteractive = chat.msgs && chat.msgs.some(msg => msg.m === true)

      // 根据会话名字获取预设色或哈希生成色
      const color = getChatColor(name)

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

// 精美空状态下的推荐助手列表数据
const recommendAssistants = [
  { name: '智能创作助手', icon: 'i-carbon-chat', color: '#22D386', desc: '撰写文章、灵感写作' },
  { name: '智能翻译', icon: 'i-carbon-globe', color: '#2F86FF', desc: '30+语言一键互译' },
  { name: '策划脑暴', icon: 'i-carbon-idea', color: '#FF6B6B', desc: '品牌起名、营销方案' },
  { name: '周易八卦', icon: 'i-carbon-compass', color: '#E5B26E', desc: '起卦占卜，推演乾坤运势' }
]

// 一键创建并开启推荐的聊天会话
const startRecommendedChat = (name: string) => {
  chatStore.initConversation(name)
  uni.navigateTo({
    url: `/pages/chat/detail?name=${encodeURIComponent(name)}`
  })
}
</script>

<template>
  <view class="px-4 pt-12">
    <!-- 顶部操作栏 -->
    <view class="flex items-center justify-between py-3">
      <view class="text-2xl font-extrabold text-[#1a1a1a]">智能聊天</view>
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
      <!-- 极致高端扁平化空状态 (带分层同心圆与一键开启对话磁贴) -->
      <view v-else class="flex flex-col items-center justify-center pt-10 pb-8 text-center">
        <!-- 1. 精美的分层同心圆头像框 -->
        <view class="relative h-24 w-24 flex items-center justify-center mb-5 flex-shrink-0">
          <!-- 外层白底灰描边圈（加微弱呼吸感） -->
          <view class="absolute inset-0 rounded-full bg-white border border-solid border-[#e4e6eb]/60 shadow-sm animate-pulse" />
          <!-- 内层淡绿底色圈 -->
          <view class="h-16 w-16 flex items-center justify-center rounded-full bg-[#22D386]/8 text-[#22D386] z-10">
            <view class="i-carbon-chat text-3xl" />
          </view>
        </view>

        <!-- 2. 引导文字 -->
        <view class="text-base font-extrabold text-[#1a1a1a] mb-1.5">还没有聊天记录</view>
        <view class="text-xs text-[#8c9199] mb-8 max-w-[240px] leading-relaxed">
          选择下方推荐的智能助手，即可一键直接开启全新的对话之旅
        </view>

        <!-- 3. 推荐助手快捷磁贴 (二列扁平网格，完全复用项目色彩规范) -->
        <view class="w-full text-left">
          <view class="grid grid-cols-2 gap-3 pb-4">
            <view
              v-for="item in recommendAssistants"
              :key="item.name"
              class="flex items-center gap-2.5 rounded-2xl bg-white border border-solid border-[#e4e6eb]/65 p-3 shadow-sm active:bg-gray-100/60 cursor-pointer transition-all active:scale-97"
              @click="startRecommendedChat(item.name)"
            >
              <!-- 纯色圆角图标角标 -->
              <view
                class="h-8.5 w-8.5 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                :style="{ backgroundColor: item.color }"
              >
                <view :class="[item.icon, 'text-base']" />
              </view>
              <!-- 文字说明 -->
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
/* 扁平按钮点击缩放 */
button:active {
  transform: scale(0.98);
}
</style>
