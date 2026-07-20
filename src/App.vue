<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { getCurrentInstance, onMounted, onUnmounted } from 'vue'
import { navigateToInterceptor } from '@/router/interceptor'
import { tabbarStore } from '@/tabbar/store'
import { permission } from '@/router/permission'
import { useTokenStore } from '@/store/token'

const { proxy } = (getCurrentInstance() || {}) as any
const router = proxy?.$router

router && permission.install(router)

onLaunch(async (options) => {
  console.log('App.vue onLaunch', options)
  
  // #ifdef MP-WEIXIN
  const tokenStore = useTokenStore()
  if (!tokenStore.hasLogin) {
    console.log('--- 检测到微信小程序未登录，执行默认授权静默登录 ---')
    try {
      await tokenStore.wxLogin()
      console.log('--- 微信小程序静默授权登录成功 ---')
    }
    catch (error) {
      console.error('微信小程序默认授权登录失败', error)
    }
  }
  // #endif
})
onShow((options) => {
  console.log('App.vue onShow', options)
  // 处理直接进入页面路由的情况：如h5直接输入路由、微信小程序分享后进入等
  // https://github.com/unibest-tech/unibest/issues/192
  if (options?.path) {
    navigateToInterceptor.invoke({ url: `/${options.path}`, query: options.query })
  }
  else {
    navigateToInterceptor.invoke({ url: '/' })
  }
})
onHide(() => {
  console.log('App Hide')
})

// #ifdef H5
function syncTabbarWhenPageVisible() {
  if (document.visibilityState === 'visible') {
    tabbarStore.syncCurIdxByCurrentPageAsync()
  }
}

onMounted(() => {
  document.addEventListener('visibilitychange', syncTabbarWhenPageVisible)
  window.addEventListener('pageshow', syncTabbarWhenPageVisible)
})

onUnmounted(() => {
  document.removeEventListener('visibilitychange', syncTabbarWhenPageVisible)
  window.removeEventListener('pageshow', syncTabbarWhenPageVisible)
})
// #endif
</script>

<style lang="scss">

</style>
