<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useChatStore } from '@/store/chat'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'ChatDetail',
})

definePage({
  style: {
    navigationBarTitleText: '智能聊天',
  },
})

const chatStore = useChatStore()
const { conversations, isStreaming, modelList, currentModel } = storeToRefs(chatStore)

// 路由参数
const sessionId = ref('')
const chatName = ref('智能聊天')
const inputValue = ref('')
const toView = ref('')
const showModelPicker = ref(false)

// 获取当前会话
const currentChat = computed(() => {
  return conversations.value[sessionId.value] || null
})

// 监听消息列表变化，自动滚动到底部
watch(
  () => currentChat.value?.msgs.length,
  () => {
    nextTick(() => {
      const len = currentChat.value?.msgs.length || 0
      if (len > 0) {
        toView.value = `msg-${len - 1}`
      }
    })
  },
  { immediate: true },
)

// 监听流式内容变化，持续滚动到底部
watch(
  () => {
    const msgs = currentChat.value?.msgs
    if (!msgs || msgs.length === 0) return ''
    const last = msgs[msgs.length - 1]
    return last.t
  },
  () => {
    if (isStreaming.value) {
      nextTick(() => {
        const len = currentChat.value?.msgs.length || 0
        if (len > 0) {
          toView.value = `msg-${len - 1}`
        }
      })
    }
  },
)

// 加载页面
onLoad(async (options: Record<string, string | undefined>) => {
  if (options?.name) {
    chatName.value = decodeURIComponent(options.name)
    uni.setNavigationBarTitle({ title: chatName.value })
  }
  if (options?.sessionId) {
    sessionId.value = decodeURIComponent(options.sessionId)
  }
  else {
    // 没有 sessionId，创建新会话
    sessionId.value = await chatStore.initConversation(chatName.value)
  }

  // 加载模型列表
  if (modelList.value.length === 0) {
    chatStore.loadModels()
  }

  // 加载历史消息
  chatStore.loadHistory(sessionId.value)
})

// 发送消息
const handleSend = () => {
  const text = inputValue.value.trim()
  if (!text || isStreaming.value) return

  chatStore.sendMessage(sessionId.value, text)
  inputValue.value = ''
}

// 点击推荐芯片
const clickChip = (txt: string) => {
  if (isStreaming.value) return
  chatStore.sendMessage(sessionId.value, txt)
}

// 停止生成
const handleStop = () => {
  chatStore.stopStreaming()
}

// 选择模型
const selectModel = (modelName: string) => {
  chatStore.setModel(modelName)
  showModelPicker.value = false
}

// 当前模型显示名
const currentModelLabel = computed(() => {
  const model = modelList.value.find(m => m.modelName === currentModel.value)
  return model?.modelDescribe || currentModel.value || 'dify'
})
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
        <template v-if="currentChat">
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
              <!-- 深度思考折叠区 -->
              <view v-if="msg.thinking" class="mb-2 text-xs text-[#8c9199] border-b border-b-solid border-b-[#eee] pb-2">
                <text class="font-bold">思考过程：</text>
                <text>{{ msg.thinking }}</text>
              </view>

              <!-- 消息正文 -->
              <text v-if="msg.t">{{ msg.t }}</text>

              <!-- 流式加载动画 -->
              <view v-if="msg.streaming && !msg.t" class="flex items-center gap-1 py-1">
                <view class="h-1.5 w-1.5 rounded-full bg-[#22D386] animate-bounce" style="animation-delay: 0ms" />
                <view class="h-1.5 w-1.5 rounded-full bg-[#22D386] animate-bounce" style="animation-delay: 150ms" />
                <view class="h-1.5 w-1.5 rounded-full bg-[#22D386] animate-bounce" style="animation-delay: 300ms" />
              </view>

              <!-- 流式输出中的光标 -->
              <text v-if="msg.streaming && msg.t" class="inline-block w-0.5 h-4 bg-[#22D386] ml-0.5 animate-pulse align-middle" />
            </view>
          </view>

          <!-- 推荐提示词芯片列表 -->
          <view v-if="currentChat.chips && currentChat.chips.length && !isStreaming" class="ml-11 flex flex-wrap gap-2.5">
            <span
              v-for="chip in currentChat.chips"
              :key="chip"
              class="bg-white border border-solid border-[#E5E5E5] text-[#07C160] text-xs px-3.5 py-2 rounded-2xl shadow-sm active:bg-[#F2FBF6]"
              @click="clickChip(chip)"
            >
              {{ chip }}
            </span>
          </view>
        </template>
      </view>
    </scroll-view>

    <!-- 底部输入栏 -->
    <view class="flex-shrink-0 bg-[#EDEDED] border-t border-t-solid border-t-[#E5E5E5] px-3.5 pb-8 pt-2.5">
      <!-- 模型选择 + 停止按钮 -->
      <view class="flex items-center justify-between mb-2">
        <view
          class="flex items-center gap-1 text-xs text-[#8c9199] bg-white rounded-full px-3 py-1.5 shadow-sm"
          @click="showModelPicker = !showModelPicker"
        >
          <view class="i-carbon-machine-learning-model text-sm text-[#22D386]" />
          <text>{{ currentModelLabel }}</text>
          <view class="i-carbon-chevron-down text-xs" />
        </view>

        <view
          v-if="isStreaming"
          class="flex items-center gap-1 text-xs text-white bg-[#FF6B6B] rounded-full px-3 py-1.5 shadow-sm active:opacity-80"
          @click="handleStop"
        >
          <view class="i-carbon-stop-filled text-sm" />
          <text>停止生成</text>
        </view>
      </view>

      <!-- 模型选择弹出层 -->
      <view v-if="showModelPicker" class="mb-2 bg-white rounded-2xl p-3 shadow-sm">
        <view class="text-xs text-[#8c9199] mb-2 font-bold">选择模型</view>
        <view class="flex flex-wrap gap-2">
          <view
            v-for="model in modelList"
            :key="model.modelName"
            class="text-xs px-3 py-1.5 rounded-full border border-solid"
            :class="model.modelName === currentModel
              ? 'bg-[#22D386]/10 border-[#22D386] text-[#22D386] font-bold'
              : 'border-[#E5E5E5] text-[#666]'"
            @click="selectModel(model.modelName)"
          >
            {{ model.modelDescribe || model.modelName }}
          </view>
        </view>
      </view>

      <!-- 输入框 -->
      <view class="flex items-center gap-2.5 bg-white rounded-3xl px-3.5 py-1.5 shadow-sm">
        <input
          v-model="inputValue"
          placeholder="输入你想说的…"
          confirm-type="send"
          class="flex-1 h-9 text-[15px] outline-none text-[#1a1a1a]"
          :disabled="isStreaming"
          @confirm="handleSend"
        />
        <!-- 发送按钮 -->
        <button
          class="h-9 w-9 flex items-center justify-center rounded-full flex-shrink-0 active:opacity-90"
          :class="isStreaming ? 'bg-[#ccc] text-white' : 'bg-[#22D386] text-white'"
          :disabled="isStreaming"
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
