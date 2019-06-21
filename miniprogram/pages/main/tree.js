// miniprogram/main/tree.js
// 初始化APP对象，方便后面调用
var app = getApp();
let animTreeSwing;
const initData = "当前经验值：";
const db = wx.cloud.database();
const _ = db.command;
const TAG = "Tree";
var lastAwardTime;
var serverExp;
var docid;


Page({
  /**
   * 页面的初始数据
   */
  data: {
    animWaterCan: {}, // 浇水壶的动画
    animWaterFall: {}, // 水滴下落的动画
    animTreeSwingData: {},
    showOrHidden: false, //判断显示与否的，true表示显示，反之隐藏
    text: initData,
    avatarUrl: '/images/user-unlogin.png',
    treePng: '/images/tree_1.png',
    userInfo: '',
    logged: false,
    takeSession: false,
    requestResult: '',
    localwater: 0,
    localExperence: '0g',
    usedWater: 0,
    treesCoount: 'trees: 0',
    lastanswertime: "2016/6/10 00:00:00"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    // 答完题后，需要将答题得分上传至服务器
    var scoreforquestion = options.score;
    this.awardMoreWaterForQuestion(options.score);

    console.log('tree.js', "scoreforquestion:" + scoreforquestion);
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })

              app.globalData.userInfo = res.userInfo;
              app.globalData.avatarUrl = res.userInfo.avatarUrl;

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
              console.log('用户信息11', app.globalData.userInfo.nickName);


            }
          }),
            this.queryInfo();

        }
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('用户信息', app.globalData.userInfo);
    // this.getOpenid();
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 获取用户openid
  getOpenid() {
    let that = this;
    wx.cloud.callFunction({
      name: 'getOpenid',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result)
        var openid = res.result.openId;
        that.setData({
          openid: openid
        })
      }
    })
  },

  animationstart: function (event) {
    console.log('Tree:', event);
  },

  animationend: function (event) {
    console.log('Tree:', event);
  },

  touchTree: function () {
    if (animTreeSwing == null) {
      animTreeSwing = wx.createAnimation({
        duration: 200,
        timingFunction: "linear"
      })
    }

    animTreeSwing
      .rotate(10)
      .step();

    animTreeSwing
      .rotate(-10)
      .step();

    animTreeSwing
      .rotate(0)
      .step();

    this.setData({
      animTreeSwingData: animTreeSwing.export()
    })
  },

  // 点击了浇水壶，进行浇水
  onWaterCanTouched: function () {
    if (this.data.localwater < 10) {
      wx.showModal({
        title: 'Watering Fail!',
        content: 'no enough water left',
        confirmText: "OK",
        showCancel: false,
      });
    } else {
      // 执行动画
      this.refreshList();
      // 更新服务器数据，-10
      this.reduceServerWater();
    }
  },

  onQuestionTouched: function () {
    var lastAnswerTime = this.data.lastAnswerTime;
    var nowDate = new Date().toLocaleString('chinese', {
      hour12: false
    });
    console.log(TAG, "onQuestionTouched nowTime:" + nowDate);

    var nowTime = new Date(nowDate);
    var diffHours = (nowTime - lastAnswerTime) / (1000 * 3600);
    console.log(TAG, "onQuestionTouched diffHours:" + diffHours + " 小时");

    if (diffHours >= 20) { // 可以再次领取
      this.gotoAnswer();
    } else {
      wx.showModal({
        title: 'Try tomorrow!',
        content: 'Only one chance one day',
        confirmText: "OK",
        showCancel: false,
      });
    }
  },

  // 创建水壶动画
  refreshList: function () {
    var that = this;

    let animation = wx.createAnimation({
      duration: 800,
      timingFunction: "linear"
    })
    animation
      .translate(50, -300)
      .rotate(-45)
      .step();

    animation
      .rotate(44)
      .step();

    animation
      .translate(0, 0)
      .rotate(0)
      .step();

    this.setData({
      animWaterCan: animation.export()
    })

    // 延时1S显示水滴，并执行水滴下落的动画
    var timerTem = setTimeout(function () {
      that.setData({
        showOrHidden: true
      });
      that.waterFullAnim();
    }, 1000);

    // 延时2S显示水滴，隐藏水滴
    var timerTem1 = setTimeout(function () {
      that.setData({
        showOrHidden: false
      });
    }, 2000);


    this.request();
  },


  // 创建水滴动画
  waterFullAnim: function () {
    let animWater = wx.createAnimation({
      duration: 800,
      timingFunction: "linear"
    })
    // 原地下落40px
    animWater
      .translate(0, 40)
      .rotate(0)
      .step();

    this.setData({
      animWaterFall: animWater.export()
    });

    // 2S后恢复原始位置
    var that = this;
    setTimeout(function () {
      animWater.translate(0, -40).step({
        duration: 0,
        transformOrigin: "50%,50%",
        timingFunction: 'linear'
      })
      that.setData({
        animWaterFall: animWater.export()
      })
    }, 2000)

  },

  request: function () {
    console.log('request');
  },


  onGetUserInfo: function (e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  // 首次登陆创建一条新用户纪录
  insertInfo: function (myName, myExp, myTrees, myAvatar) {
    console.log(TAG, 'insertInfo');
    var nowDate = new Date();
    var nowTime = nowDate.toLocaleString('chinese', {
      hour12: false
    });

    db.collection("trees").add({
      data: {
        name: myName,
        exp: myExp,
        usedexp: 0,
        trees: myTrees,
        avatar: myAvatar,
        lastawardtime: nowTime,
        lastanswertime: "Fri Jun 19 2019 20:11:14 GMT+0800 (CST)"
      },
      success(res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(TAG, res)
      },
      fail(res) {
        console.log(TAG, "queryInfo error:" + res);
      }
    }),



      this.updateLocalDataFromServer();
  },


  // 获取服务器数据
  queryInfo: function () {
    var that = this;
    db.collection("trees").where({})
      .get({
        success(res) {
          console.log(TAG + " queryInfo:", res.data);
          // 首次注册，服务器没有相关的数据，需要插入一条数据
          if (Object.keys(res.data).length == 0) {
            console.log(TAG, "queryInfo null");
            var name = app.globalData.userInfo.nickName;
            var ava = app.globalData.userInfo.avatarUrl;
            that.insertInfo(name, 100, 0, ava);
          } else { // 非首次登入，判断是否超过24小时，领取今日奖励      
            console.log(TAG, "lastawardtime:" + res.data[0].lastawardtime);
            docid = res.data[0]._id;
            lastAwardTime = new Date(res.data[0].lastawardtime);
            serverExp = res.data[0].exp;
            that.doAward(lastAwardTime, serverExp);

            that.setData({
              localExperence: res.data[0].exp + 'g',
              lastAnswerTime: new Date(res.data[0].lastanswertime),
              localwater: res.data[0].exp
            });
            console.log(TAG, "serverExp:" + serverExp);
          }


        },
        fail(res) {
          console.log(TAG, "queryInfo error:" + res);
        }
      })
  },

  doAward: function (mLastAwardTime, serverExp) {
    var that = this;
    console.log(TAG, "doAward start");
    var nowDate = new Date().toLocaleString('chinese', {
      hour12: false
    });
    console.log(TAG, "nowTime:" + nowDate);

    var nowTime = new Date(nowDate);
    var diffHours = (nowTime - mLastAwardTime) / (1000 * 3600);
    console.log(TAG, "距离上次领取:" + diffHours + " 小时");

    if (diffHours >= 24) { // 可以再次领取
      that.awardMoreWater(10);

    } else { // 无法再次领取

    }
  },

  // 奖励更多的水，暂时只有登录奖励
  awardMoreWater: function (water) {
    var that = this;
    console.log(TAG, "award4Login  start");
    var nowTime = new Date().toLocaleString('chinese', {
      hour12: false
    });
    db.collection('trees').doc(docid).update({
      // data 传入需要局部更新的数据
      // 因为登录而获得的奖励，登录时间也要更新
      data: {
        exp: _.inc(water),
        lastawardtime: nowTime
      },
      success(res) {
        console.log(TAG, res);
        that.updateLocalDataFromServer();
      }
    })
  },

  // 奖励更多的水，通过答题获得奖励
  awardMoreWaterForQuestion: function (waterQuestion) {
    if (waterQuestion >= 0) {
      var that = this;
      console.log(TAG, "awardMoreWaterForQuestion  start " + waterQuestion);
      var nowTime = new Date().toLocaleString('chinese', {
        hour12: false
      });
      db.collection('trees').doc(docid).update({
        // data 传入需要局部更新的数据
        // 因为登录而获得的奖励，登录时间也要更新
        data: {
          exp: _.inc(parseInt(waterQuestion)),
          lastanswertime: nowTime
        },
        success(res) {
          console.log(TAG, "awardMoreWaterForQuestion:" + res);
          that.updateLocalDataFromServer();
        }
      });
    }

  },

  // 执行浇水操作
  reduceServerWater: function () {
    var that = this;

    console.log(TAG, "reduceServerWater start");
    db.collection('trees').doc(docid).update({
      // data 传入需要局部更新的数据
      data: {
        exp: _.inc(-10),
        usedexp: _.inc(10),
      },
      success(res) {
        console.log(TAG, res);
        that.updateLocalDataFromServer()
      }
    })
  },

  updateLocalDataFromServer: function () {
    var that = this;
    db.collection("trees").where({})
      .get({
        success(res) {
          console.log(TAG + " updateLocalDataFromServer:", res.data);
          serverExp = res.data[0].exp;
          docid = res.data[0]._id;
          console.log(TAG, "serverExp:" + serverExp);
          that.setData({
            localExperence: res.data[0].exp + 'g',
            localwater: res.data[0].exp
          });
          that.judgeToGrowUp(res.data[0].usedexp);

        },
        fail(res) {
          console.log(TAG, "updateLocalDataFromServer error:" + res);
        }
      })
  },

  // 判断树苗是否需要成长
  judgeToGrowUp: function (usedWater) {
    var that = this;
    console.log(TAG, "judgeToGrowUp >>");
    var b = parseInt((usedWater % 100) / 10);
    var h = parseInt(usedWater / 100);
    console.log(TAG, "judgeToGrowUp b:" + b + " h:" + h);
    if (b <= 3) {
      that.setData({
        treePng: "/images/tree_1.png"
      });
    } else if (b > 3 && b <= 6) {
      that.setData({
        treePng: "/images/tree_2.png"
      });
    } else if (b > 6) {
      that.setData({
        treePng: "/images/tree_3.png"
      });
    }

    that.setData({
      treesCoount: 'trees:' + h
    });
  },


  gotoAnswer: function () {
    wx.navigateTo({
      url: '../question/question?type=sequence'
    })
  }



})