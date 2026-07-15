<script setup lang="ts">
import { computed } from 'vue'
// i-carbon-code
import { customTabbarEnable, needHideNativeTabbar, tabbarCacheEnable } from './config'
import { tabbarList, tabbarStore } from './store'
import TabbarItem from './TabbarItem.vue'


// #ifdef MP-WEIXIN
// 将自定义节点设置成虚拟的（去掉自定义组件包裹层），更加接近Vue组件的表现，能更好的使用flex属性
defineOptions({
  virtualHost: true,
})
// #endif

const curIdx = computed(() => tabbarStore.curIdx)

/**
 * 中间的鼓包tabbarItem的点击事件
 */
function handleClickBulge() {
  uni.showToast({
    title: '点击了中间的鼓包tabbarItem',
    icon: 'none',
  })
}

function handleClick(index: number) {
  const list = tabbarList.value
  if (!list[index]) {
    return
  }
  if (list[index].isBulge) {
    handleClickBulge()
    return
  }
  tabbarStore.setCurIdx(index)
}
// #ifndef MP-WEIXIN || MP-ALIPAY
// 因为有了 custom:true， 微信里面不需要多余的hide操作
onLoad(() => {
  // 解决原生 tabBar 未隐藏导致有2个 tabBar 的问题
  needHideNativeTabbar
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
    success(res) {
      // console.log('hideTabBar success: ', res)
    },
  })
})
// #endif

// #ifdef MP-ALIPAY
onMounted(() => {
  // 解决支付宝自定义tabbar 未隐藏导致有2个 tabBar 的问题; 注意支付宝很特别，需要在 onMounted 钩子调用
  customTabbarEnable // 另外，支付宝里面，只要是 customTabbar 都需要隐藏
  && uni.hideTabBar({
    fail(err) {
      console.log('hideTabBar fail: ', err)
    },
    success(res) {
      // console.log('hideTabBar success: ', res)
    },
  })
})
// #endif
const activeColor = '#ffffff'
const inactiveColor = '#aab0b8'
function getColorByIndex(index: number) {
  return curIdx.value === index ? activeColor : inactiveColor
}
</script>

<template>
  <view v-if="customTabbarEnable" class="fixed-tabbar-container" @touchmove.stop.prevent>
    <view class="tabbar-float">
      <!-- 水滴/水流滑动指示器 (背景层，在底座内层滑动) -->
      <view
        class="active-indicator"
        :style="{
          transform: `translateX(${curIdx * 100}%)`
        }"
      />

      <view
        v-for="(item, index) in tabbarList" :key="index"
        class="tab-item"
        :style="{
          color: getColorByIndex(index)
        }"
        @click="handleClick(index)"
      >
        <TabbarItem :item="item" :index="index" class="relative text-center z-10" />
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.fixed-tabbar-container {
  position: fixed;
  bottom: 28px;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
}

.tabbar-float {
  width: 90%;
  height: 62px;
  background: #ffffff;
  border-radius: 30px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  padding: 4px 6px;
  box-sizing: border-box;
  position: relative; /* 为滑动指示器提供定位基准 */
}

.active-indicator {
  position: absolute;
  left: 6px; /* 对应父级 padding-left */
  top: 4px; /* 对应父级 padding-top */
  width: calc((100% - 12px) / 4); /* 精等分 4 列 */
  height: calc(100% - 8px); /* 高度扣除 padding */
  background: #22D386;
  border-radius: 24px;
  box-shadow: 0 6px 14px rgba(34, 211, 134, 0.4);
  z-index: 1;
  /* 带有粘滞感和稍微回弹特性的水滴贝塞尔过渡曲线，效果极度惊艳 */
  transition: transform 0.38s cubic-bezier(0.25, 1, 0.33, 1);
  will-change: transform;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-radius: 24px;
  /* 配合滑块的滑动，文字颜色进行平滑过渡 */
  transition: color 0.3s ease-in-out;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
  z-index: 10; /* 确保层级在绿色滑块上方，文字清晰显示 */
}
</style>
