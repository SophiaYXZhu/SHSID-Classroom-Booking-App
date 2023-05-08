// pages/index/index.js
const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        
    },

    onZtbTap: function(e) {
        wx.navigateTo({
            url: "../ztb/floor",
            success: function(res) {
                console.log(res);
            },
            catch: function(e) {
                console.log(e);
            }
        })
    },
    
    onXmtTap: function(e) {
        wx.navigateTo({
            url: "../xmt/floor",
            success: function(res) {
                console.log(res);
            },
            catch: function(e) {
                console.log(e);
            }
        })
    },
})
