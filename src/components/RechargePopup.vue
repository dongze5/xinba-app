<script lang="ts" setup>
import { ref } from 'vue'
import { useWalletStore } from '@/store/wallet'

const walletStore = useWalletStore()

const rechargeAmounts = [
  { p: 100, money: 6 },
  { p: 300, money: 18 },
  { p: 500, money: 28 },
  { p: 1000, money: 52 },
]
const rechargeSelected = ref(100)

const selectRecharge = (val: number) => {
  rechargeSelected.value = val
}

const handlePay = () => {
  walletStore.recharge(rechargeSelected.value)
  walletStore.closeRecharge()
  uni.showToast({
    title: `已成功充值 ${rechargeSelected.value} 积分`,
    icon: 'success',
  })
}
</script>

<template>
  <view
    v-if="walletStore.showRecharge"
    class="fixed inset-0 z-[9999] bg-black/45 flex flex-col justify-end"
    @click="walletStore.closeRecharge"
  >
    <view class="bg-white rounded-t-[22px] p-6 pb-8" style="padding-bottom: calc(24px + env(safe-area-inset-bottom));" @click.stop>
      <view class="relative text-center mb-5">
        <span class="text-lg font-extrabold">积分充值</span>
        <view
          class="absolute right-0 top-0.5 text-2xl leading-none text-[#aaa]"
          @click="walletStore.closeRecharge"
        >
          ×
        </view>
      </view>
      <view class="grid grid-cols-2 gap-3">
        <view
          v-for="item in rechargeAmounts"
          :key="item.p"
          class="border border-solid rounded-2xl text-center py-4 active:scale-98"
          :class="rechargeSelected === item.p ? 'border-[#22D386] bg-green-50' : 'border-[#f0f2f5] bg-white'"
          @click="selectRecharge(item.p)"
        >
          <view class="text-xl font-extrabold" :class="rechargeSelected === item.p ? 'text-[#22D386]' : 'text-[#1a1a1a]'">{{ item.p }}</view>
          <view class="text-xs mt-0.5" :class="rechargeSelected === item.p ? 'text-[#22D386]' : 'text-[#8c9199]'">¥{{ item.money }}</view>
        </view>
      </view>
      <button
        class="w-full h-12 mt-6 rounded-2xl bg-[#22D386] text-white text-base font-bold shadow-md active:opacity-90 flex items-center justify-center border-none"
        @click="handlePay"
      >
        确认支付
      </button>
    </view>
  </view>
</template>

<style scoped>
</style>
