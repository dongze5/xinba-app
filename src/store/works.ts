import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WorkItem {
  id: string
  title: string
  color: string
  prompt: string
  ratio?: string
  url?: string
}

export const useWorksStore = defineStore(
  'works',
  () => {
    // 作品 ID 列表
    const myWorks = ref<string[]>([])
    const collected = ref<string[]>([])
    const downloads = ref<string[]>([])

    // 作品数据库（用于大图展示和以此生成）
    const workMap = ref<Record<string, WorkItem>>({
      p1: { id: 'p1', title: '插画', color: '#22D386', prompt: '梦幻森林插画，治愈绿色调', ratio: '3:4' },
      p2: { id: 'p2', title: '海报', color: '#FF9F43', prompt: '夏日沙滩复古海报，暖橙阳光', ratio: '16:9' },
      p3: { id: 'p3', title: '头像', color: '#2F86FF', prompt: '极简线条情侣头像，清爽蓝色', ratio: '1:1' },
      p4: { id: 'p4', title: '壁纸', color: '#41E09A', prompt: '治愈系星空宇航员壁纸，夜空绿', ratio: '9:16' },
    })

    // 切换收藏
    const toggleCollect = (id: string) => {
      const idx = collected.value.indexOf(id)
      if (idx > -1) {
        collected.value.splice(idx, 1)
      }
      else {
        collected.value.push(id)
      }
    }

    // 保存/下载作品
    const downloadWork = (id: string) => {
      if (!downloads.value.includes(id)) {
        downloads.value.push(id)
      }
    }

    // 删除我生成的作品
    const deleteWork = (id: string) => {
      const idx = myWorks.value.indexOf(id)
      if (idx > -1) {
        myWorks.value.splice(idx, 1)
      }
      // 同时也从下载和收藏中清除
      const cIdx = collected.value.indexOf(id)
      if (cIdx > -1)
        collected.value.splice(cIdx, 1)
      const dIdx = downloads.value.indexOf(id)
      if (dIdx > -1)
        downloads.value.splice(dIdx, 1)
    }

    // 注册生成的新作品
    const addGeneratedWork = (id: string, title: string, color: string, prompt: string, ratio?: string, url?: string) => {
      workMap.value[id] = { id, title, color, prompt, ratio, url }
      myWorks.value.push(id)
    }

    return {
      myWorks,
      collected,
      downloads,
      workMap,
      toggleCollect,
      downloadWork,
      deleteWork,
      addGeneratedWork,
    }
  },
  {
    persist: true,
  },
)
