// pages/teacher/teacher.js

Page({
    /**
     * 页面的初始数据
     */
    data: {

    },

    onTapActivate: function(e) {
        wx.navigateTo({
            url: "./activate",
            success(res) {
                console.log("success");
            },
            fail(res) {
                console.log("failed");
            }
        })
    },

    onTapSuspend: function(e) {
        wx.navigateTo({
            url: "./suspend",
            success(res) {
                console.log("success");
            },
            fail(res) {
                console.log("failed");
            }
        })
    },
})