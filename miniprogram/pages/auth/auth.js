//home.js
Page({
  data: {
    openid: '',
  },
  onLoad: function() {
    // this.getOpenid();
    this.applyUpdate();
  },
  // 获取用户openid
  // getOpenid() {
  //   let that = this;
  //   wx.cloud.callFunction({
  //     name: 'getOpenid',
  //     complete: res => {
  //       console.log('云函数获取到的openid: ', res.result)
  //       var openid = res.result.openId;
  //       that.setData({
  //         openid: openid
  //       })
  //     }
  //   })
  // },
  onGotUserInfo(e) {
    console.log(e.detail.errMsg)
    console.log(e.detail.userInfo)
    console.log(e.detail.rawData)
    this.judgeAuth()
  },

  judgeAuth() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log('是否授权', res.authSetting['scope.userInfo'] !== undefined);
        if (res.authSetting['scope.userInfo']) {

          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
              success: res => {
                // 可以将 res 发送给后台解码出 unionId
                this.globalData.userInfo = res.userInfo

                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                // 所以此处加入 callback 以防止这种情况
                if (this.userInfoReadyCallback) {
                  this.userInfoReadyCallback(res)
                }
              }
            }),

            // 进入种树主程序
            wx.redirectTo({
              url: '../main/tree',
            })


        } else {
          // 没有授权，进入授权界面
          wx.redirectTo({
            url: 'auth',
          })
        }
      }
    })
  },

  //检查是否需要升级
  applyUpdate: function() {
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      console.log("ghc onCheckForUpdate >>>", res.hasUpdate)
    })
    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: 'Update',
        content: 'New Version is ready, restart the application？',
        success: function(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()            
          }
        }
      })
    })
    updateManager.onUpdateFailed(function() {
      // 新的版本下载失败
      wx.showModal({
        title: 'Update',
        content: 'update fail，please restart the application',
        // showCancel:false,
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    })
  }
})