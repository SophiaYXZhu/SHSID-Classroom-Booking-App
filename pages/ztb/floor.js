
// pages/xmt/floor.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
  
    },
  
    onF1Tap: function(e) {
        wx.setStorageSync("floorN", 3);
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
        wx.setStorageSync("floorN", 4);
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
        wx.setStorageSync("floorN", 5);
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
