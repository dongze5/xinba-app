<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'
import { useWorksStore } from '@/store/works'
import { bindPhone, updateProfile } from '@/api/login'
import { uploadFileUrl } from '@/utils/uploadFile'

defineOptions({
  name: 'ProfilePage',
})

definePage({
  style: {
    navigationBarTitleText: '个人资料编辑',
  },
})

const worksStore = useWorksStore()
const { myWorks } = storeToRefs(worksStore)

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 表单响应式数据
const nickname = ref(userInfo.value.nickname || '')
const avatarUrl = ref(userInfo.value.avatar || '/static/images/avatar.png')
/** 标记头像是否为新选择的临时文件（需要上传） */
const avatarChanged = ref(false)
/** 保存中状态 */
const saving = ref(false)

// 微信头像授权回调
const onChooseAvatar = (e: any) => {
  if (e.detail?.avatarUrl) {
    avatarUrl.value = e.detail.avatarUrl
    avatarChanged.value = true
  }
}

// 微信昵称输入与失去焦点回调
const onNicknameBlur = (e: any) => {
  if (e.detail?.value) {
    nickname.value = e.detail.value
  }
}

const onNicknameInput = (e: any) => {
  if (e.detail?.value) {
    nickname.value = e.detail.value
  }
}

// 微信手机号授权一键绑定回调
const bindingPhone = ref(false)
const onGetPhoneNumber = async (e: any) => {
  console.log('[bindPhone] getPhoneNumber 回调完整数据:', JSON.stringify(e.detail))
  const { code, errMsg } = e.detail || {}
  if (code) {
    if (bindingPhone.value) return
    bindingPhone.value = true
    try {
      await bindPhone(code)
      // 绑定成功后刷新用户信息（后端已写入手机号）
      await userStore.fetchUserInfo()
      uni.showToast({ title: '绑定手机成功！', icon: 'success' })
    }
    catch (err: any) {
      uni.showToast({ title: err?.message || '绑定失败，请重试', icon: 'none' })
    }
    finally {
      bindingPhone.value = false
    }
  }
  else if (errMsg?.includes('deny') || errMsg?.includes('cancel')) {
    uni.showToast({ title: '已取消绑定', icon: 'none' })
  }
  else {
    // 个人主体小程序无 getPhoneNumber 权限，需企业认证
    uni.showToast({ title: '暂不支持，需企业认证后开放', icon: 'none' })
  }
}

/**
 * 上传头像临时文件到服务器
 * @returns 服务器返回的永久头像 URL
 */
function uploadAvatar(tempFilePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: uploadFileUrl.USER_AVATAR,
      filePath: tempFilePath,
      name: 'avatarfile',
      header: {
        // #ifndef H5
        'Content-Type': 'multipart/form-data',
        // #endif
      },
      success: (res) => {
        try {
          const parsed = JSON.parse(res.data)
          if (parsed.code === 200 && parsed.data?.imgUrl) {
            resolve(parsed.data.imgUrl)
          }
          else {
            reject(new Error(parsed.msg || '头像上传失败'))
          }
        }
        catch {
          reject(new Error('解析上传响应失败'))
        }
      },
      fail: err => reject(new Error(err.errMsg || '网络请求失败')),
    })
  })
}

// 保存个人资料
const handleSave = async () => {
  const nameVal = nickname.value.trim()
  if (!nameVal) {
    uni.showToast({ title: '昵称不能为空', icon: 'none' })
    return
  }
  if (saving.value) return
  saving.value = true

  try {
    let finalAvatar = avatarUrl.value

    // 1. 若头像有变更，先上传临时文件到服务器获取永久 URL
    if (avatarChanged.value) {
      uni.showLoading({ title: '头像上传中...', mask: true })
      finalAvatar = await uploadAvatar(avatarUrl.value)
      uni.hideLoading()
    }

    // 2. 调用后端接口更新昵称等资料
    await updateProfile({ nickName: nameVal })

    // 3. 同步更新本地 store
    userStore.updateProfile(nameVal, finalAvatar)

    uni.showToast({ title: '资料更新成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1000)
  }
  catch (err: any) {
    uni.hideLoading()
    uni.showToast({ title: err?.message || '保存失败，请重试', icon: 'none' })
  }
  finally {
    saving.value = false
  }
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
      <view class="flex items-center justify-between py-3 border-b border-b-solid border-b-[#f0f2f5]">
        <text class="text-[15px] font-bold text-[#1a1a1a]">手机号码</text>
        <text
          v-if="userInfo.username && userInfo.username.startsWith('1') && userInfo.username.length === 11"
          class="text-[15px] text-[#8c9199] font-semibold text-right"
        >
          {{ userInfo.username.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') }}
        </text>
        <button
          v-else
          open-type="getPhoneNumber"
          class="phone-bind-btn m-0 p-0 bg-transparent text-[15px] text-[#22D386] font-bold text-right outline-none border-none flex items-center justify-end"
          @getphonenumber="onGetPhoneNumber"
        >
          点击绑定微信手机
        </button>
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
        class="w-full h-12 rounded-2xl text-white text-[15px] font-bold shadow-sm flex items-center justify-center active:opacity-90"
        :class="saving ? 'bg-[#22D386]/60' : 'bg-[#22D386]'"
        :disabled="saving"
        @click="handleSave"
      >
        {{ saving ? '保存中...' : '保存个人资料' }}
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
.phone-bind-btn {
  background-color: transparent !important;
  line-height: normal !important;
  border: none !important;
  outline: none !important;
  padding: 0 !important;
}
.phone-bind-btn::after {
  border: none !important;
}
</style>
