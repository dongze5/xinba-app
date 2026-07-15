<script lang="ts" setup>
import { ref } from 'vue'
import { useAppStateStore } from '@/store/appState'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'

defineOptions({
  name: 'ProfilePage',
})

definePage({
  style: {
    navigationBarTitleText: '个人资料编辑',
  },
})

const appState = useAppStateStore()
const { myWorks } = storeToRefs(appState)

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 表单响应式数据
const nickname = ref(userInfo.value.nickname || '')
const avatarUrl = ref(userInfo.value.avatar || '/static/images/avatar.png')

// 微信头像授权回调
const onChooseAvatar = (e: any) => {
  console.log('微信头像授权回调', e)
  if (e.detail && e.detail.avatarUrl) {
    avatarUrl.value = e.detail.avatarUrl
    console.log('成功获取微信临时头像路径: ', avatarUrl.value)
  }
}

// 微信昵称输入与失去焦点回调
const onNicknameBlur = (e: any) => {
  if (e.detail && e.detail.value) {
    nickname.value = e.detail.value
    console.log('昵称 blur 更新: ', nickname.value)
  }
}

const onNicknameInput = (e: any) => {
  if (e.detail && e.detail.value) {
    nickname.value = e.detail.value
  }
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确认退出当前登录状态吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.clearUserInfo()
        uni.showToast({
          title: '已退出登录',
          icon: 'success',
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1000)
      }
    }
  })
}

// 保存个人资料
const handleSave = () => {
  const nameVal = nickname.value.trim()
  if (!nameVal) {
    uni.showToast({
      title: '昵称不能为空',
      icon: 'none',
    })
    return
  }
  
  userStore.updateProfile(nameVal, avatarUrl.value)
  uni.showToast({
    title: '资料更新成功',
    icon: 'success',
  })
  
  setTimeout(() => {
    uni.navigateBack()
  }, 1000)
}
</script>

<template>
  <view class="min-h-screen bg-[#f5f7f9] px-4 py-5">
    <view class="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
      <!-- 微信头像采集按钮 (圆圈) -->
      <button
        open-type="chooseAvatar"
        class="avatar-btn h-20 w-20 rounded-full flex items-center justify-center p-0 overflow-hidden border border-solid border-[#e4e6eb] relative active:opacity-90"
        @chooseavatar="onChooseAvatar"
      >
        <image :src="avatarUrl" class="h-full w-full object-cover" />
        <view class="absolute bottom-0 left-0 right-0 h-5 bg-black/40 text-[9px] text-white flex items-center justify-center font-bold">
          点击修改
        </view>
      </button>
      <view class="text-xs text-[#8c9199] mt-2.5">点击上方头像同步微信真实头像</view>
    </view>

    <!-- 微信资料填写表单 -->
    <view class="mt-4 bg-white rounded-2xl p-5 shadow-sm">
      <view class="flex items-center justify-between py-3 border-b border-b-solid border-b-[#f0f2f5]">
        <text class="text-[15px] font-bold text-[#1a1a1a] w-20">用户昵称</text>
        <input
          type="nickname"
          v-model="nickname"
          placeholder="点击一键填充微信昵称"
          placeholder-class="text-[#c0c4cc]"
          class="flex-1 text-[15px] text-[#1a1a1a] text-right font-medium"
          @blur="onNicknameBlur"
          @input="onNicknameInput"
        />
      </view>
      <view class="flex items-center justify-between py-3">
        <text class="text-[15px] font-bold text-[#1a1a1a]">创作统计</text>
        <text class="text-[14px] text-[#8c9199] font-semibold">
          已创作 {{ myWorks.length }} 次
        </text>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="mt-6">
      <button
        class="w-full h-12 rounded-2xl bg-[#22D386] text-white text-[15px] font-bold shadow-sm flex items-center justify-center active:opacity-90"
        @click="handleSave"
      >
        保存个人资料
      </button>
    </view>

    <!-- 退出登录按钮 -->
    <view class="mt-3">
      <button
        class="w-full h-12 rounded-2xl bg-white border border-solid border-[#e4e6eb] text-[#f56c6c] text-[15px] font-bold shadow-sm flex items-center justify-center active:bg-gray-50"
        @click="handleLogout"
      >
        退出当前登录
      </button>
    </view>
  </view>
</template>

<style scoped>
/* 消除小程序默认 button 重置引起的不美观 */
.avatar-btn {
  background: none;
  line-height: normal;
}
.avatar-btn::after {
  border: none;
}
</style>
