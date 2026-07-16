<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStateStore } from '@/store/appState'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'RecordsPage',
})

definePage({
  style: {
    navigationBarTitleText: '充值记录',
  },
})

const appState = useAppStateStore()
const { ledger } = storeToRefs(appState)

// 仅展示充值明细
const rechargeList = computed(() => {
  return ledger.value.filter((item) => item.type === 'recharge').slice().reverse()
})

const goRecharge = () => {
  uni.navigateTo({
    url: '/pages/me/points',
  })
}
</script>

<template>
  <view class="min-h-screen bg-[#f5f7f9] px-4 py-4">
    <!-- 空记录 -->
    <view v-if="!rechargeList.length" class="flex flex-col items-center justify-center py-24 text-center">
      <view class="h-22 w-22 flex items-center justify-center rounded-[28px] bg-green-50 text-[#22D386] mb-5">
        <view class="i-carbon-wallet inline-block text-4xl" />
      </view>
      <view class="text-base font-bold text-[#1a1a1a] mb-1">还没有充值记录</view>
      <view class="text-xs text-[#8c9199] mb-6 max-w-[200px]">充值积分，解锁更多智能创作</view>
      <button
        class="h-9 px-6 rounded-2xl bg-[#22D386] text-white text-xs font-bold shadow-sm active:scale-95 flex items-center justify-center"
        @click="goRecharge"
      >
        去充值
      </button>
    </view>

    <!-- 充值列表 -->
    <view v-else class="flex flex-col gap-3">
      <view
        v-for="(item, index) in rechargeList"
        :key="index"
        class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
      >
        <view class="h-11 w-11 flex items-center justify-center rounded-2xl bg-[#22D386] text-white text-[16px] font-bold">
          ¥
        </view>
        <view class="flex-1 min-w-0">
          <view class="text-sm font-bold text-[#1a1a1a]">充值 {{ item.amt }} 积分</view>
          <view class="mt-1 text-xs text-[#8c9199]">{{ item.time }}</view>
        </view>
        <view class="text-sm font-extrabold text-[#22D386]">+{{ item.amt }}</view>
      </view>
    </view>
  </view>
</template>

<style scoped>
</style>
