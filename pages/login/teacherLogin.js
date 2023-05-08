// pages/login/teacherLogin.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
      account: "",
      pwd: "",
  },

  bindAccountInput: function(e) {
    console.log(e);
    this.setData({
        account: e.detail.value
    })
  },

  bindPwdInput: function(e) {
    console.log(e);
    this.setData({
      pwd: e.detail.value
    })
  },

  submit: function(e) {
    const pwd = this.data.pwd
    const account = this.data.account
    wx.cloud.database().collection('teachers').where({account: this.data.account})
    .get({
      success(res) {
        if(res.data[0] == null){
          wx.showModal({
            title: '用户名错误',
            content: '用户名错误'
          });
        }
        else{
            if (pwd == res.data[0].pwd){
                wx.setStorageSync('building', "ZTB")
                if (account == "XMT") {
                    wx.setStorageSync('building', "XMT")
                }
                wx.navigateTo({
                    url: "../teacher/teacher",
                    success: function(res) {
                        console.log('teacher login success');
                    }
                })
            }
            else{
                wx.showModal({
                title: '密码错误',
                content: '密码错误'
                })
            }
        }
      }
    })
  },
})
