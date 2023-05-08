// pages/login/login.js
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
      login: false,
      clubName: "",
      pwd: "",
  },

  bindGInput: function(e) {
    console.log(e);
    this.setData({
        clubName: e.detail.value
    })
  },

  bindPwdInput: function(e) {
    console.log(e);
    this.setData({
      pwd: e.detail.value
    })
  },

  registration: function(e){
    wx.navigateTo({
      url: "./registration",
      success: function(res) {
          console.log(res);
      }
    })
  },

  teacherLogin: function(e){
    wx.navigateTo({
      url: "./teacherLogin",
      success: function(res) {
          console.log(res);
      }
    })
  },

  gradeTeacherLogin: function(e){
    wx.navigateTo({
      url: "./gradeTeacherLogin",
      success: function(res) {
          console.log(res);
      }
    })
  },

  forgetPassword(e) {
    wx.navigateTo({
        url: "./forgetPwd",
      })
  },

  clubSubmit: function(e) {
    console.log(this.data.clubName);
    const pwdVal = this.data.pwd;
    const clubNameVal = this.data.clubName;
    wx.setStorageSync("clubName", clubNameVal);
    console.log("Club name in storagesync", wx.getStorageSync("clubName"));
    const db = wx.cloud.database();
    db.collection("clubs").where({clubName: clubNameVal})
    .get({
      success(res) {
        console.log("Get success", res)
        if(res.data[0] == null){
          wx.showModal({
            title: '用户名错误',
            content: '用户名错误',
            showCancel: false,
          });
        }
        else{
          // if the status is approved
          if (res.data[0].status == -1) {
            wx.showModal({
                title: 'Account Has Not Been Activated',
                content: 'Your account is registered, but not yet approved by the teachers. If your account is not activitated within 24 hours after registration, please contact the receptions teachers or your grade instructions teacher.',
                showCancel: false,
            })
          }
          else if (res.data[0].status == 1) { // approved
            if (pwdVal == res.data[0].password){
                wx.switchTab({
                    url: "../index/index",
                    success: function(res) {
                        console.log(res);
                    }
                })
            }
            else{
                wx.showModal({
                    title: '密码错误',
                    content: '密码错误',
                    showCancel: false,
                })
            }
          }
          else {
            wx.showModal({
                title: 'Disapproved or Suspended Account',
                content: 'Your account has been disapproved by the teachers or suspended for the following reason: ' + res.data[0].suspendReason + '. Please contact the receptions teachers or your grade instructions teacher if something is wrong.',
                showCancel: false,
            })
          }
        }
      },
      catch(e) {
        console.log("Login failure", e)
      }
    })
  },
})
