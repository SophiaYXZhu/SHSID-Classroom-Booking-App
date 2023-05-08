// pages/xmt/floor.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
  
    },
  
    onF1Tap: function(e) {
        wx.setStorageSync("floorN", 0);
        wx.navigateTo({
            url: "../yuyue/selectMethod",
            success: function(res) {
                console.log(res);
            },
            fail: function(res) {
                console.log(res);
            }
        });
    },
    onF2Tap: function(e) {
        wx.setStorageSync("floorN", 1);
        wx.navigateTo({
            url: "../yuyue/selectMethod",
            success: function(res) {
                console.log(res);
            },
            fail: function(res) {
                console.log(res);
            }
        });
    },
    onF3Tap: function(e) {
        wx.setStorageSync("floorN", 2);
        wx.navigateTo({
            url: "../yuyue/selectMethod",
            success: function(res) {
                console.log(res);
            },
            fail: function(res) {
                console.log(res);
            }
        });
    },
})
