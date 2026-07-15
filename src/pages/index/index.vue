<script lang="ts" setup>
import { computed } from 'vue'
import { tabbarStore } from '@/tabbar/store'
import { onLoad } from '@dcloudio/uni-app'
import HomeContent from './components/HomeContent.vue'
import ChatList from '../chat/index.vue'
import GenPage from '../gen/index.vue'
import MePage from '../me/me.vue'
import Tabbar from '@/tabbar/index.vue'
import { useSwipeTab } from '@/composables/useSwipeTab'
import RechargePopup from '@/components/RechargePopup.vue'

defineOptions({
  name: 'IndexMain',
})

// 声明页面配置为自定义导航栏
definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
  },
})

// 拦截路由携带的 tab 切换参数 (如从其它二级页面 reLaunch 回来时)
onLoad((options: any) => {
  if (options && options.tab !== undefined) {
    const tabIdx = parseInt(options.tab, 10)
    if (!isNaN(tabIdx) && tabIdx >= 0 && tabIdx < 4) {
      tabbarStore.setCurIdx(tabIdx)
    }
  }
})

const curIdx = computed(() => tabbarStore.curIdx)
const { onTouchStart, onTouchEnd } = useSwipeTab(() => tabbarStore.curIdx, tabbarStore)
</script>

<template>
  <view
    class="h-screen w-full flex flex-col overflow-hidden bg-[#f5f7f9] relative"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- 主滚动视图区域 -->
    <scroll-view class="flex-1 min-h-0 w-full" scroll-y :show-scrollbar="false">
      <!-- 采用 v-show 切换四大页面组件，完全避免页面销毁重挂载, 实现 0 延迟、零闪烁 -->
      <HomeContent v-show="curIdx === 0" />
      <ChatList v-show="curIdx === 1" />
      <GenPage v-show="curIdx === 2" />
      <MePage v-show="curIdx === 3" />
      <!-- 统一的底部胶囊导航避空占位区 -->
      <view class="h-28 w-full flex-shrink-0" />
    </scroll-view>

    <!-- 悬浮胶囊 Tabbar 永久常驻底部，体验丝般顺滑 -->
    <Tabbar />

    <!-- 全局统一的充值弹窗，100% 遮罩且悬浮在真机最上层 -->
    <RechargePopup />
  </view>
</template>

<style scoped>
/* 隐藏滚动条 */
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
