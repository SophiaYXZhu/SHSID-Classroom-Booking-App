// pages/login/pwdReset.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        pwd: "",
        confirmPwd: ""
    },

    onLoad(options) {

    },

    bindInputPwd(e) {
        const val = e.detail.value;
        this.setData({
            pwd: val,
        })
    },

    bindInputConfirm(e) {
        const val = e.detail.value;
        this.setData({
            confirmPwd: val,
        })
    },

    onBindSubmit(e) {
        let pwd = this.data.pwd;
        let confirmPwd = this.data.confirmPwd;
        if (pwd == "" || confirmPwd == "") {
            wx.showModal({
                title: 'Warning',
                content: 'Please fill in all blanks.'
            });
        }
        else if (pwd != confirmPwd) {
            wx.showModal({
                title: 'Warning',
                content: 'Your confirm password does not match with your password.'
            });
        }
        else {
            wx.showModal({
                title: 'Success',
                content: 'Your new password has successfully been updated.',
                showCancel: false,
                success (res) {
                    wx.navigateBack({
                        delta: 2,
                    })
                }
            });
        }
    }
})