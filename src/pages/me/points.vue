<script lang="ts" setup>
import { ref } from 'vue'
import { useAppStateStore } from '@/store/appState'
import { storeToRefs } from 'pinia'
import RechargePopup from '@/components/RechargePopup.vue'

defineOptions({
  name: 'PointsPage',
})

definePage({
  style: {
    navigationBarTitleText: '我的积分',
  },
})

const appState = useAppStateStore()
const { points, ledger } = storeToRefs(appState)



// 格式化积分
const fmt = (num: number) => num.toLocaleString('en-US')
</script>

<template>
  <view class="min-h-screen bg-[#f5f7f9] px-4 py-4 pb-12">
    <!-- 积分钱包卡片 (高保真纯色扁平) -->
    <view class="rounded-2xl bg-[#22D386] p-5 text-white shadow-sm">
      <view class="flex justify-between items-center">
        <span class="text-sm opacity-90">我的积分</span>
        <button
          class="h-7 bg-white/20 text-white rounded-[16px] px-3.5 text-xs font-bold active:bg-white/30 flex items-center justify-center m-0"
          @click="appState.openRecharge()"
        >
          充值
        </button>
      </view>
      <view class="mt-3.5 text-[38px] font-extrabold flex items-baseline tracking-wide">
        {{ fmt(points) }}
        <span class="text-sm font-semibold ml-1 opacity-90">积分</span>
      </view>
      <view class="mt-2 text-xs opacity-85 leading-normal">
        生图 10 积分 / 张 · 可用于 AI 生图、智能翻译等创作
      </view>
    </view>

    <!-- 积分明细标题 -->
    <view class="text-sm font-bold text-[#8c9199] px-1 py-4">积分明细</view>

    <!-- 空明细状态 -->
    <view v-if="!ledger.length" class="flex flex-col items-center justify-center py-16 text-center">
      <view class="h-22 w-22 flex items-center justify-center rounded-[28px] bg-green-50 text-[#22D386] mb-5">
        <view class="i-carbon-flow-connection inline-block text-4xl" />
      </view>
      <view class="text-base font-bold text-[#1a1a1a] mb-1">还没有积分变动</view>
      <view class="text-xs text-[#8c9199] mb-4 max-w-[200px]">生图或充值后，记录会显示在这里</view>
      <button
        class="h-9 px-6 rounded-2xl bg-[#22D386] text-white text-xs font-bold shadow-sm active:scale-95 flex items-center justify-center"
        @click="appState.openRecharge()"
      >
        去充值
      </button>
    </view>

    <!-- 明细流水列表 -->
    <view v-else class="flex flex-col gap-3">
      <view
        v-for="(item, index) in ledger.slice().reverse()"
        :key="index"
        class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
      >
        <view
          class="h-11 w-11 flex items-center justify-center rounded-2xl text-white text-[16px] font-bold"
          :class="item.type === 'recharge' ? 'bg-[#22D386]' : 'bg-[#FF8A3D]'"
        >
          {{ item.type === 'recharge' ? '¥' : '✦' }}
        </view>
        <view class="flex-1 min-w-0">
          <view class="text-sm font-bold text-[#1a1a1a]">{{ item.title }}</view>
          <view class="mt-1 text-xs text-[#8c9199]">{{ item.time }}</view>
        </view>
        <view
          class="text-sm font-extrabold"
          :class="item.type === 'recharge' ? 'text-[#22D386]' : 'text-[#FF8A3D]'"
        >
          {{ item.amt >= 0 ? '+' : '' }}{{ item.amt }}
        </view>
      </view>
    </view>

    <!-- 引入的全局充值弹窗 -->
    <RechargePopup />
  </view>
</template>

<style scoped>
</style>
