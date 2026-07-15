<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAppStateStore } from '@/store/appState'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'ChatDetail',
})

definePage({
  style: {
    navigationBarTitleText: 'AI 聊天',
  },
})

const appState = useAppStateStore()
const { conversations } = storeToRefs(appState)

// 路由参数
const chatName = ref('AI 聊天')
const inputValue = ref('')
const toView = ref('')

// 获取当前会话
const currentChat = computed(() => {
  return conversations.value[chatName.value] || {
    chips: ['帮我写文案', '生成一张图', '随便聊聊'],
    msgs: [{ m: false, t: '你好！我是你的 AI 助手。今天想聊点什么，还是需要帮你生成内容？' }],
  }
})

// 监听消息列表变化，自动滚动到底部
watch(
  () => currentChat.value.msgs.length,
  () => {
    nextTick(() => {
      const len = currentChat.value.msgs.length
      if (len > 0) {
        toView.value = `msg-${len - 1}`
      }
    })
  },
  { immediate: true },
)

// 加载会话名称
onLoad((options: any) => {
  if (options && options.name) {
    chatName.value = decodeURIComponent(options.name)
    uni.setNavigationBarTitle({
      title: chatName.value,
    })
  }
})

// 发送消息
const handleSend = () => {
  const text = inputValue.value.trim()
  if (!text) return

  appState.sendMessage(chatName.value, text)
  inputValue.value = ''
}

// 点击推荐芯片
const clickChip = (txt: string) => {
  appState.sendMessage(chatName.value, txt)
}
</script>

<template>
  <view class="flex flex-col h-screen bg-[#EDEDED]">
    <!-- 消息滚动列表 -->
    <scroll-view
      class="flex-1 overflow-y-auto"
      scroll-y
      :scroll-into-view="toView"
      :show-scrollbar="false"
    >
      <view class="px-4 py-5 flex flex-col gap-5">
        <view
          v-for="(msg, index) in currentChat.msgs"
          :key="index"
          :id="`msg-${index}`"
          class="flex items-end gap-2.5"
          :class="msg.m ? 'justify-end' : 'justify-start'"
        >
          <!-- AI 头像 -->
          <view
            v-if="!msg.m"
            class="h-9 w-9 flex items-center justify-center rounded-full text-white flex-shrink-0"
            style="background: linear-gradient(135deg, #2BE08F, #18C97A)"
          >
            <view class="i-carbon-star-filled text-sm" />
          </view>

          <!-- 消息气泡 -->
          <view
            class="max-w-[72%] px-4 py-3 rounded-[18px] text-[15px] leading-relaxed break-words shadow-sm"
            :class="msg.m ? 'bg-[#95EC69] text-black rounded-br-[5px]' : 'bg-white text-[#1a1a1a] rounded-bl-[5px]'"
          >
            {{ msg.t }}
          </view>
        </view>

        <!-- 推荐提示词芯片列表 -->
        <view v-if="currentChat.chips && currentChat.chips.length" class="ml-11 flex flex-wrap gap-2.5">
          <span
            v-for="chip in currentChat.chips"
            :key="chip"
            class="bg-white border border-solid border-[#E5E5E5] text-[#07C160] text-xs px-3.5 py-2 rounded-2xl shadow-sm active:bg-[#F2FBF6]"
            @click="clickChip(chip)"
          >
            {{ chip }}
          </span>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入栏 -->
    <view class="flex-shrink-0 bg-[#EDEDED] border-t border-t-solid border-t-[#E5E5E5] px-3.5 pb-8 pt-2.5">
      <view class="flex items-center gap-2.5 bg-white rounded-3xl px-3.5 py-1.5 shadow-sm">
        <!-- 附加媒体按钮 -->
        <view class="i-carbon-attachment text-xl text-[#07C160] flex-shrink-0" />
        <input
          v-model="inputValue"
          placeholder="输入你想说的…"
          confirm-type="send"
          class="flex-1 h-9 text-[15px] outline-none text-[#1a1a1a]"
          @confirm="handleSend"
        />
        <!-- 发送按钮 -->
        <button
          class="h-9 w-9 flex items-center justify-center rounded-full bg-[#22D386] text-white flex-shrink-0 active:opacity-90"
          @click="handleSend"
        >
          <view class="i-carbon-send text-base text-white" />
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
