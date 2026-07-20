export default () => {
  const updateManager = wx.getUpdateManager()

  updateManager.onCheckForUpdate((res) => {
    console.log('版本信息', res)
  })

  updateManager.onUpdateReady(() => {
    wx.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          updateManager.applyUpdate()
        }
      },
    })
  })

  updateManager.onUpdateFailed(() => {
    wx.showToast({
      title: '新版本下载失败，请检查网络后重启小程序',
      icon: 'none',
      duration: 3000,
    })
  })
}
