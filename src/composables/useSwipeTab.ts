/**
 * 左右滑动切换 Tab 的 composable
 * 仅用于单页 v-show 切换架构（index.vue 中所有 tab 内容共存一个页面）
 *
 * @param getCurIdx  返回当前 tab 索引的 getter 函数
 * @param store      tabbarStore，需要有 setCurIdx 方法和 tabbarList 长度
 */
export function useSwipeTab(
  getCurIdx: () => number,
  store: { setCurIdx: (idx: number) => void },
  total = 4,
) {
  // 最小横向触发距离（px）
  const MIN_X = 60
  // 最大纵向容忍距离（px），超过则认为是上下滚动
  const MAX_Y = 40

  let startX = 0
  let startY = 0

  const onTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
  }

  const onTouchEnd = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const deltaX = endX - startX
    const deltaY = Math.abs(endY - startY)

    // 纵向偏移过大 → 是上下滚动，忽略
    if (deltaY > MAX_Y) return
    // 横向距离不够 → 忽略
    if (Math.abs(deltaX) < MIN_X) return

    const cur = getCurIdx()
    let next = cur

    if (deltaX < 0) {
      // 手指往左划 -> 切换到上一个 tab
      next = Math.max(cur - 1, 0)
    }
    else {
      // 手指往右划 -> 切换到下一个 tab
      next = Math.min(cur + 1, total - 1)
    }

    if (next === cur) return

    // 直接切换 curIdx，v-show 内容立即切换，水滴指示器同步滑动
    store.setCurIdx(next)
  }

  return { onTouchStart, onTouchEnd }
}
