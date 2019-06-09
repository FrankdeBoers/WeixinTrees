//app.js
// 首页JS，刚进去的页面
// 可以在app.json中配置首个wxml页面
App({
  onLaunch: function() {

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'dev-tksev',
        traceUser: true,
      })
    }

    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log('是否授权', res.authSetting['scope.userInfo'] !== undefined);
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
        if (res.authSetting['scope.userInfo']) {
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
              url: '/pages/main/tree',
            }), 
            this.getSysInfo()

        } else {
          // 没有授权，进入授权界面
          wx.navigateTo({
            url: '/pages/auth/auth',
          })
        }
      }
    })
  },

  //获取系统参数
  getSysInfo: function() {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log("brand:" + res.brand, "; model:" + res.model, "; language:" + res.language, "; pixelRatio:" + res.pixelRatio, "; screenHeight:" + res.screenHeight, "; screenWidth:" + res.screenWidth, "; SDKVersion:" + res.SDKVersion, "; system:" + res.system);
        that.globalData.version = res.SDKVersion;
        that.globalData.screenHeight = res.screenHeight;
        that.globalData.screenWidth = res.screenWidth;
      },
      fail: function() {

      }
    })
  },

  globalData: {
    avatarUrl: './user-unlogin.png',
    userInfo: null,
    screenHeight: '',
    screenWidth: ''

  }
})