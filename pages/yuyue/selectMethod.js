// pages/xmt/floor.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
  
    },
  
    bindPermanent: function(e) {
        wx.navigateTo({
            url: "./permanent",
            success: function(res) {
                console.log(res);
            },
            fail: function(res) {
                console.log(res);
            }
        });
    },

    bindTemporary: function(e) {
        wx.navigateTo({
            url: "./index",
            success: function(res) {
                console.log(res);
            },
            fail: function(res) {
                console.log(res);
            }
        });
    }
})
