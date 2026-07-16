<script lang="ts" setup>
import { useUserStore } from '@/store/user'
import { useAppStateStore } from '@/store/appState'

defineOptions({
  name: 'SettingsPage',
})

definePage({
  style: {
    navigationBarTitleText: '设置',
  },
})

const userStore = useUserStore()
const appState = useAppStateStore()

const settingsList = ['账号与安全', '通知设置', '隐私设置', '关于我们', '清除缓存']

const handleAction = (item: string) => {
  if (item === '关于我们') {
    uni.navigateTo({
      url: '/pages/about/about',
    })
  } else if (item === '清除缓存') {
    uni.showModal({
      title: '确认清除',
      content: '清除缓存将删除本地所有聊天历史、已存作品和登录状态，确认要清除吗？',
      confirmColor: '#ff4d4f',
      success: (res) => {
        if (res.confirm) {
          // 1. 物理擦除手机本地所有 Storage 缓存
          uni.clearStorageSync()
          
          uni.showToast({
            title: '缓存已全部清空',
            icon: 'success',
          })
          
          // 2. 1秒后重新挂载大首页，使所有全局 Pinia store 恢复初始出厂设置
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index',
            })
          }, 1000)
        }
      },
    })
  } else {
    uni.showToast({
      title: `点击了 ${item}`,
      icon: 'none',
    })
  }
}
</script>

<template>
  <view class="min-h-screen bg-[#f5f7f9] px-4 py-4">
    <view class="flex flex-col rounded-2xl bg-white p-2 shadow-sm">
      <view
        v-for="(item, index) in settingsList"
        :key="index"
        class="flex items-center justify-between p-4 font-semibold text-[15px] border-b border-b-solid border-b-[#f0f2f5] last:border-b-none active:bg-gray-50 cursor-pointer"
        @click="handleAction(item)"
      >
        <span class="text-[#1a1a1a]">{{ item }}</span>
        <span class="text-xs text-[#8c9199]">›</span>
      </view>
    </view>
  </view>
</template>

<style scoped></style>
