<script lang="ts" setup>
import { ref } from 'vue'
import { useAppStateStore } from '@/store/appState'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'MePage',
})

definePage({
  style: {
    navigationStyle: 'custom',
  },
})

const appState = useAppStateStore()
const { points, myWorks, collected, downloads } = storeToRefs(appState)



// 格式化积分
const fmt = (num: number) => num.toLocaleString('en-US')

import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 页面跳转
const goPage = (url: string) => {
  uni.navigateTo({ url })
}

// 个人资料卡片点击拦截
const handleCardClick = () => {
  if (userInfo.value.userId !== -1) {
    goPage('/pages/me/profile')
  } else {
    uni.showToast({
      title: '请点击下方微信登录按钮授权',
      icon: 'none',
    })
  }
}

// 微信手机号授权快捷登录回调
const onGetPhoneNumber = (e: any) => {
  console.log('微信手机号授权回调', e)
  if (e.detail && e.detail.code) {
    const code = e.detail.code
    console.log('--- 微信手机号授权成功 ---')
    console.log('微信手机号解密凭证 code 为: ', code)

    // 模拟快捷登录
    const virtualPhone = `1380000${code.slice(-4)}`
    userStore.loginByPhone(virtualPhone)

    uni.showToast({
      title: '登录成功！',
      icon: 'success',
    })
  } else {
    console.warn('用户拒绝手机号授权', e.detail?.errMsg)
    uni.showToast({
      title: '已取消授权',
      icon: 'none',
    })
  }
}
</script>

<template>
  <view class="px-4 pt-12">
    <!-- 页头 -->
    <view class="pb-2 pt-2">
      <view class="text-2xl font-extrabold text-[#1a1a1a]">我的</view>
    </view>

    <!-- 个人信息卡片 (点击去编辑资料) -->
    <!-- 未登录状态：整张卡片配置为微信手机号授权大按钮，维持原有的精致风格 -->
    <button
      v-if="userInfo.userId === -1"
      open-type="getPhoneNumber"
      class="login-card-btn mt-3 flex items-center gap-3 rounded-2xl bg-white p-5 shadow-sm active:bg-gray-50 border-none text-left"
      @getphonenumber="onGetPhoneNumber"
    >
      <image
        src="/static/images/df_avatar.png"
        class="h-18 w-18 mt-1 rounded-full bg-white"
      />
      <view class="flex-1">
        <view class="text-xl font-extrabold text-[#1a1a1a]">点击登录</view>
        <view class="mt-1 text-xs text-[#8c9199]">授权微信手机号，开启 AI 创意之旅</view>
      </view>
    </button>

    <!-- 已登录状态：正常可点击跳转资料编辑页 -->
    <view
      v-else
      class="mt-3 flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm active:bg-gray-50 cursor-pointer"
      @click="goPage('/pages/me/profile')"
    >
      <image
        :src="userInfo.avatar"
        class="h-16 w-16 rounded-full bg-white border border-solid border-[#f0f2f5]"
      />
      <view class="flex-1 min-w-0">
        <view class="text-xl font-extrabold text-[#1a1a1a] truncate">
          {{ userInfo.nickname }}
        </view>
        <view class="mt-1 text-xs text-[#8c9199] truncate">
          已创作 {{ myWorks.length }} 次
        </view>
      </view>
    </view>

    <!-- 积分钱包卡 (高对比扁平纯色背景, 无渐变) -->
    <view class="mt-3 flex items-center justify-between rounded-2xl bg-[#22D386] p-5 text-white shadow-sm">
      <view>
        <view class="text-xs opacity-90">我的积分</view>
        <view class="mt-2.5 text-3xl font-extrabold flex items-baseline">
          {{ fmt(points) }}
          <span class="text-xs font-semibold ml-1.5 opacity-90">积分</span>
        </view>
      </view>
      <button
        class="h-9 rounded-2xl bg-white px-4 text-sm font-bold text-[#22D386] border-none active:bg-gray-100 flex items-center justify-center m-0"
        @click="appState.openRecharge()"
      >
        充值
      </button>
    </view>

    <!-- 三栏数据统计卡 -->
    <view class="mt-3 flex items-center rounded-2xl bg-white py-3.5 shadow-sm">
      <view
        class="flex flex-1 flex-col items-center justify-center border-r border-r-solid border-r-[#f0f2f5] cursor-pointer"
        @click="goPage('/pages/me/works?type=myworks')"
      >
        <span class="text-xl font-extrabold text-[#1a1a1a]">{{ myWorks.length }}</span>
        <span class="mt-0.5 text-xs text-[#8c9199]">作品</span>
      </view>
      <view
        class="flex flex-1 flex-col items-center justify-center border-r border-r-solid border-r-[#f0f2f5] cursor-pointer"
        @click="goPage('/pages/me/works?type=collected')"
      >
        <span class="text-xl font-extrabold text-[#1a1a1a]">{{ collected.length }}</span>
        <span class="mt-0.5 text-xs text-[#8c9199]">收藏</span>
      </view>
      <view
        class="flex flex-1 flex-col items-center justify-center cursor-pointer"
        @click="goPage('/pages/me/works?type=downloads')"
      >
        <span class="text-xl font-extrabold text-[#1a1a1a]">{{ downloads.length }}</span>
        <span class="mt-0.5 text-xs text-[#8c9199]">已下载</span>
      </view>
    </view>

    <!-- 菜单单元格列表 -->
    <view class="mt-4 flex flex-col rounded-2xl bg-white p-0 overflow-hidden shadow-sm">
      <view
        class="flex items-center gap-3 border-b border-b-solid border-b-[#f0f2f5] py-4.5 px-4 font-semibold text-[15px] active:bg-gray-50"
        @click="goPage('/pages/me/points')"
      >
        <view class="i-carbon-wallet text-lg text-[#22D386]" />
        <span class="text-[#1a1a1a]">我的积分</span>
        <span class="ml-auto text-xs text-[#8c9199] flex items-center">
          {{ fmt(points) }} &nbsp;›
        </span>
      </view>

      <view
        class="flex items-center gap-3 border-b border-b-solid border-b-[#f0f2f5] py-4.5 px-4 font-semibold text-[15px] active:bg-gray-50"
        @click="goPage('/pages/me/records')"
      >
        <view class="i-carbon-list-boxes text-lg text-[#22D386]" />
        <span class="text-[#1a1a1a]">充值记录</span>
        <span class="ml-auto text-xs text-[#8c9199]">›</span>
      </view>

      <view
        class="flex items-center gap-3 border-b border-b-solid border-b-[#f0f2f5] py-4.5 px-4 font-semibold text-[15px] active:bg-gray-50"
        @click="goPage('/pages/me/works?type=fav')"
      >
        <view class="i-carbon-star text-lg text-[#22D386]" />
        <span class="text-[#1a1a1a]">灵感收藏</span>
        <span class="ml-auto text-xs text-[#8c9199]">›</span>
      </view>

      <view
        class="flex items-center gap-3 py-4.5 px-4 font-semibold text-[15px] active:bg-gray-50"
        @click="goPage('/pages/me/settings')"
      >
        <view class="i-carbon-settings text-lg text-[#22D386]" />
        <span class="text-[#1a1a1a]">设置</span>
        <span class="ml-auto text-xs text-[#8c9199]">›</span>
      </view>
    </view>

  </view>
</template>

<style scoped>
/* 彻底清除微信手机号授权大卡片按钮的默认怪异样式 */
.login-card-btn {
  background-color: #ffffff !important;
  line-height: normal !important;
  padding: 20px !important; /* 对应 p-5 */
  border: none !important;
  outline: none !important;
  display: flex !important;
  align-items: center !important;
  text-align: left !important;
}
.login-card-btn::after {
  border: none !important;
}
</style>
