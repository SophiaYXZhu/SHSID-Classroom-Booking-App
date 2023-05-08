// pages/teacher/teacher.js

Page({
    /**
     * 页面的初始数据
     */
    data: {

    },

    onTapReserve: function(e) {
        wx.navigateTo({
            url: "../process/process",
            success(res) {
                console.log("success");
            },
            fail(res) {
                console.log("failed");
            }
        })
    },

    onTapFeedback: function(e){
        wx.navigateTo({
            url: "./check",
            success(res) {
                console.log("success");
            },
            fail(res) {
                console.log("failed");
            }
        })
    },
})