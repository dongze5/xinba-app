import type { IUserInfoRes } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUserInfo,
} from '@/api/login'

// 初始化状态
const userInfoState: IUserInfoRes = {
  userId: -1,
  username: '',
  nickname: '',
  avatar: '/static/images/avatar.png',
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoRes>({ ...userInfoState })
    // 设置用户信息
    const setUserInfo = (val: IUserInfoRes) => {
      console.log('设置用户信息', val)
      // 若头像为空 则使用默认头像
      if (!val.avatar) {
        val.avatar = userInfoState.avatar
      }
      userInfo.value = val
    }
    const setUserAvatar = (avatar: string) => {
      userInfo.value.avatar = avatar
      console.log('设置用户头像', avatar)
      console.log('userInfo', userInfo.value)
    }
    // 微信手机号一键快捷登录
    const loginByPhone = (phone: string) => {
      userInfo.value.userId = 1
      userInfo.value.username = phone
      userInfo.value.nickname = `手机用户_${phone.slice(-4)}`
      userInfo.value.avatar = '/static/images/avatar.png'
      console.log('手机一键快捷登录成功', userInfo.value)
    }
    // 微信更新头像和昵称
    const updateProfile = (nickname: string, avatar: string) => {
      userInfo.value.nickname = nickname
      userInfo.value.avatar = avatar
      console.log('同步更新微信资料成功', nickname, avatar)
    }
    // 删除用户信息
    const clearUserInfo = () => {
      userInfo.value = { ...userInfoState }
      uni.removeStorageSync('user')
    }

    /**
     * 获取用户信息
     */
    const fetchUserInfo = async () => {
      const res = await getUserInfo()
      setUserInfo(res)
      return res
    }

    return {
      userInfo,
      clearUserInfo,
      fetchUserInfo,
      setUserInfo,
      setUserAvatar,
      loginByPhone,
      updateProfile,
    }
  },
  {
    persist: true,
  },
)
