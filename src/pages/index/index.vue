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

import { useUserStore } from '@/store/user'

const userStore = useUserStore()

// 拦截路由携带的 tab 切换参数 (如从其它二级页面 reLaunch 回来时)，并在初始化时静默登录
onLoad((options: Record<string, string | undefined>) => {
  // 1. 无感静默登录：若检测为新用户，直接自动生成游客临时账号，无感开启服务
  if (userStore.userInfo.userId === -1) {
    userStore.loginSilently()
  }

  // 2. 路由携带的 Tab 指针解析
  if (options && options.tab !== undefined) {
    const tabIdx = parseInt(options.tab, 10)
    if (!isNaN(tabIdx) && tabIdx >= 0 && tabIdx < 4) {
      tabbarStore.setCurIdx(tabIdx)
    }
  }
})

import { ref, watch, nextTick } from 'vue'

const curIdx = computed(() => tabbarStore.curIdx)
const { onTouchStart, onTouchEnd } = useSwipeTab(() => tabbarStore.curIdx, tabbarStore)
</script>

<template>
  <view
    class="h-screen w-full flex flex-col overflow-hidden bg-[#f5f7f9] relative"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <!-- 4个平行的局部滚动视图 (完全物理隔离滚动位置，绝对防止切换Tab时高度计算崩塌或重置归零) -->
    <scroll-view
      v-show="curIdx === 0"
      class="flex-1 min-h-0 w-full"
      scroll-y
      :show-scrollbar="false"
    >
      <HomeContent />
      <view class="h-28 w-full flex-shrink-0" />
    </scroll-view>

    <scroll-view
      v-show="curIdx === 1"
      class="flex-1 min-h-0 w-full"
      scroll-y
      :show-scrollbar="false"
    >
      <ChatList />
      <view class="h-28 w-full flex-shrink-0" />
    </scroll-view>

    <scroll-view
      v-show="curIdx === 2"
      class="flex-1 min-h-0 w-full"
      scroll-y
      :show-scrollbar="false"
    >
      <GenPage />
      <view class="h-28 w-full flex-shrink-0" />
    </scroll-view>

    <scroll-view
      v-show="curIdx === 3"
      class="flex-1 min-h-0 w-full"
      scroll-y
      :show-scrollbar="false"
    >
      <MePage />
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
